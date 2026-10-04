import { COMMON_TYPES, GOVERNMENT_OPERATOR, ROLE_LABEL, TYPE_CATALOG, matchCallsignPrefix, type RoleClass } from './catalog';
import { DB_FLAG, type Aircraft } from './types';

/** Colour meaning on the map. Order matters: later wins only if more important. */
export type Tone = 'standard' | 'interesting' | 'watch' | 'event' | 'emergency';

export interface Reason {
  label: string;
  points: number;
}

export interface Assessment {
  score: number;
  reasons: Reason[];
  tone: Tone;
  military: boolean;
  role: RoleClass | null;
  roleLabel: string | null;
  /** Unit or programme derived from the callsign prefix, e.g. "NATO AEW&C". */
  unit: string | null;
  squawkNote: string | null;
}

const ROLE_POINTS: Partial<Record<RoleClass, number>> = {
  bomber: 30,
  isr: 22,
  awacs: 22,
  uav: 22,
  tanker: 18,
  government: 20,
  'maritime-patrol': 15,
  fighter: 15,
  'strategic-airlift': 10,
  'tactical-airlift': 6,
  'outsize-cargo': 22,
  historic: 25,
  research: 15,
  'very-large': 6,
  trainer: 4,
  helicopter: 2,
};

export const SQUAWK_NOTE: Record<string, { label: string; tone: Tone; points: number }> = {
  '7500': { label: 'Unlawful interference', tone: 'emergency', points: 60 },
  '7600': { label: 'Radio failure', tone: 'event', points: 35 },
  '7700': { label: 'Emergency', tone: 'emergency', points: 60 },
  '7400': { label: 'UAV lost link', tone: 'event', points: 35 },
};

const MILITARY_ONLY_ROLE: Record<string, RoleClass> = {
  A332: 'tanker', // A330 MRTT
  GLEX: 'isr',
  CL60: 'government',
};

export function assess(ac: Aircraft, onWatchlist: boolean, nowYear = new Date().getFullYear()): Assessment {
  const reasons: Reason[] = [];
  const prefix = matchCallsignPrefix(ac.callsign);
  const military =
    (ac.dbFlags & DB_FLAG.military) !== 0 || (prefix != null && prefix.role !== 'research' && !/^(DLR|NASA)$/.test(prefix.prefix));

  // Role
  let role: RoleClass | null = null;
  const typeInfo = ac.typeCode ? TYPE_CATALOG[ac.typeCode] : undefined;
  if (typeInfo && typeInfo.rarity > 0) role = typeInfo.role;
  else if (military && ac.typeCode && MILITARY_ONLY_ROLE[ac.typeCode]) role = MILITARY_ONLY_ROLE[ac.typeCode];
  if (!role && prefix?.role) role = prefix.role;
  if (!role && ac.operator && GOVERNMENT_OPERATOR.some((r) => r.test(ac.operator!))) role = 'government';
  if (!role && ac.category === 'A7') role = 'helicopter';

  // Squawk / emergency
  let tone: Tone = 'standard';
  let squawkNote: string | null = null;
  const sq = ac.squawk ? SQUAWK_NOTE[ac.squawk] : undefined;
  if (sq) {
    reasons.push({ label: `Squawk ${ac.squawk}`, points: sq.points });
    tone = sq.tone;
    squawkNote = sq.label;
  } else if (ac.emergency && ac.emergency !== 'none') {
    reasons.push({ label: `Emergency: ${ac.emergency}`, points: 50 });
    tone = 'emergency';
    squawkNote = ac.emergency;
  }

  if (military) reasons.push({ label: 'Military', points: 25 });
  if (role && ROLE_POINTS[role]) reasons.push({ label: ROLE_LABEL[role], points: ROLE_POINTS[role]! });

  const rarity = typeInfo?.rarity ?? 0;
  if (rarity >= 0.5) reasons.push({ label: 'Rare type', points: Math.round(rarity * 20) });

  if (ac.year && ac.year > 1900) {
    const age = nowYear - ac.year;
    if (age >= 50) reasons.push({ label: `${age} years old`, points: 12 });
    else if (age >= 35) reasons.push({ label: `${age} years old`, points: 6 });
  }

  if ((ac.dbFlags & DB_FLAG.interesting) !== 0 && !military) reasons.push({ label: 'Notable airframe', points: 15 });
  if (onWatchlist) reasons.push({ label: 'Watchlist', points: 30 });

  const score = Math.min(100, reasons.reduce((s, r) => s + r.points, 0));
  if (tone === 'standard') {
    if (onWatchlist) tone = 'watch';
    else if (score >= 25) tone = 'interesting';
  }
  reasons.sort((a, b) => b.points - a.points);

  return {
    score,
    reasons,
    tone,
    military,
    role,
    roleLabel: role ? ROLE_LABEL[role] : null,
    unit: prefix?.label ?? null,
    squawkNote,
  };
}

/** Display name of the type: catalogue name, upstream description, or the code. */
export function typeDisplayName(ac: Aircraft): string | null {
  const cat = ac.typeCode ? TYPE_CATALOG[ac.typeCode] : undefined;
  if (cat?.name && cat.rarity > 0) return cat.name;
  return ac.typeName ?? cat?.name ?? (ac.typeCode ? COMMON_TYPES[ac.typeCode] : undefined) ?? ac.typeCode;
}
