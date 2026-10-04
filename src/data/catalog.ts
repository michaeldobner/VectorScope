// Curated knowledge used for classification and the interest score.
// Everything here is public, well-known information. Extend freely.

export type RoleClass =
  | 'tanker'
  | 'awacs'
  | 'isr'
  | 'bomber'
  | 'strategic-airlift'
  | 'tactical-airlift'
  | 'maritime-patrol'
  | 'fighter'
  | 'trainer'
  | 'uav'
  | 'government'
  | 'outsize-cargo'
  | 'very-large'
  | 'historic'
  | 'research'
  | 'helicopter';

export const ROLE_LABEL: Record<RoleClass, string> = {
  tanker: 'Tanker',
  awacs: 'AEW&C',
  isr: 'ISR',
  bomber: 'Bomber',
  'strategic-airlift': 'Strategic airlift',
  'tactical-airlift': 'Tactical airlift',
  'maritime-patrol': 'Maritime patrol',
  fighter: 'Fighter',
  trainer: 'Trainer',
  uav: 'UAV',
  government: 'Government',
  'outsize-cargo': 'Outsize cargo',
  'very-large': 'Very large',
  historic: 'Historic',
  research: 'Research',
  helicopter: 'Helicopter',
};

interface TypeInfo {
  role: RoleClass;
  /** 0..1, how rarely this type is seen in European airspace. */
  rarity: number;
  name?: string;
}

/** ICAO type designators. */
export const TYPE_CATALOG: Record<string, TypeInfo> = {
  // Tankers
  K35R: { role: 'tanker', rarity: 0.5, name: 'Boeing KC-135R Stratotanker' },
  K35E: { role: 'tanker', rarity: 0.7, name: 'Boeing KC-135E Stratotanker' },
  KC46: { role: 'tanker', rarity: 0.6, name: 'Boeing KC-46A Pegasus' },
  K46: { role: 'tanker', rarity: 0.6, name: 'Boeing KC-46A Pegasus' },
  KC10: { role: 'tanker', rarity: 0.8, name: 'McDonnell Douglas KC-10 Extender' },
  A332: { role: 'tanker', rarity: 0, name: 'Airbus A330' }, // only a tanker if military, see score
  // AEW&C
  E3TF: { role: 'awacs', rarity: 0.6, name: 'Boeing E-3 Sentry' },
  E3CF: { role: 'awacs', rarity: 0.6, name: 'Boeing E-3 Sentry' },
  E737: { role: 'awacs', rarity: 0.8, name: 'Boeing E-7 Wedgetail' },
  E2: { role: 'awacs', rarity: 0.8, name: 'Grumman E-2 Hawkeye' },
  // ISR / SIGINT
  R135: { role: 'isr', rarity: 0.8, name: 'Boeing RC-135' },
  RC35: { role: 'isr', rarity: 0.8, name: 'Boeing RC-135' },
  E6: { role: 'isr', rarity: 0.9, name: 'Boeing E-6B Mercury' },
  E8: { role: 'isr', rarity: 0.9, name: 'Northrop Grumman E-8C JSTARS' },
  U2: { role: 'isr', rarity: 0.95, name: 'Lockheed U-2' },
  GLEX: { role: 'isr', rarity: 0, name: 'Bombardier Global Express' }, // military variants only
  CL60: { role: 'isr', rarity: 0, name: 'Bombardier Challenger 600' },
  // UAV
  Q4: { role: 'uav', rarity: 0.85, name: 'Northrop Grumman RQ-4 Global Hawk' },
  Q9: { role: 'uav', rarity: 0.85, name: 'General Atomics MQ-9 Reaper' },
  HRON: { role: 'uav', rarity: 0.85, name: 'IAI Heron' },
  // Bombers
  B52: { role: 'bomber', rarity: 0.95, name: 'Boeing B-52 Stratofortress' },
  B1: { role: 'bomber', rarity: 0.95, name: 'Rockwell B-1 Lancer' },
  B2: { role: 'bomber', rarity: 0.98, name: 'Northrop B-2 Spirit' },
  // Airlift
  C17: { role: 'strategic-airlift', rarity: 0.5, name: 'Boeing C-17A Globemaster III' },
  C5M: { role: 'strategic-airlift', rarity: 0.75, name: 'Lockheed C-5M Super Galaxy' },
  A400: { role: 'strategic-airlift', rarity: 0.4, name: 'Airbus A400M Atlas' },
  C130: { role: 'tactical-airlift', rarity: 0.4, name: 'Lockheed C-130 Hercules' },
  C30J: { role: 'tactical-airlift', rarity: 0.4, name: 'Lockheed C-130J Super Hercules' },
  C295: { role: 'tactical-airlift', rarity: 0.4, name: 'Airbus C295' },
  C27J: { role: 'tactical-airlift', rarity: 0.6, name: 'Alenia C-27J Spartan' },
  KC39: { role: 'tactical-airlift', rarity: 0.7, name: 'Embraer C-390 Millennium' },
  // Maritime patrol
  P8: { role: 'maritime-patrol', rarity: 0.6, name: 'Boeing P-8 Poseidon' },
  P3: { role: 'maritime-patrol', rarity: 0.7, name: 'Lockheed P-3 Orion' },
  ATL2: { role: 'maritime-patrol', rarity: 0.8, name: 'Dassault Atlantique 2' },
  // Fighters and trainers (rarely transmit, but sometimes do)
  F16: { role: 'fighter', rarity: 0.7, name: 'General Dynamics F-16' },
  F35: { role: 'fighter', rarity: 0.8, name: 'Lockheed Martin F-35' },
  EUFI: { role: 'fighter', rarity: 0.6, name: 'Eurofighter Typhoon' },
  F18H: { role: 'fighter', rarity: 0.8, name: 'Boeing F/A-18 Super Hornet' },
  RFAL: { role: 'fighter', rarity: 0.7, name: 'Dassault Rafale' },
  TOR: { role: 'fighter', rarity: 0.7, name: 'Panavia Tornado' },
  M346: { role: 'trainer', rarity: 0.6, name: 'Leonardo M-346' },
  PC21: { role: 'trainer', rarity: 0.5, name: 'Pilatus PC-21' },
  // Outsize and very large
  A124: { role: 'outsize-cargo', rarity: 0.85, name: 'Antonov An-124 Ruslan' },
  A225: { role: 'outsize-cargo', rarity: 1, name: 'Antonov An-225 Mriya' },
  AN22: { role: 'outsize-cargo', rarity: 0.95, name: 'Antonov An-22' },
  A3ST: { role: 'outsize-cargo', rarity: 0.7, name: 'Airbus Beluga' },
  A337: { role: 'outsize-cargo', rarity: 0.6, name: 'Airbus BelugaXL' },
  BLCF: { role: 'outsize-cargo', rarity: 0.85, name: 'Boeing 747 Dreamlifter' },
  A388: { role: 'very-large', rarity: 0.2, name: 'Airbus A380' },
  B748: { role: 'very-large', rarity: 0.25, name: 'Boeing 747-8' },
  B744: { role: 'very-large', rarity: 0.3, name: 'Boeing 747-400' },
  // Historic
  JU52: { role: 'historic', rarity: 0.95, name: 'Junkers Ju 52' },
  DC3: { role: 'historic', rarity: 0.9, name: 'Douglas DC-3' },
  DC6: { role: 'historic', rarity: 0.95, name: 'Douglas DC-6' },
  CONI: { role: 'historic', rarity: 0.98, name: 'Lockheed Constellation' },
  CONC: { role: 'historic', rarity: 1, name: 'Concorde' },
  B17: { role: 'historic', rarity: 0.98, name: 'Boeing B-17' },
  SPIT: { role: 'historic', rarity: 0.9, name: 'Supermarine Spitfire' },
  P51: { role: 'historic', rarity: 0.9, name: 'North American P-51 Mustang' },
  AN2: { role: 'historic', rarity: 0.7, name: 'Antonov An-2' },
  L188: { role: 'historic', rarity: 0.9, name: 'Lockheed Electra' },
};

/** Military / government callsign prefixes (public, widely documented). */
export const CALLSIGN_PREFIX: Record<string, { label: string; role?: RoleClass }> = {
  FORTE: { label: 'USAF RQ-4 Global Hawk', role: 'uav' },
  JAKE: { label: 'USAF RC-135 / ISR', role: 'isr' },
  HOMER: { label: 'US Navy P-8 Poseidon', role: 'maritime-patrol' },
  RCH: { label: 'USAF Air Mobility Command', role: 'strategic-airlift' },
  REACH: { label: 'USAF Air Mobility Command', role: 'strategic-airlift' },
  LAGR: { label: 'USAF KC-135 (RAF Mildenhall)', role: 'tanker' },
  QID: { label: 'USAF tanker', role: 'tanker' },
  NATO: { label: 'NATO AEW&C', role: 'awacs' },
  NAEW: { label: 'NATO AEW&C', role: 'awacs' },
  MMF: { label: 'NATO Multinational MRTT Fleet', role: 'tanker' },
  GAF: { label: 'German Air Force' },
  GAM: { label: 'German Army Aviation' },
  GNY: { label: 'German Navy' },
  IAM: { label: 'Italian Air Force' },
  CTM: { label: 'French Air and Space Force' },
  FAF: { label: 'French Air and Space Force' },
  RRR: { label: 'Royal Air Force' },
  ASCOT: { label: 'Royal Air Force transport' },
  TARTN: { label: 'RAF tanker', role: 'tanker' },
  NAVY: { label: 'US Navy' },
  CNV: { label: 'US Navy' },
  DUKE: { label: 'US Army' },
  PAT: { label: 'US Army Priority Air Transport' },
  SAM: { label: 'USAF Special Air Mission', role: 'government' },
  SPAR: { label: 'USAF Special Air Resource', role: 'government' },
  EXEC: { label: 'USAF executive transport', role: 'government' },
  BAF: { label: 'Belgian Air Component' },
  NAF: { label: 'Royal Netherlands Air Force' },
  PLF: { label: 'Polish Air Force' },
  SUI: { label: 'Swiss Air Force' },
  ASY: { label: 'Royal Australian Air Force' },
  CFC: { label: 'Royal Canadian Air Force' },
  HKY: { label: 'Hellenic Air Force' },
  SHF: { label: 'Swedish Air Force' },
  DLR: { label: 'German Aerospace Center (DLR)', role: 'research' },
  NASA: { label: 'NASA', role: 'research' },
};

/** Operators that indicate government / VIP transport (matched against operator name). */
export const GOVERNMENT_OPERATOR = [
  /flugbereitschaft/i,
  /german air force/i,
  /luftwaffe/i,
  /government/i,
  /regierung/i,
  /ministry/i,
  /state of/i,
  /royal flight/i,
  /presidential/i,
  /armed forces/i,
];

export function matchCallsignPrefix(callsign: string | null) {
  if (!callsign) return null;
  const letters = callsign.match(/^[A-Z]+/)?.[0];
  if (!letters) return null;
  // Longest prefix first, so NATO wins over NA.
  for (let len = letters.length; len >= 3; len--) {
    const hit = CALLSIGN_PREFIX[letters.slice(0, len)];
    if (hit) return { prefix: letters.slice(0, len), ...hit };
  }
  return null;
}
