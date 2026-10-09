// Test lab: topics by meaning (collector/embed.ts) with the real multilingual model, on the data of the collector.
// Runs the benchmark of Now without topics and with topics at several thresholds, and counts the share of stories
// made of a single report. Writes lab-out/embed.md. The threshold with the best Recall@5 goes into embed.ts.
import { mkdirSync, writeFileSync } from 'node:fs';
import { benchmarkSnapshot, enrichedAt } from '../collector/benchmark';
import { assignTopics, loadEmbedder, MODEL, withTopic, type EmbedState } from '../collector/embed';
import type { ReferenceFile } from '../collector/reference';
import { withTranslations, type TrCache } from '../collector/translate';
import { buildStories } from '../intel/src/data/stories';
import type { Item } from '../intel/src/data/types';

const BASE = 'https://raw.githubusercontent.com/michaeldobner/VectorScope/collector-data';
const get = async (f: string) => (await fetch(`${BASE}/${f}`)).json();
const OUT = 'lab-out';
mkdirSync(OUT, { recursive: true });

const now = Date.now();
const tr: TrCache = await get('translations.json').catch(() => ({}));
const items: Item[] = ((await get('archive.json')).items as Item[]).filter((i) => now - i.time < 72 * 3600_000).map((i) => withTranslations(i, tr));
const ref: ReferenceFile = await get('reference.json');
const first = Math.min(...items.map((i) => i.seen ?? i.time));
const snaps = ref.snapshots.filter((s) => s.at - first > 24 * 3600_000);

function measure(list: Item[]) {
  let major = 0;
  let at5 = 0;
  let at10 = 0;
  for (const s of snaps) {
    const r = benchmarkSnapshot(list, s);
    major += r.major;
    at5 += r.at5;
    at10 += r.at10;
  }
  const last = snaps[snaps.length - 1];
  const stories = last ? buildStories(enrichedAt(list, last.at)) : [];
  const single = stories.length ? stories.filter((s) => s.items.length === 1).length / stories.length : 0;
  return { major, at5, at10, stories: stories.length, single };
}
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)} %` : 'n/a');

const lines = [`# Topics by meaning ${new Date().toISOString()}`, '', `Model ${MODEL}, ${items.length} reports of 72 hours, ${snaps.length} snapshots of the reference.`, ''];
lines.push('| Variant | Recall@5 | Recall@10 | Stories at the last snapshot | Single reports | Joined | ms |', '|---|---|---|---|---|---|---|');
const base = measure(items);
lines.push(`| words only (today) | ${pct(base.at5, base.major)} | ${pct(base.at10, base.major)} | ${base.stories} | ${pct(base.single * 100, 100)} | | |`);

const t0 = Date.now();
const embed = await loadEmbedder('lab-models');
lines.push('', `Model loaded in ${Date.now() - t0} ms.`, '');
// Embed once, then only the grouping changes with the threshold.
const cache = new Map<string, Float32Array>();
const cached = async (texts: string[]) => {
  const missing = texts.filter((t) => !cache.has(t));
  if (missing.length) (await embed(missing)).forEach((v, i) => cache.set(missing[i], v));
  return texts.map((t) => cache.get(t)!);
};
for (const threshold of [0.7, 0.75, 0.8, 0.85, 0.9]) {
  const state: EmbedState = {};
  const t = Date.now();
  const r = await assignTopics(items, state, { embed: cached, now, threshold });
  const m = measure(items.map((i) => withTopic(i, state)));
  lines.push(`| topics, threshold ${threshold} | ${pct(m.at5, m.major)} | ${pct(m.at10, m.major)} | ${m.stories} | ${pct(m.single * 100, 100)} | ${r.joined} | ${Date.now() - t} |`);
}
writeFileSync(`${OUT}/embed.md`, lines.join('\n') + '\n');
console.log(lines.join('\n'));
