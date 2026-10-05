// Probe collector: runs every 15 minutes on GitHub Actions for one week (workflow collector.yml).
// Loads every source of INTEL directly, keeps what it has seen with the time it first saw it,
// and writes three files into the folder given as argument (published on the branch collector-data):
//   archive.json  every item of the last 7 days, for the evaluation
//   latest.json   the last 72 hours, compact, read by INTEL in the browser
//   stats.json    one record per run: per source ok, items, new items, error
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadSource, mergeItems, pool } from '../intel/src/data/feed';
import { SOURCES } from '../intel/src/data/sources';
import { clip, urlKey } from '../intel/src/data/text';
import type { Item } from '../intel/src/data/types';

const DIR = process.argv[2] ?? 'collector-data';
const DAY = 24 * 3600_000;
const now = Date.now();

const read = <T,>(file: string, fallback: T): T => {
  try {
    return existsSync(join(DIR, file)) ? (JSON.parse(readFileSync(join(DIR, file), 'utf8')) as T) : fallback;
  } catch {
    return fallback;
  }
};

interface RunRecord {
  at: number;
  ms: number;
  sources: Record<string, { ok: boolean; items: number; fresh: number; error?: string }>;
}

const archive = read<{ at: number; items: Item[] }>('archive.json', { at: 0, items: [] });
const stats = read<{ runs: RunRecord[] }>('stats.json', { runs: [] });
const seenBefore = new Map(archive.items.map((i) => [urlKey(i.url), i.seen ?? i.time]));

const results = await pool(SOURCES, 6, (s) => loadSource(s, { direct: true }));
const run: RunRecord = { at: now, ms: Date.now() - now, sources: {} };
const fresh: Item[] = [];
SOURCES.forEach((s, i) => {
  const { items, status } = results[i];
  let count = 0;
  for (const item of items) {
    if (!seenBefore.has(urlKey(item.url))) {
      fresh.push({ ...item, seen: now });
      count++;
    }
  }
  run.sources[s.id] = { ok: status.ok, items: status.count, fresh: count, ...(status.error ? { error: status.error } : {}) };
});

// Merge keeps the earliest time and the earliest "seen" of duplicates.
const merged = mergeItems([...archive.items, ...results.flatMap((r) => r.items).map((i) => ({ ...i, seen: seenBefore.get(urlKey(i.url)) ?? now }))], now).filter(
  (i) => now - i.time < 7 * DAY,
);

mkdirSync(DIR, { recursive: true });
writeFileSync(join(DIR, 'archive.json'), JSON.stringify({ at: now, items: merged }));
const latest = merged
  .filter((i) => now - i.time < 3 * DAY)
  .slice(0, 1500)
  .map((i) => ({ ...i, text: clip(i.text, 300) }));
writeFileSync(join(DIR, 'latest.json'), JSON.stringify({ at: now, items: latest }));
stats.runs = [...stats.runs.filter((r) => now - r.at < 8 * DAY), run];
writeFileSync(join(DIR, 'stats.json'), JSON.stringify(stats));

const ok = Object.values(run.sources).filter((s) => s.ok).length;
console.log(`Collected ${merged.length} items, ${fresh.length} new, ${ok}/${SOURCES.length} sources ok`);
for (const [id, s] of Object.entries(run.sources)) console.log(`  ${s.ok ? 'ok ' : 'ERR'} ${id.padEnd(16)} ${String(s.items).padStart(4)} items ${String(s.fresh).padStart(4)} new ${s.error ?? ''}`);
