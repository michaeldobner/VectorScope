// Stories: items from different sources that report the same event, grouped by shared places,
// callsigns, types and rare words within 36 hours of the first report. Each story gets a status from the tiers of its sources.
import { independenceKey, sourceById, type Source, type Tier } from './sources';
import type { EnrichedItem } from './types';

export type Status = 'observed' | 'signal' | 'emerging' | 'reported' | 'confirmed';

export interface Story {
  id: string;
  items: EnrichedItem[];
  /**
   * Sources that do not count as confirmation: their report copies an earlier one almost word for word,
   * or another channel of the same network (Rybar) already reported.
   */
  echoes: string[];
  /** Number of independent sources: echoes left out, a network counted once. */
  independent: number;
  /** Item ids of the copies. */
  echoItems: string[];
  /** The item whose headline represents the story: highest tier, then earliest. */
  lead: EnrichedItem;
  status: Status;
  sources: string[];
  tiers: Record<Tier, number>;
  /** Event confidence 0 to 1 from the independent sources, see eventConfidence. */
  confidence: number;
  first: number;
  last: number;
  /** How long the first unverified report came before the first confirming one, in ms. */
  leadMs: number | null;
  leadFrom: string | null;
  leadTo: string | null;
}

const WINDOW_MS = 36 * 3600_000;
const LINK_SCORE = 3.4;

// German event words mapped to English, so "Pest" and "plague" meet.
const SYNONYM: Record<string, string> = {
  pest: 'plague', explosion: 'explosion', explosionen: 'explosion', brand: 'fire', feuer: 'fire', angriff: 'attack', angriffe: 'attack',
  drohne: 'drone', drohnen: 'drone', rakete: 'missile', raketen: 'missile', flugzeug: 'aircraft', absturz: 'crash', abgestürzt: 'crash',
  erdbeben: 'earthquake', evakuierung: 'evacuation', evakuiert: 'evacuation', anschlag: 'attack', schiff: 'ship', kriegsschiff: 'warship',
  flughafen: 'airport', luftraum: 'airspace', sperrung: 'closure', gesperrt: 'closure', festnahme: 'arrest', festgenommen: 'arrest',
  verletzte: 'injured', tote: 'killed', getötet: 'killed', streik: 'strike', luftangriff: 'airstrike', luftangriffe: 'airstrike',
  airstrikes: 'airstrike', drones: 'drone', missiles: 'missile', attacks: 'attack', killed: 'killed', dead: 'killed',
};

/**
 * Russian and Ukrainian event stems mapped to English, so "Взрыв в Воронеже" and "Explosion in Voronezh" meet.
 * Stems, because these languages bend every word (взрыв, взрыва, взрывом, взрывы).
 */
const STEMS: [RegExp, string][] = [
  [/^(взрыв|вибух)/, 'explosion'],
  [/^(пожар|возгоран|пожеж)/, 'fire'],
  [/^(беспилот|бпла|дрон|бпла|бпл)/, 'drone'],
  [/^(ракет)/, 'missile'],
  [/^(атак|удар)/, 'attack'],
  [/^(обстрел|обстріл)/, 'shelling'],
  [/^(аэропорт|аеропорт)/, 'airport'],
  [/^(ограничен|обмежен)/, 'restrictions'],
  [/^(самолет|самолёт|літак)/, 'aircraft'],
  [/^(вертолет|вертолёт|гелікоптер)/, 'helicopter'],
  [/^(эвакуац|евакуац)/, 'evacuation'],
  [/^(землетрясен|землетрус)/, 'earthquake'],
  [/^(чум)/, 'plague'],
  [/^(задержан|арест)/, 'arrest'],
  [/^(погиб|убит|загинул)/, 'killed'],
  [/^(ранен|пострадав|поранен)/, 'injured'],
  [/^(тревог|тривог)/, 'alert'],
  [/^(пво|сбит|збит|перехват)/, 'intercepted'],
  [/^(нпз)/, 'refinery'],
  [/^(авари)/, 'crash'],
  [/^(теракт)/, 'terror'],
  [/^(мобилизац)/, 'mobilization'],
  [/^(флот)/, 'fleet'],
  [/^(корабл)/, 'ship'],
  [/^(танкер)/, 'tanker'],
];

const RU_STOP = new Set(
  ('что это для как при все его она они был была были будет также после около более уже году года может если или том так где только сообщили сообщает сообщил данным время сегодня ночью утром вечером области район района города город человек заявил заявили местные жители видео фото подписаться прислать новости срочно ' +
    'девушк мужчин женщин подрос челове жители россия россиян вчера теперь работа праздн поздра учител днём днем сводка сводки фронто утро вечер новост главно рассказ стало станет ' +
    'десятк тысяч сотни двое двух трёх троих первый января феврал марта апреля мая июня июля августа сентяб октябр ноября декабр делюсь резуль знамен сегодн неделю недели месяц президе правит минист').split(' '),
);

function normalise(raw: string): string {
  if (/\p{Script=Cyrillic}/u.test(raw)) {
    for (const [re, en] of STEMS) if (re.test(raw)) return en;
    const stem = raw.slice(0, 6);
    return RU_STOP.has(raw) || RU_STOP.has(stem) ? '' : stem;
  }
  return SYNONYM[raw] ?? raw.replace(/(?<=\p{L}{3}[^s])s$/u, '');
}

const STOP = new Set(
  (
    'about after again against also amid among another around back been before being between both called could during each even every first from have having here into just last later like made make many more most much must near never news next only other over part said says some still such than that their them then there these they this those three through time today under until very were what when where which while will with within without would year years your ' +
    'aber alle allem allen aller alles also andere anderen auch auf aus bei beim bereits bevor bis bisher dabei damit dann darf darum dass davon dazu dem den denen der des deshalb dessen die dies diese diesem diesen dieser dieses doch dort durch eine einem einen einer eines einige erst etwa etwas euro fall gegen gibt habe haben hatte heute hier ihre ihren immer jahr jahre jahren jetzt kann kein keine können laut lassen machen mehr meisten mit nach nicht noch nun nur oder ohne rund schon sehr seien sein seine seit sich sind soll sollen sowie über unter viele vom von vor wegen weil weiter weitere wenn werden wieder wird wurde wurden zum zur zwei zwischen ' +
    'breaking update updated report reports reported according official officials video footage photo photos watch read first latest sources source new says said ' +
    'week weeks month recent recently aboard following amid could might plans white house president government minister ministry military forces defense defence analysis inside behind'
  ).split(' '),
);

/**
 * Keywords of an item, normalised across English and German. Words come from the headline only:
 * excerpts are long and full of boilerplate, headlines say what happened. Entities come from both.
 */
export function keywords(item: EnrichedItem): Set<string> {
  const out = new Set<string>();
  // A city or base (small area) is as specific as a word, a country or sea is not.
  for (const p of item.entities.places) out.add(p.radiusKm <= 150 ? `@!${p.name}` : `@${p.name}`);
  for (const c of item.entities.callsigns) out.add(`#${c.callsign}`);
  for (const t of item.entities.types) out.add(`%${t.label}`);
  const placeWords = new Set(item.entities.places.flatMap((p) => (p.matched ?? '').split(/\s+/)));
  for (const raw of item.title.toLowerCase().match(/\p{L}[\p{L}\p{N}/-]{2,}/gu) ?? []) {
    // A place is counted once, as place, not again as word.
    if (placeWords.has(raw)) continue;
    const w = normalise(raw);
    if (w && !STOP.has(w) && !STOP.has(raw)) out.add(w);
  }
  return out;
}

const weight = (token: string, df: Map<string, number>, n: number) => {
  // Places and entities count more than words, rare tokens more than common ones.
  // At least 200 documents are assumed, so a small set does not make every word look common.
  const base = token[0] === '@' ? 1.4 : token[0] === '#' ? 3 : token[0] === '%' ? 1.2 : 1;
  return base * Math.log(1 + Math.max(n, 200) / (df.get(token) ?? 1));
};

export function buildStories(items: EnrichedItem[]): Story[] {
  const n = items.length;
  const keys = items.map(keywords);
  const df = new Map<string, number>();
  for (const k of keys) for (const t of k) df.set(t, (df.get(t) ?? 0) + 1);

  const score = (a: number, b: number) => {
    let sum = 0;
    let words = 0;
    for (const t of keys[a]) {
      if (!keys[b].has(t)) continue;
      // Tokens that appear in many reports (navy, pentagon, ukraine) say nothing about the event.
      if ((df.get(t) ?? 1) > Math.max(4, n * 0.025)) continue;
      sum += weight(t, df, n) / 2.5;
      if (!/^[@#%]/.test(t) || t.startsWith('@!')) words++;
    }
    // Two shared headline words, or a callsign plus one word.
    return words >= 2 || (words >= 1 && sum >= LINK_SCORE * 1.5) ? sum : 0;
  };

  // Chronological, seed based grouping: a report joins a story only if it matches the first report
  // of that story (and, for larger stories, at least one more). Chaining A to B to C to everything is impossible.
  // Reports of the same source never confirm each other.
  const order = items.map((_, i) => i).sort((a, b) => items[a].time - items[b].time);
  const groups: number[][] = [];
  for (const i of order) {
    let best: { g: number[]; s: number } | null = null;
    for (const g of groups) {
      const seed = g[0];
      if (items[i].time - items[seed].time > WINDOW_MS) continue;
      // A source repeating itself is not a story of several sources. Channels of one network may group,
      // so a later independent report finds them all, but toStory counts the network once.
      if (g.every((m) => items[m].sourceId === items[i].sourceId)) continue;
      const s = score(i, seed);
      if (s < LINK_SCORE) continue;
      if (g.length > 1 && !g.slice(1).some((m) => score(i, m) >= LINK_SCORE * 0.6)) continue;
      if (!best || s > best.s) best = { g, s };
    }
    if (best) best.g.push(i);
    else groups.push([i]);
  }
  return groups.map((g) => toStory(g.map((i) => items[i])));
}

const RANK: Record<Tier, number> = { confirming: 6, primary: 5, specialist: 4, osint: 3, early: 2, perspective: 1, physical: 0 };

/** How much one source of a class adds to the confidence of an event, before its trust is applied. */
export const CLASS_WEIGHT: Record<Tier, number> = {
  physical: 0.6,
  primary: 0.7,
  confirming: 0.55,
  specialist: 0.45,
  osint: 0.4,
  early: 0.3,
  perspective: 0.2,
};

/**
 * Event confidence: every independent source lowers the chance that the event is not real by
 * class weight times source trust. A second source of the same class counts 60 %, a third 36 %,
 * because voices of one kind tend to repeat each other. Agreement across classes adds a bonus:
 * 10 % of the remaining doubt for two classes, 25 % for three or more.
 */
export function eventConfidence(sources: Source[]): number {
  const perClass = new Map<Tier, number>();
  let doubt = 1;
  for (const s of [...sources].sort((a, b) => b.trust - a.trust)) {
    const k = perClass.get(s.tier) ?? 0;
    perClass.set(s.tier, k + 1);
    doubt *= 1 - CLASS_WEIGHT[s.tier] * (s.trust / 100) * 0.6 ** k;
  }
  let confidence = 1 - doubt;
  if (perClass.size >= 3) confidence += (1 - confidence) * 0.25;
  else if (perClass.size === 2) confidence += (1 - confidence) * 0.1;
  return Math.min(0.99, confidence);
}

const wordsOf = (i: EnrichedItem) => new Set(`${i.title} ${i.text}`.toLowerCase().match(/\p{L}[\p{L}\p{N}]{2,}/gu) ?? []);

/**
 * True if `b` repeats `a` almost word for word: at least 60 % of all their words are shared.
 * A longer article that only contains the words of a short post is not a copy, it adds its own.
 */
export function isEcho(a: EnrichedItem, b: EnrichedItem): boolean {
  const wa = wordsOf(a);
  const wb = wordsOf(b);
  if (Math.min(wa.size, wb.size) < 6) return false;
  let shared = 0;
  for (const w of wa) if (wb.has(w)) shared++;
  return shared / (wa.size + wb.size - shared) >= 0.6;
}

function toStory(list: EnrichedItem[]): Story {
  const items = [...list].sort((a, b) => a.time - b.time);
  const tierOf = (i: EnrichedItem): Tier => sourceById(i.sourceId)?.tier ?? 'early';
  // Echo detector: a later report of another source that copies an earlier one is not an independent source.
  const echoItems: string[] = [];
  items.forEach((b, j) => {
    if (items.slice(0, j).some((a) => a.sourceId !== b.sourceId && !echoItems.includes(a.id) && isEcho(a, b))) echoItems.push(b.id);
  });
  const independent = items.filter((i) => !echoItems.includes(i.id));
  const sources = [...new Set(items.map((i) => i.sourceId))];
  // One representative per network: the channel that reported first.
  const byKey = new Map<string, string>();
  for (const i of independent) if (!byKey.has(independenceKey(i.sourceId))) byKey.set(independenceKey(i.sourceId), i.sourceId);
  const independentSources = [...byKey.values()];
  const echoes = sources.filter((s) => !independentSources.includes(s));
  const tiers: Record<Tier, number> = { physical: 0, primary: 0, early: 0, osint: 0, specialist: 0, perspective: 0, confirming: 0 };
  const known = independentSources.map((id) => sourceById(id)).filter((s): s is Source => !!s);
  for (const s of known) tiers[s.tier]++;
  const lead = [...independent].sort((a, b) => RANK[tierOf(b)] - RANK[tierOf(a)] || a.time - b.time)[0];
  const reporters = independentSources.length - tiers.physical;
  const status: Status =
    tiers.confirming || tiers.primary
      ? 'confirmed'
      : tiers.specialist || tiers.osint
        ? 'reported'
        : reporters >= 2
          ? 'emerging'
          : reporters === 1
            ? 'signal'
            : 'observed';
  // Lead time: the first fast report or measurement against the first confirming or specialist one.
  const fast = new Set<Tier>(['early', 'perspective', 'physical']);
  const firstFast = independent.find((i) => fast.has(tierOf(i)));
  const firstSlow = independent.find((i) => tierOf(i) === 'confirming') ?? independent.find((i) => tierOf(i) === 'specialist');
  const leadMs = firstFast && firstSlow && firstSlow.time > firstFast.time ? firstSlow.time - firstFast.time : null;
  return {
    id: items[0].id,
    items,
    echoes,
    echoItems,
    independent: independentSources.length,
    lead,
    status,
    sources,
    tiers,
    confidence: eventConfidence(known),
    first: items[0].time,
    last: items[items.length - 1].time,
    leadMs,
    leadFrom: leadMs ? firstFast!.sourceId : null,
    leadTo: leadMs ? firstSlow!.sourceId : null,
  };
}

/** Developing first: several sources and active in the last 12 hours, most sources first. Then everything by time. */
export function rankStories(stories: Story[], now: number): { developing: Story[]; latest: Story[] } {
  const developing = stories
    .filter((s) => independentCount(s) >= 2 && now - s.last < 12 * 3600_000)
    .sort((a, b) => independentCount(b) - independentCount(a) || b.last - a.last);
  const ids = new Set(developing.map((s) => s.id));
  const latest = stories.filter((s) => !ids.has(s.id)).sort((a, b) => b.last - a.last);
  return { developing, latest };
}

/** Sources that reported on their own: echoes left out. */
export const independentCount = (s: Story) => s.independent;
