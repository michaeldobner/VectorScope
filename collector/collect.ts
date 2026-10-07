// Collector: one round. Runs every 10 minutes, on the own server (server/collector-loop.mjs) and as a probe
// on GitHub Actions (workflow collector.yml). Loads every source of INTEL directly, keeps what it has seen
// with the time it first saw it. With DATABASE_URL set it also writes the round into PostgreSQL (store.ts).
//
//   npx tsx collector/collect.ts <data folder> [raw folder]
//
// Data folder (published on the branch collector-data, replaced every round):
//   archive.json     every report of the last 7 days, for the evaluation
//   latest.json      the last 72 hours, compact, read by INTEL in the browser
//   stats.json       one record per round: per source ok, items, new items, error
//   health.json      checks: failing or silent sources, reports that break an assumption
//   raw-state.json   which raw units are known, with their fingerprint
// Raw folder (published on the branch collector-raw, only grows): raw/YYYY/MM/DD/HHMM.jsonl.gz,
// every answer of every source split into units, new or changed units only. See intel/docs/en/raw-data.md
import { appendFileSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { itemKey, loadLive, loadSource, mergeItems, pool, type RawResponse } from '../intel/src/data/feed';
import { writeLegacy, writeRawRound } from './archive-raw';
import { checkHealth, healthMarkdown, type RunRecord } from './checks';
import { storeRound } from './store';
import { detectAll } from '../intel/src/data/sensor';
import { SOURCES } from '../intel/src/data/sources';
import { clip } from '../intel/src/data/text';
import type { Item } from '../intel/src/data/types';

const DIR = process.argv[2] ?? 'collector-data';
const RAW_DIR = process.argv[3];
const DAY = 24 * 3600_000;
const now = Date.now();

const read = <T,>(file: string, fallback: T): T => {
  try {
    return existsSync(join(DIR, file)) ? (JSON.parse(readFileSync(join(DIR, file), 'utf8')) as T) : fallback;
  } catch {
    return fallback;
  }
};

// keys: every item key ever seen with the time it was first seen. Items merged into another one
// (a Bluesky post into its article) or older than the archive stay known, so they never count as new again.
const archive = read<{ at: number; items: Item[]; keys?: Record<string, number> }>('archive.json', { at: 0, items: [] });
const stats = read<{ runs: RunRecord[] }>('stats.json', { runs: [] });
const seenBefore = new Map<string, number>(Object.entries(archive.keys ?? {}));
for (const i of archive.items) if (!seenBefore.has(itemKey(i))) seenBefore.set(itemKey(i), i.seen ?? i.time);

const responses: RawResponse[] = [];
const results = await pool(SOURCES, 6, (s) => loadSource(s, { direct: true, onRaw: RAW_DIR ? (r) => responses.push(r) : undefined }));
// Own sensor: activity and emergencies in live flight data, through the proxy like the app.
const live = await loadLive().catch(() => []);
const sensorItems = detectAll(live, now);
results.push({ items: sensorItems, status: { ok: live.length > 0, newest: now, count: sensorItems.length } });
const run: RunRecord = { at: now, ms: Date.now() - now, sources: {} };
const fresh: Item[] = [];
[...SOURCES, { id: 'sensor' }].forEach((s, i) => {
  const { items, status } = results[i];
  let count = 0;
  for (const item of items) {
    if (seenBefore.has(itemKey(item))) continue;
    seenBefore.set(itemKey(item), now);
    // An old article that a feed still lists is not news.
    if (now - item.time > DAY) continue;
    fresh.push({ ...item, seen: now });
    count++;
  }
  run.sources[s.id] = { ok: status.ok, items: status.count, fresh: count, ...(status.error ? { error: status.error } : {}) };
});

// Merge keeps the earliest time and the earliest "seen" of duplicates.
const merged = mergeItems([...archive.items, ...results.flatMap((r) => r.items).map((i) => ({ ...i, seen: seenBefore.get(itemKey(i)) ?? now }))], now).filter(
  (i) => now - i.time < 7 * DAY,
);

mkdirSync(DIR, { recursive: true });
const keys = Object.fromEntries([...seenBefore].filter(([, seen]) => now - seen < 30 * DAY));
writeFileSync(join(DIR, 'archive.json'), JSON.stringify({ at: now, items: merged, keys }));
const latest = merged
  .filter((i) => now - i.time < 3 * DAY)
  .slice(0, 1500)
  .map((i) => ({ ...i, text: clip(i.text, 300) }));
writeFileSync(join(DIR, 'latest.json'), JSON.stringify({ at: now, items: latest }));
stats.runs = [...stats.runs.filter((r) => now - r.at < 8 * DAY), run];
writeFileSync(join(DIR, 'stats.json'), JSON.stringify(stats));

const ok = Object.values(run.sources).filter((s) => s.ok).length;

// Phase 1 of the raw archive: the answers as they came, new or changed units only.
if (RAW_DIR) {
  const stateFile = join(DIR, 'raw-state.json');
  if (!existsSync(stateFile)) {
    const legacy = writeLegacy(RAW_DIR, archive.items, now);
    if (legacy) console.log(`Raw archive starts, ${archive.items.length} earlier reports kept in ${legacy}`);
  }
  const raw = writeRawRound({ rawDir: RAW_DIR, stateFile, at: now, ms: Date.now() - now, responses, sensorItems, sources: Object.keys(run.sources).length, ok });
  console.log(`Raw ${raw.file}: ${raw.round.units} units, ${raw.round.fresh} new, ${raw.round.changed} changed`);
}

const health = checkHealth(stats.runs, results.flatMap((r) => r.items), now);
writeFileSync(join(DIR, 'health.json'), JSON.stringify(health));
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, healthMarkdown(health));
for (const w of health.warnings) console.log(`WARN ${w}`);

// Database on the own server: every report and round for good. A failure here never loses the round,
// the files above are written already and the next round writes the reports again.
if (process.env.DATABASE_URL) {
  try {
    // The reports the sources show right now: new ones are added, changed ones updated. The 7 day archive is in the database already.
    const roundItems = results.flatMap((r) => r.items);
    const db = await storeRound(process.env.DATABASE_URL, { run, items: roundItems, seen: (i) => seenBefore.get(itemKey(i)) ?? i.seen ?? now });
    console.log(`Database: ${db.reports} reports written`);
  } catch (e) {
    console.log(`WARN database not written: ${e instanceof Error ? e.message : String(e)}`);
    process.exitCode = 2;
  }
}

console.log(`Collected ${merged.length} items, ${fresh.length} new, ${ok}/${SOURCES.length} sources ok`);
for (const [id, s] of Object.entries(run.sources)) console.log(`  ${s.ok ? 'ok ' : 'ERR'} ${id.padEnd(16)} ${String(s.items).padStart(4)} items ${String(s.fresh).padStart(4)} new ${s.error ?? ''}`);
