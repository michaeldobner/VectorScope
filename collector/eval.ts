// Evaluation of the probe collector: reads archive.json from the folder given as argument and prints
// what INTEL would have shown: reports per class, stories with several sources, lead times.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { extractEntities, isCrisisRelated } from '../intel/src/data/entities';
import { sourceById, type Tier } from '../intel/src/data/sources';
import { buildStories } from '../intel/src/data/stories';
import type { EnrichedItem, Item } from '../intel/src/data/types';

const DIR = process.argv[2] ?? 'collector-data';
const DAYS = Number(process.argv[3] ?? 1);
const archive = JSON.parse(readFileSync(join(DIR, 'archive.json'), 'utf8')) as { at: number; items: Item[] };
const now = archive.at;
const items = archive.items.filter((i) => now - i.time < DAYS * 24 * 3600_000);
const enriched: EnrichedItem[] = [];
let dropped = 0;
for (const i of items) {
  const text = `${i.title}\n${i.text}`;
  const entities = extractEntities(text);
  const src = sourceById(i.sourceId);
  const broad = src?.category === 'news' || (src?.tier === 'primary' && src.category === 'general');
  if (broad && !isCrisisRelated(text, entities)) {
    dropped++;
    continue;
  }
  enriched.push({ ...i, entities, matches: [] });
}
const byTier: Partial<Record<Tier, number>> = {};
for (const i of enriched) {
  const t = sourceById(i.sourceId)?.tier ?? 'early';
  byTier[t] = (byTier[t] ?? 0) + 1;
}
const stories = buildStories(enriched);
const multi = stories.filter((s) => s.independent >= 2).sort((a, b) => b.independent - a.independent || b.last - a.last);
const status: Record<string, number> = {};
for (const s of multi) status[s.status] = (status[s.status] ?? 0) + 1;
const leads = multi.filter((s) => s.leadMs).map((s) => s.leadMs! / 60_000).sort((a, b) => a - b);

console.log(`Window ${DAYS} day(s) up to ${new Date(now).toISOString()}`);
console.log(`Reports ${items.length}, of them general news without crisis topic dropped ${dropped}, relevant ${enriched.length}`);
console.log(`Per class ${JSON.stringify(byTier)}`);
console.log(`Stories ${stories.length}, with 2+ independent sources ${multi.length} ${JSON.stringify(status)}`);
console.log(`Lead time of fast sources in ${leads.length} stories, median ${leads.length ? Math.round(leads[leads.length >> 1]) : 0} min`);
const leaders: Record<string, number> = {};
for (const s of multi) leaders[s.items[0].sourceId] = (leaders[s.items[0].sourceId] ?? 0) + 1;
console.log(`First reporter of multi-source stories ${JSON.stringify(Object.entries(leaders).sort((a, b) => b[1] - a[1]).slice(0, 12))}`);
console.log('\nTop stories');
for (const s of multi.slice(0, 40))
  console.log(`  ${s.status.padEnd(9)} ${String(s.independent).padStart(2)} src ${String(Math.round(s.confidence * 100)).padStart(3)}%  ${s.lead.title.slice(0, 90)}  [${[...new Set(s.items.map((i) => i.sourceId))].join(', ')}]`);
