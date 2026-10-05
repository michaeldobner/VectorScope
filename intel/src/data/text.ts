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

/** HTML fragment to one line of plain text. Dashes used as punctuation become commas. */
export function plainText(html: string): string {
  const strip = (s: string) => s.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<\/?[a-zA-Z][^>]*>/g, ' ');
  // Twice: some feeds escape their HTML, which only becomes markup after decoding.
  const text = strip(decodeEntities(strip(html.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1'))));
  return text
    .replace(/\s*\u2014\s*/g, ', ')
    .replace(/\s+\u2013\s+/g, ', ')
    .replace(/\u2013/g, '-')
    .replace(/\s+/g, ' ')
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
