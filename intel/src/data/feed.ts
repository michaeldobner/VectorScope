// Loading: Bluesky directly, RSS through the proxy, live military aircraft from adsb.lol through the proxy.
import { parseV2 } from '../../../air/src/data/adsblol';
import type { Aircraft } from '../../../air/src/data/types';
import { authorFeedUrl, parseAuthorFeed } from './bluesky';
import { parseFeed } from './rss';
import type { Source } from './sources';
import { urlKey } from './text';
import type { Item } from './types';

/** Same proxy as AIR (air/src/data/feed.ts), a repository check keeps both equal. */
export const PROXY = 'https://vectorscope-proxy.vercel.app';
/** Items older than this are dropped. */
export const MAX_AGE_MS = 14 * 24 * 3600_000;
const TIMEOUT_MS = 15_000;

export interface SourceStatus {
  ok: boolean;
  /** Newest item of this source, epoch ms. */
  newest: number | null;
  count: number;
  error?: string;
}

async function getText(url: string): Promise<string> {
  const r = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
}

async function loadRss(source: Source): Promise<Item[]> {
  try {
    return parseFeed(await getText(`${PROXY}/feed/${source.id}`), source.id);
  } catch (proxyError) {
    // Some feeds allow browser access themselves, try them directly before giving up.
    try {
      return parseFeed(await getText(source.rss!), source.id);
    } catch {
      throw proxyError;
    }
  }
}

async function loadBluesky(source: Source): Promise<Item[]> {
  return parseAuthorFeed(JSON.parse(await getText(authorFeedUrl(source.bluesky!))), source.id);
}

/** Both channels of one source. Fails only if every channel fails. */
export async function loadSource(source: Source): Promise<{ items: Item[]; status: SourceStatus }> {
  const jobs = [source.rss && loadRss(source), source.bluesky && loadBluesky(source)].filter(Boolean) as Promise<Item[]>[];
  const results = await Promise.allSettled(jobs);
  const items = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  const errors = results.filter((r) => r.status === 'rejected').map((r) => String((r as PromiseRejectedResult).reason?.message ?? r));
  const ok = results.some((r) => r.status === 'fulfilled');
  return {
    items,
    status: { ok, newest: items.length ? Math.max(...items.map((i) => i.time)) : null, count: items.length, error: errors.length ? errors.join(', ') : undefined },
  };
}

/** Runs tasks with at most `limit` in parallel. */
export async function pool<T, R>(list: T[], limit: number, task: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(list.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, list.length) }, async () => {
      while (next < list.length) {
        const i = next++;
        out[i] = await task(list[i]);
      }
    }),
  );
  return out;
}

/**
 * One list, newest first. A Bluesky post that links an article of the same source is the same story:
 * the article stays (longer text), the post contributes its link and an earlier time if it was faster.
 */
export function mergeItems(items: Item[], now: number): Item[] {
  const byKey = new Map<string, Item>();
  for (const item of items) {
    if (now - item.time > MAX_AGE_MS || item.time - now > 3600_000) continue;
    const key = urlKey(item.url);
    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, item);
      continue;
    }
    const rss = prev.channel === 'rss' ? prev : item.channel === 'rss' ? item : prev;
    const post = prev.channel === 'bluesky' ? prev : item.channel === 'bluesky' ? item : undefined;
    byKey.set(key, { ...rss, postUrl: rss.postUrl ?? post?.postUrl, time: Math.min(prev.time, item.time) });
  }
  return [...byKey.values()].sort((a, b) => b.time - a.time);
}

/** Military aircraft broadcasting right now, worldwide. */
export async function loadLive(): Promise<Aircraft[]> {
  const json = JSON.parse(await getText(`${PROXY}/v2/mil`));
  return parseV2(json).aircraft;
}
