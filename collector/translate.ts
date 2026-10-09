// Translation in the collector: every report once into English and German, so the app shows it right away
// in the chosen language and no device has to ask Google itself. Variant A: the public Google endpoint
// (proxy/lib/translate.js), without key. A cache file keeps every translation, nothing is translated twice.
import { translateAll } from '../proxy/lib/translate.js';
import { needsTranslation, TARGETS, type Target } from '../intel/src/data/lang';
import { sourceById } from '../intel/src/data/sources';
import { clip } from '../intel/src/data/text';
import type { Item } from '../intel/src/data/types';

/** Original text to its translations. tries counts refusals per language, after three a text is left as it is. */
export type TrCache = Record<string, { en?: string; de?: string; tries?: Partial<Record<Target, number>>; at: number }>;

const MAX_TRIES = 3;
const KEEP_MS = 30 * 24 * 3600_000;
/** Excerpts are translated as the collector data carries them, clipped. */
export const TEXT_CLIP = 300;

type Translate = (texts: string[], to: Target) => Promise<(string | null)[]>;

/** The texts of a report that need `target`: headline and clipped excerpt, if not written in it already. */
export function textsOf(item: Item, target: Target): string[] {
  const lang = sourceById(item.sourceId)?.lang;
  return [item.title, clip(item.text ?? '', TEXT_CLIP)].filter((t) => t && needsTranslation(t, target, lang));
}

/**
 * Translates what is missing, newest reports first, at most `max` texts per language and round:
 * Google limits the rate per address, the rest follows in the next round.
 */
export async function translateMissing(items: Item[], cache: TrCache, opt: { now: number; max?: number; translate?: Translate }) {
  const translate = opt.translate ?? (translateAll as Translate);
  const stats = { translated: 0, refused: 0, chars: 0, waiting: 0 };
  for (const target of TARGETS) {
    const wanted = new Set<string>();
    for (const item of [...items].sort((a, b) => b.time - a.time))
      for (const t of textsOf(item, target)) if (!cache[t]?.[target] && (cache[t]?.tries?.[target] ?? 0) < MAX_TRIES) wanted.add(t);
    const batch = [...wanted].slice(0, opt.max ?? 150);
    stats.waiting += wanted.size - batch.length;
    if (!batch.length) continue;
    const out = await translate(batch, target).catch(() => batch.map(() => null));
    batch.forEach((t, i) => {
      const entry = (cache[t] ??= { at: opt.now });
      entry.at = opt.now;
      stats.chars += t.length;
      if (out[i] && out[i] !== t) {
        entry[target] = out[i]!;
        stats.translated++;
      } else {
        entry.tries = { ...entry.tries, [target]: (entry.tries?.[target] ?? 0) + 1 };
        stats.refused++;
      }
    });
  }
  for (const [k, v] of Object.entries(cache)) if (opt.now - v.at > KEEP_MS) delete cache[k];
  return stats;
}

/** The report with its known translations attached: tr.de.title, tr.en.text … */
export function withTranslations(item: Item, cache: TrCache): Item {
  const tr: Item['tr'] = {};
  for (const target of TARGETS) {
    const title = cache[item.title]?.[target];
    const text = cache[clip(item.text ?? '', TEXT_CLIP)]?.[target];
    if (title || text) tr[target] = { ...(title ? { title } : {}), ...(text ? { text } : {}) };
  }
  return Object.keys(tr).length ? { ...item, tr } : item;
}
