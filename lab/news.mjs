// Test lab: candidate feeds for the news module. Per feed: reachable, format, items, freshness, images, teasers, CORS.
// Writes lab-out/news-feeds.md, lab-out/news-feeds.json and samples.
import fs from 'node:fs';

const OUT = 'lab-out';
fs.mkdirSync(`${OUT}/samples/news`, { recursive: true });
const UA = {
  'User-Agent': 'VectorScope-lab/0.1 (github.com/michaeldobner/VectorScope)',
};
const cell = (v) =>
  String(v ?? '')
    .replace(/\|/g, '/')
    .replace(/\s+/g, ' ')
    .slice(0, 200);

// Region, name, URL. Several URLs for one outlet where the right address is not certain.
const FEEDS = [
  ['DE', 'Tagesschau', 'https://www.tagesschau.de/index~rss2.xml'],
  ['DE', 'Tagesschau API', 'https://www.tagesschau.de/api2u/news/'],
  // The order of the Tagesschau homepage: what an editorial team puts first, a signal for the ranking.
  ['DE', 'Tagesschau Startseite', 'https://www.tagesschau.de/api2u/homepage/'],
  ['DE', 'ntv', 'https://www.n-tv.de/rss'],
  ['DE', 'Bild', 'https://www.bild.de/feed/alles.xml'],
  ['DE', 'ZDFheute', 'https://www.zdf.de/rss/zdf/nachrichten'],
  ['DE', 'Spiegel', 'https://www.spiegel.de/schlagzeilen/index.rss'],
  ['DE', 'Deutschlandfunk', 'https://www.deutschlandfunk.de/nachrichten-100.rss'],
  ['DE', 'DW Deutsch', 'https://rss.dw.com/xml/rss-de-all'],
  ['DE', 'Heise', 'https://www.heise.de/rss/heise-atom.xml'],
  ['DE', 'Golem', 'https://rss.golem.de/rss.php?feed=RSS2.0'],
  ['CH', 'SRF Neueste', 'https://www.srf.ch/news/bnf/rss/1646'],
  ['CH', 'SRF International', 'https://www.srf.ch/news/bnf/rss/1922'],
  ['CH', 'SRF Schweiz', 'https://www.srf.ch/news/bnf/rss/1890'],
  ['CH', 'SRF Wirtschaft', 'https://www.srf.ch/news/bnf/rss/1926'],
  ['CH', 'NZZ Neueste', 'https://www.nzz.ch/recent.rss'],
  ['CH', 'NZZ International', 'https://www.nzz.ch/international.rss'],
  ['CH', 'NZZ Schweiz', 'https://www.nzz.ch/schweiz.rss'],
  ['CH', 'swissinfo DE a', 'https://www.swissinfo.ch/ger/rss/alle-news'],
  ['CH', 'swissinfo DE b', 'https://www.swissinfo.ch/ger/rss'],
  ['CH', 'swissinfo EN', 'https://www.swissinfo.ch/eng/rss'],
  ['CH', 'RTS Info a', 'https://www.rts.ch/info/?format=rss/news'],
  ['CH', 'RTS Info b', 'https://www.rts.ch/info/rss'],
  ['CH', 'RSI Info', 'https://www.rsi.ch/info/?f=rss'],
  ['CH', 'watson', 'https://www.watson.ch/api/1.0/rss/index.xml'],
  ['CH', '20 Minuten', 'https://partner-feeds.20min.ch/rss/20minuten'],
  ['CH', 'Tages-Anzeiger', 'https://www.tagesanzeiger.ch/rss.xml'],
  ['CH', 'Blick', 'https://www.blick.ch/rss.xml'],
  ['AT', 'ORF', 'https://rss.orf.at/news.xml'],
  ['AT', 'Der Standard', 'https://www.derstandard.at/rss'],
  ['AT', 'Die Presse', 'https://www.diepresse.com/rss'],
  ['INT', 'BBC World', 'https://feeds.bbci.co.uk/news/world/rss.xml'],
  ['INT', 'BBC Africa', 'https://feeds.bbci.co.uk/news/world/africa/rss.xml'],
  ['INT', 'Al Jazeera', 'https://www.aljazeera.com/xml/rss/all.xml'],
  ['INT', 'NPR World', 'https://feeds.npr.org/1004/rss.xml'],
  ['INT', 'Guardian World', 'https://www.theguardian.com/world/rss'],
  ['INT', 'DW English', 'https://rss.dw.com/xml/rss-en-all'],
  ['INT', 'France 24', 'https://www.france24.com/en/rss'],
  ['INT', 'Euronews', 'https://www.euronews.com/rss'],
  ['INT', 'CBC World', 'https://www.cbc.ca/webfeed/rss/rss-world'],
  ['INT', 'ABC Australia', 'https://www.abc.net.au/news/feed/51120/rss.xml'],
  ['INT', 'CNA', 'https://www.channelnewsasia.com/rssfeeds/8395884'],
  ['INT', 'SCMP World', 'https://www.scmp.com/rss/91/feed'],
  ['INT', 'Times of India', 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms'],
  ['INT', 'CNN International', 'http://rss.cnn.com/rss/edition.rss'],
  ['INT', 'CNN World', 'http://rss.cnn.com/rss/edition_world.rss'],
  ['INT', 'CNBC Top News', 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114'],
  ['INT', 'CNBC World', 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362'],
  ['BE', 'VRT NWS', 'https://www.vrt.be/vrtnws/nl.rss.articles.xml'],
  ['BE', 'VRT NWS Hoofdpunten', 'https://www.vrt.be/vrtnws/nl.rss.headlines.xml'],
  ['BE', 'VRT NWS English', 'https://www.vrt.be/vrtnws/en.rss.articles.xml'],
  ['BE', 'De Morgen', 'https://www.demorgen.be/in-het-nieuws/rss.xml'],
  ['BE', 'De Tijd', 'https://www.tijd.be/rss/nieuws.xml'],
  ['BE', 'HLN', 'https://www.hln.be/home/rss.xml'],
];

async function get(url) {
  const t = Date.now();
  try {
    const r = await fetch(url, {
      headers: UA,
      redirect: 'follow',
      signal: AbortSignal.timeout(25000),
    });
    // Not every feed is UTF-8 (Golem is ISO-8859-1): charset from the header, else from the XML declaration.
    const bytes = new Uint8Array(await r.arrayBuffer());
    const head = new TextDecoder('latin1').decode(bytes.slice(0, 200));
    const charset = r.headers.get('content-type')?.match(/charset=([\w-]+)/i)?.[1] ?? head.match(/encoding="([\w-]+)"/i)?.[1] ?? 'utf-8';
    let body;
    try {
      body = new TextDecoder(charset).decode(bytes);
    } catch {
      body = new TextDecoder().decode(bytes);
    }
    return {
      status: r.status,
      body,
      charset,
      ms: Date.now() - t,
      type: r.headers.get('content-type'),
      cors: r.headers.get('access-control-allow-origin'),
      final: r.url,
    };
  } catch (e) {
    return {
      status: 0,
      body: '',
      error: String(e.cause?.code ?? e.message ?? e),
      ms: Date.now() - t,
    };
  }
}

// HTML entities: ZDF writes umlauts as &uuml;, others escape their markup once or twice.
const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  auml: 'ä',
  ouml: 'ö',
  uuml: 'ü',
  Auml: 'Ä',
  Ouml: 'Ö',
  Uuml: 'Ü',
  szlig: 'ß',
  eacute: 'é',
  egrave: 'è',
  agrave: 'à',
  ccedil: 'ç',
  laquo: '«',
  raquo: '»',
  bdquo: '„',
  ldquo: '“',
  rdquo: '”',
  lsquo: '‘',
  rsquo: '’',
  ndash: '-',
  mdash: '-',
  hellip: '…',
};
const decode = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
    e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1)) : (ENTITIES[e] ?? m),
  );
const cdata = (s) => (s ?? '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
const text = (s) =>
  decode(decode(cdata(s)).replace(/<[^>]+>/g, ' '))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const tag = (block, names) => {
  for (const n of names) {
    const m = block.match(new RegExp(`<${n}(?:\\s[^>]*)?>([\\s\\S]*?)</${n}>`, 'i'));
    if (m) return m[1];
  }
  return undefined;
};
const IMAGE =
  /<media:(content|thumbnail)[^>]*url=|<enclosure[^>]*type="image|<enclosure[^>]*url="[^"]+\.(jpe?g|png|webp)|&lt;img|<img|<image>/i;

function imageUrl(block) {
  const b = decode(cdata(block));
  const m =
    b.match(/<media:content[^>]*url="([^"]+)"[^>]*(?:medium="image"|type="image)/i) ??
    b.match(/<media:content[^>]*(?:medium="image"|type="image)[^>]*url="([^"]+)"/i) ??
    b.match(/<media:thumbnail[^>]*url="([^"]+)"/i) ??
    b.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image/i) ??
    b.match(/<enclosure[^>]*type="image[^"]*"[^>]*url="([^"]+)"/i) ??
    b.match(/<media:content[^>]*url="([^"]+\.(?:jpe?g|png|webp)[^"]*)"/i) ??
    b.match(/<img[^>]*src="([^"]+)"/i);
  // Golem puts a counting pixel into the description, not a picture.
  return m && !/cpx\.php|\/pixel|1x1/i.test(m[1]) ? decode(m[1]) : undefined;
}

function parseFeed(body) {
  try {
    const j = JSON.parse(body);
    const list = j.news ?? j.items ?? [];
    return {
      format: 'json',
      items: list.map((n) => ({
        title: n.title,
        date: n.date,
        image: Boolean(n.teaserImage),
        teaser: (n.firstSentence ?? n.content?.[0]?.value ?? '').length > 40,
        link: n.shareURL ?? n.detailsweb,
        imageUrl: n.teaserImage?.imageVariants?.['16x9-960'] ?? n.teaserImage?.imageVariants?.['16x9-640'],
        teaserText: text(n.firstSentence ?? n.content?.[0]?.value ?? ''),
        ressort: n.ressort,
      })),
    };
  } catch {}
  const atom = /<feed[\s>]/.test(body) && !/<rss[\s>]/.test(body);
  const blocks = [...body.matchAll(atom ? /<entry[\s>][\s\S]*?<\/entry>/g : /<item[\s>][\s\S]*?<\/item>/g)].map((m) => m[0]);
  if (!blocks.length && !/<rss|<feed|<rdf/i.test(body)) return { format: 'none', items: [] };
  const lang = body.match(/<language>([^<]+)<\/language>/i)?.[1] ?? body.match(/xml:lang="([^"]+)"/i)?.[1];
  return {
    format: atom ? 'atom' : 'rss',
    lang,
    items: blocks.map((b) => ({
      title: text(tag(b, ['title'])),
      date: text(tag(b, ['pubDate', 'updated', 'published', 'dc:date'])),
      image: IMAGE.test(b),
      teaser: text(tag(b, ['description', 'summary', 'content'])).length > 40,
      link: text(tag(b, ['link'])) || b.match(/<link[^>]*href="([^"]+)"/i)?.[1],
      imageUrl: imageUrl(b),
      teaserText: text(tag(b, ['description', 'summary', 'content'])).slice(0, 400),
      category: text(tag(b, ['category'])),
    })),
  };
}

const results = [];
for (const [region, name, url] of FEEDS) {
  const r = await get(url);
  const p = r.status === 200 ? parseFeed(r.body) : { format: '', items: [] };
  const dates = p.items.map((i) => Date.parse(i.date)).filter(Number.isFinite);
  const newest = dates.length ? Math.max(...dates) : undefined;
  const share = (k) => (p.items.length ? Math.round((100 * p.items.filter((i) => i[k]).length) / p.items.length) : 0);
  const res = {
    region,
    name,
    url,
    status: r.status || r.error,
    ms: r.ms,
    type: r.type,
    charset: r.charset ?? '',
    cors: r.cors ?? '',
    redirected: r.final && r.final !== url ? r.final : '',
    format: p.format,
    lang: p.lang ?? '',
    items: p.items.length,
    newestAgeH: newest ? Math.round(((Date.now() - newest) / 36e5) * 10) / 10 : null,
    last24h: dates.filter((d) => Date.now() - d < 864e5).length,
    imagesPct: share('image'),
    teasersPct: share('teaser'),
    titles: p.items.slice(0, 3).map((i) => i.title),
  };
  results.push(res);
  if (r.status === 200) fs.writeFileSync(`${OUT}/samples/news/${name.replace(/\W+/g, '-')}.txt`, r.body.slice(0, 60000));
  console.log(`${res.status} ${res.format} ${res.items} items ${name}`);
}

const usable = (r) => r.status === 200 && r.items >= 5 && r.newestAgeH !== null && r.newestAgeH < 48;
const md = [
  `# News feeds ${new Date().toISOString()}`,
  '',
  `${results.filter(usable).length} of ${results.length} usable: HTTP 200, at least 5 items, newest under 48 hours.`,
  '',
  '| Region | Feed | OK | HTTP | ms | Charset | Format | Lang | Items | Newest h | 24h | Images % | Teasers % | CORS | First titles |',
  '|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|',
  ...results.map(
    (r) =>
      `| ${r.region} | [${cell(r.name)}](${r.url}) | ${usable(r) ? 'yes' : 'no'} | ${cell(r.status)} | ${r.ms} | ${cell(r.charset)} | ${r.format} | ${cell(r.lang)} | ${r.items} | ${r.newestAgeH ?? ''} | ${r.last24h} | ${r.imagesPct} | ${r.teasersPct} | ${cell(r.cors)} | ${cell(r.titles.join(' / '))} |`,
  ),
  '',
];
fs.writeFileSync(`${OUT}/news-feeds.md`, md.join('\n'));
console.log(md.join('\n'));
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md.join('\n'));
fs.writeFileSync(`${OUT}/news-feeds.json`, JSON.stringify(results, null, 2));
console.log('News feeds written');
