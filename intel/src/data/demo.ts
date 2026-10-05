// Synthetic items and aircraft for ?demo, screenshots and tests without network.
// Every item belongs to the source "demo", so nothing here can be mistaken for a real report.
import type { Aircraft } from '../../../air/src/data/types';
import type { Item } from './types';

const H = 3600_000;

export function demoItems(now: number): Item[] {
  const item = (n: number, ageH: number, title: string, text: string): Item => ({
    id: `demo:${n}`,
    sourceId: 'demo',
    channel: n % 2 ? 'rss' : 'bluesky',
    title,
    text,
    url: `https://example.org/demo/${n}`,
    time: now - ageH * H,
  });
  return [
    item(1, 0.3, 'RQ-4 Global Hawk FORTE11 on a long orbit over the Black Sea', 'Demo item. The drone took off from Sigonella in the morning and has been flying racetracks off the coast of Romania for several hours.'),
    item(2, 1.2, 'NATO AWACS monitoring the Baltic Sea', 'Demo item. An E-3A from Geilenkirchen is airborne over the Baltic, supported by a KC-135 tanker from Mildenhall.'),
    item(3, 2.5, 'Luftwaffe verlegt Eurofighter nach Rumänien', 'Demo-Beitrag. Vier Eurofighter des Taktischen Luftwaffengeschwaders 71 übernehmen das Air Policing am Schwarzen Meer.'),
    item(4, 5, 'C-17 transports seen at Rzeszów', 'Demo item. Several C-17 Globemaster flights from Ramstein arrived in Poland during the night.'),
    item(5, 9, 'Naval exercise in the North Sea', 'Demo item. Frigates of four navies train anti submarine warfare, supported by a P-8 Poseidon.'),
    item(6, 30, 'Analysis: tanker activity over the Mediterranean', 'Demo item. Open source flight data shows a rise in KC-46 and A330 MRTT sorties over the past week.'),
  ];
}

const ac = (hex: string, callsign: string, typeCode: string, lat: number, lon: number, altFt: number, track: number): Aircraft => ({
  hex,
  callsign,
  registration: null,
  typeCode,
  typeName: null,
  operator: null,
  year: null,
  dbFlags: 1,
  category: null,
  lat,
  lon,
  altFt,
  onGround: false,
  gsKt: 340,
  track,
  trackRate: 0,
  vRateFpm: 0,
  squawk: null,
  emergency: null,
  posSource: 'adsb',
  posTime: Date.now(),
});

export function demoLive(): Aircraft[] {
  return [
    ac('ae5420', 'FORTE11', 'Q4', 43.9, 31.2, 52000, 80),
    ac('4d03c0', 'NATO03', 'E3TF', 55.6, 17.1, 30000, 250),
    ac('ae01ce', 'LAGR223', 'K35R', 54.9, 15.8, 26000, 70),
    ac('ae07e1', 'RCH419', 'C17', 50.2, 21.6, 31000, 95),
    ac('3f4a21', 'GAF684', 'A400', 51.4, 9.7, 21000, 120),
  ];
}
