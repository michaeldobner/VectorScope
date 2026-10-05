// Physical sensors and machine readable warning systems: earthquakes (USGS, EMSC), disaster alerts (GDACS),
// extreme weather warnings (US National Weather Service) and ground stops (FAA).
// They do not report in a journalistic sense, they measure or decide. Items carry the coordinates of the event.
import type { Item } from './types';
import { decodeEntities, plainText } from './text';

/** Where each machine readable source is fetched. GDACS and FAA allow no browser access and go through the proxy. */
export const API_URL = {
  usgs: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson',
  emsc: 'https://www.seismicportal.eu/fdsnws/event/1/query?limit=30&format=json&minmag=4.5&orderby=time',
  gdacs: 'https://www.gdacs.org/xml/rss.xml',
  nws: 'https://api.weather.gov/alerts/active?severity=Extreme&status=actual&message_type=alert',
  faa: 'https://nasstatus.faa.gov/api/airport-status-information',
} as const;
export const VIA_PROXY: (keyof typeof API_URL)[] = ['gdacs', 'faa'];

/** Minimum magnitude worth a report. Smaller quakes happen every hour somewhere. */
export const MIN_MAGNITUDE = 5;

const region = (s: string) =>
  s
    .toLowerCase()
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();

/** USGS GeoJSON summary feed. */
export function parseUsgs(json: any, sourceId: string): Item[] {
  const out: Item[] = [];
  for (const f of Array.isArray(json?.features) ? json.features : []) {
    const p = f?.properties ?? {};
    const [lon, lat, depth] = f?.geometry?.coordinates ?? [];
    const mag = Number(p.mag);
    if (!(mag >= MIN_MAGNITUDE) || typeof lat !== 'number' || typeof lon !== 'number') continue;
    // "117 km SW of Bengkulu, Indonesia": the place after "of" names the area.
    const where = String(p.place ?? '').replace(/^.*?\bof\s+/, '') || 'unknown area';
    out.push({
      id: `usgs:${f.id}`,
      sourceId,
      channel: 'sensor',
      title: `Earthquake M${mag.toFixed(1)} near ${where}`,
      text: `${p.place ?? where}, depth ${Math.round(Number(depth) || 0)} km.${p.tsunami ? ' Tsunami flag set.' : ''}`,
      url: String(p.url ?? `https://earthquake.usgs.gov/earthquakes/eventpage/${f.id}`),
      time: Number(p.time),
      lat,
      lon,
      area: where,
    });
  }
  return out;
}

/** EMSC FDSN event service, JSON. */
export function parseEmsc(json: any, sourceId: string): Item[] {
  const out: Item[] = [];
  for (const f of Array.isArray(json?.features) ? json.features : []) {
    const p = f?.properties ?? {};
    const mag = Number(p.mag);
    const lat = Number(p.lat ?? f?.geometry?.coordinates?.[1]);
    const lon = Number(p.lon ?? f?.geometry?.coordinates?.[0]);
    if (!(mag >= MIN_MAGNITUDE) || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const where = region(String(p.flynn_region ?? 'unknown area'));
    const id = String(p.unid ?? f.id);
    out.push({
      id: `emsc:${id}`,
      sourceId,
      channel: 'sensor',
      title: `Earthquake M${mag.toFixed(1)} ${where}`,
      text: `${where}, depth ${Math.round(Number(p.depth) || 0)} km.`,
      url: `https://www.seismicportal.eu/eventdetails.html?unid=${encodeURIComponent(id)}`,
      time: Date.parse(p.time),
      lat,
      lon,
      area: where,
    });
  }
  return out;
}

const tag = (block: string, name: string) => block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'))?.[1]?.trim() ?? null;

/** GDACS RSS: only orange and red alerts, green ones are routine. */
export function parseGdacs(xml: string, sourceId: string): Item[] {
  const out: Item[] = [];
  for (const block of xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? []) {
    const level = (tag(block, 'gdacs:alertlevel') ?? '').toLowerCase();
    if (level !== 'orange' && level !== 'red') continue;
    const lat = Number(tag(block, 'geo:lat'));
    const lon = Number(tag(block, 'geo:long'));
    const title = plainText(tag(block, 'title') ?? '');
    const link = decodeEntities(tag(block, 'link') ?? '');
    const time = Date.parse(tag(block, 'pubDate') ?? '');
    if (!title || !Number.isFinite(time)) continue;
    const country = plainText(tag(block, 'gdacs:country') ?? '');
    out.push({
      id: `gdacs:${tag(block, 'gdacs:eventtype') ?? ''}${tag(block, 'gdacs:eventid') ?? link}`,
      sourceId,
      channel: 'sensor',
      title,
      text: plainText(tag(block, 'description') ?? '').slice(0, 300),
      url: link,
      time,
      ...(Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : {}),
      ...(country ? { area: country } : {}),
    });
  }
  return out;
}

/** NWS alerts with severity Extreme: tornado, hurricane, tsunami and similar. Position is the centre of the alert area. */
export function parseNws(json: any, sourceId: string): Item[] {
  const out: Item[] = [];
  for (const f of Array.isArray(json?.features) ? json.features : []) {
    const p = f?.properties ?? {};
    const ring: number[][] | undefined = f?.geometry?.coordinates?.[0];
    const centre = ring?.length ? ring.reduce((a, c) => [a[0] + c[0] / ring.length, a[1] + c[1] / ring.length], [0, 0]) : null;
    const time = Date.parse(p.sent ?? p.effective);
    if (!p.event || !Number.isFinite(time)) continue;
    const area = String(p.areaDesc ?? '').split(';')[0].trim();
    out.push({
      id: `nws:${p.id ?? f.id}`,
      sourceId,
      channel: 'sensor',
      title: `${p.event}: ${area}${p.areaDesc?.includes(';') ? ' and more' : ''}`,
      text: String(p.headline ?? '').slice(0, 300),
      url: String(f.id ?? 'https://alerts.weather.gov'),
      time,
      ...(centre ? { lon: centre[0], lat: centre[1] } : {}),
      ...(area ? { area } : {}),
    });
  }
  return out;
}

/** US airports with coordinates, for ground stops. */
const US_AIRPORTS: Record<string, [string, number, number]> = {
  ATL: ['Atlanta', 33.64, -84.43], BOS: ['Boston', 42.36, -71.01], CLT: ['Charlotte', 35.21, -80.94], DCA: ['Washington National', 38.85, -77.04],
  DEN: ['Denver', 39.86, -104.67], DFW: ['Dallas Fort Worth', 32.9, -97.04], DTW: ['Detroit', 42.21, -83.35], EWR: ['Newark', 40.69, -74.17],
  IAD: ['Washington Dulles', 38.95, -77.46], IAH: ['Houston', 29.98, -95.34], JFK: ['New York JFK', 40.64, -73.78], LAS: ['Las Vegas', 36.08, -115.15],
  LAX: ['Los Angeles', 33.94, -118.41], LGA: ['New York LaGuardia', 40.78, -73.87], MCO: ['Orlando', 28.43, -81.31], MIA: ['Miami', 25.79, -80.29],
  MSP: ['Minneapolis', 44.88, -93.22], ORD: ['Chicago OHare', 41.98, -87.9], PHL: ['Philadelphia', 39.87, -75.24], PHX: ['Phoenix', 33.44, -112.01],
  SAN: ['San Diego', 32.73, -117.19], SEA: ['Seattle', 47.45, -122.31], SFO: ['San Francisco', 37.62, -122.38], TPA: ['Tampa', 27.98, -82.53],
};

/** FAA airport status: ground stops only. Delays and closures for general aviation are routine. */
export function parseFaa(xml: string, sourceId: string, now: number): Item[] {
  const list = xml.match(/<Ground_Stop_List>([\s\S]*?)<\/Ground_Stop_List>/)?.[1] ?? '';
  const out: Item[] = [];
  for (const block of list.match(/<Program>[\s\S]*?<\/Program>/g) ?? []) {
    const arpt = tag(block, 'ARPT') ?? '';
    const reason = plainText(tag(block, 'Reason') ?? '');
    const end = plainText(tag(block, 'End_Time') ?? '');
    if (!arpt) continue;
    const known = US_AIRPORTS[arpt];
    // One report per airport and day, the FAA status has no start time.
    out.push({
      id: `faa:${arpt}:${new Date(now).toISOString().slice(0, 10)}`,
      sourceId,
      channel: 'sensor',
      title: `Ground stop at ${known ? `${known[0]} (${arpt})` : arpt}${reason ? `: ${reason}` : ''}`,
      text: end ? `Expected until ${end}.` : '',
      url: 'https://nasstatus.faa.gov',
      time: now,
      ...(known ? { lat: known[1], lon: known[2], area: known[0] } : {}),
    });
  }
  return out;
}
