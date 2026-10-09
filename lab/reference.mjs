// Test lab: the reference for the benchmark of Now, the order of the top stories of leading media right now.
// Writes lab-out/reference.md and samples.
import fs from 'node:fs';

const OUT = 'lab-out';
fs.mkdirSync(`${OUT}/samples`, { recursive: true });
const UA = { 'User-Agent': 'VectorScope-lab/0.1 (github.com/michaeldobner/VectorScope)' };
const md = [`# Reference check ${new Date().toISOString()}`, '', '| Candidate | HTTP | ms | Type | Bytes | First titles |', '|---|---|---|---|---|---|'];
const cell = (v) => String(v ?? '').replace(/\|/g, '/').replace(/\s+/g, ' ').slice(0, 300);

async function get(url) {
  const t = Date.now();
  try {
    const r = await fetch(url, { headers: UA, redirect: 'follow', signal: AbortSignal.timeout(25000) });
    return { status: r.status, body: await r.text(), ms: Date.now() - t, type: r.headers.get('content-type') };
  } catch (e) {
    return { status: 0, body: '', error: String(e.cause?.code ?? e.message ?? e), ms: Date.now() - t };
  }
}

const titles = (body) => {
  try {
    const j = JSON.parse(body);
    const list = j.news ?? j.regional ?? j.items ?? [];
    return list.slice(0, 6).map((n) => n.title ?? n.topline ?? '').join(' / ');
  } catch {
    return [...body.matchAll(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/g)].slice(1, 7).map((m) => m[1].trim()).join(' / ');
  }
};

for (const [name, url] of [
  ['tagesschau api homepage', 'https://www.tagesschau.de/api2u/homepage/'],
  ['tagesschau api news', 'https://www.tagesschau.de/api2u/news/'],
  ['tagesschau rss', 'https://www.tagesschau.de/index~rss2.xml'],
  ['ntv rss', 'https://www.n-tv.de/rss'],
  ['ntv topmeldungen', 'https://www.n-tv.de/topmeldungen/rss'],
  ['zdf heute', 'https://www.zdf.de/rss/zdf/nachrichten'],
  ['spiegel schlagzeilen', 'https://www.spiegel.de/schlagzeilen/index.rss'],
  ['dlf nachrichten', 'https://www.deutschlandfunk.de/nachrichten-100.rss'],
]) {
  const r = await get(url);
  md.push(`| ${name} | ${r.status || r.error} | ${r.ms} | ${cell(r.type)} | ${r.body.length} | ${cell(titles(r.body))} |`);
  if (r.status === 200) fs.writeFileSync(`${OUT}/samples/reference-${name.replace(/\W+/g, '-')}.txt`, r.body.slice(0, 80000));
}
fs.writeFileSync(`${OUT}/reference.md`, md.join('\n') + '\n');
console.log('Reference check written');
