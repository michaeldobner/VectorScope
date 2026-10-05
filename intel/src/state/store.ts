// State of INTEL: items, live aircraft, source health, preferences. One store, React reads it with useSyncExternalStore.
import { useSyncExternalStore } from 'react';
import type { Aircraft } from '../../../air/src/data/types';
import { demoItems, demoLive } from '../data/demo';
import { extractEntities, isCrisisRelated, type Entities } from '../data/entities';
import { loadCollected, loadLive, loadSource, mergeItems, pool, type SourceStatus } from '../data/feed';
import { matchLive } from '../data/match';
import { buildStories, type Story } from '../data/stories';
import { SOURCES, sourceById, type Category } from '../data/sources';
import type { EnrichedItem, Item } from '../data/types';

const PREFS_KEY = 'vectorscope.intel.v1';
const CACHE_KEY = 'vectorscope.intel.cache.v1';
const FEED_EVERY_MS = 5 * 60_000;
const LIVE_EVERY_MS = 2 * 60_000;

export type Filter = 'all' | 'live' | Category;
export type View = 'stories' | 'wire';

export interface Prefs {
  view: View;
  filter: Filter;
  /** Place name the list is narrowed to, or null. */
  place: string | null;
  /** Items newer than this are marked as new. */
  lastSeen: number;
}

export interface IntelState {
  demo: boolean;
  items: EnrichedItem[];
  stories: Story[];
  live: Aircraft[];
  /** Time of the last collector run whose data was merged, null if none could be loaded. */
  collectedAt: number | null;
  sources: Record<string, SourceStatus>;
  loading: boolean;
  updated: number | null;
  liveUpdated: number | null;
  liveError: string | null;
  prefs: Prefs;
  /** lastSeen of the previous visit, fixed for this session so "new" marks do not vanish while reading. */
  newSince: number;
}

const demo = new URLSearchParams(location.search).has('demo');

function readJson<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') as T | null;
  } catch {
    return null;
  }
}
function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the app keeps working without it.
  }
}

const storedPrefs = readJson<Partial<Prefs>>(PREFS_KEY);
const prefs: Prefs = { view: 'stories', filter: 'all', place: null, lastSeen: 0, ...storedPrefs };

let state: IntelState = {
  demo,
  items: [],
  stories: [],
  live: [],
  collectedAt: null,
  sources: {},
  loading: false,
  updated: null,
  liveUpdated: null,
  liveError: null,
  prefs,
  newSince: prefs.lastSeen,
};
const listeners = new Set<() => void>();
const emit = (patch: Partial<IntelState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

export const getState = () => state;
/** Unfiltered reports as loaded, for the test lab. */
export const getRaw = () => rawItems;
export const useIntel = () => useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), getState);

// Entities are computed once per item, matches whenever items or live aircraft change.
const entityCache = new Map<string, Entities>();
function enrich(items: Item[], live: Aircraft[], now: number): EnrichedItem[] {
  const out: EnrichedItem[] = [];
  for (const item of items) {
    const text = `${item.title}\n${item.text}`;
    let entities = entityCache.get(item.id);
    if (!entities) {
      entities = extractEntities(text);
      entityCache.set(item.id, entities);
    }
    // General news media count only with security and crisis topics, see isCrisisRelated.
    if (sourceById(item.sourceId)?.category === 'news' && !isCrisisRelated(text, entities)) continue;
    out.push({ ...item, entities, matches: matchLive(entities, live, item.time, now) });
  }
  return out;
}

let rawItems: Item[] = [];

/** Items plus their stories, computed together so both always match. */
function derive(items: Item[], live: Aircraft[], now: number): Pick<IntelState, 'items' | 'stories'> {
  const enriched = enrich(items, live, now);
  return { items: enriched, stories: buildStories(enriched) };
}

export function setPrefs(patch: Partial<Prefs>) {
  const next = { ...state.prefs, ...patch };
  emit({ prefs: next });
  writeJson(PREFS_KEY, next);
}

export async function refreshFeed() {
  if (state.loading) return;
  emit({ loading: true });
  const now = Date.now();
  if (demo) {
    rawItems = demoItems(now);
    emit({ loading: false, updated: now, ...derive(rawItems, state.live, now), sources: Object.fromEntries(SOURCES.map((s) => [s.id, { ok: true, newest: null, count: 0 }])) });
    return;
  }
  // Live sources and the collector in parallel. The collector adds what scrolled out of a channel while the app was closed.
  const [results, collected] = await Promise.all([pool(SOURCES, 4, (s) => loadSource(s)), loadCollected().catch(() => null)]);
  const sources: Record<string, SourceStatus> = {};
  SOURCES.forEach((s, i) => (sources[s.id] = results[i].status));
  const known = new Set(SOURCES.map((s) => s.id));
  const merged = mergeItems([...results.flatMap((r) => r.items), ...(collected?.items ?? []).filter((i) => known.has(i.sourceId))], now);
  // Keep what we had if everything failed, for example offline.
  if (merged.length) rawItems = merged;
  writeJson(CACHE_KEY, { at: now, items: rawItems.slice(0, 300) });
  emit({ loading: false, updated: merged.length ? now : state.updated, sources, collectedAt: collected?.at ?? state.collectedAt, ...derive(rawItems, state.live, now) });
}

export async function refreshLive() {
  const now = Date.now();
  try {
    const live = demo ? demoLive() : await loadLive();
    emit({ live, liveUpdated: now, liveError: null, ...derive(rawItems, live, now) });
  } catch (e) {
    emit({ liveError: String((e as Error).message ?? e) });
  }
}

/** Marks everything up to now as seen, the next visit shows newer items as new. */
export function markSeen() {
  const newest = rawItems[0]?.time ?? Date.now();
  writeJson(PREFS_KEY, { ...state.prefs, lastSeen: Math.max(newest, state.prefs.lastSeen) });
}

export function startIntel() {
  const cached = demo ? null : readJson<{ at: number; items: Item[] }>(CACHE_KEY);
  if (cached?.items?.length) {
    rawItems = cached.items;
    emit({ ...derive(rawItems, [], Date.now()), updated: cached.at });
  }
  refreshLive().then(refreshFeed);
  setInterval(() => !document.hidden && refreshFeed(), FEED_EVERY_MS);
  setInterval(() => !document.hidden && refreshLive(), LIVE_EVERY_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) markSeen();
    else if (Date.now() - (state.updated ?? 0) > FEED_EVERY_MS) refreshLive().then(refreshFeed);
  });
  addEventListener('pagehide', markSeen);
}
