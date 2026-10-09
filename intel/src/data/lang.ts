// Language of a single report, from its text. A source has a language, but channels mix (Rybar DE posts
// Russian quotes, German media quote English headlines), so translation decides per text.
import type { Lang } from './sources';

/** How reports are shown: as they came, all in English or all in German. The interface stays English. */
export type ReportLang = 'original' | 'en' | 'de';
export const TARGETS = ['en', 'de'] as const;
export type Target = (typeof TARGETS)[number];

const HEBREW = /[֐-׿]/g;
const CYRILLIC = /[Ѐ-ӿ]/g;
const UKRAINIAN = /[іїєґІЇЄҐ]/;
const LATIN = /[A-Za-zÀ-ɏ]/g;
const GERMAN_WORDS = /(?<![\p{L}])(der|die|das|und|nicht|mit|für|ist|sind|von|den|dem|auf|eine?|einen|zu|im|bei|nach|wird|werden|auch|über|wie|sich)(?![\p{L}])/giu;
const ENGLISH_WORDS = /(?<![\p{L}])(the|and|of|to|in|is|are|for|on|with|after|from|by|as|at|says|will|has|have|was|were)(?![\p{L}])/giu;

/**
 * The language a text is written in, or null for too little text (a number, a name).
 * Script first: Hebrew, Cyrillic (Ukrainian by its own letters). Latin texts by umlauts and common words.
 */
export function detectLang(text: string): Lang | null {
  const count = (re: RegExp) => text.match(re)?.length ?? 0;
  const he = count(HEBREW);
  const cy = count(CYRILLIC);
  const la = count(LATIN);
  if (he + cy + la < 4) return null;
  if (he >= cy && he >= la) return 'he';
  if (cy >= la) return UKRAINIAN.test(text) ? 'uk' : 'ru';
  const de = count(GERMAN_WORDS) + 2 * count(/[äöüßÄÖÜ]/g);
  const en = count(ENGLISH_WORDS);
  if (de > en) return 'de';
  if (en > de) return 'en';
  return null;
}

/** True if `text` has to be translated to be read in `target`. Unknown texts follow their source. */
export function needsTranslation(text: string, target: Target, sourceLang?: Lang): boolean {
  if (!text || !/\p{L}{2}/u.test(text)) return false;
  return (detectLang(text) ?? sourceLang ?? target) !== target;
}
