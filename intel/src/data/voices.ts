// Who says what: the members of the Bundestag in a story, by fraction.
import { PARTY_ORDER, memberParty, type PartyId } from './parties';
import { sourceById } from './sources';
import type { EnrichedItem } from './types';

/**
 * Who says what: the members of the Bundestag in a story by fraction, those posting themselves first.
 * A member is in it by an own post (Bluesky) or by being named.
 */
export function voicesOf(items: Pick<EnrichedItem, 'sourceId' | 'entities'>[]): { party: PartyId; own: string[]; named: string[] }[] {
  const own = new Map<PartyId, Set<string>>();
  const named = new Map<PartyId, Set<string>>();
  const add = (m: Map<PartyId, Set<string>>, p: PartyId, name: string) => (m.get(p) ?? m.set(p, new Set()).get(p)!).add(name);
  for (const i of items) {
    const src = sourceById(i.sourceId);
    if (src?.party) add(own, src.party, src.name);
    for (const m of i.entities.members ?? []) {
      const p = memberParty(m);
      if (p) add(named, p, m);
    }
  }
  return PARTY_ORDER.filter((p) => own.has(p) || named.has(p)).map((p) => {
    const o = [...(own.get(p) ?? [])];
    return { party: p, own: o, named: [...(named.get(p) ?? [])].filter((n) => !o.includes(n)) };
  });
}
