// Loading: Bluesky directly, RSS through the proxy, live military aircraft from adsb.lol through the proxy.
import { parseV2 } from '../../../air/src/data/adsblol';
import type { Aircraft } from '../../../air/src/data/types';
import { authorFeedUrl, parseAuthorFeed } from './bluesky';
import { parseFeed } from './rss';
import { parseTelegram } from './telegram';
import { API_URL, VIA_PROXY, parseEmsc, parseFaa, parseGdacs, parseNws, parseUsgs } from './physical';
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

// Browsers send their own User-Agent. In Node.js (collector, lab) publishers get a contact address.
const NODE_HEADERS: Record<string, string> =
  typeof window === 'undefined' ? { 'User-Agent': 'VectorScope-collector/0.1 (+https://github.com/michaeldobner/VectorScope)' } : {};

/** One answer of a publisher exactly as it came, handed to the collector for the raw archive. */
export interface RawResponse {
  sourceId: string;
  kind: 'rss' | 'telegram' | 'bluesky' | 'api';
  /** For kind api: usgs, emsc, gdacs, nws or faa. */
  api?: string;
  url: string;
  /** Epoch ms when the request started. */
  at: number;
  ms: number;
  /** HTTP status, null if no answer came (network error, timeout). */
  status: number | null;
  /** Body of a successful answer. */
  body?: string;
  error?: string;
}

/**
 * direct: fetch the publishers themselves, used by the collector on GitHub Actions where browsers rules do not apply.
 * Otherwise RSS and Telegram go through the proxy, Bluesky always directly.
 * onRaw: receives every answer unchanged, used by the collector to keep the raw data.
 */
export interface LoadOptions {
  direct?: boolean;
  onRaw?: (r: RawResponse) => void;
}

type RawMeta = Pick<RawResponse, 'sourceId' | 'kind' | 'api'>;

async function getText(url: string, opt: LoadOptions = {}, meta?: RawMeta): Promise<string> {
  const at = Date.now();
  let status: number | null = null;
  try {
    const r = await fetch(url, { headers: NODE_HEADERS, signal: AbortSignal.timeout(TIMEOUT_MS) });
    status = r.status;
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const body = await r.text();
    if (meta) opt.onRaw?.({ ...meta, url, at, ms: Date.now() - at, status, body });
    return body;
  } catch (e) {
    if (meta) opt.onRaw?.({ ...meta, url, at, ms: Date.now() - at, status, error: String((e as Error)?.message ?? e) });
    throw e;
  }
}

async function loadRss(source: Source, opt: LoadOptions): Promise<Item[]> {
  const meta: RawMeta = { sourceId: source.id, kind: 'rss' };
  if (opt.direct) return parseFeed(await getText(source.rss!, opt, meta), source.id);
  try {
    return parseFeed(await getText(`${PROXY}/feed/${source.id}`, opt, meta), source.id);
  } catch (proxyError) {
    // Some feeds allow browser access themselves, try them directly before giving up.
    try {
      return parseFeed(await getText(source.rss!, opt, meta), source.id);
    } catch {
      throw proxyError;
    }
  }
}

async function loadTelegram(source: Source, opt: LoadOptions): Promise<Item[]> {
  const url = opt.direct ? `https://t.me/s/${source.telegram}` : `${PROXY}/tg/${source.telegram}`;
  return parseTelegram(await getText(url, opt, { sourceId: source.id, kind: 'telegram' }), source.id);
}

async function loadApi(source: Source, opt: LoadOptions): Promise<Item[]> {
  const api = source.api!;
  const url = !opt.direct && VIA_PROXY.includes(api) ? `${PROXY}/feed/${api}` : API_URL[api];
  const text = await getText(url, opt, { sourceId: source.id, kind: 'api', api });
  switch (api) {
    case 'usgs':
      return parseUsgs(JSON.parse(text), source.id);
    case 'emsc':
      return parseEmsc(JSON.parse(text), source.id);
    case 'nws':
      return parseNws(JSON.parse(text), source.id);
    case 'gdacs':
      return parseGdacs(text, source.id);
    case 'faa':
      return parseFaa(text, source.id, Date.now());
  }
}

async function loadBluesky(source: Source, opt: LoadOptions): Promise<Item[]> {
  return parseAuthorFeed(JSON.parse(await getText(authorFeedUrl(source.bluesky!), opt, { sourceId: source.id, kind: 'bluesky' })), source.id);
}

/** Both channels of one source. Fails only if every channel fails. */
export async function loadSource(source: Source, opt: LoadOptions = {}): Promise<{ items: Item[]; status: SourceStatus }> {
  const jobs = [
    source.rss && loadRss(source, opt),
    source.telegram && loadTelegram(source, opt),
    source.bluesky && loadBluesky(source, opt),
    source.api && loadApi(source, opt),
  ].filter(Boolean) as Promise<Item[]>[];
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

/** Sensor reports have stable ids per area and day, everything else is the same story at the same URL. */
export const itemKey = (item: Item) => (item.channel === 'sensor' ? item.id : urlKey(item.url));

/**
 * One list, newest first. A Bluesky post that links an article of the same source is the same story:
 * the article stays (longer text), the post contributes its link and an earlier time if it was faster.
 */
export function mergeItems(items: Item[], now: number): Item[] {
  const byKey = new Map<string, Item>();
  for (const item of items) {
    if (now - item.time > MAX_AGE_MS || item.time - now > 3600_000) continue;
    const key = itemKey(item);
    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, item);
      continue;
    }
    const rss = prev.channel === 'rss' ? prev : item.channel === 'rss' ? item : prev;
    const post = prev.channel === 'bluesky' ? prev : item.channel === 'bluesky' ? item : undefined;
    const seen = Math.min(prev.seen ?? Infinity, item.seen ?? Infinity);
    byKey.set(key, { ...rss, postUrl: rss.postUrl ?? post?.postUrl, time: Math.min(prev.time, item.time), ...(Number.isFinite(seen) ? { seen } : {}) });
  }
  return [...byKey.values()].sort((a, b) => b.time - a.time);
}

/** Military aircraft broadcasting right now, worldwide. */
/** Items gathered by the collector on GitHub Actions (collector/collect.ts), last 72 hours. */
export const COLLECTOR_URL = 'https://raw.githubusercontent.com/michaeldobner/VectorScope/collector-data/latest.json';

export async function loadCollected(): Promise<{ at: number; items: Item[] }> {
  const json = JSON.parse(await getText(COLLECTOR_URL));
  return { at: Number(json.at) || 0, items: Array.isArray(json.items) ? json.items : [] };
}

export async function loadLive(): Promise<Aircraft[]> {
  const json = JSON.parse(await getText(`${PROXY}/v2/mil`));
  return parseV2(json).aircraft;
}
