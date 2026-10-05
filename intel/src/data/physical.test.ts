import { describe, expect, it } from 'vitest';
import { parseEmsc, parseFaa, parseGdacs, parseNws, parseUsgs } from './physical';
import { eventConfidence, buildStories } from './stories';
import { DEMO_SOURCES, sourceById, type Source } from './sources';
import { demoItems } from './demo';
import { entitiesOf } from './entities';
import type { EnrichedItem, Item } from './types';

// Shapes as answered on 2026-10-05, reduced to the fields that are read.
const USGS = { features: [
  { id: 'us7000abcd', properties: { mag: 5.6, place: '117 km SW of Bengkulu, Indonesia', time: 1791240000000, url: 'https://earthquake.usgs.gov/x', tsunami: 0 }, geometry: { coordinates: [101.5, -4.6, 35] } },
  { id: 'us7000small', properties: { mag: 4.6, place: 'somewhere', time: 1791240000000 }, geometry: { coordinates: [0, 0, 10] } },
] };
const EMSC = { features: [{ id: '20261005_0000340', properties: { time: '2026-10-05T20:22:59.52Z', flynn_region: 'SOUTH OF FIJI ISLANDS', lat: -24.441, lon: 179.879, depth: 514.9, mag: 5.0, unid: '20261005_0000340' } }] };
const GDACS = `<rss><channel>
<item><title>Green flood alert in Thailand</title><link>https://www.gdacs.org/report.aspx?eventtype=FL&amp;eventid=1</link><pubDate>Mon, 05 Oct 2026 22:09:58 GMT</pubDate><gdacs:eventtype>FL</gdacs:eventtype><gdacs:alertlevel>Green</gdacs:alertlevel><gdacs:eventid>1</gdacs:eventid><geo:Point><geo:lat>17.1</geo:lat><geo:long>99.0</geo:long></geo:Point></item>
<item><title>Orange tropical cyclone alert for MAWAR</title><description>Wind speed 180 km/h.</description><link>https://www.gdacs.org/report.aspx?eventtype=TC&amp;eventid=2</link><pubDate>Mon, 05 Oct 2026 21:00:00 GMT</pubDate><gdacs:eventtype>TC</gdacs:eventtype><gdacs:alertlevel>Orange</gdacs:alertlevel><gdacs:eventid>2</gdacs:eventid><gdacs:country>Philippines</gdacs:country><geo:Point><geo:lat>14.5</geo:lat><geo:long>125.1</geo:long></geo:Point></item>
</channel></rss>`;
const NWS = { features: [{ id: 'https://api.weather.gov/alerts/urn:1', properties: { event: 'Tornado Warning', areaDesc: 'Leon, FL; Wakulla, FL', headline: 'Tornado Warning issued October 5', sent: '2026-10-05T23:00:00-04:00' }, geometry: { coordinates: [[[-84.1, 30.1], [-84.0, 30.2], [-83.8, 30.0]]] } }] };
const FAA = `<AIRPORT_STATUS_INFORMATION><Delay_type><Name>Ground Stops</Name><Ground_Stop_List><Program><ARPT>JFK</ARPT><Reason>thunderstorms</Reason><End_Time>8:45 pm EDT</End_Time></Program></Ground_Stop_List></Delay_type><Delay_type><Name>Airport Closures</Name><Airport_Closure_List><Airport><ARPT>LAX</ARPT><Reason>GA only</Reason></Airport></Airport_Closure_List></Delay_type></AIRPORT_STATUS_INFORMATION>`;

describe('physical sensors and warning systems', () => {
  it('USGS: magnitude 5 and more, area after "of"', () => {
    const items = parseUsgs(USGS, 'usgs');
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ title: 'Earthquake M5.6 near Bengkulu, Indonesia', lat: -4.6, lon: 101.5, area: 'Bengkulu, Indonesia', channel: 'sensor' });
  });

  it('EMSC: region in normal case', () => {
    expect(parseEmsc(EMSC, 'emsc')[0]).toMatchObject({ title: 'Earthquake M5.0 South Of Fiji Islands', lat: -24.441 });
  });

  it('GDACS: only orange and red alerts', () => {
    const items = parseGdacs(GDACS, 'gdacs');
    expect(items.map((i) => i.title)).toEqual(['Orange tropical cyclone alert for MAWAR']);
    expect(items[0]).toMatchObject({ lat: 14.5, lon: 125.1, area: 'Philippines' });
  });

  it('NWS: event, first area and the centre of the polygon', () => {
    const [a] = parseNws(NWS, 'nws');
    expect(a.title).toBe('Tornado Warning: Leon, FL and more');
    expect(a.lat).toBeCloseTo(30.1, 1);
  });

  it('FAA: ground stops only', () => {
    const items = parseFaa(FAA, 'faa', Date.parse('2026-10-05T23:00:00Z'));
    expect(items.map((i) => i.title)).toEqual(['Ground stop at New York JFK (JFK): thunderstorms']);
  });

  it('coordinates become a place of the item', () => {
    const [quake] = parseUsgs(USGS, 'usgs');
    expect(entitiesOf(quake).places[0]).toMatchObject({ name: 'Bengkulu, Indonesia', lat: -4.6, radiusKm: 100 });
  });
});

const src = (id: string) => DEMO_SOURCES.find((s) => s.id === id) as Source;

describe('event confidence', () => {
  it('grows with every independent source and more with different classes', () => {
    const one = eventConfidence([src('demo-ru')]);
    const two = eventConfidence([src('demo-ru'), src('demo-side')]);
    const four = eventConfidence([src('demo-ru'), src('demo-side'), src('demo-primary'), src('demo-confirm')]);
    expect(one).toBeLessThan(0.2);
    expect(two).toBeGreaterThan(one);
    expect(four).toBeGreaterThan(0.85);
  });

  it('a second voice of the same class counts less than a different class', () => {
    expect(eventConfidence([src('demo-fast-a'), src('demo-fast-b')])).toBeLessThan(eventConfidence([src('demo-fast-a'), src('demo-osint')]));
  });

  it('never reaches 100 %', () => {
    expect(eventConfidence(DEMO_SOURCES)).toBeLessThanOrEqual(0.99);
  });
});

describe('Russian reports', () => {
  const now = Date.parse('2026-10-05T20:00:00Z');
  const enrich = (items: Item[]): EnrichedItem[] => items.map((i) => ({ ...i, entities: entitiesOf(i), matches: [] }));

  it('the Voronezh case: Russian channels, governor and an English medium become one confirmed story', () => {
    const stories = buildStories(enrich(demoItems(now)));
    const v = stories.find((s) => s.items.some((i) => i.title.includes('Voronezh')))!;
    expect(v.items.map((i) => i.sourceId).sort()).toEqual(['demo-confirm', 'demo-primary', 'demo-ru', 'demo-side']);
    expect(v.status).toBe('confirmed');
    expect(v.confidence).toBeGreaterThan(0.85);
    expect(v.leadFrom).toBe('demo-ru');
    expect(sourceById(v.lead.sourceId)?.tier).toBe('confirming');
  });

  it('an earthquake measured by a sensor is observed', () => {
    const quake = buildStories(enrich(demoItems(now))).find((s) => s.items.some((i) => i.title.includes('Izmir')))!;
    expect(quake.status).toBe('observed');
  });
});
