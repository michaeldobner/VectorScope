// Stories: items from different sources that report the same event, grouped by shared places,
// callsigns, types and rare words within 36 hours. Each story gets a status from the tiers of its sources.
import { sourceById, type Tier } from './sources';
import type { EnrichedItem } from './types';

export type Status = 'signal' | 'emerging' | 'reported' | 'confirmed';

export interface Story {
  id: string;
  items: EnrichedItem[];
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
const LINK_SCORE = 2.6;

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
    'breaking update report reports reported according official officials video footage photo photos watch read first latest sources source new says said'
  ).split(' '),
);

/** Keywords of an item: entities plus rare looking words, normalised across English and German. */
export function keywords(item: EnrichedItem): Set<string> {
  const out = new Set<string>();
  for (const p of item.entities.places) out.add(`@${p.name}`);
  for (const c of item.entities.callsigns) out.add(`#${c.callsign}`);
  for (const t of item.entities.types) out.add(`%${t.label}`);
  const text = `${item.title} ${item.text.slice(0, 240)}`.toLowerCase();
  for (const raw of text.match(/\p{L}[\p{L}\p{N}-]{3,}/gu) ?? []) {
    const w = SYNONYM[raw] ?? raw.replace(/(?<=\p{L}{3}[^s])s$/u, '');
    if (!STOP.has(w) && !STOP.has(raw)) out.add(w);
  }
  return out;
}

const weight = (token: string, df: Map<string, number>, n: number) => {
  // Places and entities count more than words, rare tokens more than common ones.
  const base = token[0] === '@' ? 1.4 : token[0] === '#' ? 3 : token[0] === '%' ? 1.2 : 1;
  return base * Math.log(1 + n / (df.get(token) ?? 1));
};

export function buildStories(items: EnrichedItem[]): Story[] {
  const n = items.length;
  const keys = items.map(keywords);
  const df = new Map<string, number>();
  for (const k of keys) for (const t of k) df.set(t, (df.get(t) ?? 0) + 1);

  // Union find over pairs that share enough rare tokens. Items of the same source never link directly,
  // a source repeating itself is not confirmation.
  const parent = items.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const order = items.map((_, i) => i).sort((a, b) => items[a].time - items[b].time);
  for (let x = 0; x < order.length; x++) {
    const a = order[x];
    for (let y = x + 1; y < order.length; y++) {
      const b = order[y];
      if (items[b].time - items[a].time > WINDOW_MS) break;
      if (items[a].sourceId === items[b].sourceId) continue;
      let score = 0;
      let words = 0;
      for (const t of keys[a]) {
        if (!keys[b].has(t)) continue;
        const df1 = df.get(t) ?? 1;
        // Tokens that appear everywhere say nothing.
        if (df1 > Math.max(6, n * 0.08)) continue;
        score += weight(t, df, n) / 2.5;
        if (!/^[@#%]/.test(t)) words++;
      }
      if (score >= LINK_SCORE && words >= 1) parent[find(a)] = find(b);
    }
  }

  const groups = new Map<number, EnrichedItem[]>();
  items.forEach((it, i) => {
    const r = find(i);
    groups.set(r, [...(groups.get(r) ?? []), it]);
  });
  return [...groups.values()].map(toStory);
}

const RANK: Record<Tier, number> = { confirm: 3, press: 2, osint: 1, breaking: 0 };

function toStory(list: EnrichedItem[]): Story {
  const items = [...list].sort((a, b) => a.time - b.time);
  const tiers: Record<Tier, number> = { breaking: 0, osint: 0, press: 0, confirm: 0 };
  const sources = [...new Set(items.map((i) => i.sourceId))];
  for (const s of sources) tiers[sourceById(s)?.tier ?? 'breaking']++;
  const tierOf = (i: EnrichedItem) => sourceById(i.sourceId)?.tier ?? 'breaking';
  const lead = [...items].sort((a, b) => RANK[tierOf(b)] - RANK[tierOf(a)] || a.time - b.time)[0];
  const status: Status = tiers.confirm
    ? 'confirmed'
    : tiers.press || tiers.osint
      ? 'reported'
      : sources.length >= 2
        ? 'emerging'
        : 'signal';
  const firstFast = items.find((i) => tierOf(i) === 'breaking');
  const firstSlow = items.find((i) => tierOf(i) === 'confirm') ?? items.find((i) => tierOf(i) === 'press');
  const leadMs = firstFast && firstSlow && firstSlow.time > firstFast.time ? firstSlow.time - firstFast.time : null;
  return {
    id: items[0].id,
    items,
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
    .filter((s) => s.sources.length >= 2 && now - s.last < 12 * 3600_000)
    .sort((a, b) => b.sources.length - a.sources.length || b.last - a.last);
  const ids = new Set(developing.map((s) => s.id));
  const latest = stories.filter((s) => !ids.has(s.id)).sort((a, b) => b.last - a.last);
  return { developing, latest };
}
