// Posts of one Bluesky account from the public API (public.api.bsky.app allows browser access).
import type { Item } from './types';
import { clip, plainText } from './text';

export const BSKY_API = 'https://public.api.bsky.app/xrpc';

export const authorFeedUrl = (handle: string, limit = 25) =>
  `${BSKY_API}/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(handle)}&limit=${limit}&filter=posts_no_replies`;

/** Own posts only, reposts are skipped. A post that links an article points to the article. */
export function parseAuthorFeed(json: any, sourceId: string): Item[] {
  const out: Item[] = [];
  for (const entry of Array.isArray(json?.feed) ? json.feed : []) {
    if (entry.reason) continue;
    const post = entry.post;
    const record = post?.record;
    if (!post?.uri || typeof record?.text !== 'string') continue;
    const rkey = String(post.uri).split('/').pop();
    const postUrl = `https://bsky.app/profile/${post.author?.handle ?? post.author?.did}/post/${rkey}`;
    const time = Date.parse(record.createdAt ?? post.indexedAt);
    if (!Number.isFinite(time)) continue;
    const external = post.embed?.external ?? post.embed?.media?.external;
    const text = plainText(record.text);
    const title = external?.title ? plainText(external.title) : firstSentence(text);
    const body = external?.title ? text || plainText(external.description ?? '') : text.slice(title.length).trim();
    out.push({
      id: `bsky:${post.uri}`,
      sourceId,
      channel: 'bluesky',
      title: clip(title, 220),
      text: clip(body, 420),
      url: external?.uri ?? postUrl,
      postUrl,
      time,
    });
  }
  return out;
}

function firstSentence(text: string): string {
  const m = text.match(/^(.{20,200}?[.!?])(\s|$)/);
  return m ? m[1] : clip(text, 200);
}
