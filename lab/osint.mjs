// OSINT source check, runs in the test lab with real internet.
// For every candidate: does it exist, how active is it, can a browser read it (CORS)?
// Writes lab-out/osint.json and lab-out/osint.md. Nothing of this is used by the app yet.
import fs from 'node:fs';

const OUT = 'lab-out';
fs.mkdirSync(OUT, { recursive: true });
const UA = { 'User-Agent': 'VectorScope-lab/0.1 (github.com/michaeldobner/VectorScope)' };
const ORIGIN = { Origin: 'https://michaeldobner.github.io' };
const BSKY = 'https://public.api.bsky.app/xrpc';
const now = Date.now();
const ageH = (iso) => (iso ? Math.round((now - Date.parse(iso)) / 36e5) : null);

async function get(url, accept) {
  const t = Date.now();
  try {
    const r = await fetch(url, { headers: { ...UA, ...ORIGIN, ...(accept ? { Accept: accept } : {}) }, redirect: 'follow', signal: AbortSignal.timeout(20000) });
    const body = await r.text();
    return { status: r.status, cors: r.headers.get('access-control-allow-origin'), type: r.headers.get('content-type'), body, ms: Date.now() - t, url: r.url };
  } catch (e) {
    return { status: 0, error: String(e.cause?.code ?? e.message ?? e), ms: Date.now() - t };
  }
}

// Bluesky: search by name, then read the newest post of each hit.
const BLUESKY = process.env.LAB_SKIP_BLUESKY ? [] : [
  'The Aviationist', 'The War Zone', 'ItaMilRadar', 'Aircraft Spots', 'Gerjon', 'Scramble',
  'Bellingcat', 'Oryx', 'GeoConfirmed', 'Institute for the Study of War', 'Liveuamap',
  'USNI News', 'Naval News', 'Breaking Defense', 'Defense News',
  'Augen geradeaus', 'hartpunkt', 'ESUT', 'sentdefender', 'OSINTtechnical', 'Faytuks', 'ELINT News',
  'Intel Crab', 'Thomas Wiegold', 'Tyler Rogoway', 'Rob Lee', 'Michael Kofman', 'Nathan Ruser',
  'Shashank Joshi', 'Phillips OBrien', 'Jakub Janovsky', 'Oliver Alexander', 'Christo Grozev', 'Eliot Higgins',
];
const blueskyHits = [];
const seen = new Set();
for (const q of BLUESKY) {
  const r = await get(`${BSKY}/app.bsky.actor.searchActors?q=${encodeURIComponent(q)}&limit=4`);
  let actors = [];
  try { actors = JSON.parse(r.body).actors ?? []; } catch {}
  for (const a of actors) {
    if (seen.has(a.did)) continue;
    seen.add(a.did);
    const p = await get(`${BSKY}/app.bsky.actor.getProfile?actor=${a.did}`);
    const f = await get(`${BSKY}/app.bsky.feed.getAuthorFeed?actor=${a.did}&limit=5&filter=posts_no_replies`);
    let prof = {}, last = null, own = 0;
    try { prof = JSON.parse(p.body); } catch {}
    try {
      const feed = JSON.parse(f.body).feed ?? [];
      own = feed.filter((x) => !x.reason).length;
      last = feed.map((x) => x.post?.indexedAt).filter(Boolean).sort().pop() ?? null;
    } catch {}
    blueskyHits.push({ query: q, handle: a.handle, name: a.displayName ?? '', followers: prof.followersCount ?? null, posts: prof.postsCount ?? null, lastPostAgeH: ageH(last), ownOfLast5: own, cors: f.cors, description: (prof.description ?? '').replace(/\s+/g, ' ').slice(0, 140) });
  }
}

// RSS and Atom feeds.
const FEEDS = [
  ['The Aviationist', 'https://theaviationist.com/feed/'],
  ['The War Zone', 'https://www.twz.com/feed'],
  ['ItaMilRadar', 'https://www.itamilradar.com/feed/'],
  ['Scramble', 'https://www.scramble.nl/military-news?format=feed&type=rss'],
  ['Bellingcat', 'https://www.bellingcat.com/feed/'],
  ['Oryx', 'https://www.oryxspioenkop.com/feeds/posts/default?alt=rss'],
  ['ISW', 'https://www.understandingwar.org/feeds.xml'],
  ['ISW (alt)', 'https://understandingwar.org/feed/'],
  ['USNI News', 'https://news.usni.org/feed'],
  ['Naval News', 'https://www.navalnews.com/feed/'],
  ['Breaking Defense', 'https://breakingdefense.com/feed/'],
  ['Defense News', 'https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml'],
  ['Augen geradeaus!', 'https://augengeradeaus.net/feed/'],
  ['hartpunkt', 'https://www.hartpunkt.de/feed/'],
  ['ESUT', 'https://esut.de/feed/'],
  ['NATO News', 'https://www.nato.int/cps/rss/en/natohq/rssFeed.xsl/rssFeed.xml'],
  ['US DoD News', 'https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=945&max=10'],
  ['Bundeswehr', 'https://www.bundeswehr.de/service/rss/de/517054/feed'],
  ['FlugRevue', 'https://www.flugrevue.de/feed/'],
  ['Aviation Week Defense', 'https://aviationweek.com/defense-space/rss.xml'],
  ['Airforce Technology', 'https://www.airforce-technology.com/feed/'],
  ['Janes', 'https://www.janes.com/feeds/news'],
  ['Tagesschau', 'https://www.tagesschau.de/index~rss2.xml'],
  ['Tagesschau Ausland', 'https://www.tagesschau.de/ausland/index~rss2.xml'],
  ['DW English', 'https://rss.dw.com/rdf/rss-en-top'],
  ['BBC World', 'https://feeds.bbci.co.uk/news/world/rss.xml'],
  ['Al Jazeera', 'https://www.aljazeera.com/xml/rss/all.xml'],
  ['Deutschlandfunk', 'https://www.deutschlandfunk.de/nachrichten-100.rss'],
];
const feeds = [];
for (const [name, url] of FEEDS) {
  const r = await get(url, 'application/rss+xml, application/atom+xml, application/xml, text/xml');
  const body = r.body ?? '';
  const items = (body.match(/<item[\s>]/g) ?? []).length + (body.match(/<entry[\s>]/g) ?? []).length;
  const dates = [...body.matchAll(/<(?:pubDate|updated|published|dc:date)>([^<]+)</g)].map((m) => Date.parse(m[1].trim())).filter((d) => !isNaN(d));
  const newest = dates.length ? new Date(Math.max(...dates)).toISOString() : null;
  feeds.push({ name, url, status: r.status, error: r.error, items, newestAgeH: ageH(newest), cors: r.cors, type: r.type?.split(';')[0], isFeed: items > 0 });
}

// Mastodon: account search on two large instances (no login).
const MASTODON = ['bellingcat', 'GeoConfirmed', 'The Aviationist', 'Oryx', 'osint', 'augengeradeaus', 'Naval News', 'USNI'];
const mastodon = [];
for (const q of MASTODON) {
  for (const host of ['mastodon.social', 'mstdn.social']) {
    const r = await get(`https://${host}/api/v2/search?q=${encodeURIComponent(q)}&type=accounts&limit=3&resolve=false`);
    let accounts = [];
    try { accounts = JSON.parse(r.body).accounts ?? []; } catch {}
    for (const a of accounts) mastodon.push({ query: q, host, acct: a.acct, name: a.display_name, followers: a.followers_count, posts: a.statuses_count, lastPostAgeH: ageH(a.last_status_at), cors: r.cors, status: r.status });
    if (!accounts.length) mastodon.push({ query: q, host, acct: null, status: r.status, error: r.error });
  }
}

// GDELT: news articles in the last hours on military aviation keywords.
const GDELT_Q = ['"air force" aircraft', 'tanker refuelling NATO', '"military aircraft"', 'Luftwaffe Eurofighter'];
const gdelt = [];
for (const q of GDELT_Q) {
  // GDELT allows one request every five seconds.
  await new Promise((r) => setTimeout(r, 6000));
  const r = await get(`https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(q)}&mode=artlist&format=json&maxrecords=10&timespan=24h&sort=datedesc`);
  let arts = [];
  try { arts = JSON.parse(r.body).articles ?? []; } catch {}
  const newest = arts.map((a) => a.seendate).filter(Boolean).sort().pop();
  const iso = newest ? newest.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/, '$1-$2-$3T$4:$5:$6Z') : null;
  gdelt.push({ query: q, status: r.status, error: r.error, articles: arts.length, newestAgeH: ageH(iso), cors: r.cors, ms: r.ms, sample: arts.slice(0, 3).map((a) => `${a.domain}: ${a.title}`.slice(0, 120)) });
}

// Telegram channels: web preview t.me/s, directly and through the proxy (Vercel may be blocked by Telegram).
const TELEGRAM = ['rybar', 'rybar_in_english', 'rybar_mena', 'rybar_africa', 'rybarde', 'evropar', 'caucasar', 'rybar_latam', 'rybar_pacific', 'balkanar', 'rybar_stan', 'rybar_tactical', 'rybar_america'];
const telegram = [];
for (const ch of TELEGRAM) {
  const direct = await get(`https://t.me/s/${ch}`);
  const proxied = await get(`https://vectorscope-proxy.vercel.app/tg/${ch}`);
  const body = direct.body ?? '';
  const title = plainTitle(body.match(/<meta property="og:title" content="([^"]*)"/)?.[1]);
  const subs = body.match(/<span class="counter_value">([^<]+)<\/span>\s*<span class="counter_type">subscribers/)?.[1] ?? null;
  const times = [...body.matchAll(/<time datetime="([^"]+)"/g)].map((m) => Date.parse(m[1])).filter((t) => !isNaN(t));
  const posts = (body.match(/data-post="/g) ?? []).length;
  const texts = (body.match(/class="tgme_widget_message_text js-message_text"/g) ?? []).length;
  const span = times.length > 1 ? (Math.max(...times) - Math.min(...times)) / 36e5 : null;
  const sample = [...body.matchAll(/class="tgme_widget_message_text js-message_text"[^>]*>([\s\S]{0,400}?)<\/div>/g)].slice(-3).map((m) => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140));
  const textAll = [...body.matchAll(/class="tgme_widget_message_text js-message_text"[^>]*>([\s\S]{0,600}?)<\/div>/g)].map((m) => m[1]).join(' ');
  const letters = textAll.replace(/<[^>]+>/g, '').match(/\p{L}/gu) ?? [];
  const cyr = letters.filter((c) => /\p{Script=Cyrillic}/u.test(c)).length;
  const heb = letters.filter((c) => /\p{Script=Hebrew}/u.test(c)).length;
  const lang = !letters.length ? '' : cyr / letters.length > 0.5 ? 'ru/uk' : heb / letters.length > 0.5 ? 'he' : 'latin';
  telegram.push({
    channel: ch, title, subs, lang, status: direct.status, error: direct.error, posts, texts,
    newestAgeH: times.length ? ageH(new Date(Math.max(...times)).toISOString()) : null,
    postsPerDay: span ? Math.round((posts / span) * 24) : null,
    proxyStatus: proxied.status, proxyPosts: (proxied.body?.match(/data-post="/g) ?? []).length, sample,
  });
}

// Machine readable physical and primary sources: keep a sample of each answer for the parsers.
const MACHINE = [
  ['usgs', 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson'],
  ['emsc', 'https://www.seismicportal.eu/fdsnws/event/1/query?limit=20&format=json&minmag=4.5&orderby=time'],
  ['gdacs', 'https://www.gdacs.org/xml/rss.xml'],
  ['faa', 'https://nasstatus.faa.gov/api/airport-status-information'],
  ['nws', 'https://api.weather.gov/alerts/active?severity=Extreme,Severe&status=actual&message_type=alert'],
  ['gdelt', 'https://api.gdeltproject.org/api/v2/doc/doc?query=(explosion%20OR%20drone%20OR%20missile)&mode=artlist&format=json&maxrecords=20&timespan=2h&sort=datedesc'],
];
const machine = [];
for (const [name, url] of MACHINE) {
  const r = await get(url, name === 'nws' ? 'application/geo+json' : undefined);
  fs.writeFileSync(`${OUT}/machine-${name}.txt`, `HTTP ${r.status} CORS ${r.cors}\n\n${(r.body ?? r.error ?? '').slice(0, 60000)}`);
  machine.push({ name, status: r.status, error: r.error, cors: r.cors, bytes: r.body?.length ?? 0, ms: r.ms });
}

const result = { checkedAt: new Date().toISOString(), bluesky: blueskyHits, feeds, mastodon, gdelt, telegram, machine };
fs.writeFileSync(`${OUT}/osint.json`, JSON.stringify(result, null, 2));

const cell = (v) => (v == null || v === '' ? '' : String(v).replace(/\|/g, '/'));
function plainTitle(s) {
  return (s ?? '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

const md = [
  `# OSINT source check ${result.checkedAt}`,
  '', '## Bluesky', '', '| Query | Handle | Name | Followers | Posts | Newest (h) | Own of last 5 | CORS |', '|---|---|---|---|---|---|---|---|',
  ...blueskyHits.map((b) => `| ${cell(b.query)} | ${cell(b.handle)} | ${cell(b.name)} | ${cell(b.followers)} | ${cell(b.posts)} | ${cell(b.lastPostAgeH)} | ${b.ownOfLast5} | ${cell(b.cors)} |`),
  '', '## Feeds', '', '| Name | HTTP | Items | Newest (h) | CORS | Type | URL |', '|---|---|---|---|---|---|---|',
  ...feeds.map((f) => `| ${f.name} | ${f.status || cell(f.error)} | ${f.items} | ${cell(f.newestAgeH)} | ${cell(f.cors)} | ${cell(f.type)} | ${f.url} |`),
  '', '## Mastodon', '', '| Query | Host | Account | Followers | Posts | Newest (h) | CORS |', '|---|---|---|---|---|---|---|',
  ...mastodon.map((m) => `| ${m.query} | ${m.host} | ${cell(m.acct) || `none (HTTP ${m.status || m.error})`} | ${cell(m.followers)} | ${cell(m.posts)} | ${cell(m.lastPostAgeH)} | ${cell(m.cors)} |`),
  '', '## Telegram', '', '| Channel | Title | Subscribers | Lang | HTTP | Posts on page | With text | Newest (h) | Posts per day | Proxy HTTP | Proxy posts | Latest |', '|---|---|---|---|---|---|---|---|---|---|---|---|',
  ...telegram.map((t) => `| ${t.channel} | ${cell(t.title)} | ${cell(t.subs)} | ${t.lang} | ${t.status || cell(t.error)} | ${t.posts} | ${t.texts} | ${cell(t.newestAgeH)} | ${cell(t.postsPerDay)} | ${t.proxyStatus || ''} | ${t.proxyPosts} | ${cell(t.sample.at(-1))} |`),
  '', '## Machine sources', '', '| Name | HTTP | CORS | Bytes | ms |', '|---|---|---|---|---|',
  ...machine.map((m) => `| ${m.name} | ${m.status || cell(m.error)} | ${cell(m.cors)} | ${m.bytes} | ${m.ms} |`),
  '', '## GDELT', '', '| Query | HTTP | Articles 24 h | Newest (h) | CORS | ms |', '|---|---|---|---|---|---|',
  ...gdelt.map((g) => `| ${g.query} | ${g.status || cell(g.error)} | ${g.articles} | ${cell(g.newestAgeH)} | ${cell(g.cors)} | ${g.ms} |`),
];
fs.writeFileSync(`${OUT}/osint.md`, md.join('\n') + '\n');
console.log(`OSINT check: ${telegram.filter((t) => t.posts).length}/${telegram.length} Telegram channels, ${blueskyHits.length} Bluesky accounts, ${feeds.filter((f) => f.isFeed).length}/${feeds.length} feeds, ${mastodon.filter((m) => m.acct).length} Mastodon accounts, GDELT ${gdelt.map((g) => g.articles).join('/')}`);
