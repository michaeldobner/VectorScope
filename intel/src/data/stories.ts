// Stories: items from different sources that report the same event, grouped by shared places,
// callsigns, types and rare words within 36 hours of the first report. Each story gets a status from the tiers of its sources.
import { sourceById, type Tier } from './sources';
import type { EnrichedItem } from './types';

export type Status = 'observed' | 'signal' | 'emerging' | 'reported' | 'confirmed';

export interface Story {
  id: string;
  items: EnrichedItem[];
  /** Sources whose report copies an earlier report of another source almost word for word. They do not count as confirmation. */
  echoes: string[];
  /** Item ids of the copies. */
  echoItems: string[];
  /** The item whose headline represents the story: highest tier, then earliest. */
  lead: EnrichedItem;
  status: Status;
  sources: string[];
  tiers: Record<Tier, number>;
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
  for (const p of item.entities.places) out.add(`@${p.name}`);
  for (const c of item.entities.callsigns) out.add(`#${c.callsign}`);
  for (const t of item.entities.types) out.add(`%${t.label}`);
  for (const raw of item.title.toLowerCase().match(/\p{L}[\p{L}\p{N}/-]{2,}/gu) ?? []) {
    const w = SYNONYM[raw] ?? raw.replace(/(?<=\p{L}{3}[^s])s$/u, '');
    if (!STOP.has(w) && !STOP.has(raw)) out.add(w);
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
      if (!/^[@#%]/.test(t)) words++;
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
      if (g.some((m) => items[m].sourceId === items[i].sourceId) && g.every((m) => items[m].sourceId === items[i].sourceId)) continue;
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

const RANK: Record<Tier, number> = { confirm: 4, press: 3, osint: 2, breaking: 1, sensor: 0 };

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
  const tierOf = (i: EnrichedItem) => sourceById(i.sourceId)?.tier ?? 'breaking';
  // Echo detector: a later report of another source that copies an earlier one is not an independent source.
  const echoItems: string[] = [];
  items.forEach((b, j) => {
    if (items.slice(0, j).some((a) => a.sourceId !== b.sourceId && !echoItems.includes(a.id) && isEcho(a, b))) echoItems.push(b.id);
  });
  const independent = items.filter((i) => !echoItems.includes(i.id));
  const sources = [...new Set(items.map((i) => i.sourceId))];
  const independentSources = new Set(independent.map((i) => i.sourceId));
  const echoes = sources.filter((s) => !independentSources.has(s));
  const tiers: Record<Tier, number> = { sensor: 0, breaking: 0, osint: 0, press: 0, confirm: 0 };
  for (const s of independentSources) tiers[sourceById(s)?.tier ?? 'breaking']++;
  const lead = [...independent].sort((a, b) => RANK[tierOf(b)] - RANK[tierOf(a)] || a.time - b.time)[0];
  const reporters = independentSources.size - tiers.sensor;
  const status: Status = tiers.confirm
    ? 'confirmed'
    : tiers.press || tiers.osint
      ? 'reported'
      : reporters >= 2
        ? 'emerging'
        : reporters === 1
          ? 'signal'
          : 'observed';
  // Lead time: the first unverified report or own sensor observation against the first confirming or specialist one.
  const firstFast = independent.find((i) => tierOf(i) === 'breaking' || tierOf(i) === 'sensor');
  const firstSlow = independent.find((i) => tierOf(i) === 'confirm') ?? independent.find((i) => tierOf(i) === 'press');
  const leadMs = firstFast && firstSlow && firstSlow.time > firstFast.time ? firstSlow.time - firstFast.time : null;
  return {
    id: items[0].id,
    items,
    echoes,
    echoItems,
    lead,
    status,
    sources,
    tiers,
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
export const independentCount = (s: Story) => s.sources.length - s.echoes.length;
