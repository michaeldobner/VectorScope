// Fractions of the Bundestag and the recognition of its members in reports: who says what.
import { MEMBERS } from './members';

export type PartyId = 'cdu' | 'afd' | 'spd' | 'gruene' | 'linke' | 'fl';

export const PARTIES: Record<PartyId, { label: string; color: string }> = {
  cdu: { label: 'CDU/CSU', color: '#5b6573' },
  afd: { label: 'AfD', color: '#009ee0' },
  spd: { label: 'SPD', color: '#e3000f' },
  gruene: { label: 'Grüne', color: '#1aa037' },
  linke: { label: 'Linke', color: '#be3075' },
  fl: { label: 'fraktionslos', color: '#8a8f98' },
};
export const PARTY_ORDER = Object.keys(PARTIES) as PartyId[];

const partyOf = new Map<string, PartyId>();
for (const p of PARTY_ORDER) for (const name of MEMBERS[p]) partyOf.set(name, p);

/** Fraction of a member, by the full name as in members.ts. */
export const memberParty = (name: string) => partyOf.get(name);

/**
 * Members known well enough that the last name alone names them in the news ("Klingbeil sagte").
 * Only distinct last names: Lang, Bas, Frei or Hoffmann alone would find other people and plain words.
 */
const BY_LAST_NAME = [
  'Merz', 'Klingbeil', 'Weidel', 'Chrupalla', 'Reichinnek', 'Dröge', 'Haßelmann', 'Spahn', 'Miersch', 'Dobrindt', 'Wadephul',
  'Pistorius', 'Warken', 'Schnieder', 'Hubertz', 'Klöckner', 'Esken', 'Kiesewetter', 'Röttgen', 'Nouripour', 'Mützenich',
  'Banaszak', 'Brantner', 'Schwerdtner', 'Faeser', 'Scholz', 'van Aken',
];

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Case sensitive, names are proper nouns. Full name, first and last name without middle names, and the known last names. The longest first,
// so "Johann David Wadephul" wins over "Wadephul".
const names = new Map<string, string>();
for (const full of partyOf.keys()) {
  names.set(full, full);
  const parts = full.split(' ');
  if (parts.length > 2 && !/^(von|van|de|zu)$/i.test(parts[parts.length - 2])) names.set(`${parts[0]} ${parts[parts.length - 1]}`, full);
}
for (const last of BY_LAST_NAME) {
  const full = [...partyOf.keys()].filter((n) => n.endsWith(` ${last}`));
  if (full.length === 1) names.set(last, full[0]);
}
const MEMBER_RE = new RegExp(
  `(?<![\\p{L}])(${[...names.keys()].sort((a, b) => b.length - a.length).map(esc).join('|')})(?:s|'|’)?(?![\\p{L}])`,
  'gu',
);

/** Members of the Bundestag named in a text, by full name, each once, in the order they appear. */
export function findMembers(text: string): string[] {
  const out = new Set<string>();
  // A genitive s is allowed: "Klingbeils Plan" names Klingbeil.
  for (const m of text.matchAll(MEMBER_RE)) {
    const full = names.get(m[1]);
    if (full) out.add(full);
  }
  return [...out];
}

/** Short form for chips: the last name, with "van Aken" kept whole. */
export const shortName = (full: string) => full.match(/(?:(?:von|van|de|zu) )?\S+$/)?.[0] ?? full;
