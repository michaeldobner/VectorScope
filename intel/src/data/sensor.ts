// VectorScope as its own source: patterns in live flight data become reports of the source "sensor".
// 1. Activity: tankers, AWACS, reconnaissance and bombers flying together in one area.
// 2. Emergencies: aircraft squawking 7700.
// The reports get stable ids per area or aircraft and day, so the same activity is one report, not one per refresh.
import { TYPE_CATALOG, type RoleClass } from '../../../air/src/data/catalog';
import type { Aircraft } from '../../../air/src/data/types';
import { distanceM } from '../../../air/src/geo/geo';
import { PLACES } from './places';
import type { Item } from './types';

const KEY_ROLES: Partial<Record<RoleClass, string>> = {
  tanker: 'tanker',
  awacs: 'AWACS',
  isr: 'reconnaissance',
  'maritime-patrol': 'maritime patrol',
  uav: 'drone',
  bomber: 'bomber',
};
const CLUSTER_KM = 350;

const roleOf = (ac: Aircraft): RoleClass | null => {
  const role = ac.typeCode ? TYPE_CATALOG[ac.typeCode]?.role : undefined;
  return role && role in KEY_ROLES ? role : null;
};

/**
 * The place whose area contains the point most centrally (distance relative to its radius),
 * otherwise the place whose area edge is nearest.
 */
export function placeFor(lat: number, lon: number): { name: string; over: boolean } {
  let inside: { name: string; ratio: number } | null = null;
  let nearest: { name: string; d: number } | null = null;
  for (const p of PLACES) {
    const d = distanceM({ lat, lon }, { lat: p.lat, lon: p.lon }) / 1000;
    const ratio = d / p.radiusKm;
    if (ratio <= 1 && (!inside || ratio < inside.ratio)) inside = { name: p.name, ratio };
    if (!nearest || d - p.radiusKm < nearest.d) nearest = { name: p.name, d: d - p.radiusKm };
  }
  return inside ? { name: inside.name, over: true } : { name: nearest!.name, over: false };
}

const day = (now: number) => new Date(now).toISOString().slice(0, 10);
const label = (ac: Aircraft) => `${ac.callsign?.trim() || ac.hex.toUpperCase()}${ac.typeCode ? ` (${ac.typeCode})` : ''}`;
const plural = (n: number, word: string) => `${n} ${word}${n > 1 && !word.endsWith('S') ? 's' : ''}`;

export function detectActivity(live: Aircraft[], now: number): Item[] {
  const candidates = live.filter((ac) => !ac.onGround && roleOf(ac));
  const used = new Set<string>();
  const out: Item[] = [];
  for (const seed of candidates) {
    if (used.has(seed.hex)) continue;
    const group = candidates.filter((ac) => !used.has(ac.hex) && distanceM(seed, ac) <= CLUSTER_KM * 1000);
    const roles = new Map<RoleClass, Aircraft[]>();
    for (const ac of group) roles.set(roleOf(ac)!, [...(roles.get(roleOf(ac)!) ?? []), ac]);
    const bombers = roles.get('bomber')?.length ?? 0;
    const qualifies = (group.length >= 3 && roles.size >= 2) || bombers >= 2 || (bombers >= 1 && roles.has('tanker'));
    if (!qualifies) continue;
    group.forEach((ac) => used.add(ac.hex));
    const lat = group.reduce((s, a) => s + a.lat, 0) / group.length;
    const lon = group.reduce((s, a) => s + a.lon, 0) / group.length;
    const place = placeFor(lat, lon);
    const mix = [...roles.entries()].sort((a, b) => b[1].length - a[1].length).map(([r, list]) => plural(list.length, KEY_ROLES[r]!));
    const sig = [...roles.keys()].sort().join('+');
    out.push({
      id: `sensor:activity:${place.name}:${sig}:${day(now)}`,
      sourceId: 'sensor',
      channel: 'sensor',
      title: `Air activity ${place.over ? 'over' : 'near'} ${place.name}: ${mix.join(', ')}`,
      text: `Detected in live ADS-B data: ${group.map(label).join(', ')}.`,
      url: `../air/?hex=${group[0].hex}`,
      time: now,
    });
  }
  return out;
}

/** ICAO airline codes of the larger carriers, so an emergency names the airline that news reports use. */
const AIRLINES: Record<string, string> = {
  DLH: 'Lufthansa', EWG: 'Eurowings', CFG: 'Condor', TUI: 'TUIfly', BAW: 'British Airways', VIR: 'Virgin Atlantic', EZY: 'easyJet',
  RYR: 'Ryanair', AFR: 'Air France', KLM: 'KLM', SWR: 'Swiss', AUA: 'Austrian Airlines', SAS: 'SAS', FIN: 'Finnair', IBE: 'Iberia',
  VLG: 'Vueling', AZA: 'ITA Airways', ITY: 'ITA Airways', TAP: 'TAP Air Portugal', LOT: 'LOT Polish Airlines', THY: 'Turkish Airlines',
  PGT: 'Pegasus', UAE: 'Emirates', QTR: 'Qatar Airways', ETD: 'Etihad', SVA: 'Saudia', ELY: 'El Al', AAL: 'American Airlines',
  UAL: 'United Airlines', DAL: 'Delta Air Lines', SWA: 'Southwest', ACA: 'Air Canada', SIA: 'Singapore Airlines', CPA: 'Cathay Pacific',
  QFA: 'Qantas', ANA: 'All Nippon Airways', JAL: 'Japan Airlines', AIC: 'Air India', WZZ: 'Wizz Air', EXS: 'Jet2', FDB: 'flydubai',
};

export function detectEmergencies(live: Aircraft[], now: number): Item[] {
  return live
    .filter((ac) => ac.squawk === '7700')
    .map((ac) => {
      const place = placeFor(ac.lat, ac.lon);
      const airline = AIRLINES[(ac.callsign ?? '').slice(0, 3)];
      const who = [airline, ac.callsign?.trim() || ac.hex.toUpperCase()].filter(Boolean).join(' ');
      const type = ac.typeName ?? ac.typeCode;
      return {
        id: `sensor:7700:${ac.hex}:${day(now)}`,
        sourceId: 'sensor',
        channel: 'sensor' as const,
        title: `Emergency squawk 7700: ${who}${type ? `, ${type}` : ''} ${place.over ? 'over' : 'near'} ${place.name}`,
        text: `Detected in live ADS-B data${ac.altFt != null ? ` at ${Math.round(ac.altFt * 0.3048).toLocaleString('de-DE')} m` : ''}. Squawk 7700 signals a general emergency.`,
        url: `../air/?hex=${ac.hex}`,
        time: now,
      };
    });
}

export const detectAll = (live: Aircraft[], now: number) => [...detectActivity(live, now), ...detectEmergencies(live, now)];
