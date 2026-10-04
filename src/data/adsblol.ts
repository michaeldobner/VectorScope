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

export interface RouteInfo {
  callsign: string;
  plausible: boolean;
  airports: { icao: string | null; iata: string | null; name: string | null; location: string | null }[];
}

export function parseRoutes(json: any): RouteInfo[] {
  if (!Array.isArray(json)) return [];
  return json
    .filter((r) => r && typeof r.callsign === 'string')
    .map((r) => ({
      callsign: r.callsign,
      plausible: r.plausible !== false && r.airport_codes !== 'unknown',
      airports: Array.isArray(r._airports)
        ? r._airports.map((p: any) => ({
            icao: str(p.icao),
            iata: str(p.iata),
            name: str(p.name),
            location: str(p.location),
          }))
        : [],
    }));
}
