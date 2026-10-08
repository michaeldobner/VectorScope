// Test lab: the new loaders of INTEL 0.9.0 need real answers to be written and tested against.
// Saves samples of the chosen feeds and APIs to lab-out/samples and tries the DIP API with every way of sending its key.
// Writes lab-out/voices.md.
import fs from 'node:fs';

const OUT = 'lab-out';
fs.mkdirSync(`${OUT}/samples`, { recursive: true });
const UA = { 'User-Agent': 'VectorScope-lab/0.1 (github.com/michaeldobner/VectorScope)' };
const md = [`# Voices samples ${new Date().toISOString()}`, ''];
const cell = (v) => (v == null || v === '' ? '' : String(v).replace(/\|/g, '/').replace(/\s+/g, ' ').slice(0, 160));

async function get(url, headers = {}) {
  const t = Date.now();
  try {
    const r = await fetch(url, { headers: { ...UA, ...headers }, redirect: 'follow', signal: AbortSignal.timeout(25000) });
    return { status: r.status, body: await r.text(), ms: Date.now() - t, type: r.headers.get('content-type'), cors: r.headers.get('access-control-allow-origin') };
  } catch (e) {
    return { status: 0, body: '', error: String(e.cause?.code ?? e.message ?? e), ms: Date.now() - t };
  }
}

// 1. Samples of the feeds and APIs, cut to 60 kB.
const samples = [
  ['bund-bundesregierung.rss', 'https://social.bund.de/@Bundesregierung.rss'],
  ['bund-bmi.rss', 'https://social.bund.de/@bmi.rss'],
  ['dlf-interview.rss', 'https://www.deutschlandfunk.de/interview-der-woche-100.rss'],
  ['politico-playbook.rss', 'https://feeds.megaphone.fm/ASD3449434491'],
  ['phoenix-persoenlich.rss', 'https://www.phoenix.de/podcast/persoenlich/audio/rss.xml'],
  ['yt-bundestag.xml', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCbh5D3EdIHP4YQA5X-eK1ug'],
  ['yt-phoenix.xml', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCqmQ1b96-PNH4coqgHTuTlA'],
  ['fragdenstaat.rss', 'https://fragdenstaat.de/artikel/feed/'],
  ['aw-polls.json', 'https://www.abgeordnetenwatch.de/api/v2/polls?field_legislature=161&sort_by=field_poll_date&sort_direction=desc&range_end=10'],
  ['bsky-mdb.json', 'https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=nroettgen.bsky.social&limit=10&filter=posts_no_replies'],
];
md.push('## Samples', '', '| File | HTTP | ms | Type | CORS | Bytes |', '|---|---|---|---|---|---|');
let polls = null;
for (const [file, url] of samples) {
  const r = await get(url);
  fs.writeFileSync(`${OUT}/samples/${file}`, r.body.slice(0, 60000));
  if (file === 'aw-polls.json') polls = JSON.parse(r.body || 'null');
  md.push(`| ${file} | ${r.status || r.error} | ${r.ms} | ${cell(r.type)} | ${cell(r.cors)} | ${r.body.length} |`);
}

// 2. One poll with its votes: how the fractions voted.
const poll = polls?.data?.[0];
if (poll) {
  const r = await get(`https://www.abgeordnetenwatch.de/api/v2/polls/${poll.id}?related_data=votes`);
  let j = null;
  try {
    j = JSON.parse(r.body);
  } catch {}
  const votes = j?.data?.related_data?.votes ?? [];
  fs.writeFileSync(`${OUT}/samples/aw-poll-votes.json`, JSON.stringify({ ...j, data: { ...j?.data, related_data: { votes: votes.slice(0, 5) } }, count: votes.length }, null, 1));
  md.push('', `Poll ${poll.id} with votes: HTTP ${r.status || r.error}, ${votes.length} votes, ${r.ms} ms`);
  const v = await get(`https://www.abgeordnetenwatch.de/api/v2/votes?poll=${poll.id}&range_end=1000`);
  try {
    const vj = JSON.parse(v.body);
    fs.writeFileSync(`${OUT}/samples/aw-votes.json`, JSON.stringify({ meta: vj.meta, data: vj.data?.slice(0, 5) }, null, 1));
    md.push(`Votes endpoint: HTTP ${v.status}, ${vj.data?.length} votes, ${v.ms} ms`);
  } catch {
    md.push(`Votes endpoint: HTTP ${v.status || v.error}`);
  }
}

// 3. DIP: the public key from the help page, sent as header and as parameter.
md.push('', '## DIP', '');
const help = await get('https://dip.bundestag.de/%C3%BCber-dip/hilfe/api');
const keys = [...new Set([...(help.body.matchAll(/\b([A-Za-z0-9]{6,8}\.[A-Za-z0-9_-]{20,})\b/g) ?? [])].map((m) => m[1]))];
const around = help.body.search(/API-?Key|Schlüssel/i);
fs.writeFileSync(`${OUT}/samples/dip-help.txt`, around >= 0 ? help.body.slice(Math.max(0, around - 1500), around + 3000) : help.body.slice(0, 5000));
md.push(`Help page HTTP ${help.status || help.error}, candidates: ${keys.length}`, '');
const BASE = 'https://search.dip.bundestag.de/api/v1';
for (const key of keys.slice(0, 3)) {
  for (const [how, url, headers] of [
    ['header ApiKey', `${BASE}/plenarprotokoll?f.zuordnung=BT&format=json`, { Authorization: `ApiKey ${key}` }],
    ['parameter apikey', `${BASE}/plenarprotokoll?f.zuordnung=BT&format=json&apikey=${key}`, {}],
    ['header, aktivitaet Rede', `${BASE}/aktivitaet?f.aktivitaetsart=Rede&format=json`, { Authorization: `ApiKey ${key}` }],
    ['header, plenarprotokoll-text', `${BASE}/plenarprotokoll-text?f.zuordnung=BT&format=json`, { Authorization: `ApiKey ${key}` }],
  ]) {
    const r = await get(url, { Accept: 'application/json', ...headers });
    md.push(`* key ${key.slice(0, 4)}…, ${how}: HTTP ${r.status || r.error}, ${r.ms} ms, CORS ${cell(r.cors)}, ${cell(r.body.slice(0, 200))}`);
    if (r.status === 200) fs.writeFileSync(`${OUT}/samples/dip-${how.replace(/\W+/g, '-')}.json`, r.body.slice(0, 60000));
  }
}

fs.writeFileSync(`${OUT}/voices.md`, md.join('\n') + '\n');
console.log('Voices samples written');
