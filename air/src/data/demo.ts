import { destination } from '../geo/geo';
import type { Aircraft, FeedResult } from './types';

// Synthetic traffic for demo mode and screenshots. Every flight crosses the area on a
// straight line and re-enters on the other side, so the picture stays alive forever.

interface Spec {
  hex: string;
  callsign: string;
  reg: string;
  type: string;
  desc: string;
  op: string;
  year?: number;
  flags?: number;
  cat?: string;
  track: number;
  /** Lateral miss distance from the observer, km (signed). */
  offsetKm: number;
  altFt: number;
  gsKt: number;
  vRate?: number;
  squawk?: string;
  phase: number;
}

const AIRLINERS: [string, string, string, string][] = [
  ['DLH', 'A20N', 'Airbus A320neo', 'Lufthansa'],
  ['DLH', 'A359', 'Airbus A350-900', 'Lufthansa'],
  ['EWG', 'A320', 'Airbus A320', 'Eurowings'],
  ['RYR', 'B38M', 'Boeing 737 MAX 8', 'Ryanair'],
  ['BAW', 'A321', 'Airbus A321', 'British Airways'],
  ['AFR', 'A359', 'Airbus A350-900', 'Air France'],
  ['KLM', 'B738', 'Boeing 737-800', 'KLM'],
  ['UAE', 'A388', 'Airbus A380-800', 'Emirates'],
  ['SWR', 'BCS3', 'Airbus A220-300', 'Swiss'],
  ['AUA', 'E195', 'Embraer 195', 'Austrian'],
  ['CFG', 'A321', 'Airbus A321', 'Condor'],
  ['TAP', 'A21N', 'Airbus A321neo', 'TAP Air Portugal'],
  ['UAL', 'B789', 'Boeing 787-9', 'United Airlines'],
  ['THY', 'A333', 'Airbus A330-300', 'Turkish Airlines'],
  ['WZZ', 'A21N', 'Airbus A321neo', 'Wizz Air'],
  ['CLX', 'B744', 'Boeing 747-400F', 'Cargolux'],
];

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function buildSpecs(): Spec[] {
  const r = rng(42);
  const specs: Spec[] = [];
  for (let i = 0; i < 40; i++) {
    const [icao, type, desc, op] = AIRLINERS[Math.floor(r() * AIRLINERS.length)];
    const climbing = r() < 0.2;
    specs.push({
      hex: (0x3c4000 + Math.floor(r() * 0xffff)).toString(16).toUpperCase(),
      callsign: `${icao}${Math.floor(r() * 900 + 100)}${r() < 0.3 ? 'X' : ''}`,
      reg: `D-A${String.fromCharCode(65 + Math.floor(r() * 26))}${String.fromCharCode(65 + Math.floor(r() * 26))}${String.fromCharCode(65 + Math.floor(r() * 26))}`,
      type,
      desc,
      op,
      track: Math.floor(r() * 360),
      offsetKm: (r() - 0.5) * 90,
      altFt: climbing ? Math.round(8000 + r() * 12000) : Math.round(28000 + r() * 11000),
      gsKt: Math.round(380 + r() * 110),
      vRate: climbing ? Math.round(1200 + r() * 1500) : 0,
      phase: r(),
    });
  }
  specs.push(
    { hex: 'AE5421', callsign: 'FORTE11', reg: '11-2048', type: 'Q4', desc: 'Northrop Grumman RQ-4B Global Hawk', op: 'United States Air Force', year: 2011, flags: 1, track: 62, offsetKm: 14, altFt: 52000, gsKt: 340, phase: 0.35 },
    { hex: 'AE146C', callsign: 'RCH419', reg: '05-5142', type: 'C17', desc: 'Boeing C-17A Globemaster III', op: 'United States Air Force', year: 2006, flags: 1, track: 86, offsetKm: 6, altFt: 32000, gsKt: 438, vRate: 64, phase: 0.42 },
    { hex: 'AE01CE', callsign: 'LAGR223', reg: '62-3534', type: 'K35R', desc: 'Boeing KC-135R Stratotanker', op: 'United States Air Force', year: 1962, flags: 1, track: 118, offsetKm: -22, altFt: 26000, gsKt: 412, phase: 0.6 },
    { hex: '3C6DD1', callsign: 'DLH8MJ', reg: 'D-AISQ', type: 'A321', desc: 'Airbus A321', op: 'Lufthansa', year: 2011, track: 250, offsetKm: -31, altFt: 18400, gsKt: 360, vRate: -1800, squawk: '7700', phase: 0.55 },
    { hex: '4D03D0', callsign: 'NATO03', reg: 'LX-N90451', type: 'E3TF', desc: 'Boeing E-3A Sentry', op: 'NATO', year: 1982, flags: 1, track: 160, offsetKm: 38, altFt: 30000, gsKt: 380, phase: 0.2 },
    { hex: '3F4B3A', callsign: 'GAF684', reg: '54+08', type: 'A400', desc: 'Airbus A400M Atlas', op: 'German Air Force', year: 2017, flags: 1, track: 300, offsetKm: -9, altFt: 21000, gsKt: 330, phase: 0.7 },
    { hex: '3D5D5D', callsign: 'DAQUI', reg: 'D-AQUI', type: 'JU52', desc: 'Junkers Ju 52/3m', op: 'Private', year: 1936, flags: 2, track: 20, offsetKm: 2, altFt: 2800, gsKt: 95, phase: 0.48 },
    { hex: '3DD4E1', callsign: 'CHX22', reg: 'D-HDSB', type: 'EC35', desc: 'Airbus Helicopters H135', op: 'ADAC Luftrettung', cat: 'A7', track: 200, offsetKm: -4, altFt: 1600, gsKt: 120, phase: 0.3 },
    { hex: '3C4DD2', callsign: 'DLH400', reg: 'D-ABYA', type: 'B748', desc: 'Boeing 747-8', op: 'Lufthansa', year: 2012, track: 292, offsetKm: 0.8, altFt: 35000, gsKt: 480, phase: 0.46 },
  );
  return specs;
}

const SPECS = buildSpecs();
const T0 = Date.now();
const SPAN_KM = 160;

function position(spec: Spec, center: { lat: number; lon: number }, t: number) {
  const speedKmS = (spec.gsKt * 1.852) / 3600;
  const period = (2 * SPAN_KM) / speedKmS;
  const s = (((t - T0) / 1000 / period + spec.phase) % 1) * 2 * SPAN_KM - SPAN_KM; // -SPAN..SPAN along track
  const lateral = destination(center, spec.track + 90, spec.offsetKm * 1000);
  return destination(lateral, spec.track, s * 1000);
}

function toAircraft(spec: Spec, center: { lat: number; lon: number }, now: number): Aircraft {
  const p = position(spec, center, now);
  return {
    hex: spec.hex,
    callsign: spec.callsign,
    registration: spec.reg,
    typeCode: spec.type,
    typeName: spec.desc,
    operator: spec.op,
    year: spec.year ?? null,
    dbFlags: spec.flags ?? 0,
    category: spec.cat ?? 'A3',
    lat: p.lat,
    lon: p.lon,
    altFt: spec.altFt,
    onGround: false,
    gsKt: spec.gsKt,
    track: spec.track,
    trackRate: 0,
    vRateFpm: spec.vRate ?? 0,
    squawk: spec.squawk ?? String(1000 + Math.abs(parseInt(spec.hex, 16) % 6777)).padStart(4, '0'),
    emergency: spec.squawk === '7700' ? 'general' : null,
    posSource: 'adsb',
    posTime: now,
  };
}

export function demoSnapshot(lat: number, lon: number): FeedResult {
  const now = Date.now();
  return { now, aircraft: SPECS.map((s) => toAircraft(s, { lat, lon }, now)) };
}

const NOTABLE: (Partial<Aircraft> & { hex: string; lat: number; lon: number })[] = [
  { hex: 'AE5420', callsign: 'FORTE10', registration: '10-2043', typeCode: 'Q4', typeName: 'RQ-4B Global Hawk', operator: 'United States Air Force', lat: 43.6, lon: 33.1, altFt: 53000, gsKt: 320, track: 80, dbFlags: 1 },
  { hex: 'AE01C5', callsign: 'JAKE11', registration: '64-14845', typeCode: 'R135', typeName: 'Boeing RC-135V Rivet Joint', operator: 'United States Air Force', lat: 56.2, lon: 20.4, altFt: 33000, gsKt: 390, track: 40, dbFlags: 1 },
  { hex: '4D03CF', callsign: 'NATO06', registration: 'LX-N90449', typeCode: 'E3TF', typeName: 'Boeing E-3A Sentry', operator: 'NATO', lat: 45.4, lon: 26.2, altFt: 31000, gsKt: 360, track: 300, dbFlags: 1 },
  { hex: 'AE6857', callsign: 'HOMER51', registration: '169330', typeCode: 'P8', typeName: 'Boeing P-8A Poseidon', operator: 'United States Navy', lat: 57.8, lon: 18.9, altFt: 24000, gsKt: 340, track: 190, dbFlags: 1 },
  { hex: 'AE0412', callsign: 'DOOM31', registration: '60-0034', typeCode: 'B52', typeName: 'Boeing B-52H Stratofortress', operator: 'United States Air Force', lat: 55.1, lon: 4.2, altFt: 36000, gsKt: 450, track: 95, dbFlags: 1 },
  { hex: '508035', callsign: 'ADB3451', registration: 'UR-82029', typeCode: 'A124', typeName: 'Antonov An-124-100 Ruslan', operator: 'Antonov Airlines', lat: 51.2, lon: 12.3, altFt: 30000, gsKt: 420, track: 250, dbFlags: 0, year: 1989 },
];

export function demoNotable(lat: number, lon: number): FeedResult {
  const near = demoSnapshot(lat, lon).aircraft.filter((a) => a.dbFlags & 1 || a.squawk === '7700');
  const now = Date.now();
  const far: Aircraft[] = NOTABLE.map((n) => ({
    registration: null,
    typeCode: null,
    typeName: null,
    operator: null,
    year: null,
    category: 'A5',
    onGround: false,
    trackRate: 0,
    vRateFpm: 0,
    squawk: null,
    emergency: null,
    posSource: 'adsb',
    posTime: now,
    callsign: null,
    altFt: null,
    gsKt: null,
    track: null,
    dbFlags: 0,
    ...n,
  }));
  return { now, aircraft: [...near, ...far] };
}
