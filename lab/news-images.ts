// Test lab: picture sizes of the NEWS feeds. Per feed the first pictures as the parser of the app reads them
// (news/src/data/parse.ts), their real size, the size of candidate addresses for larger variants, and the
// preview picture of the article page (og:image). Prints Markdown to the log and the job summary, stores nothing.
//
//   npx tsx lab/news-images.ts
import { appendFileSync } from 'node:fs';
import { FEEDS } from '../news/src/data/feeds';
import { decode, decodeEntities, parseFeed } from '../news/src/data/parse';

const UA = { 'User-Agent': 'VectorScope-lab/0.1 (github.com/michaeldobner/VectorScope)' };
const PER_FEED = 3;

/** Candidate rewrites of picture addresses to a larger variant. */
const RULES: [string, RegExp, string][] = [
  ['ws960', /\/(\d+)ws\//, '/960ws/'],
  ['ws1280', /\/(\d+)ws\//, '/1280ws/'],
  ['fill1200', /rs:fill:\d+:\d+/, 'rs:fill:1200:0'],
  ['dw605', /_\d+\.(jpe?g|png|webp)$/i, '_605.$1'],
  ['dw804', /_\d+\.(jpe?g|png|webp)$/i, '_804.$1'],
  ['dw906', /_\d+\.(jpe?g|png|webp)$/i, '_906.$1'],
  ['geometry1200', /\/scale\/geometry\/\d+\//, '/scale/geometry/1200/'],
  ['tilde1280', /~\d+x\d+/, '~1280x720'],
  ['wh1200', /width=\d+&height=\d+/, 'width=1200&height=675'],
  ['w1280', /\/w:\d+\//, '/w:1280/'],
  ['cfill1280', /c_fill,g_auto,h_\d+,w_\d+/, 'c_fill,g_auto,h_720,w_1280'],
  ['toi1200', /width-\d+,height-\d+/, 'width-1200,height-675'],
  ['spiegel1200', /_w\d+_/, '_w1200_'],
  ['width1200', /([?&])width=\d+/, '$1width=1200'],
  ['w1200', /([?&])w=\d+/, '$1w=1200'],
];

/** Width and height from the first bytes of a JPEG, PNG, GIF or WebP. */
function size(b: Uint8Array): string {
  const u16 = (i: number) => (b[i] << 8) | b[i + 1];
  const le16 = (i: number) => b[i] | (b[i + 1] << 8);
  if (b[0] === 0x89 && b[1] === 0x50) return `${(b[16] << 24) | (b[17] << 16) | u16(18)}x${(b[20] << 24) | (b[21] << 16) | u16(22)}`;
  if (b[0] === 0x47 && b[1] === 0x49) return `${le16(6)}x${le16(8)}`;
  if (b[0] === 0x52 && b[8] === 0x57) {
    const kind = String.fromCharCode(b[12], b[13], b[14], b[15]);
    if (kind === 'VP8 ') return `${le16(26) & 0x3fff}x${le16(28) & 0x3fff}`;
    if (kind === 'VP8L') return `${1 + (((b[22] & 0x3f) << 8) | b[21])}x${1 + (((b[24] & 0xf) << 10) | (b[23] << 2) | ((b[22] & 0xc0) >> 6))}`;
    if (kind === 'VP8X') return `${1 + (b[24] | (b[25] << 8) | (b[26] << 16))}x${1 + (b[27] | (b[28] << 8) | (b[29] << 16))}`;
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length - 9) {
      if (b[i] !== 0xff) return '?';
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return `${u16(i + 7)}x${u16(i + 5)}`;
      i += 2 + u16(i + 2);
    }
  }
  return '?';
}

async function probe(url: string) {
  try {
    const r = await fetch(url, { headers: UA, redirect: 'follow', signal: AbortSignal.timeout(15000) });
    const b = new Uint8Array(await r.arrayBuffer());
    return { status: r.status, kb: Math.round(b.length / 1024), size: r.ok ? size(b) : '' };
  } catch (e) {
    return { status: String((e as Error).message).slice(0, 30), kb: 0, size: '' };
  }
}

const rows = ['| Feed | Variant | HTTP | KB | Size | Address |', '|---|---|---|---|---|---|'];
const cut = (u: string) => (u.length > 110 ? u.slice(0, 107) + '…' : u);
for (const feed of FEEDS.filter((f) => f.kind !== 'homepage')) {
  let reports;
  try {
    const r = await fetch(feed.url, { headers: UA, signal: AbortSignal.timeout(25000) });
    reports = parseFeed(decode(new Uint8Array(await r.arrayBuffer()), r.headers.get('content-type')), feed);
  } catch {
    rows.push(`| ${feed.id} | feed | failed | | | |`);
    continue;
  }
  const withImage = reports.filter((r) => r.image).slice(0, PER_FEED);
  for (const rep of withImage) {
    const url = rep.image!;
    const p = await probe(url);
    rows.push(`| ${feed.id} | feed | ${p.status} | ${p.kb} | ${p.size} | ${cut(url)} |`);
    for (const [name, re, to] of RULES) {
      if (!re.test(url)) continue;
      const big = url.replace(re, to);
      if (big === url) continue;
      const q = await probe(big);
      rows.push(`| ${feed.id} | ${name} | ${q.status} | ${q.kb} | ${q.size} | ${cut(big)} |`);
    }
  }
  // The preview picture of the article page, for the first report.
  const first = reports[0];
  if (first) {
    try {
      const r = await fetch(first.link, { headers: UA, redirect: 'follow', signal: AbortSignal.timeout(15000) });
      const page = await r.text();
      const m = page.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i) ?? page.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);
      if (m) {
        const og = decodeEntities(m[1]);
        const p = await probe(og);
        rows.push(`| ${feed.id} | og:image | ${p.status} | ${p.kb} | ${p.size} | ${cut(og)} |`);
      } else rows.push(`| ${feed.id} | og:image | none | | | |`);
    } catch {
      rows.push(`| ${feed.id} | og:image | failed | | | |`);
    }
  }
  if (!withImage.length) rows.push(`| ${feed.id} | feed | no pictures | | | |`);
}
const md = `# NEWS picture sizes ${new Date().toISOString()}\n\n${rows.join('\n')}\n`;
console.log(md);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
