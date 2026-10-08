// Recognition of callsigns, aircraft types and places in posts and articles.
// Callsign prefixes come from the catalogue of AIR, so both modules speak the same language.
import { CALLSIGN_PREFIX } from '../../../air/src/data/catalog';
import { findActors } from './actors';
import { findPlaces } from './places';

export interface CallsignEntity {
  callsign: string;
  prefix: string;
  label: string;
}
export interface TypeEntity {
  /** Display label, e.g. KC-135. */
  label: string;
  /** ICAO type designators that ADS-B reports for it. Empty if it does not broadcast. */
  codes: string[];
}
export interface PlaceEntity {
  name: string;
  /** The words of the text that named the place, so they are not counted again as words. */
  matched?: string;
  lat: number;
  lon: number;
  radiusKm: number;
}
export interface Entities {
  callsigns: CallsignEntity[];
  types: TypeEntity[];
  places: PlaceEntity[];
  /** Political actors (ids of actors.ts): Trump, Bundestag, Kremlin … */
  actors: string[];
}

/** Military callsign prefixes often named in OSINT posts, in addition to the catalogue of AIR. */
const EXTRA_PREFIX: Record<string, string> = {
  ETHYL: 'USAF KC-135 tanker',
  PACK: 'USAF KC-135 tanker',
  GOLD: 'USAF KC-135 tanker',
  BLUE: 'USAF KC-135 tanker',
  NCHO: 'USAF KC-135 tanker',
  GORDO: 'USAF KC-135 tanker',
  DOOM: 'USAF B-52',
  DEATH: 'USAF B-2',
  OLIVE: 'USAF RC-135',
  TOPCAT: 'USAF RC-135',
  SNOOP: 'USAF RC-135',
  HAVOC: 'USAF',
  IRON: 'USAF',
  BART: 'USAF E-3',
  DRAGN: 'USAF U-2',
  NAVY: 'US Navy',
  MAGMA: 'USAF E-6',
  RAPTOR: 'USAF F-22',
};

const PREFIXES: Record<string, string> = {
  ...Object.fromEntries(Object.entries(CALLSIGN_PREFIX).map(([k, v]) => [k, v.label])),
  ...EXTRA_PREFIX,
};
// Civil research and broad national prefixes are left out, they produce false hits in news text.
for (const k of ['DLR', 'NASA']) delete PREFIXES[k];

const prefixList = Object.keys(PREFIXES).sort((a, b) => b.length - a.length).join('|');
// Uppercase only. Three letter prefixes must be written together with the number (RCH123),
// longer ones may have a space (FORTE 10), never with four digits (NATO 2026 is a year).
const CALLSIGN_RE = new RegExp(`(?<![A-Za-z0-9])(${prefixList})(?:(\\d{1,4})|\\s(\\d{1,3}))(?![A-Za-z0-9])`, 'g');

export function findCallsigns(text: string): CallsignEntity[] {
  const out = new Map<string, CallsignEntity>();
  for (const m of text.matchAll(CALLSIGN_RE)) {
    const prefix = m[1];
    const digits = m[2] ?? m[3];
    if (m[3] && prefix.length < 4) continue;
    const callsign = prefix + digits;
    if (!out.has(callsign)) out.set(callsign, { callsign, prefix, label: PREFIXES[prefix] });
  }
  return [...out.values()];
}

/** Writes a designator like KC-135 as a pattern that also accepts KC135 and KC 135. */
const d = (designator: string) => designator.replace(/([A-Za-z])-(?=\d)/g, '$1[-\\s]?');

const TYPES: { label: string; codes: string[]; patterns: string[] }[] = [
  { label: 'RQ-4', codes: ['Q4'], patterns: [d('RQ-4'), 'Global Hawk'] },
  { label: 'MQ-4C', codes: ['Q4', 'MQ4'], patterns: [d('MQ-4C?'), 'Triton'] },
  { label: 'MQ-9', codes: ['Q9'], patterns: [d('MQ-9[AB]?'), 'Reaper', 'SkyGuardian'] },
  { label: 'E-3', codes: ['E3TF', 'E3CF'], patterns: [d('E-3[A-G]?'), 'AWACS', 'Sentry'] },
  { label: 'E-7', codes: ['E737'], patterns: [d('E-7A?'), 'Wedgetail'] },
  { label: 'KC-135', codes: ['K35R', 'K35E'], patterns: [d('KC-135[A-Z]?'), 'Stratotanker'] },
  { label: 'KC-46', codes: ['KC46', 'K46'], patterns: [d('KC-46A?')] },
  { label: 'A330 MRTT', codes: ['A332'], patterns: ['A330 MRTT', 'MRTT', 'Voyager', 'Phénix', 'Phenix'] },
  { label: 'RC-135', codes: ['R135'], patterns: [d('RC-135[A-Z]?'), 'Rivet Joint', 'Cobra Ball', 'Combat Sent'] },
  { label: 'P-8', codes: ['P8'], patterns: [d('P-8[AI]?'), 'Poseidon'] },
  { label: 'P-3', codes: ['P3'], patterns: [d('P-3[A-Z]?'), 'Orion'] },
  { label: 'C-17', codes: ['C17'], patterns: [d('C-17A?'), 'Globemaster'] },
  { label: 'C-5', codes: ['C5M', 'C5'], patterns: [d('C-5[AMB]?'), 'C-5M Super Galaxy'] },
  { label: 'C-130', codes: ['C130', 'C30J'], patterns: [d('C-130[A-Z]?'), 'Hercules'] },
  { label: 'A400M', codes: ['A400'], patterns: ['A400M?'] },
  { label: 'B-52', codes: ['B52'], patterns: [d('B-52[A-Z]?'), 'Stratofortress'] },
  { label: 'B-1', codes: ['B1'], patterns: [d('B-1B?'), 'Lancer'] },
  { label: 'B-2', codes: ['B2'], patterns: [d('B-2A?')] },
  { label: 'B-21', codes: [], patterns: [d('B-21')] },
  { label: 'F-35', codes: ['F35'], patterns: [d('F-35[ABC]?'), 'Lightning II'] },
  { label: 'F-16', codes: ['F16'], patterns: [d('F-16[A-Z]?'), 'Fighting Falcon', 'Viper'] },
  { label: 'F-15', codes: ['F15'], patterns: [d('F-15[A-Z]{0,2}')] },
  { label: 'F-22', codes: ['F22'], patterns: [d('F-22A?'), 'Raptor'] },
  { label: 'F/A-18', codes: ['F18', 'F18S'], patterns: ['F/A-18[A-F]?', d('F-18'), 'Super Hornet', 'Growler', d('EA-18G')] },
  { label: 'Eurofighter', codes: ['EUFI'], patterns: ['Eurofighter', 'Typhoon FGR4'] },
  { label: 'Rafale', codes: ['RFAL'], patterns: ['Rafale'] },
  { label: 'Gripen', codes: ['JAS39'], patterns: ['Gripen', d('JAS-39')] },
  { label: 'Tornado', codes: ['TOR'], patterns: ['Tornado'] },
  { label: 'U-2', codes: ['U2'], patterns: [d('U-2S?'), 'Dragon Lady'] },
  { label: 'E-8', codes: ['E8'], patterns: [d('E-8C?'), 'JSTARS'] },
  { label: 'E-6', codes: ['E6'], patterns: [d('E-6B?'), 'TACAMO'] },
  { label: 'E-4', codes: ['E4B', 'B742'], patterns: [d('E-4B?'), 'Nightwatch', 'Doomsday plane'] },
  { label: 'E-2', codes: ['E2'], patterns: [d('E-2[CD]?'), 'Hawkeye'] },
  { label: 'V-22', codes: ['V22'], patterns: [d('[CM]?V-22[A-Z]?'), 'Osprey'] },
  { label: 'CH-47', codes: ['H47'], patterns: [d('[CM]?H-47[A-Z]?'), 'Chinook'] },
  { label: 'Air Force One', codes: ['B742', 'VC25', 'B748'], patterns: ['Air Force One', d('VC-25[AB]?')] },
  { label: 'Il-76', codes: ['IL76'], patterns: [d('Il-76[A-Z]{0,2}')] },
  { label: 'A-50', codes: [], patterns: [d('A-50U?'), 'Beriev'] },
  { label: 'Tu-95', codes: [], patterns: [d('Tu-95[A-Z]{0,3}'), 'Bear bomber'] },
  { label: 'Tu-160', codes: [], patterns: [d('Tu-160M?'), 'Blackjack'] },
  { label: 'Tu-22M', codes: [], patterns: [d('Tu-22M3?'), 'Backfire'] },
  { label: 'Su-34', codes: [], patterns: [d('Su-34')] },
  { label: 'Su-35', codes: [], patterns: [d('Su-35S?')] },
  { label: 'Su-27', codes: [], patterns: [d('Su-27'), 'Flanker'] },
  { label: 'MiG-31', codes: [], patterns: [d('MiG-31[A-Z]?')] },
  { label: 'Shahed', codes: [], patterns: ['Shahed', 'Geran'] },
];

const TYPE_RE = TYPES.map((t) => ({ ...t, re: new RegExp(`(?<![\\p{L}\\p{N}/-])(?:${t.patterns.join('|')})(?![\\p{L}\\p{N}])`, 'u') }));

export function findTypes(text: string): TypeEntity[] {
  return TYPE_RE.filter((t) => t.re.test(text)).map(({ label, codes }) => ({ label, codes }));
}

/** Entities of an item: from its text, plus the coordinates a physical sensor gives. */
export function entitiesOf(item: { title: string; text: string; lat?: number; lon?: number; area?: string }): Entities {
  const e = extractEntities(`${item.title}\n${item.text}`);
  if (item.lat != null && item.lon != null && Number.isFinite(item.lat) && Number.isFinite(item.lon)) {
    e.places.unshift({ name: item.area ?? 'Event location', lat: item.lat, lon: item.lon, radiusKm: 100 });
  }
  return e;
}

export function extractEntities(text: string): Entities {
  return {
    callsigns: findCallsigns(text),
    types: findTypes(text),
    places: findPlaces(text).map(({ place: { name, lat, lon, radiusKm }, text: matched }) => ({ name, lat, lon, radiusKm, matched: matched.toLowerCase() })),
    actors: findActors(text),
  };
}

/**
 * Leading news media report everything, from book prizes to football. For INTEL their reports only count
 * when they name a callsign or an aircraft type, or use a word of this security and crisis vocabulary.
 */
const CRISIS =
  /(?<![\p{L}])(military|army|armed forces|troops|soldiers?|navy|naval|air ?force|fighter jets?|warplanes?|warships?|drones?|missiles?|rockets?|air ?strikes?|strikes? on|attacks?|attacked|explosions?|blasts?|shelling|war|invasion|ceasefire|terror\p{L}*|hostages?|evacuat\p{L}*|earthquake|tsunami|outbreak|plague|epidemic|pandemic|nuclear|airspace|shot down|intercept\p{L}*|coup|sabotage|cyber ?attack|nato|pentagon|bundeswehr|luftwaffe|marine|milit\p{L}*|armee|soldat\p{L}*|truppen|kampfjets?|drohnen?|raketen?|luftangriff\p{L}*|angriff\p{L}*|explosion\p{L}*|krieg\p{L}*|waffenruhe|anschlag\p{L}*|geisel\p{L}*|evakuier\p{L}*|erdbeben|ausbruch|pest|seuche|atom\p{L}*|luftraum|abgeschossen|abfangen|putsch|sabotage)(?![\p{L}])/iu;

// German builds compounds (Drohnenangriff, Raketenbeschuss), Russian bends words: these stems count anywhere in a word.
const CRISIS_DE = /(drohne|rakete|angriff|beschuss|explosion|krieg|anschlag|evakuier|soldat|truppe|kampfjet|militär|bundeswehr|luftwaffe|geisel|erdbeben|seuche|luftraum|abgeschossen|putsch|terror|взрыв|пожар|беспилот|бпла|дрон|ракет|атак|обстрел|эвакуац|землетрясен|теракт|задержан|войн|военн|армия|армии|минобороны|аэропорт|ограничени|самолет|вертолет|чум|пво|сбит|мобилизац|фсб)/i;

export function isCrisisRelated(text: string, entities: Entities): boolean {
  return entities.callsigns.length > 0 || entities.types.length > 0 || CRISIS.test(text) || CRISIS_DE.test(text);
}
