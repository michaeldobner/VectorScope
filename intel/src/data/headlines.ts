// Now: the five main stories across both lenses, and the early reports that must not get lost.
// Two lanes instead of one list: confirmed weight on top, fast unconfirmed sensations in a ticker of their own.
// Every headline says why it is there, so the ranking can be checked by reading it.
import { DECISION, actorById } from './actors';
import { isAirTrack } from './alerts';
import { storyInLens } from './lens';
import { sourceById, type Tier } from './sources';
import { independentCount, type Story } from './stories';
import type { EnrichedItem, Lens } from './types';

const HOUR = 3600_000;
/** The weight of a story halves every three hours without new reports. */
const HALF_LIFE_MS = 3 * HOUR;
export const HEADLINES = 5;

/** Heads of state and government: their own words weigh more than those of a governor. */
const HEAVY_ACTORS = new Set(['trump', 'putin', 'zelensky', 'merz', 'xi', 'kremlin', 'whitehouse', 'bundesregierung', 'vonderleyen', 'netanyahu', 'khamenei', 'erdogan', 'macron', 'starmer']);

/**
 * Severe events: people killed or hurt, explosions, attacks, crashes, fires. Not a word alone, see isSevere.
 * German words end where the word ends: "Angriffskrieg" is no attack, "Explosionsgefahr" no explosion.
 */
const SEVERE =
  /(?<![\p{L}])(killed|dead|deaths?|casualt\p{L}*|injured|wounded|explosions?|blasts?|attacks?|attacked|strikes?|struck|missiles?|crash\p{L}*|shot down|downed|fire|ablaze|evacuat\p{L}*|hostages?|tote|toten|getötet|verletzte?n?|explosionen|explosion|angriffe?n?|absturz|abgestürzt|abgeschossen|brand|evakuier\p{L}*|взрыв\p{L}*|погиб\p{L}*|убит\p{L}*|ранен\p{L}*|атак\p{L}*|удар\p{L}*|пожар\p{L}*|сбит\p{L}*|крушени\p{L}*|вибух\p{L}*|загин\p{L}*|поранен\p{L}*|ракет\p{L}*)(?![\p{L}])/iu;

const STATUS_WEIGHT: Record<Story['status'], number> = { confirmed: 3, reported: 2, official: 1.6, observed: 1.5, emerging: 1.2, signal: 0.6 };
const FAST: Tier[] = ['early', 'perspective'];

/**
 * Air situation: warnings, all-clears and the drone and missile tracks of air forces. Live tracking, not an event:
 * kept out of the main stories and the ticker, counted in one line of its own.
 */
const AIR_SITUATION =
  /(?<![\p{L}])(отбой|отмен\p{L}* (опасност|угроз|режим|ракетн)\p{L}*|угроз\p{L}* (атаки )?(бпла|беспилотн)\p{L}*|опасност\p{L}* (атаки )?(бпла|беспилотн)\p{L}*|ракетная опасность|режим (беспилотной|ракетной) опасности|відбій|повітряна тривога|загроза (застосування )?(бпла|балістики)|all clear|air raid (alert|warning)|entwarnung|luftalarm)/iu;
/** "No injuries", "без пострадавших": the injury word does not make the report severe. */
const NEGATED = /(no|without) (casualties|injuries|deaths|victims)|keine (verletzten|toten|opfer)|ohne (verletzte|tote)|без (пострадавших|жертв|погибших)|(пострадавших|жертв|погибших) нет|без постраждалих|постраждалих немає/giu;

const textOf = (i: EnrichedItem) => `${i.title}\n${i.text}`;
/** A track or warning of the air situation, see AIR_SITUATION. */
export const isAirSituation = (i: EnrichedItem) => isAirTrack(i) || AIR_SITUATION.test(textOf(i));
/** A severe event needs a place: "attack" alone is also a political attack. Warnings and all-clears are none. */
const isSevere = (i: EnrichedItem) => !isAirSituation(i) && SEVERE.test(textOf(i).replace(NEGATED, ' ')) && i.entities.places.length > 0;
/** A story made only of warnings, all-clears and tracks. */
const isAirStory = (s: Story) => s.items.every(isAirSituation);
const lensOf = (s: Story): Lens => (storyInLens(s.items, 'security') ? 'security' : 'politics');

export interface Headline {
  story: Story;
  lens: Lens;
  score: number;
  /** Why it is a headline, in a few words: "5 sources", "Kremlin in the original", "growing". */
  why: string[];
}

/** Weight of a story now, with the reasons. Stories older than a day weigh nothing. */
export function weigh(s: Story, now: number): { score: number; why: string[] } {
  if (now - s.last > 24 * HOUR) return { score: 0, why: [] };
  const why: string[] = [];
  const n = independentCount(s);
  let score = STATUS_WEIGHT[s.status] + 0.8 * Math.log2(1 + n);
  if (n > 1) why.push(`${n} sources`);
  const voice = s.items.find((i) => sourceById(i.sourceId)?.voice);
  if (voice) {
    score += 1;
    const v = sourceById(voice.sourceId)!.voice!;
    why.push(`${actorById(v)?.name ?? sourceById(voice.sourceId)!.name} in the original`);
  }
  const actors = new Set(s.items.flatMap((i) => i.entities.actors ?? []).filter((a) => !actorById(a)?.weak));
  if ([...actors].some((a) => HEAVY_ACTORS.has(a))) score += 0.7;
  score += Math.min(actors.size, 3) * 0.3;
  if (s.items.some(isSevere)) {
    score += 1;
    why.push('severe');
  } else if (s.items.some((i) => DECISION.test(i.title))) {
    score += 0.8;
    why.push('decision');
  }
  // Growth: new reports in the last hour lift a story, up to five of them.
  const fresh = s.items.filter((i) => now - i.time < HOUR).length;
  if (fresh >= 2) why.push('growing');
  score += Math.min(fresh, 5) * 0.3;
  if (s.items.some((i) => i.matches.some((m) => m.kind === 'callsign'))) {
    score += 0.8;
    why.push('aircraft live');
  }
  return { score: score * 0.5 ** ((now - s.last) / HALF_LIFE_MS), why };
}

/** The main stories of both lenses, heaviest first. Single unverified posts are the ticker's, not here. */
export function headlines(stories: Story[], now: number, count = HEADLINES): Headline[] {
  return stories
    .filter((s) => s.status !== 'signal' && !isAirStory(s) && s.items.some((i) => i.lens?.security || i.lens?.politics))
    .map((s) => ({ story: s, lens: lensOf(s), ...weigh(s, now) }))
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}

export interface EarlyReport {
  story: Story;
  lens: Lens;
  /** Why it is worth a look before anybody confirmed it. */
  why: string;
}

/**
 * Fast and unconfirmed: stories of the last two hours carried only by early or partisan sources, that are
 * either fast (two independent early channels within 15 minutes) or severe (an attack, explosion, crash with a place).
 */
export function earlyReports(stories: Story[], now: number, exclude: Set<string>, count = 5): EarlyReport[] {
  const out: EarlyReport[] = [];
  for (const s of [...stories].sort((a, b) => b.last - a.last)) {
    if (exclude.has(s.id) || now - s.first > 2 * HOUR || isAirStory(s)) continue;
    if (!s.items.every((i) => FAST.includes(sourceById(i.sourceId)?.tier ?? 'early'))) continue;
    const quick = independentCount(s) >= 2 && s.items.length >= 2 && s.items[1].time - s.items[0].time <= 15 * 60_000;
    const severe = s.items.some(isSevere);
    if (!quick && !severe) continue;
    out.push({ story: s, lens: lensOf(s), why: quick ? `${independentCount(s)} channels within 15 min` : 'severe, one channel' });
    if (out.length >= count) break;
  }
  return out;
}

/** The air situation of the last hour in one line: tracks of the air force and warnings or all-clears of regions. */
export function airSituation(items: EnrichedItem[], tracks: EnrichedItem[], now: number): { tracks: number; warnings: number } {
  return {
    tracks: tracks.filter((i) => now - i.time < HOUR).length,
    warnings: items.filter((i) => now - i.time < HOUR && !isAirTrack(i) && AIR_SITUATION.test(textOf(i))).length,
  };
}
