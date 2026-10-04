// Enrichment for the inspector: route, airline, owner and a readable type name.
// Sources (all CORS enabled, no key): adsbdb.com and hexdb.io. Results are cached per session.
import { distanceM } from '../geo/geo';
import type { Airport, RouteInfo } from './adsblol';

/* eslint-disable @typescript-eslint/no-explicit-any */
const str = (v: any): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);
const num = (v: any): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

async function getJson(url: string): Promise<any | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

function cached<T>(fn: (key: string) => Promise<T>): (key: string) => Promise<T> {
  const cache = new Map<string, Promise<T>>();
  return (key) => {
    if (!cache.has(key)) cache.set(key, fn(key));
    return cache.get(key)!;
  };
}

// --- Airports (hexdb, by ICAO code) ---------------------------------------------------------
const hexdbAirport = cached(async (icao: string): Promise<Airport | null> => {
  const j = await getJson(`https://hexdb.io/api/v1/airport/icao/${icao}`);
  if (!j || !str(j.icao)) return null;
  return {
    icao: str(j.icao),
    iata: str(j.iata),
    name: str(j.airport),
    city: cityFromName(str(j.airport)),
    country: str(j.region_name) ?? str(j.country_code),
    lat: num(j.latitude),
    lon: num(j.longitude),
  };
});

/** "Leeds Bradford Airport" → "Leeds Bradford"; good enough as a city label when no city is known. */
function cityFromName(name: string | null): string | null {
  if (!name) return null;
  return name.replace(/\b(International|Intl\.?|Airport|Airfield|Air Base|Regional|Flughafen)\b/gi, '').replace(/\s+/g, ' ').trim() || name;
}

function adsbdbAirport(a: any): Airport {
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

// --- Route candidates --------------------------------------------------------------------------
type Candidate = { source: 'adsbdb' | 'hexdb'; airline: string | null; legs: [Airport, Airport][] };

const adsbdbRoute = cached(async (cs: string): Promise<Candidate | null> => {
  const j = await getJson(`https://api.adsbdb.com/v0/callsign/${encodeURIComponent(cs)}`);
  const r = j?.response?.flightroute;
  if (!r?.origin || !r?.destination) return null;
  return { source: 'adsbdb', airline: str(r.airline?.name), legs: [[adsbdbAirport(r.origin), adsbdbAirport(r.destination)]] };
});

const hexdbRoute = cached(async (cs: string): Promise<Candidate | null> => {
  const j = await getJson(`https://hexdb.io/api/v1/route/icao/${encodeURIComponent(cs)}`);
  const codes = str(j?.route)?.split('-').filter((c: string) => /^[A-Z0-9]{4}$/.test(c));
  if (!codes || codes.length < 2) return null;
  const airports = await Promise.all(codes.map((c: string) => hexdbAirport(c)));
  const legs: [Airport, Airport][] = [];
  for (let i = 0; i < airports.length - 1; i++) if (airports[i] && airports[i + 1]) legs.push([airports[i]!, airports[i + 1]!]);
  return legs.length ? { source: 'hexdb', airline: null, legs } : null;
});

/** How far off the direct line between both airports the aircraft is (0 = on the line). */
function detour(o: Airport, d: Airport, lat: number, lon: number): number | null {
  if (o.lat == null || o.lon == null || d.lat == null || d.lon == null) return null;
  const direct = distanceM({ lat: o.lat, lon: o.lon }, { lat: d.lat, lon: d.lon });
  const via = distanceM({ lat: o.lat, lon: o.lon }, { lat, lon }) + distanceM({ lat, lon }, { lat: d.lat, lon: d.lon });
  return (via - direct) / Math.max(direct, 50_000);
}

/**
 * Route databases age differently (seasonal schedules reuse callsigns), so both sources are
 * asked and the leg that matches the aircraft's current position wins.
 */
export async function lookupRoute(callsign: string, lat: number, lon: number): Promise<RouteInfo | null> {
  const cs = callsign.trim().toUpperCase();
  const [a, h] = await Promise.all([adsbdbRoute(cs), hexdbRoute(cs)]);
  let best: { o: Airport; d: Airport; score: number } | null = null;
  for (const c of [h, a]) {
    if (!c) continue;
    for (const [o, d] of c.legs) {
      const s = detour(o, d, lat, lon);
      if (s == null || s > 0.25) continue;
      if (!best || s < best.score) best = { o, d, score: s };
    }
  }
  const airline = a?.airline ?? (await airlineFor(cs));
  if (!best) return null;
  return { callsign: cs, airline, origin: best.o, destination: best.d };
}

// --- Airline by callsign prefix --------------------------------------------------------------
const airlineByIcao = cached(async (icao: string): Promise<string | null> => {
  const j = await getJson(`https://api.adsbdb.com/v0/airline/${icao}`);
  const list = Array.isArray(j?.response) ? j.response : [];
  return str(list[0]?.name);
});

export async function airlineFor(callsign: string | null): Promise<string | null> {
  const m = callsign?.trim().toUpperCase().match(/^([A-Z]{3})\d/);
  return m ? airlineByIcao(m[1]) : null;
}

// --- Aircraft owner and type ---------------------------------------------------------------------
export interface AircraftInfo {
  owner: string | null;
  manufacturer: string | null;
  type: string | null;
  registration: string | null;
}

export const lookupAircraft = cached(async (hex: string): Promise<AircraftInfo | null> => {
  const j = await getJson(`https://api.adsbdb.com/v0/aircraft/${hex.toUpperCase()}`);
  const a = j?.response?.aircraft;
  if (a) return { owner: str(a.registered_owner), manufacturer: str(a.manufacturer), type: str(a.type), registration: str(a.registration) };
  const h = await getJson(`https://hexdb.io/api/v1/aircraft/${hex.toUpperCase()}`);
  if (h && (h.RegisteredOwners || h.Type)) return { owner: str(h.RegisteredOwners), manufacturer: str(h.Manufacturer), type: str(h.Type), registration: str(h.Registration) };
  return null;
});
