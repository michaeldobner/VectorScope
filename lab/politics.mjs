// Test lab: candidates for the voices of politics (INTEL 0.9.0). Runs on GitHub Actions with real internet.
//   Mastodon of the federal government (social.bund.de), members of the Bundestag on Bluesky, the member list and
//   votes of abgeordnetenwatch.de, the DIP API of the Bundestag (speeches, documents), interview feeds and podcasts,
//   YouTube channels, FragDenStaat.
// Writes lab-out/politics.md and the data files the app needs: mps.json, mdb-bluesky.json, bund-mastodon.json.
import fs from 'node:fs';

const OUT = 'lab-out';
fs.mkdirSync(OUT, { recursive: true });
const UA = { 'User-Agent': 'VectorScope-lab/0.1 (github.com/michaeldobner/VectorScope)' };
const now = Date.now();
const ageH = (t) => (t ? Math.round((now - t) / 36e5) : null);
const md = [`# Politics voices check ${new Date().toISOString()}`, ''];
const cell = (v) => (v == null || v === '' ? '' : String(v).replace(/\|/g, '/').replace(/\s+/g, ' ').slice(0, 110));

async function get(url, accept) {
  const t = Date.now();
  try {
    const r = await fetch(url, { headers: { ...UA, ...(accept ? { Accept: accept } : {}) }, redirect: 'follow', signal: AbortSignal.timeout(25000) });
    const body = await r.text();
    return { status: r.status, body, ms: Date.now() - t, type: r.headers.get('content-type') };
  } catch (e) {
    return { status: 0, error: String(e.cause?.code ?? e.message ?? e), ms: Date.now() - t };
  }
}
const json = (r) => {
  try {
    return JSON.parse(r.body);
  } catch {
    return null;
  }
};
const feedInfo = (body = '') => {
  const items = (body.match(/<item[\s>]/g) ?? []).length + (body.match(/<entry[\s>]/g) ?? []).length;
  const dates = [...body.matchAll(/<(?:pubDate|updated|published|dc:date)>([^<]+)</g)].map((m) => Date.parse(m[1].trim())).filter((d) => !isNaN(d));
  const first = body.match(/<(item|entry)[\s>][\s\S]*?<\/\1>/)?.[0] ?? '';
  const latest = (first.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? '').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
  const span = dates.length > 1 ? (Math.max(...dates) - Math.min(...dates)) / 864e5 : 0;
  return { items, newestAgeH: dates.length ? ageH(Math.max(...dates)) : null, perDay: span ? Math.round(dates.length / Math.max(span, 1 / 24)) : null, latest };
};

// 1. Mastodon of the federal government: the directory of social.bund.de, then the RSS of the largest accounts.
{
  md.push('## social.bund.de', '', '| Account | Name | Followers | Posts | RSS items | Newest (h) | Per day | Latest |', '|---|---|---|---|---|---|---|---|');
  const accounts = [];
  for (const offset of [0, 80, 160]) {
    const r = await get(`https://social.bund.de/api/v1/directory?local=true&order=active&limit=80&offset=${offset}`);
    const list = json(r);
    if (!Array.isArray(list)) {
      md.push(`| directory | HTTP ${r.status || r.error} |`);
      break;
    }
    accounts.push(...list);
    if (list.length < 80) break;
  }
  const top = accounts.sort((a, b) => b.followers_count - a.followers_count).slice(0, 40);
  const out = [];
  for (const a of top) {
    const f = await get(`https://social.bund.de/@${a.acct}.rss`, 'application/rss+xml');
    const info = feedInfo(f.body);
    out.push({ acct: a.acct, name: a.display_name, followers: a.followers_count, posts: a.statuses_count, rssStatus: f.status, ...info });
    md.push(`| ${a.acct} | ${cell(a.display_name)} | ${a.followers_count} | ${a.statuses_count} | ${f.status === 200 ? info.items : f.status || f.error} | ${cell(info.newestAgeH)} | ${cell(info.perDay)} | ${cell(info.latest)} |`);
  }
  fs.writeFileSync(`${OUT}/bund-mastodon.json`, JSON.stringify(out, null, 1));
  md.push('');
}

// 2. Members of the Bundestag: the current period of abgeordnetenwatch.de, its mandates, and the latest votes.
let mps = [];
{
  md.push('## abgeordnetenwatch.de', '');
  const AW = 'https://www.abgeordnetenwatch.de/api/v2';
  const periods = json(await get(`${AW}/parliament-periods?parliament=5&type=legislature&sort_by=start_date_period&sort_direction=desc&range_end=3`));
  const period = periods?.data?.[0];
  md.push(`Period: ${period ? `${period.label} (id ${period.id})` : 'not found'}`, '');
  if (period) {
    for (let start = 0; start < 1200; start += 500) {
      const page = json(await get(`${AW}/candidacies-mandates?parliament_period=${period.id}&type=mandate&range_start=${start}&range_end=500`));
      const rows = page?.data ?? [];
      for (const m of rows) {
        const fraction = m.fraction_membership?.find((f) => !f.valid_until)?.fraction?.label ?? m.fraction_membership?.[0]?.fraction?.label ?? null;
        mps.push({ id: m.politician?.id, name: m.politician?.label, fraction, end: m.end_date ?? null });
      }
      if (rows.length < 500) break;
    }
    mps = mps.filter((m) => m.name && !m.end);
    md.push(`Members with a running mandate: ${mps.length}`, '', '| Fraction | Members |', '|---|---|');
    const by = {};
    for (const m of mps) by[m.fraction ?? 'none'] = (by[m.fraction ?? 'none'] ?? 0) + 1;
    for (const [f, n] of Object.entries(by).sort((a, b) => b[1] - a[1])) md.push(`| ${cell(f)} | ${n} |`);
    fs.writeFileSync(`${OUT}/mps.json`, JSON.stringify(mps));
    const polls = json(await get(`${AW}/polls?field_legislature=${period.id}&sort_by=field_poll_date&sort_direction=desc&range_end=8`));
    md.push('', '| Poll date | Title | Accepted |', '|---|---|---|');
    for (const p of polls?.data ?? []) md.push(`| ${p.field_poll_date} | ${cell(p.label)} | ${p.field_accepted} |`);
  }
  md.push('');
}

// 3. Members of the Bundestag on Bluesky: actors whose profile says MdB, matched against the member list.
{
  md.push('## Bluesky, members of the Bundestag', '');
  const BSKY = 'https://public.api.bsky.app/xrpc';
  const found = new Map();
  for (const q of ['MdB', 'Mitglied des Bundestages', 'Bundestagsabgeordnete', 'Bundestagsabgeordneter']) {
    let cursor = '';
    for (let page = 0; page < 4; page++) {
      const r = json(await get(`${BSKY}/app.bsky.actor.searchActors?q=${encodeURIComponent(q)}&limit=100${cursor ? `&cursor=${cursor}` : ''}`));
      for (const a of r?.actors ?? []) found.set(a.did, a);
      cursor = r?.cursor ?? '';
      if (!cursor) break;
    }
  }
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
  const byName = new Map(mps.map((m) => [norm(m.name), m]));
  const matched = [];
  const actors = [...found.values()];
  for (let i = 0; i < actors.length; i += 25) {
    const batch = actors.slice(i, i + 25);
    const profiles = json(await get(`${BSKY}/app.bsky.actor.getProfiles?${batch.map((a) => `actors=${encodeURIComponent(a.did)}`).join('&')}`))?.profiles ?? [];
    for (const p of profiles) {
      const name = norm((p.displayName ?? '').replace(/,?\s*MdB.*$/i, '').replace(/\(.*?\)/g, ''));
      const mp = byName.get(name) ?? [...byName.entries()].find(([n]) => name && (n.endsWith(` ${name.split(' ').at(-1)}`) && n.startsWith(name.split(' ')[0])))?.[1];
      if (!mp || !/mdb|bundestag/i.test(`${p.description ?? ''} ${p.displayName ?? ''}`)) continue;
      matched.push({ handle: p.handle, name: mp.name, fraction: mp.fraction, followers: p.followersCount, posts: p.postsCount });
    }
  }
  matched.sort((a, b) => b.followers - a.followers);
  fs.writeFileSync(`${OUT}/mdb-bluesky.json`, JSON.stringify(matched, null, 1));
  md.push(`Profiles found: ${found.size}, matched with a member: ${matched.length}`, '', '| Handle | Member | Fraction | Followers | Posts |', '|---|---|---|---|---|');
  for (const m of matched.slice(0, 60)) md.push(`| ${m.handle} | ${cell(m.name)} | ${cell(m.fraction)} | ${m.followers} | ${m.posts} |`);
  md.push('');
}

// 4. DIP, the documentation system of the Bundestag: the public key from its help page, then activities and minutes.
{
  md.push('## DIP Bundestag', '');
  const help = await get('https://dip.bundestag.de/%C3%BCber-dip/hilfe/api');
  const key = help.body?.match(/\b([A-Za-z0-9]{6,8}\.[A-Za-z0-9]{20,})\b/)?.[1];
  md.push(`Help page HTTP ${help.status || help.error}, public key ${key ? 'found' : 'not found'}`, '');
  if (key) {
    fs.writeFileSync(`${OUT}/dip-key.txt`, key);
    for (const [name, path] of [
      ['aktivitaet', 'aktivitaet?f.aktivitaetsart=Rede'],
      ['plenarprotokoll', 'plenarprotokoll?f.zuordnung=BT'],
      ['drucksache', 'drucksache?f.zuordnung=BT'],
    ]) {
      const r = await get(`https://search.dip.bundestag.de/api/v1/${path}&apikey=${key}&format=json`);
      const j = json(r);
      const doc = j?.documents?.[0];
      md.push(`* ${name}: HTTP ${r.status || r.error}, ${j?.numFound ?? '?'} found, newest ${cell(doc?.datum)}: ${cell(doc?.titel)} ${cell(doc?.vorgangsbezug?.[0]?.titel ?? '')}`);
      if (name === 'aktivitaet') fs.writeFileSync(`${OUT}/dip-aktivitaet.json`, JSON.stringify(j?.documents?.slice(0, 5) ?? [], null, 1));
    }
  }
  md.push('');
}

// 5. Interviews: feeds of Deutschlandfunk, podcasts found through the iTunes search, YouTube channels, FragDenStaat.
{
  md.push('## Interviews, podcasts, YouTube, FragDenStaat', '', '| Name | HTTP | Items | Newest (h) | Per day | Latest | URL |', '|---|---|---|---|---|---|---|');
  const feeds = [
    ['DLF Interviews', 'https://www.deutschlandfunk.de/interviews-100.rss'],
    ['DLF Interview der Woche', 'https://www.deutschlandfunk.de/interview-der-woche-100.rss'],
    ['DLF Informationen am Morgen', 'https://www.deutschlandfunk.de/informationen-am-morgen-102.rss'],
    ['DLF Kultur Interviews', 'https://www.deutschlandfunkkultur.de/interview-100.rss'],
    ['FragDenStaat requests', 'https://fragdenstaat.de/anfrage/feed/'],
    ['FragDenStaat articles', 'https://fragdenstaat.de/artikel/feed/'],
    ['FragDenStaat blog', 'https://fragdenstaat.de/blog/feed/'],
  ];
  for (const term of ['Interview der Woche Deutschlandfunk', 'Berlin Playbook Podcast', 'phoenix persönlich', 'Bericht aus Berlin', 'Table.Today']) {
    const r = json(await get(`https://itunes.apple.com/search?media=podcast&limit=3&term=${encodeURIComponent(term)}`));
    for (const p of r?.results ?? []) if (p.feedUrl) feeds.push([`Podcast: ${p.collectionName}`, p.feedUrl]);
  }
  for (const handle of ['phoenix', 'bundestag', 'tagesschau']) {
    const page = await get(`https://www.youtube.com/@${handle}`);
    const id = page.body?.match(/"(?:channelId|externalId)":"(UC[\w-]{22})"/)?.[1];
    if (id) feeds.push([`YouTube @${handle}`, `https://www.youtube.com/feeds/videos.xml?channel_id=${id}`]);
    else md.push(`| YouTube @${handle} | ${page.status || page.error} | channel id not found | | | | |`);
  }
  for (const [name, url] of feeds) {
    const r = await get(url, 'application/rss+xml, application/atom+xml, application/xml, text/xml');
    const info = feedInfo(r.body);
    md.push(`| ${cell(name)} | ${r.status || r.error} | ${info.items} | ${cell(info.newestAgeH)} | ${cell(info.perDay)} | ${cell(info.latest)} | ${url} |`);
  }
  const api = json(await get('https://fragdenstaat.de/api/v1/request/?format=json&status=resolved&limit=5'));
  md.push('', `FragDenStaat API: ${api?.meta?.total_count ?? '?'} resolved requests, newest: ${cell(api?.objects?.[0]?.title)} (${cell(api?.objects?.[0]?.last_message)})`, '');
}

fs.writeFileSync(`${OUT}/politics.md`, md.join('\n') + '\n');
console.log(`Politics check: ${mps.length} members, files in ${OUT}`);
