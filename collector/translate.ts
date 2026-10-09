// Translation in the collector: every report once into English and German, so the app shows it right away
// in the chosen language and no device has to ask Google itself. Variant A: the public Google endpoint
// (proxy/lib/translate.js), without key. A cache file keeps every translation, nothing is translated twice.
import { translateAll } from '../proxy/lib/translate.js';
import { needsTranslation, TARGETS, type Target } from '../intel/src/data/lang';
import { sourceById } from '../intel/src/data/sources';
import { clip } from '../intel/src/data/text';
import type { Item } from '../intel/src/data/types';

/**
 * Original text to its translations. tries counts failed attempts per language, retry the time of the next one:
 * 10 minutes after the first failure, then three times longer each time, at most 12 hours. Nothing is given up
 * for good, a text is asked as long as its report is in the last 72 hours.
 */
export type TrCache = Record<string, { en?: string; de?: string; tries?: Partial<Record<Target, number>>; retry?: Partial<Record<Target, number>>; at: number }>;

const KEEP_MS = 30 * 24 * 3600_000;
/** Texts per request and the pause between two: Google limits the rate per address, small and slow gets through. */
const SLICE = 20;
const PAUSE_MS = 1500;
const retryAfter = (tries: number) => Math.min(10 * 60_000 * 3 ** (tries - 1), 12 * 3600_000);
/** Excerpts are translated as the collector data carries them, clipped. */
export const TEXT_CLIP = 300;

type Translate = (texts: string[], to: Target) => Promise<(string | null)[]>;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** The texts of a report that need `target`: headline and clipped excerpt, if not written in it already. */
export function textsOf(item: Item, target: Target): string[] {
  const lang = sourceById(item.sourceId)?.lang;
  return [item.title, clip(item.text ?? '', TEXT_CLIP)].filter((t) => t && needsTranslation(t, target, lang));
}

/**
 * Translates what is missing, newest reports first, at most `max` texts per language and round, in slices
 * with a pause. When Google refuses a whole slice, the round stops for that language: asking on only makes
 * the block longer. The rest follows in the next round.
 */
export async function translateMissing(items: Item[], cache: TrCache, opt: { now: number; max?: number; translate?: Translate; pauseMs?: number }) {
  const translate = opt.translate ?? (translateAll as Translate);
  const stats = { translated: 0, refused: 0, chars: 0, waiting: 0 };
  for (const target of TARGETS) {
    const wanted = new Set<string>();
    for (const item of [...items].sort((a, b) => b.time - a.time))
      for (const t of textsOf(item, target)) if (!cache[t]?.[target] && (cache[t]?.retry?.[target] ?? 0) <= opt.now) wanted.add(t);
    const batch = [...wanted].slice(0, opt.max ?? 150);
    let done = 0;
    for (let s = 0; s < batch.length; s += SLICE) {
      const slice = batch.slice(s, s + SLICE);
      if (s) await sleep(opt.pauseMs ?? PAUSE_MS);
      const out = await translate(slice, target).catch(() => slice.map(() => null));
      // Everything refused: Google blocks this address for now. Nothing counts as tried, the round stops here.
      if (out.every((x) => x == null)) {
        stats.refused += slice.length;
        break;
      }
      done += slice.length;
      slice.forEach((t, i) => {
        const entry = (cache[t] ??= { at: opt.now });
        entry.at = opt.now;
        stats.chars += t.length;
        if (out[i] && out[i] !== t) {
          entry[target] = out[i]!;
          stats.translated++;
        } else {
          const n = (entry.tries?.[target] ?? 0) + 1;
          entry.tries = { ...entry.tries, [target]: n };
          entry.retry = { ...entry.retry, [target]: opt.now + retryAfter(n) };
          stats.refused++;
        }
      });
    }
    stats.waiting += wanted.size - done;
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
