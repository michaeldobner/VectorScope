// Benchmark of Now against the reference (reference.ts): for every hourly snapshot, Now is computed again from the
// reports the collector had seen by then, and checked against the topics the newsrooms agree on.
//
//   npx tsx collector/benchmark.ts <data folder or URL of collector-data> [out folder]
//
// Major topic: a topic at least two of the three newsrooms have in their top ten. Recall@5 and @10: the share
// of major topics that one of the first five or ten main stories of Now covers. Matching by shared words and
// names, with the German translation of the collector, so "execution" meets "Hinrichtung" only if translated.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { isAirTrack } from '../intel/src/data/alerts';
import { entitiesOf, extractEntities } from '../intel/src/data/entities';
import { headlines } from '../intel/src/data/headlines';
import { kindOf } from '../intel/src/data/kinds';
import { lensesOf } from '../intel/src/data/lens';
import { buildStories, keywords, type Story } from '../intel/src/data/stories';
import type { EnrichedItem, Item } from '../intel/src/data/types';
import type { ReferenceFile, ReferenceId, ReferenceSnapshot } from './reference';

/** The tokens of a headline: words, small places, actors and members of the Bundestag. */
export function tokensOf(title: string): Set<string> {
  const entities = extractEntities(title);
  const out = keywords({ id: '', sourceId: '', channel: 'rss', title, text: '', url: '', time: 0, entities, matches: [] });
  for (const a of entities.actors) out.add(`*${a}`);
  for (const m of entities.members) out.add(`*${m}`);
  // Countries and seas say little alone, they stay out of the comparison.
  for (const t of [...out]) if (t.startsWith('@') && !t.startsWith('@!')) out.delete(t);
  return out;
}

/** Same topic: at least two shared tokens. */
export const sameTopic = (a: Set<string>, b: Set<string>) => [...a].filter((t) => b.has(t)).length >= 2;

/** Tokens of a story: every headline of its reports, and their German and English translations. */
export function storyTokens(s: Story): Set<string> {
  const out = new Set<string>();
  for (const i of s.items) for (const title of [i.title, i.tr?.de?.title, i.tr?.en?.title]) if (title) for (const t of tokensOf(title)) out.add(t);
  return out;
}

export interface Topic {
  titles: Partial<Record<ReferenceId, string>>;
  tokens: Set<string>;
  /** Best place in any newsroom, 1 is the top story. */
  rank: number;
}

/** Topics of a snapshot: headlines of different newsrooms about the same thing grouped, those of at least two kept. */
export function majorTopics(snap: ReferenceSnapshot): Topic[] {
  const topics: Topic[] = [];
  for (const [ref, list] of Object.entries(snap.top) as [ReferenceId, string[]][]) {
    list.forEach((title, i) => {
      const tokens = tokensOf(title);
      const t = topics.find((x) => !x.titles[ref] && sameTopic(x.tokens, tokens));
      if (t) {
        t.titles[ref] = title;
        tokens.forEach((k) => t.tokens.add(k));
        t.rank = Math.min(t.rank, i + 1);
      } else topics.push({ titles: { [ref]: title }, tokens, rank: i + 1 });
    });
  }
  return topics.filter((t) => Object.keys(t.titles).length >= 2).sort((a, b) => a.rank - b.rank);
}

/** The reports as the app had them at `at`: seen by then, enriched like the store does, air tracks apart. */
export function enrichedAt(items: Item[], at: number): EnrichedItem[] {
  const out: EnrichedItem[] = [];
  for (const item of items) {
    if ((item.seen ?? item.time) > at || item.time > at) continue;
    if (isAirTrack(item)) continue;
    const entities = entitiesOf(item);
    const lens = lensesOf(item, `${item.title}\n${item.text}`, entities);
    if (!lens.security && !lens.politics) continue;
    const kind = kindOf(item);
    out.push({ ...item, entities, matches: [], lens, ...(kind ? { kind } : {}) });
  }
  return out;
}

export interface SnapshotResult {
  at: number;
  major: number;
  at5: number;
  at10: number;
  /** For reading: the major topics with the place of the main story that covers them, or null. */
  topics: { title: string; rank: number; place: number | null }[];
  now: string[];
}

export function benchmarkSnapshot(items: Item[], snap: ReferenceSnapshot): SnapshotResult {
  const stories = buildStories(enrichedAt(items, snap.at));
  const top = headlines(stories, snap.at, 10);
  const tokens = top.map((h) => storyTokens(h.story));
  const topics = majorTopics(snap).map((t) => {
    const i = tokens.findIndex((s) => sameTopic(s, t.tokens));
    return { title: Object.values(t.titles)[0]!, rank: t.rank, place: i >= 0 ? i + 1 : null };
  });
  return {
    at: snap.at,
    major: topics.length,
    at5: topics.filter((t) => t.place != null && t.place <= 5).length,
    at10: topics.filter((t) => t.place != null).length,
    topics,
    now: top.map((h) => h.story.lead.tr?.de?.title ?? h.story.lead.title),
  };
}

const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)} %` : 'n/a');

export function report(results: SnapshotResult[]): string {
  const major = results.reduce((n, r) => n + r.major, 0);
  const at5 = results.reduce((n, r) => n + r.at5, 0);
  const at10 = results.reduce((n, r) => n + r.at10, 0);
  const lines = [
    `# Benchmark of Now ${new Date().toISOString()}`,
    '',
    `${results.length} hourly snapshots, ${major} major topics (in the top ten of at least two of Tagesschau, ntv, Spiegel).`,
    '',
    `**Recall@5 ${pct(at5, major)} · Recall@10 ${pct(at10, major)}**`,
    '',
    '| Snapshot (UTC) | Major topics | In top 5 | In top 10 |',
    '|---|---|---|---|',
    ...results.map((r) => `| ${new Date(r.at).toISOString().slice(0, 16)} | ${r.major} | ${r.at5} | ${r.at10} |`),
  ];
  const last = results[results.length - 1];
  if (last) {
    lines.push('', `## Latest snapshot ${new Date(last.at).toISOString().slice(0, 16)}`, '', '| Major topic | Best place in a newsroom | Place in Now |', '|---|---|---|');
    for (const t of last.topics) lines.push(`| ${t.title.replace(/\|/g, '/')} | ${t.rank} | ${t.place ?? 'missing'} |`);
    lines.push('', 'Now at that time:', '', ...last.now.map((t, i) => `${i + 1}. ${t}`));
  }
  return lines.join('\n') + '\n';
}

async function load(where: string, file: string): Promise<string> {
  if (/^https?:/.test(where)) {
    const r = await fetch(`${where.replace(/\/$/, '')}/${file}`);
    if (!r.ok) throw new Error(`${file}: HTTP ${r.status}`);
    return r.text();
  }
  return readFileSync(join(where, file), 'utf8');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const where = process.argv[2] ?? 'collector-data';
  const out = process.argv[3] ?? 'lab-out';
  const items: Item[] = JSON.parse(await load(where, 'latest.json')).items ?? [];
  const ref: ReferenceFile = JSON.parse(await load(where, 'reference.json').catch(() => '{"snapshots":[]}'));
  const first = Math.min(...items.map((i) => i.seen ?? i.time));
  // Only snapshots the reports cover: 24 hours of reports before them.
  const snaps = ref.snapshots.filter((s) => s.at - first > 24 * 3600_000);
  const results = snaps.map((s) => benchmarkSnapshot(items, s));
  if (!existsSync(out)) mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'benchmark.md'), report(results));
  writeFileSync(join(out, 'benchmark.json'), JSON.stringify(results));
  console.log(report(results).split('\n').slice(0, 5).join('\n'));
}
