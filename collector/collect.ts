// Probe collector: one round, run every 10 minutes on GitHub Actions until the end of the probe (workflow collector.yml).
// Loads every source of INTEL directly, keeps what it has seen with the time it first saw it,
// and writes three files into the folder given as argument (published on the branch collector-data):
//   archive.json  every item of the last 7 days, for the evaluation
//   latest.json   the last 72 hours, compact, read by INTEL in the browser
//   stats.json    one record per run: per source ok, items, new items, error
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { itemKey, loadLive, loadSource, mergeItems, pool } from '../intel/src/data/feed';
import { detectAll } from '../intel/src/data/sensor';
import { SOURCES } from '../intel/src/data/sources';
import { clip } from '../intel/src/data/text';
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

// keys: every item key ever seen with the time it was first seen. Items merged into another one
// (a Bluesky post into its article) or older than the archive stay known, so they never count as new again.
const archive = read<{ at: number; items: Item[]; keys?: Record<string, number> }>('archive.json', { at: 0, items: [] });
const stats = read<{ runs: RunRecord[] }>('stats.json', { runs: [] });
const seenBefore = new Map<string, number>(Object.entries(archive.keys ?? {}));
for (const i of archive.items) if (!seenBefore.has(itemKey(i))) seenBefore.set(itemKey(i), i.seen ?? i.time);

const results = await pool(SOURCES, 6, (s) => loadSource(s, { direct: true }));
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
console.log(`Collected ${merged.length} items, ${fresh.length} new, ${ok}/${SOURCES.length} sources ok`);
for (const [id, s] of Object.entries(run.sources)) console.log(`  ${s.ok ? 'ok ' : 'ERR'} ${id.padEnd(16)} ${String(s.items).padStart(4)} items ${String(s.fresh).padStart(4)} new ${s.error ?? ''}`);
