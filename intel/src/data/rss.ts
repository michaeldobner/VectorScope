// RSS 2.0 and Atom parser. Works without DOMParser, so it runs in Node.js tests and in the browser alike.
import type { Item } from './types';
import { clip, decodeEntities, plainText } from './text';

const tag = (block: string, name: string) => {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? m[1] : null;
};
const cdata = (s: string | null) => (s == null ? null : s.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1').trim());

export function parseFeed(xml: string, sourceId: string): Item[] {
  const items: Item[] = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) ?? [];
  for (const block of blocks) {
    const title = plainText(cdata(tag(block, 'title')) ?? '');
    let link = cdata(tag(block, 'link'));
    if (!link) {
      // Atom: <link rel="alternate" href="…"/>, the first link without rel or with rel="alternate".
      const links = [...block.matchAll(/<link\b([^>]*)\/?>/gi)].map((m) => m[1]);
      const alt = links.find((a) => !/rel=/.test(a) || /rel=["']alternate["']/.test(a)) ?? links[0];
      link = alt?.match(/href=["']([^"']+)["']/)?.[1] ?? null;
    }
    if (!title || !link) continue;
    link = decodeEntities(link.trim());
    const dateRaw = cdata(tag(block, 'pubDate') ?? tag(block, 'published') ?? tag(block, 'updated') ?? tag(block, 'dc:date'));
    const time = dateRaw ? Date.parse(dateRaw) : NaN;
    if (!Number.isFinite(time)) continue;
    const body = cdata(tag(block, 'description') ?? tag(block, 'summary') ?? tag(block, 'content:encoded') ?? tag(block, 'content')) ?? '';
    let text = plainText(body);
    // WordPress appends "The post … appeared first on …".
    text = text.replace(/\s*The post .{0,300}? appeared first on .{0,120}?\.?$/i, '').replace(/\s*\[…\]$|\s*\[\.\.\.\]$/, ' …');
    items.push({ id: `rss:${link}`, sourceId, channel: 'rss', title: clip(title, 220), text: clip(text, 420), url: link, time });
  }
  return items;
}
