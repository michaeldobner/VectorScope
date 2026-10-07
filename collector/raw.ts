// Raw archive of the collector: phase 1 (download) keeps every answer of a publisher as it came,
// split into units (one Telegram post, one RSS item, one earthquake), and stores only new or changed units.
// Phase 2 (parsing, collector/parse.ts) turns units into reports again with the same parsers as INTEL,
// so a better parser can run over the whole history. Details: intel/docs/en/raw-data.md
import { createHash } from 'node:crypto';
import type { RawResponse } from '../intel/src/data/feed';
import { parseAuthorFeed } from '../intel/src/data/bluesky';
import { parseEmsc, parseFaa, parseGdacs, parseNws, parseUsgs } from '../intel/src/data/physical';
import { parseFeed } from '../intel/src/data/rss';
import { parseTelegram } from '../intel/src/data/telegram';
import { decodeEntities } from '../intel/src/data/text';
import type { Item } from '../intel/src/data/types';

/** Version of the record format. Raise it when a field changes its meaning, and describe the change in raw-data.md. */
export const RAW_FORMAT = 1;

/** One round of the collector. */
export interface RoundRecord {
  t: 'round';
  format: number;
  round: string;
  at: number;
  ms: number;
  sources: number;
  ok: number;
  units: number;
  fresh: number;
  changed: number;
}

/** One request to a publisher, also when it failed. */
export interface FetchRecord {
  t: 'fetch';
  round: string;
  at: number;
  src: string;
  kind: RawResponse['kind'];
  api?: string;
  url: string;
  status: number | null;
  ms: number;
  bytes: number;
  /** Units in the answer, of them new and changed since the last round. */
  units: number;
  fresh: number;
  changed: number;
  error?: string;
}

/** One post, item or event exactly as the publisher sent it. Written when new (v 1) or changed (v 2, 3, …). */
export interface UnitRecord {
  t: 'unit';
  round: string;
  at: number;
  src: string;
  /** sensor: a report of the own sensor, derived from live flight data. */
  kind: RawResponse['kind'] | 'sensor';
  api?: string;
  key: string;
  v: number;
  hash: string;
  body: string;
}

/** Reports of the earlier archive from before the raw archive started, already parsed. */
export interface LegacyRecord {
  t: 'legacy';
  item: Item;
}

export type RawRecord = RoundRecord | FetchRecord | UnitRecord | LegacyRecord;

export interface Unit {
  key: string;
  body: string;
  hash: string;
}

export const sha1 = (s: string) => createHash('sha1').update(s).digest('hex').slice(0, 16);
const collapse = (s: string) => s.replace(/\s+/g, ' ').trim();

/**
 * What decides whether a unit changed. Counters (views, likes) and signed image links change all the time
 * and are left out, so a post counts as changed only when its content does.
 */
function fingerprint(kind: RawResponse['kind'], body: string): string {
  if (kind === 'telegram')
    return sha1(
      collapse(
        body
          .replace(/<span class="tgme_widget_message_views">[^<]*<\/span>/g, '')
          .replace(/https?:\/\/cdn\d*\.(?:telesco\.pe|cdn-telegram\.org)\/[^"')\s]+/g, '')
          .replace(/https?:\/\/[^"')\s]*telegram-cdn[^"')\s]*/g, ''),
      ),
    );
  if (kind === 'bluesky') {
    try {
      const entry = JSON.parse(body);
      const { likeCount, repostCount, replyCount, quoteCount, bookmarkCount, viewer, indexedAt, author, ...post } = entry.post ?? {};
      return sha1(JSON.stringify({ ...entry, post: { ...post, author: { did: author?.did, handle: author?.handle } } }));
    } catch {
      return sha1(body);
    }
  }
  return sha1(collapse(body.replace(/<Update_Time>[^<]*<\/Update_Time>/g, '')));
}

const xmlUnits = (body: string) => body.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? body.match(/<entry[\s>][\s\S]*?<\/entry>/gi) ?? [];
const xmlKey = (block: string) => {
  const v = block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i)?.[1] ?? block.match(/<id>([\s\S]*?)<\/id>/i)?.[1] ?? block.match(/<link>([\s\S]*?)<\/link>/i)?.[1];
  return v ? decodeEntities(v.replace(/<!\[CDATA\[|\]\]>/g, '').trim()) : null;
};

/** Splits one answer into units with a stable key. Anything that cannot be split is one unit. */
export function splitUnits(r: Pick<RawResponse, 'sourceId' | 'kind' | 'api' | 'body'>): Unit[] {
  const body = r.body ?? '';
  const unit = (key: string, b: string): Unit => ({ key, body: b, hash: fingerprint(r.kind, b) });
  if (r.kind === 'telegram') {
    const starts = [...body.matchAll(/<div class="tgme_widget_message [^"]*"[^>]*data-post="([^"]+)"/g)];
    return starts.map((m, i) => unit(`tg:${m[1]}`, body.slice(m.index, starts[i + 1]?.index ?? body.length).replace(/\s*<\/section>[\s\S]*$/, '')));
  }
  if (r.kind === 'rss' || r.api === 'gdacs') {
    const prefix = r.api ?? `rss:${r.sourceId}`;
    return xmlUnits(body).map((b) => unit(`${prefix}:${xmlKey(b) ?? sha1(b)}`, b));
  }
  if (r.kind === 'bluesky') {
    try {
      const feed = JSON.parse(body).feed ?? [];
      return feed.map((e: any) => {
        const b = JSON.stringify(e);
        // A repost has the uri of the original post: the reason makes it a unit of its own.
        return unit(`bsky:${e.post?.uri ?? sha1(b)}${e.reason ? `:repost:${e.reason?.by?.did ?? ''}` : ''}`, b);
      });
    } catch {
      return [unit(`bsky:${r.sourceId}:${sha1(body)}`, body)];
    }
  }
  if (r.api === 'usgs' || r.api === 'emsc' || r.api === 'nws') {
    try {
      const features = JSON.parse(body).features ?? [];
      return features.map((f: any) => {
        const b = JSON.stringify(f);
        return unit(`${r.api}:${f.id ?? f.properties?.id ?? f.properties?.unid ?? sha1(b)}`, b);
      });
    } catch {
      return [unit(`${r.api}:${sha1(body)}`, body)];
    }
  }
  // FAA: one status document for the whole country.
  return [unit(`${r.api ?? r.kind}:status`, body)];
}

/** Phase 2: the report(s) in a unit, parsed with the same code as INTEL. `at` stands in for "now" where a source has no time. */
export function parseUnit(u: Pick<UnitRecord, 'src' | 'kind' | 'api' | 'body' | 'at'>): Item[] {
  try {
    if (u.kind === 'sensor') return [JSON.parse(u.body) as Item];
    if (u.kind === 'telegram') return parseTelegram(u.body, u.src);
    if (u.kind === 'rss') return parseFeed(`<rss><channel>${u.body}</channel></rss>`, u.src);
    if (u.kind === 'bluesky') return parseAuthorFeed({ feed: [JSON.parse(u.body)] }, u.src);
    switch (u.api) {
      case 'usgs':
        return parseUsgs({ features: [JSON.parse(u.body)] }, u.src);
      case 'emsc':
        return parseEmsc({ features: [JSON.parse(u.body)] }, u.src);
      case 'nws':
        return parseNws({ features: [JSON.parse(u.body)] }, u.src);
      case 'gdacs':
        return parseGdacs(`<rss><channel>${u.body}</channel></rss>`, u.src);
      case 'faa':
        return parseFaa(u.body, u.src, u.at);
    }
  } catch {
    // A unit that does not parse stays in the raw archive and is counted by the checks.
  }
  return [];
}

/** What the Telegram web preview tells beyond the text: the material for the forward graph. */
export interface TelegramMeta {
  /** Channel (and post) a forwarded post comes from, e.g. "rybar" or "rybar/12345". Name only if the origin has no link. */
  forwardedFrom?: string;
  /** Post this one answers, e.g. "bazabazon/9876". */
  replyTo?: string;
  views?: number;
  edited?: boolean;
  /** Links in the text, without links to Telegram itself. */
  links: string[];
  /** Mentioned channels (t.me links and @names). */
  mentions: string[];
  media: ('photo' | 'video' | 'document' | 'poll')[];
}

const tmeTarget = (href: string) => href.match(/^https?:\/\/t\.me\/(?:s\/)?([A-Za-z0-9_]+(?:\/\d+)?)/)?.[1];

export function telegramMeta(block: string): TelegramMeta {
  const fwd = block.match(/class="tgme_widget_message_forwarded_from_name"(?:\s+href="([^"]+)")?[^>]*>([\s\S]*?)<\/(?:a|span)>/);
  const reply = block.match(/class="tgme_widget_message_reply"\s+href="([^"]+)"/);
  const viewsRaw = block.match(/<span class="tgme_widget_message_views">([^<]+)<\/span>/)?.[1];
  const metaAt = block.indexOf('tgme_widget_message_meta');
  const textAt = block.indexOf('js-message_text');
  const footerAt = textAt >= 0 ? block.indexOf('tgme_widget_message_footer', textAt) : -1;
  const text = textAt >= 0 ? block.slice(textAt, footerAt < 0 ? undefined : footerAt) : '';
  const hrefs = [...text.matchAll(/href="([^"]+)"/g)].map((m) => decodeEntities(m[1]));
  const mentions = new Set<string>();
  for (const h of hrefs) {
    const t = tmeTarget(h);
    if (t) mentions.add(t.split('/')[0]);
  }
  for (const m of text.replace(/<[^>]+>/g, ' ').matchAll(/(?:^|\s)@([A-Za-z0-9_]{4,})/g)) mentions.add(m[1]);
  const media: TelegramMeta['media'] = [];
  if (/tgme_widget_message_photo/.test(block)) media.push('photo');
  if (/tgme_widget_message_video|tgme_widget_message_roundvideo/.test(block)) media.push('video');
  if (/tgme_widget_message_document/.test(block)) media.push('document');
  if (/tgme_widget_message_poll/.test(block)) media.push('poll');
  return {
    ...(fwd ? { forwardedFrom: (fwd[1] && tmeTarget(fwd[1])) || collapse(decodeEntities(fwd[2].replace(/<[^>]+>/g, ''))) } : {}),
    ...(reply && tmeTarget(reply[1]) ? { replyTo: tmeTarget(reply[1]) } : {}),
    ...(viewsRaw ? { views: countOf(viewsRaw) } : {}),
    ...(metaAt >= 0 && /\bedited\b/i.test(block.slice(metaAt, metaAt + 800)) ? { edited: true } : {}),
    links: [...new Set(hrefs.filter((h) => /^https?:/.test(h) && !tmeTarget(h)))],
    mentions: [...mentions],
    media,
  };
}

/** "12.3K" → 12300, "1.2M" → 1200000. */
export function countOf(s: string): number {
  const m = s.trim().match(/^([\d.,]+)\s*([KM]?)$/i);
  if (!m) return NaN;
  const n = Number(m[1].replace(',', '.'));
  return Math.round(n * (m[2].toUpperCase() === 'M' ? 1e6 : m[2].toUpperCase() === 'K' ? 1e3 : 1));
}
