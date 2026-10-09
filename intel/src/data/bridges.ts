// Bridges between the lenses, e.g. a sanctions package (politics) and a tanker attack (security) on the same day.
import { storyInLens } from './lens';
import { independentCount, type Story } from './stories';
import type { Lens } from './types';

const inLens = (s: Story, lens: Lens) => storyInLens(s.items, lens);

/** A key named by more stories than this on the same day says nothing: Trump, Washington, Kyiv. */
const MAX_SHARED = 3;
const DAY_MS = 24 * 3600_000;

/**
 * Bridges between the lenses: a story of the other lens, that this lens does not show, naming the same actor
 * or the same city within 24 hours. Only stories with two sources or confirmed, so a bridge is worth a look.
 * The shared actor or city must be rare that day: at most three stories name it. Otherwise every story with
 * Trump would link to every other one.
 */
export function bridgesFor(visible: Story[], all: Story[], lens: Lens): Map<string, { story: Story; key: string }[]> {
  const other: Lens = lens === 'security' ? 'politics' : 'security';
  const keysOf = (s: Story) =>
    new Set(s.items.flatMap((i) => [...(i.entities.actors ?? []).map((a) => `a:${a}`), ...i.entities.places.filter((p) => p.radiusKm <= 150).map((p) => `p:${p.name}`)]));
  const keyed = all.map((s) => ({ s, keys: keysOf(s) }));
  const candidates = keyed.filter(({ s }) => inLens(s, other) && !inLens(s, lens) && (independentCount(s) >= 2 || s.status === 'confirmed'));
  /** How many stories name the key within 24 hours of `at`. */
  const shared = (key: string, at: number) => keyed.filter(({ s, keys }) => keys.has(key) && Math.abs(s.last - at) <= DAY_MS).length;
  const out = new Map<string, { story: Story; key: string }[]>();
  for (const s of visible) {
    const mine = keysOf(s);
    const found: { story: Story; key: string }[] = [];
    for (const c of candidates) {
      if (Math.abs(c.s.last - s.last) > DAY_MS) continue;
      const key = [...mine].filter((k) => c.keys.has(k) && shared(k, s.last) <= MAX_SHARED).sort((a, b) => shared(a, s.last) - shared(b, s.last))[0];
      if (key) found.push({ story: c.s, key });
    }
    if (found.length) out.set(s.id, found.sort((a, b) => independentCount(b.story) - independentCount(a.story)).slice(0, 2));
  }
  return out;
}
