import type { Aircraft, FeedResult } from './types';

// adsb.lol serves readsb "v2" JSON. Data licence: ODbL 1.0, attribution required.
export const ADSBLOL_BASE = 'https://api.adsb.lol';

/* eslint-disable @typescript-eslint/no-explicit-any */
function num(v: any): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}
function str(v: any): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s.length ? s : null;
}

export function parseV2(json: any): FeedResult {
  const now = num(json?.now) ?? Date.now();
  const list: any[] = Array.isArray(json?.ac) ? json.ac : [];
  const aircraft: Aircraft[] = [];
  for (const a of list) {
    const lat = num(a.lat) ?? num(a.lastPosition?.lat);
    const lon = num(a.lon) ?? num(a.lastPosition?.lon);
    if (lat == null || lon == null || typeof a.hex !== 'string') continue;
    const seenPos = num(a.seen_pos) ?? num(a.lastPosition?.seen_pos) ?? 0;
    if (seenPos > 60) continue; // stale
    const onGround = a.alt_baro === 'ground';
    const t: string = typeof a.type === 'string' ? a.type : '';
    aircraft.push({
      hex: a.hex.replace(/^~/, '').toUpperCase(),
      callsign: str(a.flight),
      registration: str(a.r),
      typeCode: str(a.t),
      typeName: str(a.desc),
      operator: str(a.ownOp),
      year: num(Number(a.year)) || null,
      dbFlags: num(a.dbFlags) ?? 0,
      category: str(a.category),
      lat,
      lon,
      altFt: onGround ? 0 : (num(a.alt_baro) ?? num(a.alt_geom)),
      onGround,
      gsKt: num(a.gs),
      track: num(a.track) ?? num(a.true_heading) ?? num(a.calc_track),
      trackRate: num(a.track_rate),
      vRateFpm: num(a.baro_rate) ?? num(a.geom_rate),
      squawk: str(a.squawk),
      emergency: str(a.emergency),
      posSource: t.startsWith('mlat') ? 'mlat' : t.startsWith('tisb') ? 'tisb' : t.startsWith('adsb') ? 'adsb' : 'other',
      posTime: now - seenPos * 1000,
    });
  }
  return { aircraft, now };
}

export interface Airport {
  icao: string | null;
  iata: string | null;
  name: string | null;
  city: string | null;
  country: string | null;
  lat: number | null;
  lon: number | null;
}

export interface RouteInfo {
  callsign: string;
  airline: string | null;
  origin: Airport;
  destination: Airport;
}

function airport(a: any): Airport {
  return {
    icao: str(a?.icao_code),
    iata: str(a?.iata_code),
    name: str(a?.name),
    city: str(a?.municipality),
    country: str(a?.country_name),
    lat: num(a?.latitude),
    lon: num(a?.longitude),
  };
}

/** Parse an adsbdb.com /v0/callsign response. */
export function parseAdsbdbRoute(json: any): RouteInfo | null {
  const r = json?.response?.flightroute;
  if (!r || !r.origin || !r.destination) return null;
  return {
    callsign: str(r.callsign) ?? '',
    airline: str(r.airline?.name),
    origin: airport(r.origin),
    destination: airport(r.destination),
  };
}
