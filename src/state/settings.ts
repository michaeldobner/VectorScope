import { useSyncExternalStore } from 'react';

// Everything personal (location, watchlist, proxy) lives only in this device's localStorage.

export type FeedMode = 'auto' | 'direct' | 'proxy' | 'demo';
export type Units = 'metric' | 'aviation';
export type WatchKind = 'hex' | 'registration' | 'callsign' | 'type';

export interface WatchEntry {
  id: string;
  kind: WatchKind;
  /** Upper-case value. For callsign this is a prefix (e.g. FORTE, RCH). */
  value: string;
  note?: string;
}

export interface Settings {
  location: { lat: number; lon: number; label: string } | null;
  useGps: boolean;
  observerAltM: number;
  radiusKm: number;
  feedMode: FeedMode;
  proxyUrl: string;
  proxyToken: string;
  pollSec: number;
  units: Units;
  watchlist: WatchEntry[];
  onlyInteresting: boolean;
}

const KEY = 'vectorscope.settings.v1';

export const DEFAULT_SETTINGS: Settings = {
  location: null,
  useGps: true,
  observerAltM: 120,
  radiusKm: 50,
  feedMode: 'auto',
  proxyUrl: '',
  proxyToken: '',
  pollSec: 5,
  units: 'metric',
  watchlist: [
    { id: 'w1', kind: 'callsign', value: 'FORTE' },
    { id: 'w2', kind: 'callsign', value: 'NATO' },
    { id: 'w3', kind: 'type', value: 'B52' },
    { id: 'w4', kind: 'type', value: 'A124' },
  ],
  onlyInteresting: false,
};

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    /* storage unavailable */
  }
  return DEFAULT_SETTINGS;
}

let state: Settings = load();
const listeners = new Set<() => void>();

export function getSettings(): Settings {
  return state;
}

export function updateSettings(patch: Partial<Settings>) {
  state = { ...state, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function useSettings(): Settings {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

// URL overrides, handy for testing: ?demo, ?lat=..&lon=..
const params = new URLSearchParams(location.search);
if (params.has('demo')) state = { ...state, feedMode: 'demo' };
// One-tap setup: ?proxy=https://… (and optionally &token=…) is saved permanently, then removed from the address.
if (params.has('proxy')) {
  const proxyUrl = (params.get('proxy') ?? '').trim().replace(/\/+$/, '');
  if (/^https:\/\//.test(proxyUrl)) {
    state = { ...state, proxyUrl, proxyToken: params.get('token') ?? state.proxyToken, feedMode: 'auto' };
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }
  params.delete('proxy');
  params.delete('token');
  const rest = params.toString();
  history.replaceState(null, '', location.pathname + (rest ? `?${rest}` : '') + location.hash);
}
if (params.has('lat') && params.has('lon')) {
  state = {
    ...state,
    useGps: false,
    location: { lat: Number(params.get('lat')), lon: Number(params.get('lon')), label: 'URL' },
  };
}
