// State of INTEL: items, live aircraft, source health, preferences. One store, React reads it with useSyncExternalStore.
import { useSyncExternalStore } from 'react';
import type { Aircraft } from '../../../air/src/data/types';
import { demoItems, demoLive } from '../data/demo';
import { entitiesOf, type Entities } from '../data/entities';
import { lensesOf } from '../data/lens';
import { loadCollected, loadLive, loadSource, mergeItems, pool, type SourceStatus } from '../data/feed';
import { matchLive } from '../data/match';
import { detectAll } from '../data/sensor';
import { buildStories, type Story } from '../data/stories';
import { SOURCES } from '../data/sources';
import { kindOf } from '../data/kinds';
import { isAirTrack } from '../data/alerts';
import type { EnrichedItem, Item, Lens } from '../data/types';
import type { ReportLang } from '../data/lang';
import { learnTranslations } from './translate';

const LIVE_SOURCES = SOURCES.filter((s) => !s.collectorOnly);

const PREFS_KEY = 'vectorscope.intel.v1';
const CACHE_KEY = 'vectorscope.intel.cache.v1';
const FEED_EVERY_MS = 5 * 60_000;
const LIVE_EVERY_MS = 2 * 60_000;

/** all, live (strong live match), r:<region> or c:<category>. */
export type Filter = string;
export type View = 'stories' | 'wire' | 'map';
/** Filter by one of the pulse tiles above the stories. */
export type Pulse = 'hour' | 'unverified' | 'developing' | 'alerts' | 'originals' | 'decisions' | null;

export interface Prefs {
  view: View;
  /** Security and crisis, or politics. Both lenses share the views. */
  lens: Lens;
  /** Actor id of actors.ts, or cap:<capital> for every actor of a capital, or null. */
  actor: string | null;
  /** Politics lens: only stories with an original statement or at least two independent sources. */
  signal: boolean;
  pulse: Pulse;
  /** Now: the five main stories of both lenses and the early ticker. The app always starts there. */
  now: boolean;
  /** Reports as they came, all in English or all in German. The interface stays English. */
  reports: ReportLang;
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
  /** Air alerts: drone and missile tracks of the Ukrainian Air Force, newest first, kept out of the stories. */
  alerts: EnrichedItem[];
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
  /** Search over stories and wire, for this session only. */
  query: string;
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

const storedPrefs = readJson<Partial<Prefs> & { german?: boolean }>(PREFS_KEY);
const { german: wasGerman, ...kept } = storedPrefs ?? {};
const prefs: Prefs = { view: 'stories', lens: 'security', actor: null, signal: true, pulse: null, reports: wasGerman ? 'de' : 'original', filter: 'all', place: null, lastSeen: 0, ...kept, now: true };
// The switch DE of earlier versions becomes the choice German.
if (!['original', 'en', 'de'].includes(prefs.reports)) prefs.reports = 'original';
// Filters of earlier versions ("aviation", "breaking") become "all".
if (!/^(all|live|[rc]:[a-z]+)$/.test(prefs.filter)) prefs.filter = 'all';

let state: IntelState = {
  demo,
  items: [],
  stories: [],
  alerts: [],
  live: [],
  collectedAt: null,
  sources: {},
  loading: false,
  updated: null,
  liveUpdated: null,
  liveError: null,
  prefs,
  newSince: prefs.lastSeen,
  query: '',
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
      entities = entitiesOf(item);
      entityCache.set(item.id, entities);
    }
    const lens = lensesOf(item, text, entities);
    if (!lens.security && !lens.politics) continue;
    const kind = kindOf(item);
    out.push({ ...item, entities, matches: matchLive(entities, live, item.time, now), lens, ...(kind ? { kind } : {}) });
  }
  return out;
}

let rawItems: Item[] = [];

// First time each sensor report was seen in this session, so a detection keeps its time across refreshes.
const sensorFirstSeen = new Map<string, number>();

/** Items plus own sensor reports plus their stories, computed together so everything always matches. */
function derive(items: Item[], live: Aircraft[], now: number): Pick<IntelState, 'items' | 'stories' | 'alerts'> {
  const sensor = detectAll(live, now).map((i) => {
    if (!sensorFirstSeen.has(i.id)) sensorFirstSeen.set(i.id, now);
    return { ...i, time: sensorFirstSeen.get(i.id)! };
  });
  const all = enrich(sensor.length ? mergeItems([...items, ...sensor], now) : items, live, now);
  const enriched = all.filter((i) => !isAirTrack(i));
  return { items: enriched, stories: buildStories(enriched), alerts: all.filter(isAirTrack) };
}

export function setQuery(query: string) {
  emit({ query });
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
  // Sources marked collectorOnly (members on Bluesky, votes) come only through the collector.
  const [results, collected] = await Promise.all([pool(LIVE_SOURCES, 4, (s) => loadSource(s)), loadCollected().catch(() => null)]);
  const sources: Record<string, SourceStatus> = {};
  LIVE_SOURCES.forEach((s, i) => (sources[s.id] = results[i].status));
  for (const s of SOURCES.filter((x) => x.collectorOnly)) {
    const own = (collected?.items ?? []).filter((i) => i.sourceId === s.id);
    sources[s.id] = { ok: own.length > 0, newest: own.length ? Math.max(...own.map((i) => i.time)) : null, count: own.length };
  }
  if (collected) learnTranslations(collected.items);
  const known = new Set(SOURCES.map((s) => s.id));
  // Earlier reports stay: a channel shows only its last posts, and an item that scrolled out is still news.
  const merged = mergeItems([...rawItems.filter((i) => known.has(i.sourceId)), ...results.flatMap((r) => r.items), ...(collected?.items ?? []).filter((i) => known.has(i.sourceId))], now);
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
    learnTranslations(rawItems);
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
