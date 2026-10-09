// Topics of headlines across sources and languages: shared words and names, with the translations of the collector.
// Used by Now to keep one main story per topic and by the benchmark (collector/benchmark.ts) to compare with newsrooms.
import { extractEntities } from './entities';
import { keywords, type Story } from './stories';

/** The tokens of a headline: words, small places, actors and members of the Bundestag. */
export function tokensOf(title: string): Set<string> {
  const entities = extractEntities(title);
  const out = keywords({ id: '', sourceId: '', channel: 'rss', title, text: '', url: '', time: 0, entities, matches: [] });
  for (const a of entities.actors) out.add(`*${a}`);
  for (const m of entities.members) out.add(`*${m}`);
  // German writes "Fort-Hood-Amokläufer" and "US-Justiz": the parts count, so the words of other headlines meet them.
  for (const tok of [...out]) if (/^[\p{L}\p{N}]/u.test(tok) && tok.includes('-')) for (const part of tok.split('-')) if (part.length >= 3) out.add(part.replace(/s$/, ''));
  // Countries and seas say little alone, they stay out of the comparison.
  for (const t of [...out]) if (t.startsWith('@') && !t.startsWith('@!')) out.delete(t);
  return out;
}

/**
 * Function words the headline keywords keep (they only drop a fixed list): they tie any two headlines.
 * Found in the first benchmark: "und", "ein", "für" matched an attack in Ukraine with Schröder's visit.
 */
const FILLER = new Set(
  (
    'und ein eine einer einem einen für ist sind als per was wie wer bei mit von vom zum zur den dem der die das des sich auf aus nach über unter gegen geht gibt neue neuer neues neuen massive massiver ' +
    'the and for are was were with from into after over says said new not but has have its his her their who what how why'
  ).split(' '),
);
const meaningful = (t: string) => !FILLER.has(t) && (t.length >= 4 || /^[@*#%]/.test(t));

/** Same topic: at least two shared tokens that carry meaning: names, places, words of four letters or more. */
export function sameTopic(a: Set<string>, b: Set<string>): boolean {
  const shared = [...a].filter((t) => meaningful(t) && b.has(t));
  // A name counts once: "trump" the word and "*trump" the actor are one hit.
  return shared.filter((t) => !shared.includes(`*${t}`)).length >= 2;
}

/** Tokens of a story: every headline of its reports, and their German and English translations. */
export function storyTokens(s: Story): Set<string> {
  const out = new Set<string>();
  for (const i of s.items) for (const title of [i.title, i.tr?.de?.title, i.tr?.en?.title]) if (title) for (const t of tokensOf(title)) out.add(t);
  return out;
}

/**
 * The core of a story: tokens that at least two of its reports share, or all of them for a story of one or two
 * reports. A big story collects many words on the way, only its core says what it is about.
 */
export function storyCore(s: Story): Set<string> {
  const counts = new Map<string, number>();
  for (const i of s.items) {
    const own = new Set<string>();
    for (const title of [i.title, i.tr?.de?.title, i.tr?.en?.title]) if (title) for (const t of tokensOf(title)) own.add(t);
    for (const t of own) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  const need = s.items.length <= 2 ? 1 : 2;
  return new Set([...counts].filter(([, n]) => n >= need).map(([t]) => t));
}
