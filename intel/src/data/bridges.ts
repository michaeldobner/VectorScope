// Bridges between the lenses, e.g. a sanctions package (politics) and a tanker attack (security) on the same day.
import { storyInLens } from './lens';
import { independentCount, type Story } from './stories';
import type { Lens } from './types';

const inLens = (s: Story, lens: Lens) => storyInLens(s.items, lens);

export /**
 * Bridges between the lenses: a story of the other lens, that this lens does not show, naming the same actor
 * or the same city within 24 hours. Only stories with two sources or confirmed, so a bridge is worth a look.
 */
function bridgesFor(visible: Story[], all: Story[], lens: Lens): Map<string, { story: Story; key: string }[]> {
  const other: Lens = lens === 'security' ? 'politics' : 'security';
  const keysOf = (s: Story) =>
    new Set(s.items.flatMap((i) => [...(i.entities.actors ?? []).map((a) => `a:${a}`), ...i.entities.places.filter((p) => p.radiusKm <= 150).map((p) => `p:${p.name}`)]));
  const candidates = all
    .filter((s) => inLens(s, other) && !inLens(s, lens) && (independentCount(s) >= 2 || s.status === 'confirmed'))
    .map((s) => ({ s, keys: keysOf(s) }));
  const out = new Map<string, { story: Story; key: string }[]>();
  for (const s of visible) {
    const mine = keysOf(s);
    const found: { story: Story; key: string }[] = [];
    for (const c of candidates) {
      if (Math.abs(c.s.last - s.last) > 24 * 3600_000) continue;
      const key = [...mine].find((k) => c.keys.has(k));
      if (key) found.push({ story: c.s, key });
    }
    if (found.length) out.set(s.id, found.sort((a, b) => independentCount(b.story) - independentCount(a.story)).slice(0, 2));
  }
  return out;
}

