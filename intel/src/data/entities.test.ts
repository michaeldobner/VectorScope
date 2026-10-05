import { describe, expect, it } from 'vitest';
import { extractEntities, findCallsigns, findTypes } from './entities';
import { findPlaces } from './places';
import { matchLive } from './match';
import { demoItems, demoLive } from './demo';

describe('callsigns', () => {
  it('finds military callsigns from the catalogue of AIR and OSINT usage', () => {
    expect(findCallsigns('FORTE11 and FORTE 12 orbit, RCH419 lands, HOMER21 hunts').map((c) => c.callsign)).toEqual(['FORTE11', 'FORTE12', 'RCH419', 'HOMER21']);
  });

  it('ignores years, lowercase words and short prefixes with a space', () => {
    expect(findCallsigns('NATO 2026 summit, rch419, SAM 6 battery, GAF 2 squadrons')).toEqual([]);
  });
});

describe('types', () => {
  it('recognises designators in several spellings and names', () => {
    const labels = (s: string) => findTypes(s).map((t) => t.label);
    expect(labels('A KC135R and a KC-46 refuel an F-35A')).toEqual(['KC-135', 'KC-46', 'F-35']);
    expect(labels('Global Hawk, Rivet Joint and an E-3A AWACS')).toEqual(['RQ-4', 'E-3', 'RC-135']);
    expect(labels('Eurofighter und A400M der Luftwaffe')).toEqual(['A400M', 'Eurofighter']);
  });

  it('does not see types in ordinary words', () => {
    expect(findTypes('A tornado warning, a typhoon in Asia, the Atlas mountains')).toEqual([]);
  });
});

describe('places', () => {
  it('finds English and German names, most specific first', () => {
    expect(findPlaces('Over the Black Sea off Constanta in Romania').map((h) => h.place.name)).toEqual(['Constanța', 'Romania', 'Black Sea']);
    expect(findPlaces('Eurofighter über der Ostsee').map((h) => h.place.name)).toEqual(['Baltic Sea']);
    expect(findPlaces('am Schwarzen Meer').map((h) => h.place.name)).toEqual(['Black Sea']);
  });

  it('respects word boundaries', () => {
    expect(findPlaces('Iranian drones').map((h) => h.place.name)).toEqual(['Iran']);
    expect(findPlaces('An island in the Ukrainian river')).toEqual([]);
  });
});

describe('matching with live aircraft', () => {
  const now = Date.parse('2026-10-05T12:00:00Z');
  const live = demoLive();

  it('matches a named callsign that is in the air', () => {
    const e = extractEntities('FORTE11 is up again');
    const m = matchLive(e, live, now - 3600_000, now);
    expect(m.map((x) => [x.kind, x.ac.callsign])).toEqual([['callsign', 'FORTE11']]);
  });

  it('matches a named type near a named place, and elsewhere only weakly', () => {
    const e = extractEntities('NATO E-3 over the Baltic Sea, a C-17 somewhere');
    const m = matchLive(e, live, now, now);
    expect(m[0]).toMatchObject({ kind: 'type-area', label: 'E-3', place: 'Baltic Sea' });
    expect(m.find((x) => x.ac.callsign === 'RCH419')).toMatchObject({ kind: 'type', label: 'C-17' });
  });

  it('does not match old items', () => {
    const e = extractEntities('FORTE11 is up again');
    expect(matchLive(e, live, now - 72 * 3600_000, now)).toEqual([]);
  });

  it('the demo produces live matches', () => {
    const matched = demoItems(now).filter((i) => matchLive(extractEntities(`${i.title} ${i.text}`), live, i.time, now).length > 0);
    expect(matched.length).toBeGreaterThanOrEqual(3);
  });
});
