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

/** Readable names for common airliner and business jet type codes. */
export const COMMON_TYPES: Record<string, string> = {
  A19N: 'Airbus A319neo', A20N: 'Airbus A320neo', A21N: 'Airbus A321neo', A318: 'Airbus A318', A319: 'Airbus A319',
  A320: 'Airbus A320', A321: 'Airbus A321', A332: 'Airbus A330-200', A333: 'Airbus A330-300', A338: 'Airbus A330-800neo',
  A339: 'Airbus A330-900neo', A343: 'Airbus A340-300', A346: 'Airbus A340-600', A359: 'Airbus A350-900', A35K: 'Airbus A350-1000',
  A388: 'Airbus A380-800', BCS1: 'Airbus A220-100', BCS3: 'Airbus A220-300', B712: 'Boeing 717', B733: 'Boeing 737-300',
  B734: 'Boeing 737-400', B735: 'Boeing 737-500', B736: 'Boeing 737-600', B737: 'Boeing 737-700', B738: 'Boeing 737-800',
  B739: 'Boeing 737-900', B37M: 'Boeing 737 MAX 7', B38M: 'Boeing 737 MAX 8', B39M: 'Boeing 737 MAX 9', B3XM: 'Boeing 737 MAX 10',
  B744: 'Boeing 747-400', B748: 'Boeing 747-8', B752: 'Boeing 757-200', B753: 'Boeing 757-300', B762: 'Boeing 767-200',
  B763: 'Boeing 767-300', B764: 'Boeing 767-400', B772: 'Boeing 777-200', B77L: 'Boeing 777-200LR', B773: 'Boeing 777-300',
  B77W: 'Boeing 777-300ER', B778: 'Boeing 777-8', B779: 'Boeing 777-9', B788: 'Boeing 787-8', B789: 'Boeing 787-9',
  B78X: 'Boeing 787-10', E170: 'Embraer 170', E175: 'Embraer 175', E190: 'Embraer 190', E195: 'Embraer 195',
  E290: 'Embraer E190-E2', E295: 'Embraer E195-E2', CRJ7: 'Bombardier CRJ700', CRJ9: 'Bombardier CRJ900', CRJX: 'Bombardier CRJ1000',
  AT72: 'ATR 72', AT75: 'ATR 72-500', AT76: 'ATR 72-600', AT45: 'ATR 42-500', DH8D: 'De Havilland Dash 8-400',
  MD11: 'McDonnell Douglas MD-11', A306: 'Airbus A300-600', SB20: 'Saab 2000', SF34: 'Saab 340', DO28: 'Dornier 28',
  C25A: 'Cessna Citation CJ2', C25B: 'Cessna Citation CJ3', C25C: 'Cessna Citation CJ4', C56X: 'Cessna Citation Excel',
  C68A: 'Cessna Citation Latitude', C700: 'Cessna Citation Longitude', CL35: 'Bombardier Challenger 350', CL60: 'Bombardier Challenger 600',
  GLEX: 'Bombardier Global Express', GL5T: 'Bombardier Global 5000', GL7T: 'Bombardier Global 7500', GLF5: 'Gulfstream G550',
  GLF6: 'Gulfstream G650', G280: 'Gulfstream G280', F2TH: 'Dassault Falcon 2000', F900: 'Dassault Falcon 900', FA7X: 'Dassault Falcon 7X',
  FA8X: 'Dassault Falcon 8X', E55P: 'Embraer Phenom 300', E50P: 'Embraer Phenom 100', PC12: 'Pilatus PC-12', PC24: 'Pilatus PC-24',
  C172: 'Cessna 172', C182: 'Cessna 182', SR22: 'Cirrus SR22', DA42: 'Diamond DA42', DA40: 'Diamond DA40', EC35: 'Airbus H135',
  EC45: 'Airbus H145', EC30: 'Airbus H130', EC55: 'Airbus H155', AS50: 'Airbus H125', A139: 'Leonardo AW139', A169: 'Leonardo AW169',
  BK17: 'Kawasaki BK117', R44: 'Robinson R44', NH90: 'NH90',
};
