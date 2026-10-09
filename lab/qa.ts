// QA of INTEL under real conditions, runs in the test lab: every source loaded like the app does it
// (through the proxy, four at a time), three rounds in a row, then translation of real headlines.
// Writes lab-out/qa.md and lab-out/qa.json.
import { mkdirSync, writeFileSync } from 'node:fs';
import { PROXY, loadSource, pool } from '../intel/src/data/feed';
import { SOURCES } from '../intel/src/data/sources';
import type { Item } from '../intel/src/data/types';
import { TARGETS, type Target } from '../intel/src/data/lang';
import { translateAll } from '../proxy/lib/translate.js';
import { textsOf } from '../collector/translate';

const OUT = 'lab-out';
mkdirSync(OUT, { recursive: true });
const ORIGIN = { Origin: 'https://michaeldobner.github.io' };

// 1. Sources, three rounds like three refreshes of the app.
const rounds: Record<string, { ok: boolean; count: number; ms: number; error?: string }[]> = {};
let items: Item[] = [];
for (let round = 0; round < 3; round++) {
  await pool(SOURCES, 4, async (s) => {
    const t = Date.now();
    const r = await loadSource(s);
    (rounds[s.id] ??= []).push({ ok: r.status.ok, count: r.status.count, ms: Date.now() - t, error: r.status.error });
    if (round === 0) items.push(...r.items);
  });
}

// 2. Telegram through the proxy, all channels at once, to see whether Telegram or Vercel limit the rate.
const burst: { channel: string; status: number; ms: number; posts: number }[] = [];
await Promise.all(
  SOURCES.filter((s) => s.telegram).map(async (s) => {
    const t = Date.now();
    try {
      const r = await fetch(`${PROXY}/tg/${s.telegram}`, { headers: ORIGIN });
      const body = await r.text();
      burst.push({ channel: s.telegram!, status: r.status, ms: Date.now() - t, posts: (body.match(/data-post="/g) ?? []).length });
    } catch (e) {
      burst.push({ channel: s.telegram!, status: 0, ms: Date.now() - t, posts: 0 });
    }
  }),
);

// 3. Translation: real headlines in batches of 60 like the app, five batches back to back.
const foreign = items.filter((i) => SOURCES.find((s) => s.id === i.sourceId)?.lang !== 'de');
const texts = [...new Set(foreign.flatMap((i) => [i.title, i.text]).filter(Boolean))].slice(0, 300);
const translation: { batch: number; status: number; ms: number; sent: number; translated: number; untouched: number; error?: string }[] = [];
for (let b = 0; b < 5; b++) {
  const part = texts.slice(b * 60, b * 60 + 60);
  if (!part.length) break;
  const t = Date.now();
  try {
    const r = await fetch(`${PROXY}/translate`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...ORIGIN }, body: JSON.stringify({ texts: part, to: 'de' }) });
    const body = await r.text();
    let out: string[] = [];
    try {
      out = JSON.parse(body).translations ?? [];
    } catch {}
    const untouched = part.filter((p, i) => !out[i] || out[i] === p).length;
    translation.push({ batch: b, status: r.status, ms: Date.now() - t, sent: part.length, translated: out.length, untouched, error: r.ok ? undefined : body.slice(0, 200) });
  } catch (e) {
    translation.push({ batch: b, status: 0, ms: Date.now() - t, sent: part.length, translated: 0, untouched: part.length, error: String(e) });
  }
}

// 4. Can the browser reach Google Translate directly (CORS)?
const g = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=de&dt=t&q=' + encodeURIComponent('Взрыв в Воронеже'), { headers: ORIGIN }).catch(() => null);
const googleDirect = { status: g?.status ?? 0, cors: g?.headers.get('access-control-allow-origin') ?? null, body: g ? (await g.text()).slice(0, 120) : '' };

// 5. Translation like the collector does it (collector/translate.ts, variant A): the reports of the last 24 hours
// of the collector, every text that needs English or German, translated directly at Google in rounds of 150.
const collector = await fetch('https://raw.githubusercontent.com/michaeldobner/VectorScope/collector-data/latest.json')
  .then((r) => r.json())
  .catch(() => ({ items: [] as Item[] }));
const day = (collector.items as Item[]).filter((i) => Date.now() - i.time < 24 * 3600_000);
const volume: { target: Target; texts: number; chars: number; translated: number; refused: number; ms: number; examples: string[] }[] = [];
for (const target of TARGETS) {
  const texts = [...new Set(day.flatMap((i) => textsOf(i, target)))];
  const sample = texts.slice(0, 150);
  const t = Date.now();
  const out = await translateAll(sample, target).catch(() => sample.map(() => null));
  volume.push({
    target,
    texts: texts.length,
    chars: texts.reduce((n, x) => n + x.length, 0),
    translated: out.filter((x, i) => x && x !== sample[i]).length,
    refused: out.filter((x, i) => !x || x === sample[i]).length,
    ms: Date.now() - t,
    // What came back untouched or not at all: a refusal of Google, or a text that needs no translation (names, numbers).
    examples: sample.filter((x, i) => !out[i] || out[i] === x).slice(0, 8).map((x, i) => `${x.slice(0, 90)} => ${out[sample.indexOf(x)] == null ? 'null' : 'unchanged'}`),
  });
}

const lines = [
  `# QA ${new Date().toISOString()}`,
  '',
  '## Sources, three rounds through the proxy',
  '',
  '| Source | Round 1 | Round 2 | Round 3 | Error |',
  '|---|---|---|---|---|',
  ...SOURCES.map((s) => {
    const r = rounds[s.id] ?? [];
    const cell = (x?: { ok: boolean; count: number; ms: number }) => (x ? `${x.ok ? 'ok' : 'ERR'} ${x.count} ${x.ms}ms` : '');
    const err = r.find((x) => x.error)?.error ?? '';
    return `| ${s.id} | ${cell(r[0])} | ${cell(r[1])} | ${cell(r[2])} | ${err.slice(0, 120)} |`;
  }),
  '',
  '## Telegram burst, all channels at once',
  '',
  '| Channel | HTTP | ms | Posts |',
  '|---|---|---|---|',
  ...burst.sort((a, b) => a.channel.localeCompare(b.channel)).map((b) => `| ${b.channel} | ${b.status} | ${b.ms} | ${b.posts} |`),
  '',
  '## Translation, batches of 60',
  '',
  '| Batch | HTTP | ms | Sent | Returned | Untouched | Error |',
  '|---|---|---|---|---|---|---|',
  ...translation.map((t) => `| ${t.batch} | ${t.status} | ${t.ms} | ${t.sent} | ${t.translated} | ${t.untouched} | ${t.error ?? ''} |`),
  '',
  `Google directly from a browser: HTTP ${googleDirect.status}, CORS ${googleDirect.cors}, ${googleDirect.body}`,
  '',
  `## Translation in the collector, ${day.length} reports of the last 24 hours`,
  '',
  '| Target | Texts a day | Characters a day | Sample translated | Refused | ms |',
  '|---|---|---|---|---|---|',
  ...volume.map((v) => `| ${v.target} | ${v.texts} | ${v.chars} | ${v.translated} | ${v.refused} | ${v.ms} |`),
  '',
  ...volume.flatMap((v) => [`Not translated into ${v.target}:`, '', ...v.examples.map((e) => `* ${e.replace(/\|/g, '/')}`), '']),
];
writeFileSync(`${OUT}/qa.md`, lines.join('\n') + '\n');
writeFileSync(`${OUT}/qa.json`, JSON.stringify({ rounds, burst, translation, googleDirect, volume }, null, 2));
console.log(lines.slice(0, 5).join('\n'));
