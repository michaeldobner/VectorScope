// Text helpers for feeds: entities, HTML to plain text, URL normalisation.

const NAMED: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '\u2013', mdash: '\u2014', hellip: '…',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', laquo: '«', raquo: '»', auml: 'ä', ouml: 'ö', uuml: 'ü',
  Auml: 'Ä', Ouml: 'Ö', Uuml: 'Ü', szlig: 'ß', eacute: 'é', egrave: 'è', deg: '°', middot: '·',
};

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (m, e: string) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return NAMED[e] ?? m;
  });
}

/** HTML fragment to plain text. With keepLines, line breaks survive, otherwise everything becomes one line. */
export function plainText(html: string, keepLines = false): string {
  const strip = (s: string) => s.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<\/?[a-zA-Z][^>]*>/g, ' ');
  // Twice: some feeds escape their HTML, which only becomes markup after decoding.
  const text = strip(decodeEntities(strip(html.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1'))));
  const punct = text
    .replace(/[^\S\n]*\u2014[^\S\n]*/g, ', ')
    .replace(/[^\S\n]+\u2013[^\S\n]+/g, ', ')
    .replace(/\u2013/g, '-');
  if (!keepLines) return punct.replace(/\s+/g, ' ').trim();
  return punct
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

export function clip(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return (space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:]+$/, '') + ' …';
}

/** URL key for deduplication: no scheme, no www, no query, no hash, no trailing slash. */
export function urlKey(url: string): string {
  try {
    const u = new URL(url);
    return (u.hostname.replace(/^www\./, '') + u.pathname.replace(/\/+$/, '')).toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}
