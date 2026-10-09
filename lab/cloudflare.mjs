// Test lab: Cloudflare Radar, internet outages and traffic anomalies per country, as a measuring source for INTEL.
// Tries the public API without a token, the outage center page, and with CLOUDFLARE_API_TOKEN if the lab has one.
// Writes lab-out/cloudflare.md and samples in lab-out/samples.
import fs from 'node:fs';

const OUT = 'lab-out';
fs.mkdirSync(`${OUT}/samples`, { recursive: true });
const UA = { 'User-Agent': 'VectorScope-lab/0.1 (github.com/michaeldobner/VectorScope)' };
const md = [`# Cloudflare Radar check ${new Date().toISOString()}`, ''];
const cell = (v) => String(v ?? '').replace(/\|/g, '/').replace(/\s+/g, ' ').slice(0, 200);

async function get(url, headers = {}) {
  const t = Date.now();
  try {
    const r = await fetch(url, { headers: { ...UA, ...headers }, redirect: 'follow', signal: AbortSignal.timeout(25000) });
    return { status: r.status, body: await r.text(), ms: Date.now() - t, type: r.headers.get('content-type'), cors: r.headers.get('access-control-allow-origin') };
  } catch (e) {
    return { status: 0, body: '', error: String(e.cause?.code ?? e.message ?? e), ms: Date.now() - t };
  }
}

const API = 'https://api.cloudflare.com/client/v4/radar';
const paths = [
  ['outages', '/annotations/outages?dateRange=7d&limit=20&format=json'],
  ['anomalies', '/traffic_anomalies?dateRange=7d&limit=20&format=json'],
  ['annotations', '/annotations?dateRange=7d&limit=20&format=json'],
];
const token = process.env.CLOUDFLARE_API_TOKEN;
md.push(`Token in the lab: ${token ? 'yes' : 'no'}`, '', '| Request | HTTP | ms | Type | CORS | Start of the answer |', '|---|---|---|---|---|---|');
for (const [name, path] of paths) {
  for (const [how, headers] of [['without token', {}], ...(token ? [['with token', { Authorization: `Bearer ${token}` }]] : [])]) {
    const r = await get(API + path, headers);
    md.push(`| ${name}, ${how} | ${r.status || r.error} | ${r.ms} | ${cell(r.type)} | ${cell(r.cors)} | ${cell(r.body.slice(0, 200))} |`);
    if (r.status === 200) fs.writeFileSync(`${OUT}/samples/cloudflare-${name}-${how.replace(/\s/g, '-')}.json`, r.body.slice(0, 60000));
  }
}

// Public pages: the outage center and possible feeds, in case they can be read without the API.
md.push('', '| Page | HTTP | ms | Type | Bytes | Hints |', '|---|---|---|---|---|---|');
for (const url of [
  'https://radar.cloudflare.com/outage-center',
  'https://radar.cloudflare.com/outage-center.rss',
  'https://radar.cloudflare.com/rss',
  'https://blog.cloudflare.com/tag/outage/rss/',
  'https://blog.cloudflare.com/tag/cloudflare-radar/rss/',
]) {
  const r = await get(url);
  const hints = [r.body.includes('<rss') || r.body.includes('<feed') ? 'feed' : '', /outage/i.test(r.body) ? 'mentions outage' : '', /__NEXT_DATA__|window\.__remixContext|application\/json/.test(r.body) ? 'embedded data' : '']
    .filter(Boolean)
    .join(', ');
  md.push(`| ${url} | ${r.status || r.error} | ${r.ms} | ${cell(r.type)} | ${r.body.length} | ${hints} |`);
  if (r.status === 200) fs.writeFileSync(`${OUT}/samples/cloudflare-page-${url.replace(/\W+/g, '-').slice(8, 60)}.txt`, r.body.slice(0, 60000));
}

fs.writeFileSync(`${OUT}/cloudflare.md`, md.join('\n') + '\n');
console.log('Cloudflare check written');
