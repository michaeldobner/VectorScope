import { describe, expect, it } from 'vitest';
import { parseFeed } from './rss';
import { parseAuthorFeed } from './bluesky';
import { mergeItems } from './feed';
import { plainText } from './text';

const RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel><title>Example</title>
<item>
  <title><![CDATA[RQ-4 &#8220;FORTE10&#8221; flies over the Black Sea]]></title>
  <link>https://www.example.com/2026/10/05/rq-4-black-sea/</link>
  <pubDate>Sun, 05 Oct 2026 08:12:00 +0000</pubDate>
  <description><![CDATA[<p>The drone departed Sigonella &amp; flew east.</p><p>The post RQ-4 flies appeared first on Example.</p>]]></description>
</item>
<item>
  <title>No date</title>
  <link>https://www.example.com/no-date</link>
</item>
<item>
  <title>Luftwaffe &#8211; neue Eurofighter</title>
  <link>https://www.example.com/eurofighter?utm_source=rss</link>
  <dc:date>2026-10-04T18:00:00+02:00</dc:date>
  <content:encoded><![CDATA[<div>Text &auml;hnlich</div>]]></content:encoded>
</item>
</channel></rss>`;

const ATOM = `<feed xmlns="http://www.w3.org/2005/Atom">
<entry><title type="html">Atom entry</title><link rel="alternate" href="https://blog.example.org/a"/><link rel="replies" href="https://blog.example.org/a#c"/>
<updated>2026-10-05T07:00:00Z</updated><summary>Short &lt;b&gt;summary&lt;/b&gt;</summary></entry>
</feed>`;

describe('RSS and Atom', () => {
  it('parses RSS items with CDATA, entities and WordPress footers', () => {
    const items = parseFeed(RSS, 'ex');
    expect(items).toHaveLength(2);
    expect(items[0].title).toBe('RQ-4 “FORTE10” flies over the Black Sea');
    expect(items[0].text).toBe('The drone departed Sigonella & flew east.');
    expect(items[0].time).toBe(Date.parse('2026-10-05T08:12:00Z'));
    expect(items[0].channel).toBe('rss');
  });

  it('turns dashes used as punctuation into commas', () => {
    expect(parseFeed(RSS, 'ex')[1].title).toBe('Luftwaffe, neue Eurofighter');
    expect(plainText('A&mdash;B 2020&ndash;2024')).toBe('A, B 2020-2024');
  });

  it('removes "mehr" and "read more" endings', () => {
    const feed = (d: string) => `<rss><channel><item><title>T</title><link>https://x.org/a</link><pubDate>Sun, 05 Oct 2026 08:00:00 +0000</pubDate><description>${d}</description></item></channel></rss>`;
    expect(parseFeed(feed('Früher, als das ... mehr...'), 'x')[0].text).toBe('Früher, als das …');
    expect(parseFeed(feed('Some text [&#8230;]'), 'x')[0].text).toBe('Some text …');
    expect(parseFeed(feed('Some text. Read more »'), 'x')[0].text).toBe('Some text. …');
  });

  it('parses Atom entries and picks the alternate link', () => {
    const [entry] = parseFeed(ATOM, 'ex');
    expect(entry.url).toBe('https://blog.example.org/a');
    expect(entry.text).toBe('Short summary');
  });
});

const BSKY = {
  feed: [
    {
      post: {
        uri: 'at://did:plc:abc/app.bsky.feed.post/3lxyz',
        author: { handle: 'example.com' },
        indexedAt: '2026-10-05T08:20:00Z',
        record: { text: 'New article on the RQ-4 over the Black Sea', createdAt: '2026-10-05T08:15:00Z' },
        embed: { $type: 'app.bsky.embed.external#view', external: { uri: 'https://example.com/2026/10/05/rq-4-black-sea/?utm=bsky', title: 'RQ-4 over the Black Sea', description: 'd' } },
      },
    },
    { post: { uri: 'at://x/app.bsky.feed.post/1', author: { handle: 'other' }, record: { text: 'repost', createdAt: '2026-10-05T08:00:00Z' } }, reason: { $type: 'app.bsky.feed.defs#reasonRepost' } },
    {
      post: {
        uri: 'at://did:plc:abc/app.bsky.feed.post/3abc',
        author: { handle: 'example.com' },
        record: { text: 'Two E-3 airborne over the Baltic. More soon.', createdAt: '2026-10-05T09:00:00Z' },
      },
    },
  ],
};

describe('Bluesky', () => {
  it('keeps own posts, skips reposts and links articles', () => {
    const items = parseAuthorFeed(BSKY, 'ex');
    expect(items).toHaveLength(2);
    expect(items[0].title).toBe('RQ-4 over the Black Sea');
    expect(items[0].url).toContain('example.com/2026/10/05/rq-4-black-sea');
    expect(items[0].postUrl).toBe('https://bsky.app/profile/example.com/post/3lxyz');
    expect(items[1].title).toBe('Two E-3 airborne over the Baltic.');
    expect(items[1].url).toBe(items[1].postUrl);
  });
});

describe('merge', () => {
  it('joins a post and the article it links, keeping the earlier time', () => {
    const now = Date.parse('2026-10-05T10:00:00Z');
    const rss = parseFeed(RSS, 'ex');
    const posts = parseAuthorFeed(BSKY, 'ex');
    const merged = mergeItems([...rss, ...posts], now);
    expect(merged).toHaveLength(3);
    const story = merged.find((i) => i.title.startsWith('RQ-4 “FORTE10”'))!;
    expect(story.channel).toBe('rss');
    expect(story.postUrl).toBe('https://bsky.app/profile/example.com/post/3lxyz');
    expect(merged[0].time).toBeGreaterThanOrEqual(merged[1].time);
  });

  it('drops items older than 14 days and from the future', () => {
    const now = Date.parse('2026-10-25T00:00:00Z');
    expect(mergeItems(parseFeed(RSS, 'ex'), now)).toHaveLength(0);
  });
});
