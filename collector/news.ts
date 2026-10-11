// Collector of NEWS: one round. Loads every feed of news/src/data/feeds.ts, groups the reports into stories by
// meaning (the multilingual model of embed.ts, words as fallback), translates what is missing (the public Google
// endpoint, like translate.ts, no key) and writes the edition the app reads. No language model.
//
//   npx tsx collector/news.ts <data folder>
//
// Data folder (published on the branch news-data, replaced every round):
//   news.json               the edition: stories with sources, sections, importance, texts in de, en and original
//   news-translations.json  cache of every translation, so nothing is asked twice
//   news-og.json            picture of an article page (og:image) by link, for feeds without pictures
//   news-stats.json         per feed of the last round: ok, reports, error
// MODEL_DIR keeps the model between rounds, EMBED=0 groups by words only.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { translateAll } from '../proxy/lib/translate.js';
import { loadEmbedder, THRESHOLD, type Embed } from './embed';
import { FEEDS } from '../news/src/data/feeds';
import { decode, decodeEntities, isNoise, parseFeed } from '../news/src/data/parse';
import { buildEdition, findLogos, group, usableReports, type Translate } from '../news/src/data/edition';
import type { Report } from '../news/src/data/types';

const DIR = process.argv[2] ?? 'news-data';
const now = Date.now();
const DAY = 24 * 3600_000;
const UA = { 'User-Agent': 'VectorScope-news/0.1 (github.com/michaeldobner/VectorScope)' };
mkdirSync(DIR, { recursive: true });

const read = <T,>(file: string, fallback: T): T => {
  try {
    return existsSync(join(DIR, file)) ? (JSON.parse(readFileSync(join(DIR, file), 'utf8')) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (file: string, data: unknown) => writeFileSync(join(DIR, file), JSON.stringify(data));

async function pool<T, R>(list: T[], n: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(list.length);
  let next = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (next < list.length) {
      const i = next++;
      out[i] = await fn(list[i]);
    }
  }));
  return out;
}

async function get(url: string, ms = 25000) {
  const r = await fetch(url, { headers: UA, redirect: 'follow', signal: AbortSignal.timeout(ms) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return decode(new Uint8Array(await r.arrayBuffer()), r.headers.get('content-type'));
}

// 1. Feeds
const stats: Record<string, { ok: boolean; reports: number; error?: string }> = {};
const all: Report[] = (
  await pool(FEEDS, 6, async (feed) => {
    try {
      const reports = parseFeed(await get(feed.url), feed);
      stats[feed.id] = { ok: reports.length > 0, reports: reports.length };
      return reports;
    } catch (e) {
      stats[feed.id] = { ok: false, reports: 0, error: String((e as Error).message ?? e) };
      return [];
    }
  })
).flat();
const homepage = new Map(all.filter((r) => r.feed === 'tagesschau-home').map((r) => [r.link, r.rank]));
// One report per link: the API and the homepage of Tagesschau, NZZ recent and NZZ Schweiz overlap.
const seen = new Set<string>();
const reports = usableReports(all, now, isNoise).filter((r) => !seen.has(r.link) && seen.add(r.link));

// 2. Translations of the headlines first: the model compares the English versions, like INTEL does, so a German
// and an English report on the same event meet. Teasers of the leads follow after the stories are built.
type Cache = Record<string, { de?: string; en?: string; at: number }>;
const cache = new Map(Object.entries(read<Cache>('news-translations.json', {})).filter(([, v]) => now - v.at < 7 * DAY));
const missing = { de: new Set<string>(), en: new Set<string>() };
const tr: Translate = (text, to) => {
  const hit = cache.get(text)?.[to];
  if (hit) {
    cache.get(text)!.at = now;
    return hit;
  }
  missing[to].add(text);
  return undefined;
};
const MAX = Number(process.env.TRANSLATE_MAX ?? 400);
const stat = { translated: 0, refused: 0, viaProxy: 0 };
// Google often refuses the addresses of GitHub's runners. The proxy on Vercel (proxy/api/proxy.js, route /translate)
// asks Google from its own address, the collector switches to it for the rest of the round.
const PROXY = process.env.VECTORSCOPE_PROXY || 'https://vectorscope-proxy.vercel.app';
let useProxy = false;
async function viaProxy(texts: string[], to: 'de' | 'en'): Promise<(string | null)[]> {
  const r = await fetch(`${PROXY}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts: texts.map((t) => t.slice(0, 600)), to }),
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok) throw new Error(`proxy ${r.status}`);
  return ((await r.json()) as { translations?: (string | null)[] }).translations ?? texts.map(() => null);
}
const ask = async (texts: string[], to: 'de' | 'en') => {
  const fail = texts.map(() => null);
  if (!useProxy) {
    const out = await translateAll(texts, to).catch(() => fail);
    if (out.some((x) => x != null)) return out;
    useProxy = true;
  }
  stat.viaProxy += texts.length;
  return viaProxy(texts, to).catch(() => fail);
};
async function translateMissing() {
  for (const to of ['de', 'en'] as const) {
    const texts = [...missing[to]].filter((t) => !cache.get(t)?.[to]).slice(0, MAX);
    missing[to].clear();
    for (let s = 0; s < texts.length; s += 20) {
      const slice = texts.slice(s, s + 20);
      if (s) await new Promise((r) => setTimeout(r, 1500));
      const out = await ask(slice, to);
      // Everything refused: Google blocks this address for now, the next round goes on.
      if (out.every((x) => x == null)) {
        stat.refused += slice.length;
        break;
      }
      slice.forEach((t, i) => {
        if (!out[i]) return;
        const entry = cache.get(t) ?? { at: now };
        entry[to] = out[i]!;
        cache.set(t, entry);
        stat.translated++;
      });
    }
  }
}
const langOf = (r: Report) => FEEDS.find((f) => f.id === r.feed)!.lang;
for (const r of [...reports].sort((a, b) => b.time - a.time)) {
  if (langOf(r) !== 'en') tr(r.title, 'en');
  if (langOf(r) !== 'de') tr(r.title, 'de');
}
await translateMissing();

// 3. Stories by meaning
let embed: Embed | undefined;
if (process.env.EMBED !== '0') {
  try {
    embed = await loadEmbedder(process.env.MODEL_DIR);
  } catch (e) {
    console.log(`Model not available, grouping by words: ${(e as Error).message}`);
  }
}
let vectors: Float32Array[] | undefined;
const english = reports.map((r) => (langOf(r) === 'en' ? r.title : cache.get(r.title)?.en));
if (embed) {
  vectors = [];
  const texts = reports.map((r, i) => english[i] ?? r.title);
  for (let i = 0; i < texts.length; i += 64) vectors.push(...(await embed(texts.slice(i, i + 64))));
}
// A report without an English version yet is compared in its own language, which needs a lower bar.
const groups = group(reports, vectors, THRESHOLD, reports.map((r, i) => (english[i] ? 'en' : langOf(r))));

// 4. Pictures of article pages, for stories without a picture in any feed
const og = new Map(Object.entries(read<Record<string, { url?: string; at: number }>>('news-og.json', {})).filter(([, v]) => now - v.at < 3 * DAY));
const wanted = groups
  .filter((g) => !g.some((i) => reports[i].image))
  .sort((a, b) => b.length - a.length)
  .flatMap((g) => g.slice(0, 2).map((i) => reports[i].link))
  .filter((l) => !og.has(l))
  .slice(0, 40);
await pool(wanted, 4, async (link) => {
  try {
    const page = await get(link, 15000);
    const m = page.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i) ?? page.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);
    og.set(link, { url: m ? decodeEntities(m[1]) : undefined, at: now });
  } catch {
    og.set(link, { at: now });
  }
});
const ogUrls = new Map([...og].filter(([, v]) => v.url).map(([k, v]) => [k, v.url!]));
const logos = findLogos(reports, ogUrls);

// 5. The edition, once more after the teasers of the leads are translated
const input = { reports, groups, signals: { homepage, now }, tr, ogImage: (l: string) => ogUrls.get(l), logos };
buildEdition(input);
await translateMissing();
const edition = buildEdition(input);

write('news.json', edition);
write('news-translations.json', Object.fromEntries(cache));
write('news-og.json', Object.fromEntries(og));
write('news-stats.json', { at: now, feeds: stats });
const failed = Object.entries(stats).filter(([, s]) => !s.ok).map(([id]) => id);
console.log(
  `NEWS ${new Date(now).toISOString()}: ${reports.length} reports, ${edition.stories.length} stories from ${edition.outlets} outlets in ${edition.countries} countries, ` +
    `grouped by ${vectors ? 'meaning' : 'words'}, ${stat.translated} translated (${stat.viaProxy} asked via the proxy), ${stat.refused} refused, ${wanted.length} pages read for pictures` +
    (failed.length ? `, failed: ${failed.join(', ')}` : ''),
);
