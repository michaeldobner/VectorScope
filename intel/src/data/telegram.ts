// Posts of a public Telegram channel from its web preview t.me/s/{channel}.
// Regex based like the RSS parser, so it runs in Node.js tests and in the browser alike.
import type { Item } from './types';
import { clip, plainText } from './text';

/** Inner HTML of the element that starts at `from` (the index of its opening tag), nested divs included. */
function innerDiv(html: string, from: number): string {
  const start = html.indexOf('>', from) + 1;
  let depth = 1;
  const re = /<(\/?)div\b[^>]*>/g;
  re.lastIndex = start;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return html.slice(start, m.index);
  }
  return html.slice(start);
}

/** Emojis, flags and "BREAKING:" style prefixes are noise in a headline. */
function cleanHeadline(s: string): string {
  return s
    .replace(/[\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F\u200D]/gu, '')
    .replace(/^\s*#?(?:breaking|urgent|update|just in|flash|eilmeldung)\b[\s:!-]*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitHeadline(text: string): { title: string; rest: string } {
  const lines = text.split('\n').map((l) => cleanHeadline(l)).filter(Boolean);
  // A short label line ("Аэропорт СОЧИ") says little alone: the next line belongs to the headline.
  if (lines.length > 1 && lines[0].length < 40 && !/[.!?:]$/.test(lines[0])) lines.splice(0, 2, `${lines[0]}: ${lines[1]}`);
  // A speaker line ("Trump:", "Israeli Finance Minister Bezalel Smotrich:") introduces the quote on the next line.
  else if (lines.length > 1 && lines[0].length < 60 && lines[0].endsWith(':')) lines.splice(0, 2, `${lines[0]} ${lines[1]}`);
  const first = lines[0] ?? '';
  // A sentence ends at . ! ? but not after a single capital letter (USS Harry S. Truman, U.K.).
  const sentence = first.match(/^(.{25,220}?(?<![\s.][A-Z])[.!?])(\s|$)/)?.[1];
  const title = sentence ?? clip(first, 220);
  const rest = [first.slice(title.length).trim(), ...lines.slice(1)].filter(Boolean).join(' ');
  return { title, rest };
}

export function parseTelegram(html: string, sourceId: string): Item[] {
  const items: Item[] = [];
  const starts = [...html.matchAll(/<div class="tgme_widget_message [^"]*"[^>]*data-post="([^"]+)"/g)];
  for (let i = 0; i < starts.length; i++) {
    const post = starts[i][1];
    const block = html.slice(starts[i].index, starts[i + 1]?.index ?? html.length);
    const at = block.indexOf('class="tgme_widget_message_text js-message_text"');
    if (at < 0) continue;
    const raw = innerDiv(block, block.lastIndexOf('<div', at));
    const text = plainText(raw.replace(/<br\s*\/?>/gi, '\n'), true);
    const datetime = block.match(/<time[^>]*datetime="([^"]+)"/)?.[1];
    const time = datetime ? Date.parse(datetime) : NaN;
    if (!text || !Number.isFinite(time)) continue;
    const { title, rest } = splitHeadline(text);
    if (!title) continue;
    const url = `https://t.me/${post}`;
    items.push({ id: `tg:${post}`, sourceId, channel: 'telegram', title, text: clip(rest, 420), url, time });
  }
  return items;
}
