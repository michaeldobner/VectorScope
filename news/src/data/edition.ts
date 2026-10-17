// From reports to an edition: stories, sections, importance and the text of each story in German, English and
// the original. Pure functions, the collector (collector/news.ts) brings the feeds, vectors and translations.
//
// Importance has three signals (news/KONZEPT.md): agreement of independent outlets from many countries, what the
// editors of leading outlets put first (Tagesschau homepage, top of ntv), and relevance for DACH readers.
// Belgium has its own perspective with relevance for Belgian readers, the world perspective counts outlets outside
// both home regions instead. No language model: the text of a story is the
// headline and teaser of its most factual outlet, translated where needed.
import { feedById, homeOf, LEAD_ORDER, type Home } from './feeds';
import type { Edition, Feed, Group, Lead, MsgLang, Report, Ressort, Story, StorySource } from './types';

const HOUR = 3600_000;
/** Reports older than this are not news any more. */
export const MAX_AGE = 36 * HOUR;
/** Stories in an edition, and the least per section. */
const KEEP = 200;
const PER_RESSORT = 12;

const WEIGHT: Record<Group, number> = { pub: 1, press: 1, intl: 1, biz: 0.8, tech: 0.7, fast: 0.4 };

// ---------- Grouping ----------

/** How much lower two reports in different languages may score and still be one story. */
const CROSS_LANG = 0.08;
const dot = (a: Float32Array, b: Float32Array) => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
};
const STOP = new Set(('der die das und ein eine einer eines mit von für auf nach bei aus im in am zum zur den dem des ist sind wird werden the a an of to in on for with after from by at as is are was were and or über vor nach gegen ' +
  'het een van voor met naar bij uit aan over door dat die zijn wordt worden niet ook nog maar').split(' '));
const words = (s: string) => new Set(s.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)));
/** A long word both titles share, like "meerjarenbegroting" or "schuldenrem": names the same topic. */
const LONG = 9;
const sharesLong = (a: Set<string>, b: Set<string>) => {
  for (const w of a) if (w.length >= LONG && b.has(w)) return true;
  return false;
};
/** How much a shared long word in the original titles lowers the bar. */
const SHARED_WORD = 0.1;
/** Titles in one language with this share of words in common are one story, whatever the vectors say. */
const SAME_WORDS = 0.4;
const jaccard = (a: Set<string>, b: Set<string>) => {
  let n = 0;
  for (const w of a) if (b.has(w)) n++;
  return n / (a.size + b.size - n || 1);
};

/**
 * Groups reports into stories. With vectors of a multilingual model (normalized, so the dot product is the
 * cosine): a report joins the story with the most similar member from `threshold` on. The collector embeds the
 * English version of every headline; `langs` says in which language each vector was made.
 * Without vectors: shared words, which only finds reports in the same language.
 */
export function group(reports: Report[], vectors?: Float32Array[], threshold = 0.8, langs?: string[]): number[][] {
  const order = reports.map((_, i) => i).sort((a, b) => reports[a].time - reports[b].time);
  const stories: number[][] = [];
  const bags = reports.map((r) => words(r.title));
  for (const i of order) {
    let best = -1;
    let bestSim = vectors ? threshold : 0.5;
    stories.forEach((members, s) => {
      for (const j of members) {
        if (reports[j].feed === reports[i].feed) continue;
        // Across languages the same meaning scores lower: the bar drops by CROSS_LANG.
        // A long word in common, in the same language (a budget, a motorway, a club): the bar drops by SHARED_WORD.
        // Flemish live pages and headlines of the same event differ too much for the bar of translated titles.
        const bar = (vectors && langs && langs[i] !== langs[j] ? CROSS_LANG : 0) + (vectors && sharesLong(bags[i], bags[j]) ? SHARED_WORD : 0);
        // Two Flemish outlets, almost the same words ("De Wever haalt schuldenrem voorlopig weer van tafel"): one
        // story, even when one title is still untranslated and its vector was made in Dutch.
        const words = jaccard(bags[i], bags[j]);
        const sim = vectors ? (words >= SAME_WORDS ? Math.max(threshold, dot(vectors[i], vectors[j]) + bar) : dot(vectors[i], vectors[j]) + bar) : words + bar;
        if (sim >= bestSim) {
          bestSim = sim;
          best = s;
        }
      }
    });
    if (best >= 0) stories[best].push(i);
    else stories.push([i]);
  }
  return stories;
}

// ---------- Sections ----------

const BY_PATH: [Ressort, RegExp][] = [
  ['sport', /\/(sport|sports|fussball|football|soccer|tennis|formel-?1|ski|wielrennen|wielersport|voetbal|formule-?1)\b/i],
  ['tech', /\/(digital|netzwelt|technology|tech|technik|computer|web|ki)\b/i],
  ['wirtschaft', /\/(wirtschaft|business|economy|economie|finanzen|boerse|markets|money|geld|unternehmen)\b/i],
  ['wissenschaft', /\/(wissen|science|wissenschaft|klima|climate|environment|umwelt|gesundheit|health|forschung)\b/i],
  ['kultur', /\/(kultur|culture|cultuur|entertainment|arts|leute|people|music|musik|film|kino|stars|unterhaltung|lifestyle|buecher|literatur)\b/i],
  ['dach', /\/(inland|schweiz|oesterreich|austria|deutschland|regional|bundesland)\b/i],
];
/** Home news of a Belgian outlet by its address. */
const BE_PATH = /\/(binnenland|belgie|belgium|belgique|vlaanderen|brussel|brussels|regio|politiek|politics)\b/i;
/** Categories of Belgian feeds (VRT NWS: Binnenland, Regio, Verkeer, Buitenland, Azië …). */
const BE_CATEGORY: [Ressort, RegExp][] = [
  ['welt', /buitenland|europa|azi[eë]|afrika|amerika|midden-oosten|oorlog|wereld|world/i],
  ['be', /binnenland|regio|verkeer|politiek|belgi|brussel|vlaander|walloni|justitie|onderwijs/i],
];
const BY_CATEGORY: [Ressort, RegExp][] = [
  ['sport', /sport|fußball|fussball|football/i],
  ['tech', /digital|technolog|netzwelt|computer/i],
  ['wirtschaft', /wirtschaft|business|economy|finanz|börse|markets/i],
  ['wissenschaft', /wissen|science|klima|climate|gesundheit|health|umwelt/i],
  ['kultur', /kultur|culture|entertainment|leute|people|musik|film/i],
  ['dach', /^inland$|schweiz|österreich|deutschland/i],
];
const DACH_WORDS =
  /(?<![\p{L}])(Bundestag|Bundesrat|Bundesrätin|Bundesregierung|Bundeskanzler|Kanzler|Merz|CDU|CSU|SPD|AfD|FDP|Grüne|Grünen|BSW|Nationalrat|Ständerat|Ständerätin|Kanton|Kantone|SVP|ÖVP|FPÖ|NEOS|Kickl|Babler|Stocker|Parmelin|Deutschland|Schweiz|Österreich|Wien|Zürich|Bern|Basel|Genf|Lausanne|Berlin|München|Hamburg|Köln|Bayern|Sachsen|SBB|Bundeswehr)(?![\p{L}])/u;
// Markets and companies in the title of a business feed: Wall Street, rates, oil, earnings, deals.
const MARKET_WORDS =
  /(?<![\p{L}])(S&P 500|Dow|Nasdaq|Wall Street|stocks?|shares|futures|earnings|bull market|bear market|investors?|IPO|Fed|interest rates?|inflation|bonds?|Treasury yields?|oil prices?|Brent|crude|acquires?|acquisition|takeover|merger)(?![\p{L}])/iu;
// Not Brussels alone: in foreign media it mostly stands for the EU.
const BE_WORDS =
  /(?<![\p{L}])(België|Belgie|Belgium|Belgian|Belgien|belgische[nr]?|Belgique|Vlaanderen|Vlaamse?|Flanders|Flemish|Flandern|Wallonië|Wallonia|Wallonie|Antwerpen|Antwerp|Gent|Ghent|Leuven|Brugge|Bruges|Mechelen|Hasselt|Charleroi|Luik|Liège|De Wever|N-VA|Vooruit|CD&V|Open VLD|Vlaams Belang|PVDA|NMBS|SNCB|De Lijn)(?![\p{L}])/u;
/** Sport without a result in the title: competitions and teams that are never anything else. */
const SPORT_EVENTS =
  /(?<![\p{L}])(baanwielrennen|wielrennen|veldrijden|Tour de France|Ronde van Vlaanderen|Rode Duivels|Red Devils|Red Flames|Pro League|Jupiler|Formule 1|Formel 1|Formula 1|Champions League|Europa League|Bundesliga|Super League|Premier League|Grand Slam|Wimbledon|Roland Garros)(?![\p{L}])/iu;
const SPORT_WORDS = /(?<![\p{L}])(Bundesliga|Champions League|Super League|Formel 1|Tor|Trainer|Ironman|NHL|NBA|WM|EM|Fußball|Fussball|football|goal|match|Premier League)(?![\p{L}])/iu;

/** Section of one report: its feed, its address, its category, words in its title. Null when nothing says. */
export function classify(r: Report, feed: Feed): Ressort | null {
  if (feed.ressort && feed.ressort !== 'welt') return feed.ressort;
  if (feed.group === 'biz' && MARKET_WORDS.test(r.title)) return 'wirtschaft';
  let path = '';
  try {
    path = new URL(r.link).pathname;
  } catch {}
  for (const [res, re] of BY_PATH) if (re.test(path)) return res;
  if (feed.cc === 'BE' && BE_PATH.test(path)) return 'be';
  if (feed.cc === 'BE' && /\/(buitenland|world|wereld)\b/i.test(path)) return 'welt';
  if (feed.cc === 'BE' && r.category) for (const [res, re] of BE_CATEGORY) if (re.test(r.category)) return res;
  if (r.category) for (const [res, re] of BY_CATEGORY) if (re.test(r.category)) return res;
  if (SPORT_WORDS.test(r.title) && /\d+:\d+|\d+-\d+/.test(r.title + r.teaser)) return 'sport';
  if (SPORT_EVENTS.test(r.title)) return 'sport';
  if (feed.lang !== 'en' && DACH_WORDS.test(r.title)) return 'dach';
  if (BE_WORDS.test(r.title)) return 'be';
  return null;
}

const PRIORITY: Ressort[] = ['sport', 'tech', 'wirtschaft', 'wissenschaft', 'kultur', 'dach', 'be', 'welt'];
function ressortOf(reports: Report[]): Ressort {
  const votes = new Map<Ressort, number>();
  for (const r of reports) {
    const feed = feedById(r.feed);
    const res = feed && classify(r, feed);
    if (res) votes.set(res, (votes.get(res) ?? 0) + 1);
  }
  // Nothing says, and only Belgian outlets report: Belgian news, a crash in Langemark, a bus shelter in Wuustwezel.
  // Their feeds name no section in the address, and village names are in no list.
  if (!votes.size && reports.every((r) => feedById(r.feed)?.cc === 'BE')) return 'be';
  let best: Ressort = 'welt';
  let n = 0;
  for (const res of PRIORITY) if ((votes.get(res) ?? 0) > n) [best, n] = [res, votes.get(res)!];
  // One business feed among four world reports does not make a business story: a third of the reports must agree.
  return n >= reports.length / 3 ? best : 'welt';
}

// ---------- Text of a story ----------

export type Translate = (text: string, to: 'de' | 'en') => string | undefined;

/** Teaser for the card: the first sentences up to about 260 characters, nothing when it only repeats the title. */
export function shortTeaser(teaser: string, title: string): string {
  const t = teaser.trim();
  if (!t || t === title || title.startsWith(t)) return '';
  if (t.length <= 260) return t;
  const cut = t.slice(0, 260);
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  return end > 80 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, '') + ' …';
}

function leadFor(lang: MsgLang, reports: Report[], tr: Translate): Lead {
  const outlet = (r: Report) => feedById(r.feed)!.outlet;
  const langOf = (r: Report) => feedById(r.feed)!.lang;
  const newestFirst = [...reports].sort((a, b) => b.time - a.time);
  const pick = (list: Report[]) => {
    for (const o of LEAD_ORDER[lang]) {
      const r = list.find((x) => outlet(x) === o);
      if (r) return r;
    }
    return list.find((x) => feedById(x.feed)!.group !== 'fast') ?? list[0];
  };
  if (lang === 'orig') {
    const r = pick(newestFirst);
    return { outlet: outlet(r), lang: langOf(r), head: r.title, sum: shortTeaser(r.teaser, r.title), translated: false };
  }
  const native = newestFirst.filter((r) => langOf(r) === lang);
  if (native.length) {
    const r = pick(native);
    return { outlet: outlet(r), lang, head: r.title, sum: shortTeaser(r.teaser, r.title), translated: false };
  }
  const r = pick(newestFirst);
  const head = tr(r.title, lang);
  const sum = shortTeaser(r.teaser, r.title);
  // Without a translation yet the story keeps the original text, unmarked, the next round translates it.
  if (!head) return { outlet: outlet(r), lang: langOf(r), head: r.title, sum, translated: false };
  return { outlet: outlet(r), lang, head, sum: sum ? (tr(sum, lang) ?? '') : '', translated: true };
}

// ---------- Importance ----------

export interface Signals {
  /** Link (or title) of a report to its position on the Tagesschau homepage, see placeMap. */
  homepage: Map<string, number>;
  /** The same for the headlines of VRT NWS. */
  beHomepage?: Map<string, number>;
  now: number;
}

function scores(reports: Report[], sig: Signals) {
  const feeds = reports.map((r) => feedById(r.feed)!);
  const outlets = new Map<string, Feed>();
  feeds.forEach((f) => outlets.set(f.outlet, outlets.get(f.outlet)?.group === 'intl' ? outlets.get(f.outlet)! : f));
  const all = [...outlets.values()];
  const intl = all.filter((f) => !homeOf(f));
  const sum = (list: Feed[]) => list.reduce((s, f) => s + WEIGHT[f.group], 0);
  const countries = (list: Feed[]) => new Set(list.map((f) => f.cc)).size;
  const newest = Math.max(...reports.map((r) => r.time));
  const age = Math.max(0, (sig.now - newest) / HOUR);
  let editors = 0;
  let beEditors = 0;
  const places = (n: number) => (n < 3 ? 4 : n < 8 ? 2 : n < 15 ? 1 : 0);
  for (const r of reports) {
    const vrt = sig.beHomepage && placeOf(sig.beHomepage, r);
    if (vrt != null) beEditors = Math.max(beEditors, places(vrt));
    const home = placeOf(sig.homepage, r);
    if (home != null) editors = Math.max(editors, places(home));
    if (r.feed === 'ntv' && r.rank < 3) editors = Math.max(editors, 1.5);
    // CNBC World is ordered by its editors, not by time: its first five are what CNBC leads with, the close of
    // Wall Street among them (test lab, 12 October 2026). Without this a single CNBC report never stays in an edition.
    if (r.feed === 'cnbc-world' && r.rank < 5) editors = Math.max(editors, 1.5);
  }
  // From a home region: its own outlets count fully and once more for relevance, the outlets of the other home
  // region together like one: eight Flemish outlets on a Flemish story do not make it big in DACH.
  const fromHome = (h: Home, bonus: number) => {
    const own = all.filter((f) => homeOf(f) === h);
    const other = all.filter((f) => homeOf(f) && homeOf(f) !== h);
    return sum(own) + sum(intl) + Math.min(1, sum(other)) + 0.5 * countries(all) + bonus + 0.4 * own.length - 0.12 * age;
  };
  const worldScore = sum(intl) + 0.5 * countries(intl) + 0.2 * (all.length - intl.length) - 0.12 * age;
  const round = (x: number) => Math.round(x * 100) / 100;
  // The editors of Tagesschau and ntv say what matters in Germany, those of VRT NWS what matters in Belgium.
  return { score: round(fromHome('dach', editors)), beScore: round(fromHome('be', beEditors)), worldScore: round(worldScore) };
}

// ---------- Edition ----------

export interface EditionInput {
  reports: Report[];
  groups: number[][];
  signals: Signals;
  tr: Translate;
  /** Picture from the article page (og:image), by link. */
  ogImage?: (link: string) => string | undefined;
  /** Pictures that are logos: the same address for many articles of one outlet. */
  logos?: Set<string>;
}

export function buildEdition({ reports, groups, signals, tr, ogImage, logos }: EditionInput): Edition {
  const stories: Story[] = groups.map((idx) => {
    const rs = idx.map((i) => reports[i]);
    const byOutlet = new Map<string, Report>();
    for (const r of [...rs].sort((a, b) => b.time - a.time)) {
      const o = feedById(r.feed)!.outlet;
      if (!byOutlet.has(o)) byOutlet.set(o, r);
    }
    const sources: StorySource[] = [...byOutlet.values()].map((r) => {
      const f = feedById(r.feed)!;
      return {
        outlet: f.outlet,
        cc: f.cc,
        group: f.group,
        lang: f.lang,
        orig: r.title,
        de: f.lang === 'de' ? r.title : (tr(r.title, 'de') ?? ''),
        en: f.lang === 'en' ? r.title : (tr(r.title, 'en') ?? ''),
        time: r.time,
        link: r.link,
      };
    });
    const lead = { de: leadFor('de', rs, tr), en: leadFor('en', rs, tr), orig: leadFor('orig', rs, tr) };
    const usable = (u?: string) => (u && !logos?.has(u) ? u : undefined);
    const leadReport = rs.find((r) => feedById(r.feed)!.outlet === lead.orig.outlet && r.title === lead.orig.head);
    const withImage = [leadReport, ...rs.filter((r) => feedById(r.feed)!.group !== 'fast'), ...rs].find((r) => r && usable(r.image));
    let img = withImage ? { url: usable(withImage.image)!, credit: feedById(withImage.feed)!.outlet } : undefined;
    if (!img && ogImage) {
      for (const r of rs) {
        const u = usable(ogImage(r.link));
        if (u) {
          img = { url: u, credit: feedById(r.feed)!.outlet };
          break;
        }
      }
    }
    const first = [...rs].sort((a, b) => a.time - b.time)[0];
    return {
      id: first.link,
      ressort: ressortOf(rs),
      ...scores(rs, signals),
      lead,
      img,
      time: Math.max(...rs.map((r) => r.time)),
      first: first.time,
      countries: [...new Set(sources.map((s) => s.cc))].sort(),
      sources,
    };
  });
  // The best by importance, and every section with enough to read.
  const ranked = stories.sort((a, b) => b.score - a.score);
  const keep = new Set(ranked.slice(0, KEEP));
  const world = [...stories].sort((a, b) => b.worldScore - a.worldScore);
  for (const s of world.slice(0, 40)) keep.add(s);
  for (const s of [...stories].sort((a, b) => b.beScore - a.beScore).slice(0, 40)) keep.add(s);
  for (const res of PRIORITY) ranked.filter((s) => s.ressort === res).slice(0, PER_RESSORT).forEach((s) => keep.add(s));
  const kept = ranked.filter((s) => keep.has(s));
  const all = kept.flatMap((s) => s.sources);
  return { at: signals.now, outlets: new Set(all.map((s) => s.outlet)).size, countries: new Set(all.map((s) => s.cc)).size, stories: kept };
}

/** A link without query, anchor and trailing slash: the headline feed and the article feed may write it differently. */
const bareLink = (l: string) => l.replace(/^http:/, 'https:').replace(/[?#].*$/, '').replace(/\/+$/, '');
/** Position of every report of a homepage or headline feed, by link and by title. */
export function placeMap(list: Report[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of list) {
    if (!m.has(bareLink(r.link))) m.set(bareLink(r.link), r.rank);
    if (!m.has(`t:${r.title}`)) m.set(`t:${r.title}`, r.rank);
  }
  return m;
}
const placeOf = (m: Map<string, number>, r: Report) => m.get(r.link) ?? m.get(bareLink(r.link)) ?? m.get(`t:${r.title}`);

/** Reports that belong into an edition: fresh, real news, no homepage entries. */
export const usableReports = (reports: Report[], now: number, isNoise: (t: string) => boolean) =>
  reports.filter((r) => r.time && now - r.time < MAX_AGE && r.time < now + HOUR && !isNoise(r.title) && feedById(r.feed)?.kind !== 'homepage');

/** Logos: picture addresses that one outlet uses for at least three different articles. */
export function findLogos(reports: Report[], og: Map<string, string>): Set<string> {
  const uses = new Map<string, Set<string>>();
  for (const r of reports) {
    for (const u of [r.image, og.get(r.link)]) {
      if (!u) continue;
      const key = `${feedById(r.feed)?.outlet}|${u}`;
      (uses.get(key) ?? uses.set(key, new Set()).get(key)!).add(r.link);
    }
  }
  return new Set([...uses].filter(([, links]) => links.size >= 3).map(([k]) => k.slice(k.indexOf('|') + 1)));
}
