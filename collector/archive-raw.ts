// Writes one round of the raw archive: a gzip file of JSON lines with a round record, a fetch record
// per request and a unit record per new or changed unit. Files are never changed after they are written.
// Which units are known lives in raw-state.json next to the collector data, not in the archive itself.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { gzipSync } from 'node:zlib';
import type { RawResponse } from '../intel/src/data/feed';
import type { Item } from '../intel/src/data/types';
import { RAW_FORMAT, sha1, splitUnits, type FetchRecord, type LegacyRecord, type RawRecord, type RoundRecord, type UnitRecord } from './raw';

const DAY = 24 * 3600_000;

/** key → [fingerprint, version, last time seen]. */
type State = Record<string, [string, number, number]>;

export const roundId = (at: number) => new Date(at).toISOString().slice(0, 16) + 'Z';
/** raw/2026/10/08/2110.jsonl.gz, UTC. */
export const roundPath = (at: number) => {
  const iso = new Date(at).toISOString();
  return `raw/${iso.slice(0, 4)}/${iso.slice(5, 7)}/${iso.slice(8, 10)}/${iso.slice(11, 13)}${iso.slice(14, 16)}.jsonl.gz`;
};

export const toJsonl = (records: RawRecord[]) => gzipSync(records.map((r) => JSON.stringify(r)).join('\n') + '\n');

export interface RawRound {
  round: RoundRecord;
  file: string;
  /** Per source: units in the answers, new and changed. */
  perSource: Record<string, { units: number; fresh: number; changed: number }>;
}

export function writeRawRound(opts: {
  rawDir: string;
  stateFile: string;
  at: number;
  ms: number;
  responses: RawResponse[];
  sensorItems: Item[];
  sources: number;
  ok: number;
}): RawRound {
  const { rawDir, stateFile, at } = opts;
  const state: State = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, 'utf8')) : {};
  const round = roundId(at);
  const records: RawRecord[] = [];
  const perSource: RawRound['perSource'] = {};
  let total = 0;
  let fresh = 0;
  let changed = 0;

  const take = (src: string, kind: UnitRecord['kind'], api: string | undefined, key: string, hash: string, body: string, unitAt: number) => {
    const known = state[key];
    if (known && known[0] === hash) {
      known[2] = at;
      return 'same' as const;
    }
    const v = known ? known[1] + 1 : 1;
    state[key] = [hash, v, at];
    records.push({ t: 'unit', round, at: unitAt, src, kind, ...(api ? { api } : {}), key, v, hash, body });
    return v === 1 ? ('fresh' as const) : ('changed' as const);
  };

  for (const r of opts.responses) {
    const units = r.body != null ? splitUnits(r) : [];
    const count = { units: units.length, fresh: 0, changed: 0 };
    for (const u of units) {
      const what = take(r.sourceId, r.kind, r.api, u.key, u.hash, u.body, r.at);
      if (what === 'fresh') count.fresh++;
      if (what === 'changed') count.changed++;
    }
    const fetch: FetchRecord = {
      t: 'fetch',
      round,
      at: r.at,
      src: r.sourceId,
      kind: r.kind,
      ...(r.api ? { api: r.api } : {}),
      url: r.url,
      status: r.status,
      ms: r.ms,
      bytes: r.body?.length ?? 0,
      ...count,
      ...(r.error ? { error: r.error } : {}),
    };
    records.push(fetch);
    const s = (perSource[r.sourceId] ??= { units: 0, fresh: 0, changed: 0 });
    s.units += count.units;
    s.fresh += count.fresh;
    s.changed += count.changed;
    total += count.units;
    fresh += count.fresh;
    changed += count.changed;
  }

  // Own sensor: derived from live flight data, the reports themselves are the raw data here.
  for (const item of opts.sensorItems) {
    const body = JSON.stringify(item);
    // The sensor stamps every detection with the time of the round: only title and text tell a change.
    const what = take('sensor', 'sensor', undefined, item.id, sha1(`${item.title}\n${item.text}`), body, at);
    if (what === 'fresh') fresh++;
  }

  const roundRecord: RoundRecord = { t: 'round', format: RAW_FORMAT, round, at, ms: opts.ms, sources: opts.sources, ok: opts.ok, units: total, fresh, changed };
  const file = join(rawDir, roundPath(at));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, toJsonl([roundRecord, ...records]));

  // Units not seen for 30 days are forgotten: if one comes back, it is stored again as a new version 1.
  for (const [key, [, , seen]] of Object.entries(state)) if (at - seen > 30 * DAY) delete state[key];
  writeFileSync(stateFile, JSON.stringify(state));
  return { round: roundRecord, file, perSource };
}

/**
 * Once, when the raw archive starts (no raw-state.json yet): the reports of the earlier archive,
 * so the history since the probe began is not lost.
 */
export function writeLegacy(rawDir: string, items: Item[], at: number): string | null {
  const file = join(rawDir, 'raw', 'legacy', `archive-${new Date(at).toISOString().slice(0, 10)}.jsonl.gz`);
  if (!items.length) return null;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, toJsonl(items.map((item): LegacyRecord => ({ t: 'legacy', item }))));
  return file;
}
