import { useSyncExternalStore } from 'react';
import { distanceM, project, type LatLon } from '../geo/geo';
import { skyGeometry, type SkyGeometry } from '../geo/overhead';
import { FeedError, currentTransport, fetchNearby, fetchNotable, type Transport } from '../data/feed';
import { assess, type Assessment } from '../data/score';
import type { Aircraft } from '../data/types';
import { FT_TO_M, FPM_TO_MPS, KT_TO_MPS } from '../lib/format';
import { getSettings, updateSettings } from './settings';
import { watchMatch } from './watch';

export interface TrackPoint {
  lat: number;
  lon: number;
  t: number;
}

export interface Tracked {
  ac: Aircraft;
  history: TrackPoint[];
  assessment: Assessment;
  sky: SkyGeometry;
  watch: boolean;
  firstSeen: number;
  /** Epoch ms when sky geometry was computed (for live countdowns). */
  computedAt: number;
}

export interface NotableItem {
  ac: Aircraft;
  assessment: Assessment;
  distM: number;
}

export interface Alert {
  id: string;
  hex: string;
  tone: 'watch' | 'emergency' | 'event';
  title: string;
  detail: string;
  at: number;
}

export interface TrafficState {
  observer: LatLon | null;
  locationSource: 'gps' | 'saved' | 'default';
  aircraft: Map<string, Tracked>;
  lastUpdate: number | null;
  status: 'idle' | 'loading' | 'ok' | 'error';
  error: { kind: FeedError['kind']; message: string } | null;
  transport: Transport;
  notable: NotableItem[];
  notableUpdate: number | null;
  selected: string | null;
  /** Selected aircraft outside the nearby feed. */
  external: Tracked | null;
  alerts: Alert[];
  version: number;
}

const HISTORY_MS = 30 * 60_000;
const DEFAULT_LOCATION = { lat: 50.1109, lon: 8.6821 }; // Frankfurt, until the user sets a location

let state: TrafficState = {
  observer: null,
  locationSource: 'default',
  aircraft: new Map(),
  lastUpdate: null,
  status: 'idle',
  error: null,
  transport: currentTransport(),
  notable: [],
  notableUpdate: null,
  selected: null,
  external: null,
  alerts: [],
  version: 0,
};

const listeners = new Set<() => void>();
function emit(patch: Partial<TrafficState>) {
  state = { ...state, ...patch, version: state.version + 1 };
  listeners.forEach((l) => l());
}

export function getTraffic() {
  return state;
}

export function useTraffic(): TrafficState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

export function select(hex: string | null) {
  emit({ selected: hex, external: hex && state.external?.ac.hex === hex ? state.external : null });
}

/** Select an aircraft that is not part of the nearby feed (search result, NOTABLE NOW). */
export function selectExternal(ac: Aircraft) {
  const local = state.aircraft.get(ac.hex);
  if (local) {
    select(ac.hex);
    return;
  }
  const s = getSettings();
  const watch = watchMatch(ac, s.watchlist) != null;
  const obs = state.observer ?? DEFAULT_LOCATION;
  emit({
    selected: ac.hex,
    external: {
      ac,
      history: [],
      assessment: assess(ac, watch),
      sky: skyFor(ac, obs),
      watch,
      firstSeen: Date.now(),
      computedAt: Date.now(),
    },
  });
}

export function selectedTracked(st: TrafficState = state): Tracked | null {
  if (!st.selected) return null;
  return st.aircraft.get(st.selected) ?? (st.external?.ac.hex === st.selected ? st.external : null);
}

export function dismissAlert(id: string) {
  emit({ alerts: state.alerts.filter((a) => a.id !== id) });
}

/** Interpolated position for smooth motion between polls (max 30 s of dead reckoning). */
export function displayPosition(t: Tracked, now: number): LatLon {
  const { ac } = t;
  if (ac.onGround || ac.gsKt == null || ac.track == null || ac.gsKt < 30) return { lat: ac.lat, lon: ac.lon };
  const dt = Math.min(30, Math.max(0, (now - ac.posTime) / 1000));
  return project({ lat: ac.lat, lon: ac.lon }, ac.gsKt * KT_TO_MPS, ac.track, dt, ac.trackRate ?? 0);
}

function skyFor(ac: Aircraft, observer: LatLon) {
  const s = getSettings();
  return skyGeometry(observer, s.observerAltM, {
    lat: ac.lat,
    lon: ac.lon,
    altM: ac.altFt == null ? null : ac.altFt * FT_TO_M,
    onGround: ac.onGround,
    speedMps: ac.gsKt == null ? null : ac.gsKt * KT_TO_MPS,
    track: ac.track,
    vRateMps: ac.vRateFpm == null ? null : ac.vRateFpm * FPM_TO_MPS,
  });
}

function ingest(list: Aircraft[], observer: LatLon) {
  const s = getSettings();
  const now = Date.now();
  const next = new Map<string, Tracked>();
  const newAlerts: Alert[] = [];
  const radiusM = s.radiusKm * 1000;

  for (const ac of list) {
    const prev = state.aircraft.get(ac.hex);
    const history = prev ? prev.history.filter((p) => now - p.t < HISTORY_MS) : [];
    const last = history[history.length - 1];
    if (!last || distanceM(last, ac) > 60) history.push({ lat: ac.lat, lon: ac.lon, t: ac.posTime });
    const watch = watchMatch(ac, s.watchlist) != null;
    const assessment = assess(ac, watch);
    const sky = skyFor(ac, observer);
    const tracked: Tracked = { ac, history, assessment, sky, watch, firstSeen: prev?.firstSeen ?? now, computedAt: now };
    next.set(ac.hex, tracked);

    // In-app alerts when something notable enters the radius.
    const wasInside = prev ? prev.sky.distM <= radiusM : false;
    const inside = sky.distM <= radiusM;
    if (inside && !wasInside && state.lastUpdate != null) {
      const name = ac.callsign ?? ac.registration ?? ac.hex;
      if (assessment.tone === 'emergency' || assessment.tone === 'event')
        newAlerts.push(alert(ac.hex, assessment.tone, `${name} · Squawk ${ac.squawk}`, assessment.squawkNote ?? 'Emergency'));
      else if (watch) newAlerts.push(alert(ac.hex, 'watch', `${name} · Watchlist`, `${ac.typeCode ?? ''} entered ${s.radiusKm} km radius`));
    }
  }
  return { next, newAlerts };
}

function alert(hex: string, tone: Alert['tone'], title: string, detail: string): Alert {
  return { id: `${hex}-${Date.now()}`, hex, tone, title, detail, at: Date.now() };
}

/** Re-score everything, e.g. after the watchlist or observer changed. */
export function rescore() {
  if (!state.observer) return;
  const s = getSettings();
  const aircraft = new Map<string, Tracked>();
  state.aircraft.forEach((t, hex) => {
    const watch = watchMatch(t.ac, s.watchlist) != null;
    aircraft.set(hex, { ...t, watch, assessment: assess(t.ac, watch), sky: skyFor(t.ac, state.observer!), computedAt: Date.now() });
  });
  emit({ aircraft, notable: rescoreNotable(state.notable.map((n) => n.ac)) });
}

function rescoreNotable(list: Aircraft[]): NotableItem[] {
  const s = getSettings();
  const obs = state.observer ?? DEFAULT_LOCATION;
  const seen = new Set<string>();
  const out: NotableItem[] = [];
  for (const ac of list) {
    if (seen.has(ac.hex)) continue;
    seen.add(ac.hex);
    const distM = distanceM(obs, ac);
    if (distM > 2_500_000) continue; // Europe-scale view around the observer
    const a = assess(ac, watchMatch(ac, s.watchlist) != null);
    if (a.score < 25) continue;
    out.push({ ac, assessment: a, distM });
  }
  return out.sort((x, y) => y.assessment.score - x.assessment.score).slice(0, 25);
}

// ---------------------------------------------------------------------------
// Polling loop

let timer: number | undefined;
let notableTimer: number | undefined;
let backoff = 1;
let inFlight = false;

async function poll() {
  window.clearTimeout(timer);
  const s = getSettings();
  const observer = state.observer;
  if (!observer || document.hidden) {
    timer = window.setTimeout(poll, 1000);
    return;
  }
  if (inFlight) return;
  inFlight = true;
  if (state.status === 'idle') emit({ status: 'loading' });
  try {
    const res = await fetchNearby(observer.lat, observer.lon, s.radiusKm);
    const { next, newAlerts } = ingest(res.aircraft, observer);
    backoff = 1;
    emit({
      aircraft: next,
      lastUpdate: Date.now(),
      status: 'ok',
      error: null,
      transport: currentTransport(),
      alerts: [...newAlerts, ...state.alerts].slice(0, 5),
    });
  } catch (e) {
    const fe = e instanceof FeedError ? e : new FeedError(String(e), 'network');
    if (fe.kind === 'rate') backoff = Math.min(backoff * 2, 12);
    emit({ status: 'error', error: { kind: fe.kind, message: fe.message }, transport: currentTransport() });
  } finally {
    inFlight = false;
    timer = window.setTimeout(poll, s.pollSec * 1000 * backoff);
  }
}

async function pollNotable() {
  window.clearTimeout(notableTimer);
  const observer = state.observer;
  if (observer && !document.hidden) {
    try {
      const res = await fetchNotable(observer.lat, observer.lon);
      emit({ notable: rescoreNotable(res.aircraft), notableUpdate: Date.now() });
    } catch {
      /* keep the previous list */
    }
  }
  notableTimer = window.setTimeout(pollNotable, 60_000);
}

export function refreshNow() {
  poll();
}

export function setObserver(obs: LatLon, source: TrafficState['locationSource']) {
  const prev = state.observer;
  emit({ observer: obs, locationSource: source });
  if (!prev || distanceM(prev, obs) > 300) {
    rescore();
    poll();
    if (!prev) pollNotable();
  }
}

let gpsWatch: number | null = null;

export function startLocation() {
  const s = getSettings();
  if (s.location && !s.useGps) {
    setObserver(s.location, 'saved');
    return;
  }
  if (!state.observer) setObserver(s.location ?? DEFAULT_LOCATION, s.location ? 'saved' : 'default');
  if (s.useGps && 'geolocation' in navigator && gpsWatch == null) {
    gpsWatch = navigator.geolocation.watchPosition(
      (p) => setObserver({ lat: p.coords.latitude, lon: p.coords.longitude }, 'gps'),
      () => {
        /* permission denied or unavailable: keep saved/default location */
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 20_000 },
    );
  }
}

export function stopGps() {
  if (gpsWatch != null) navigator.geolocation.clearWatch(gpsWatch);
  gpsWatch = null;
}

export function pinLocation(lat: number, lon: number, label = 'Pinned location') {
  stopGps();
  updateSettings({ location: { lat, lon, label }, useGps: false });
  setObserver({ lat, lon }, 'saved');
}

export function enableGps() {
  updateSettings({ useGps: true });
  startLocation();
}

export function startTraffic() {
  startLocation();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      poll();
      pollNotable();
    }
  });
}
