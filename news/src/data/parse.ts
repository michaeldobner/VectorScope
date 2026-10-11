// Reading a feed: bytes to text in the right charset, RSS, Atom or the Tagesschau API to reports.
// Learned in the test lab: Golem is ISO-8859-1, ZDF writes umlauts as HTML entities, Golem puts a counting pixel
// where a picture should be, SRF starts every title with a kicker, BBC delivers pictures 240 px wide.
import type { Feed, Report } from './types';

/** Decodes a feed by the charset of the header, else of the XML declaration, else UTF-8. */
export function decode(bytes: Uint8Array, contentType?: string | null): string {
  const head = new TextDecoder('latin1').decode(bytes.slice(0, 200));
  const charset = contentType?.match(/charset=([\w-]+)/i)?.[1] ?? head.match(/encoding="([\w-]+)"/i)?.[1] ?? 'utf-8';
  try {
    return new TextDecoder(charset).decode(bytes);
  } catch {
    return new TextDecoder().decode(bytes);
  }
}

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', auml: 'ä', ouml: 'ö', uuml: 'ü', Auml: 'Ä', Ouml: 'Ö', Uuml: 'Ü',
  szlig: 'ß', eacute: 'é', egrave: 'è', agrave: 'à', ccedil: 'ç', laquo: '«', raquo: '»', bdquo: '„', ldquo: '“', rdquo: '”',
  lsquo: '‘', rsquo: '’', ndash: '-', mdash: '-', hellip: '…',
};
export const decodeEntities = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) =>
    e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1)) : (ENTITIES[e] ?? m),
  );
const cdata = (s?: string) => (s ?? '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
/** Plain text: CDATA, markup and entities out, escaped markup too. */
export const plain = (s?: string) =>
  decodeEntities(decodeEntities(cdata(s)).replace(/<[^>]+>/g, ' '))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tag = (block: string, names: string[]) => {
  for (const n of names) {
    const m = block.match(new RegExp(`<${n}(?:\\s[^>]*)?>([\\s\\S]*?)</${n}>`, 'i'));
    if (m) return m[1];
  }
  return undefined;
};

/** Picture of an item: media, enclosure or the first img in the description. Counting pixels are no pictures. */
export function imageOf(block: string): string | undefined {
  const b = decodeEntities(cdata(block));
  const m =
    b.match(/<media:content[^>]*url="([^"]+)"[^>]*(?:medium="image"|type="image)/i) ??
    b.match(/<media:content[^>]*(?:medium="image"|type="image)[^>]*url="([^"]+)"/i) ??
    b.match(/<media:thumbnail[^>]*url="([^"]+)"/i) ??
    b.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image/i) ??
    b.match(/<enclosure[^>]*type="image[^"]*"[^>]*url="([^"]+)"/i) ??
    b.match(/<media:content[^>]*url="([^"]+\.(?:jpe?g|png|webp)[^"]*)"/i) ??
    b.match(/<img[^>]*src="([^"]+)"/i);
  if (!m || /cpx\.php|\/pixel|1x1/i.test(m[1])) return undefined;
  return bigger(decodeEntities(m[1]));
}

/** Larger variants where the address says the size. */
export const bigger = (url: string) => url.replace(/(ichef\.bbci\.co\.uk\/ace\/standard\/)\d+\//, '$1976/');

/** Title without kickers and labels. SRF: "Kicker – Title", kept as "Kicker: Title" when the title needs it. */
export function cleanTitle(title: string, feed: Feed): string {
  let t = title.replace(/^(LIVE-TICKER|ERKLÄRT|DATENANALYSE|DIE NEUESTEN ENTWICKLUNGEN|MELDUNGEN SCHWEIZ|INTERVIEW|KOMMENTAR|ANALYSE) - /, '');
  if (feed.outlet === 'SRF' && t.includes(' – ')) {
    const [kicker, ...rest] = t.split(' – ');
    const body = rest.join(' – ');
    t = body.includes(':') ? body : `${kicker}: ${body}`;
  }
  return t.replace(/ [–—] /g, ', ').replace(/[–—]/g, '-').trim();
}

const time = (s?: string) => {
  const t = Date.parse(plain(s));
  return Number.isFinite(t) ? t : 0;
};

type TagesschauItem = {
  title?: string; firstSentence?: string; date?: string; shareURL?: string; detailsweb?: string; ressort?: string; type?: string;
  teaserImage?: { imageVariants?: Record<string, string> };
};

/** Reports of a feed. Homepages give their order only: reports with rank and title, used for importance. */
export function parseFeed(body: string, feed: Feed): Report[] {
  if (feed.kind === 'tagesschau' || feed.kind === 'homepage') {
    let list: TagesschauItem[] = [];
    try {
      list = (JSON.parse(body) as { news?: TagesschauItem[] }).news ?? [];
    } catch {
      return [];
    }
    return list
      .filter((n) => n.title && (n.shareURL || n.detailsweb) && n.type !== 'video')
      .map((n, rank) => ({
        feed: feed.id,
        title: cleanTitle(plain(n.title), feed),
        teaser: plain(n.firstSentence),
        link: (n.shareURL ?? n.detailsweb)!,
        time: time(n.date),
        image: n.teaserImage?.imageVariants?.['16x9-960'] ?? n.teaserImage?.imageVariants?.['16x9-640'],
        category: n.ressort,
        rank,
      }));
  }
  const atom = /<feed[\s>]/.test(body) && !/<rss[\s>]/.test(body);
  const blocks = [...body.matchAll(atom ? /<entry[\s>][\s\S]*?<\/entry>/g : /<item[\s>][\s\S]*?<\/item>/g)].map((m) => m[0]);
  return blocks
    .map((b, rank) => ({
      feed: feed.id,
      title: cleanTitle(plain(tag(b, ['title'])), feed),
      teaser: plain(tag(b, ['description', 'summary', 'content'])).replace(/\s*\(\s*[^()]*,\s*[^()]*\)\s*$/, ''),
      link: plain(tag(b, ['link'])) || b.match(/<link[^>]*href="([^"]+)"/i)?.[1] || '',
      time: time(tag(b, ['pubDate', 'updated', 'published', 'dc:date'])),
      image: imageOf(b),
      category: plain(tag(b, ['category'])) || undefined,
      rank,
    }))
    .filter((r) => r.title && r.link);
}

/** Reports that are no news: broadcasts, weather, ads, bulletins, live tickers without a topic. */
const NOISE = [
  /^tagesschau \d/i, /^tagesthemen/i, /wetteraussichten|^wetter\b/i, /^heise-angebot/i, /^anzeige:/i, /^\(g\+\)/, /\[premium\]$/i,
  /^latest news bulletin/i, /^spotlight$/i, /^watch:/i, /^live:/i, /^🔴/, /forum\+?:/i, /^podcast/i, /c’t uplink|c't uplink/i, /^developer-häppchen/i,
  /bilder der woche/i, /fotonews der woche/i,
];
export const isNoise = (title: string) => NOISE.some((re) => re.test(title));
