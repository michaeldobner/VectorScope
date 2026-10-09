// Reference for the benchmark of Now: once an hour the order of the top stories of three newsrooms, headlines only.
// Tagesschau (homepage, JSON of its app), ntv and Spiegel (RSS in the order of their front page). Checked in the
// test lab (lab/reference.mjs). Kept in reference.json of the data folder, 14 days.
import { parseFeed } from '../intel/src/data/rss';

export const REFERENCES = {
  tagesschau: 'https://www.tagesschau.de/api2u/homepage/',
  ntv: 'https://www.n-tv.de/rss',
  spiegel: 'https://www.spiegel.de/schlagzeilen/index.rss',
} as const;
export type ReferenceId = keyof typeof REFERENCES;

export interface ReferenceSnapshot {
  at: number;
  /** The first ten headlines of each newsroom, in the order of its front page. */
  top: Partial<Record<ReferenceId, string[]>>;
}
export interface ReferenceFile {
  snapshots: ReferenceSnapshot[];
}

const TOP = 10;
const KEEP_MS = 14 * 24 * 3600_000;
const EVERY_MS = 55 * 60_000;

/** Headlines of the Tagesschau app JSON: news[].title in the order of the homepage. */
export function parseTagesschau(json: { news?: { title?: string; type?: string }[] }): string[] {
  return (json?.news ?? []).filter((n) => n.title && n.type !== 'video').map((n) => n.title!.trim());
}

/** Headlines of an RSS feed in the order of the feed, not sorted by time: the order is the front page. */
export function parseOrderedFeed(xml: string): string[] {
  return parseFeed(xml, 'reference').map((i) => i.title);
}

/** A new snapshot if the last one is older than about an hour. Fails quietly per newsroom. */
export async function takeSnapshot(file: ReferenceFile, now: number, fetchText: (url: string) => Promise<string>): Promise<ReferenceSnapshot | null> {
  const last = file.snapshots[file.snapshots.length - 1];
  if (last && now - last.at < EVERY_MS) return null;
  const top: ReferenceSnapshot['top'] = {};
  for (const id of Object.keys(REFERENCES) as ReferenceId[]) {
    try {
      const body = await fetchText(REFERENCES[id]);
      const list = id === 'tagesschau' ? parseTagesschau(JSON.parse(body)) : parseOrderedFeed(body);
      if (list.length) top[id] = list.slice(0, TOP);
    } catch {
      // One newsroom missing makes the snapshot weaker, not wrong.
    }
  }
  if (!Object.keys(top).length) return null;
  const snap = { at: now, top };
  file.snapshots = [...file.snapshots.filter((s) => now - s.at < KEEP_MS), snap];
  return snap;
}
