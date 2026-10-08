// Lenses of a report: security and crisis, politics, or both. Kept apart from the store so it can be tested.
import { isPoliticsRelated } from './actors';
import { isCrisisRelated, type Entities } from './entities';
import { isBroad, sourceById } from './sources';
import type { Item, Lens } from './types';

/**
 * The lenses of a report. Security: sources with a broad remit count only with security and crisis topics,
 * no book prizes, no celebrities. Politics: politics sources, or a known actor or political vocabulary.
 * A report in neither lens is dropped.
 */
/**
 * A story belongs to the security lens if one of its reports does: a statement does not turn an attack into politics.
 * It belongs to the politics lens if at least half of its reports are political.
 */
export function storyInLens(items: { lens?: Partial<Record<Lens, true>> }[], lens: Lens): boolean {
  const n = items.filter((i) => i.lens?.[lens]).length;
  return lens === 'security' ? n > 0 : n > 0 && n >= items.length / 2;
}

export function lensesOf(item: Item, text: string, entities: Entities): Partial<Record<Lens, true>> {
  const src = sourceById(item.sourceId);
  const out: Partial<Record<Lens, true>> = {};
  if (!isBroad(src) || isCrisisRelated(text, entities)) out.security = true;
  if (item.channel !== 'sensor' && (src?.category === 'politics' || isPoliticsRelated(text, entities.actors) || entities.members.length > 0)) out.politics = true;
  return out;
}

