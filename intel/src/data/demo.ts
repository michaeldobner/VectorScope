// Synthetic items and aircraft for ?demo, screenshots and tests without network.
// Every item belongs to the source "demo", so nothing here can be mistaken for a real report.
import type { Aircraft } from '../../../air/src/data/types';
import type { Item } from './types';

const H = 3600_000;

export function demoItems(now: number): Item[] {
  let n = 0;
  const item = (sourceId: string, ageH: number, title: string, text: string, channel: Item['channel'] = 'telegram'): Item => ({
    id: `demo:${++n}`,
    sourceId,
    channel,
    title,
    text,
    url: `https://example.org/demo/${n}`,
    time: now - ageH * H,
  });
  return [
    // Signal first on Telegram, then the specialist press: a reported story with lead time
    item('demo-fast-a', 1.4, 'RQ-4 drone FORTE11 orbiting over the Black Sea off Crimea', 'Demo item. Third racetrack today, south of Sevastopol.'),
    item('demo-fast-b', 1.1, 'FORTE11 Global Hawk again over the Black Sea', 'Demo item. Took off from Sigonella this morning.'),
    item('demo-press', 0.3, 'RQ-4 Global Hawk FORTE11 on a long orbit over the Black Sea', 'Demo item. The drone took off from Sigonella in the morning and has been flying racetracks off the coast of Romania for several hours.', 'rss'),
    // OSINT and a wire service: confirmed
    item('demo-osint', 2.2, 'NATO AWACS and KC-135 tanker active over the Baltic Sea', 'Demo item. An E-3A from Geilenkirchen is airborne, supported by a KC-135 from Mildenhall.', 'bluesky'),
    item('demo-confirm', 1.0, 'NATO confirms AWACS patrol over the Baltic Sea', 'Demo item. The alliance says the E-3 mission is routine air policing support.', 'rss'),
    // Two unverified channels: emerging
    item('demo-fast-a', 0.6, 'Airspace near Rzeszów partly closed, several C-17 transports inbound', 'Demo item. Unconfirmed reports of a NOTAM.'),
    item('demo-fast-b', 0.4, 'Reports: C-17 Globemaster arrivals at Rzeszów, airspace restrictions', 'Demo item. Ramstein departures overnight.'),
    // One unverified channel: signal
    item('demo-fast-a', 0.15, 'Large explosion reported in the port of Odesa', 'Demo item. No official statement yet.'),
    // The Voronezh case: Russian incident channel, partisan channel, governor, then a leading medium
    item('demo-ru', 0.9, 'Взрыв и пожар на НПЗ в Воронеже после атаки БПЛА', 'Демо. Очевидцы сообщают о громком взрыве.'),
    item('demo-side', 0.85, 'Атака беспилотников на Воронеж, горит НПЗ', 'Демо. По нашим данным, работает ПВО.'),
    item('demo-primary', 0.75, 'Губернатор: в Воронеже отражена атака БПЛА, пожар на промышленном объекте', 'Демо. Пострадавших нет.'),
    item('demo-confirm', 0.2, 'Drone attack causes fire at oil refinery in Voronezh', 'Demo item. Regional authorities report no casualties.', 'rss'),
    // A physical measurement
    { ...item('demo-quake', 0.5, 'Earthquake M6.1 near Izmir, Turkey', 'Demo item. Depth 12 km.', 'rss'), channel: 'sensor', lat: 38.4, lon: 27.1, area: 'Izmir, Turkey' },
    // German specialist press
    item('demo-de', 2.5, 'Luftwaffe verlegt Eurofighter nach Rumänien', 'Demo-Beitrag. Vier Eurofighter übernehmen das Air Policing am Schwarzen Meer.', 'rss'),
    item('demo-press', 30, 'Analysis: tanker activity over the Mediterranean', 'Demo item. Open source flight data shows a rise in KC-46 and A330 MRTT sorties over the past week.', 'rss'),
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
    ac('ae01d2', 'JAKE11', 'R135', 56.3, 19.4, 33000, 90),
    { ...ac('400a1b', 'BAW2PD', 'B772', 46.9, 9.1, 9000, 200), dbFlags: 0, squawk: '7700', typeName: 'Boeing 777-200' },
  ];
}
