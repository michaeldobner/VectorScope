import { ADSBLOL_BASE, parseRoutes, parseV2, type RouteInfo } from './adsblol';
import { demoNotable, demoSnapshot } from './demo';
import type { FeedResult } from './types';
import { getSettings } from '../state/settings';

export type Transport = 'direct' | 'proxy' | 'relay' | 'demo';

/**
 * Own proxy address built into the app. When set, nobody has to enter anything in Settings.
 * A proxy entered in Settings still takes precedence.
 */
export const BUILTIN_PROXY = '';

/**
 * Free public relays that need no account. adsb.lol does not allow direct browser access,
 * so in "auto" mode these are tried when no own proxy is available. Best effort only.
 */
const RELAYS: { name: string; wrap: (url: string) => string }[] = [
  { name: 'allorigins', wrap: (u) => `https://api.allorigins.win/raw?disableCache=true&url=${encodeURIComponent(u)}` },
  { name: 'codetabs', wrap: (u) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(u)}` },
];

export class FeedError extends Error {
  constructor(
    message: string,
    public kind: 'cors' | 'rate' | 'http' | 'network' | 'config',
    public status?: number,
  ) {
    super(message);
  }
}

// In "auto" mode we remember which route worked so we do not probe every poll.
let autoRoute: { transport: Transport; relay?: number } | null = null;

function proxyBase(): string | null {
  const url = (getSettings().proxyUrl.trim() || BUILTIN_PROXY).replace(/\/+$/, '');
  return url || null;
}

export function currentTransport(): Transport {
  const s = getSettings();
  if (s.feedMode !== 'auto') return s.feedMode;
  return autoRoute?.transport ?? 'direct';
}

/** Name of the active route for the status display. */
export function currentRouteLabel(): string {
  const t = currentTransport();
  if (t === 'relay' && autoRoute?.relay != null) return `relay (${RELAYS[autoRoute.relay].name})`;
  return t;
}

async function request(path: string, init?: RequestInit): Promise<unknown> {
  const s = getSettings();
  const isGet = !init?.method || init.method === 'GET';

  const tryOnce = async (t: Transport, relay?: number) => {
    let url: string;
    if (t === 'proxy') {
      const base = proxyBase();
      if (!base) throw new FeedError('No proxy configured', 'config');
      url = base + path;
    } else if (t === 'relay') {
      if (!isGet || relay == null) throw new FeedError('Relay only supports GET', 'config');
      url = RELAYS[relay].wrap(`${ADSBLOL_BASE}${path}${path.includes('?') ? '&' : '?'}_=${Date.now()}`);
    } else url = ADSBLOL_BASE + path;

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (t === 'proxy' && s.proxyToken) headers['X-VS-Token'] = s.proxyToken;
    if (init?.body) headers['Content-Type'] = 'application/json';
    let res: Response;
    try {
      res = await fetch(url, t === 'relay' ? { cache: 'no-store' } : { ...init, headers, cache: 'no-store' });
    } catch (e) {
      // A CORS rejection surfaces as a TypeError without status.
      throw new FeedError(String(e), t === 'direct' ? 'cors' : 'network');
    }
    if (res.status === 429) throw new FeedError('Rate limited', 'rate', 429);
    if (!res.ok) throw new FeedError(`HTTP ${res.status}`, 'http', res.status);
    try {
      return await res.json();
    } catch {
      throw new FeedError('Invalid response', 'network');
    }
  };

  if (s.feedMode !== 'auto') {
    if (s.feedMode === 'relay') return tryAllRelays(tryOnce);
    return tryOnce(s.feedMode as Transport);
  }

  if (autoRoute) {
    try {
      return await tryOnce(autoRoute.transport, autoRoute.relay);
    } catch (e) {
      if (e instanceof FeedError && e.kind === 'rate') throw e;
      autoRoute = null; // route broke, probe again below
    }
  }

  // Probe: own proxy, direct, then public relays.
  let lastError: unknown = null;
  if (proxyBase()) {
    try {
      const r = await tryOnce('proxy');
      autoRoute = { transport: 'proxy' };
      return r;
    } catch (e) {
      lastError = e;
    }
  }
  try {
    const r = await tryOnce('direct');
    autoRoute = { transport: 'direct' };
    return r;
  } catch (e) {
    lastError = lastError ?? e;
    if (!isGet) throw e;
  }
  try {
    return await tryAllRelays(tryOnce);
  } catch {
    throw lastError instanceof FeedError ? lastError : new FeedError(String(lastError), 'network');
  }
}

async function tryAllRelays(tryOnce: (t: Transport, relay?: number) => Promise<unknown>): Promise<unknown> {
  let err: unknown = null;
  for (let i = 0; i < RELAYS.length; i++) {
    try {
      const r = await tryOnce('relay', i);
      if (getSettings().feedMode === 'auto') autoRoute = { transport: 'relay', relay: i };
      return r;
    } catch (e) {
      err = e;
    }
  }
  throw err;
}

/** Round coordinates so the exact location never leaves the device (about 1 km). */
function coarse(v: number) {
  return Math.round(v * 100) / 100;
}

export async function fetchNearby(lat: number, lon: number, radiusKm: number): Promise<FeedResult> {
  if (currentTransport() === 'demo') return demoSnapshot(lat, lon);
  // Query a bit wider than the display radius so approaching traffic is known early.
  const nm = Math.min(250, Math.ceil((radiusKm * 1.25 + 2) / 1.852));
  const json = await request(`/v2/point/${coarse(lat)}/${coarse(lon)}/${nm}`);
  return parseV2(json);
}

/** Military traffic worldwide plus emergencies, for NOTABLE NOW. */
export async function fetchNotable(lat: number, lon: number): Promise<FeedResult> {
  if (currentTransport() === 'demo') return demoNotable(lat, lon);
  const [mil, sq7700] = await Promise.allSettled([request('/v2/mil'), request('/v2/sqk/7700')]);
  const out: FeedResult = { aircraft: [], now: Date.now() };
  for (const r of [mil, sq7700]) {
    if (r.status === 'fulfilled') {
      const p = parseV2(r.value);
      out.aircraft.push(...p.aircraft);
      out.now = p.now;
    }
  }
  if (mil.status === 'rejected' && sq7700.status === 'rejected') throw mil.reason;
  return out;
}

export async function fetchSearch(query: string): Promise<FeedResult> {
  const q = query.trim().toUpperCase();
  if (!q) return { aircraft: [], now: Date.now() };
  if (currentTransport() === 'demo') {
    const d = demoNotable(50, 8);
    return { ...d, aircraft: d.aircraft.filter((a) => [a.callsign, a.hex, a.registration].some((v) => v?.includes(q))) };
  }
  const path = /^[0-9A-F]{6}$/.test(q)
    ? `/v2/hex/${q}`
    : /-/.test(q) || /^N\d/.test(q)
      ? `/v2/reg/${encodeURIComponent(q)}`
      : `/v2/callsign/${encodeURIComponent(q)}`;
  return parseV2(await request(path));
}

const routeCache = new Map<string, { at: number; route: RouteInfo | null }>();

export async function fetchRoute(callsign: string, lat: number, lon: number): Promise<RouteInfo | null> {
  const key = callsign.trim().toUpperCase();
  const hit = routeCache.get(key);
  if (hit && Date.now() - hit.at < 30 * 60_000) return hit.route;
  if (currentTransport() === 'demo') return null;
  // routeset sends CORS headers itself, so try directly first.
  const body = JSON.stringify({ planes: [{ callsign: key, lat, lng: lon }] });
  let json: unknown;
  try {
    const res = await fetch(`${ADSBLOL_BASE}/api/0/routeset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if (!res.ok) throw new Error(String(res.status));
    json = await res.json();
  } catch {
    json = await request('/api/0/routeset', { method: 'POST', body });
  }
  const route = parseRoutes(json).find((r) => r.callsign.toUpperCase() === key) ?? null;
  routeCache.set(key, { at: Date.now(), route });
  return route;
}

export interface Photo {
  src: string;
  link: string;
  photographer: string;
}

const photoCache = new Map<string, Photo | null>();

/** Aircraft photo from planespotters.net (attribution required, link back to the photo page). */
export async function fetchPhoto(hex: string): Promise<Photo | null> {
  if (photoCache.has(hex)) return photoCache.get(hex)!;
  try {
    const res = await fetch(`https://api.planespotters.net/pub/photos/hex/${hex}`);
    const json = await res.json();
    const p = json?.photos?.[0];
    const photo = p ? { src: p.thumbnail_large?.src ?? p.thumbnail?.src, link: p.link, photographer: p.photographer } : null;
    photoCache.set(hex, photo);
    return photo;
  } catch {
    photoCache.set(hex, null);
    return null;
  }
}
