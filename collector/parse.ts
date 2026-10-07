// Phase 2 of the raw archive: turns the raw units back into reports, with the same parsers as INTEL.
// Repeatable at any time: a better parser runs over the whole history.
//
//   npx tsx collector/parse.ts <raw folder> <output folder>
//
// <raw folder> is a checkout of the branch collector-raw (or any folder with raw/**/*.jsonl.gz).
// Writes into <output folder>:
//   reports.jsonl.gz   one line per report: latest version, first seen, versions, Telegram details
//   problems.jsonl.gz  units that did not parse, for the checks
// Query both with DuckDB, examples in intel/docs/en/raw-data.md
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync, gzipSync } from 'node:zlib';
import { sourceById } from '../intel/src/data/sources';
import type { Item } from '../intel/src/data/types';
import { parseUnit, telegramMeta, type RawRecord, type TelegramMeta, type UnitRecord } from './raw';

export interface Report extends Item {
  /** Key of the raw unit. */
  key: string;
  kind: UnitRecord['kind'] | 'legacy';
  tier?: string;
  region?: string;
  lang?: string;
  /** First time the collector saw the unit, epoch ms. */
  firstSeen: number;
  /** Time of the latest version. */
  lastChanged: number;
  versions: number;
  telegram?: TelegramMeta;
}

export function* rawFiles(dir: string): Generator<string> {
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (name === '.git' || name === 'node_modules') continue;
    if (statSync(path).isDirectory()) yield* rawFiles(path);
    else if (name.endsWith('.jsonl.gz')) yield path;
  }
}

export function* readRecords(file: string): Generator<RawRecord> {
  for (const line of gunzipSync(readFileSync(file)).toString('utf8').split('\n')) if (line.trim()) yield JSON.parse(line) as RawRecord;
}

/** All reports in the raw archive. Units of the same key are versions of one report. */
export function parseArchive(dir: string): { reports: Report[]; problems: { key: string; src: string; v: number; round: string }[] } {
  const units = new Map<string, { first: UnitRecord; last: UnitRecord; versions: number }>();
  const legacy: Item[] = [];
  for (const file of rawFiles(dir)) {
    for (const r of readRecords(file)) {
      if (r.t === 'legacy') legacy.push(r.item);
      if (r.t !== 'unit') continue;
      const u = units.get(r.key);
      if (!u) units.set(r.key, { first: r, last: r, versions: 1 });
      else {
        if (r.at < u.first.at) u.first = r;
        if (r.at >= u.last.at) u.last = r;
        u.versions++;
      }
    }
  }
  const reports: Report[] = [];
  const problems: { key: string; src: string; v: number; round: string }[] = [];
  const urls = new Set<string>();
  for (const [key, { first, last, versions }] of units) {
    const items = parseUnit(last);
    // A Telegram post without text (only a picture), a Bluesky repost or an earthquake below the threshold
    // is no report, not a problem.
    if (!items.length) {
      if (last.kind === 'rss' || (last.kind === 'bluesky' && !key.includes(':repost:'))) problems.push({ key, src: last.src, v: last.v, round: last.round });
      continue;
    }
    const meta = last.kind === 'telegram' ? telegramMeta(last.body) : undefined;
    for (const item of items) {
      urls.add(item.url);
      reports.push({ ...item, ...describe(item.sourceId), key, kind: last.kind, firstSeen: first.at, lastChanged: last.at, versions, ...(meta ? { telegram: meta } : {}) });
    }
  }
  // Reports from before the raw archive, unless the raw archive has them as well.
  for (const item of legacy) {
    if (urls.has(item.url)) continue;
    urls.add(item.url);
    reports.push({ ...item, ...describe(item.sourceId), key: item.id, kind: 'legacy', firstSeen: item.seen ?? item.time, lastChanged: item.seen ?? item.time, versions: 1 });
  }
  reports.sort((a, b) => a.firstSeen - b.firstSeen);
  return { reports, problems };
}

const describe = (sourceId: string) => {
  const s = sourceById(sourceId);
  return s ? { tier: s.tier, region: s.region, lang: s.lang } : {};
};

const writeJsonl = (file: string, rows: unknown[]) => writeFileSync(file, gzipSync(rows.map((r) => JSON.stringify(r)).join('\n') + '\n'));

if (import.meta.url === `file://${process.argv[1]}`) {
  const [dir, out] = process.argv.slice(2);
  if (!dir || !out) {
    console.error('Usage: npx tsx collector/parse.ts <raw folder> <output folder>');
    process.exit(1);
  }
  const { reports, problems } = parseArchive(dir);
  mkdirSync(out, { recursive: true });
  writeJsonl(join(out, 'reports.jsonl.gz'), reports);
  writeJsonl(join(out, 'problems.jsonl.gz'), problems);
  const fwd = reports.filter((r) => r.telegram?.forwardedFrom).length;
  console.log(`${reports.length} reports, ${fwd} forwarded Telegram posts, ${problems.length} units that did not parse → ${out}`);
}
