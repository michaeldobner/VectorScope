import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { SOURCES } from './sources';
import { PROXY } from './feed';
import { API_URL, VIA_PROXY } from './physical';

const read = (f: string) => readFileSync(new URL(f, import.meta.url), 'utf8');

describe('sources', () => {
  it('every source has at least one channel and a unique id', () => {
    expect(new Set(SOURCES.map((s) => s.id)).size).toBe(SOURCES.length);
    for (const s of SOURCES) expect(Boolean(s.rss || s.bluesky || s.telegram || s.api), s.id).toBe(true);
  });

  it('the proxy serves exactly the RSS feeds of the sources', () => {
    const proxy = read('../../../proxy/api/proxy.js');
    const block = proxy.slice(proxy.indexOf('const FEEDS = {'), proxy.indexOf('};', proxy.indexOf('const FEEDS = {')));
    const feeds = Object.fromEntries([...block.matchAll(/^\s*([a-z0-9-]+): '([^']+)',$/gm)].map((m) => [m[1], m[2]]));
    const expected = {
      ...Object.fromEntries(SOURCES.filter((s) => s.rss).map((s) => [s.id, s.rss])),
      ...Object.fromEntries(VIA_PROXY.map((api) => [api, API_URL[api]])),
    };
    expect(feeds).toEqual(expected);
  });

  it('the proxy serves exactly the Telegram channels of the sources', () => {
    const proxy = read('../../../proxy/api/proxy.js');
    const list = proxy.match(/const TELEGRAM = \[([^\]]*)\]/)![1].match(/'([^']+)'/g)!.map((s) => s.slice(1, -1));
    expect(list.sort()).toEqual(SOURCES.filter((s) => s.telegram).map((s) => s.telegram!).sort());
  });

  it('uses the same proxy as AIR', () => {
    const air = read('../../../air/src/data/feed.ts');
    expect(air).toContain(`: '${PROXY}'`);
    // Same rule for the own server, where both use /proxy on their own address.
    const onServer = (text: string) => text.split('\n').find((l) => l.startsWith('const ON_SERVER'));
    expect(onServer(air)).toBeDefined();
    expect(onServer(air)).toBe(onServer(read('./feed.ts')));
  });
});
