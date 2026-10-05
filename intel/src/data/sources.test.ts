import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { SOURCES } from './sources';
import { PROXY } from './feed';

const read = (f: string) => readFileSync(new URL(f, import.meta.url), 'utf8');

describe('sources', () => {
  it('every source has at least one channel and a unique id', () => {
    expect(new Set(SOURCES.map((s) => s.id)).size).toBe(SOURCES.length);
    for (const s of SOURCES) expect(Boolean(s.rss || s.bluesky || s.telegram), s.id).toBe(true);
  });

  it('the proxy serves exactly the RSS feeds of the sources', () => {
    const proxy = read('../../../proxy/api/proxy.js');
    const block = proxy.slice(proxy.indexOf('const FEEDS = {'), proxy.indexOf('};', proxy.indexOf('const FEEDS = {')));
    const feeds = Object.fromEntries([...block.matchAll(/^\s*([a-z0-9-]+): '([^']+)',$/gm)].map((m) => [m[1], m[2]]));
    const expected = Object.fromEntries(SOURCES.filter((s) => s.rss).map((s) => [s.id, s.rss]));
    expect(feeds).toEqual(expected);
  });

  it('the proxy serves every Telegram channel of the sources', () => {
    const proxy = read('../../../proxy/api/proxy.js');
    const list = proxy.match(/const TELEGRAM = \[([^\]]*)\]/)![1].match(/'([^']+)'/g)!.map((s) => s.slice(1, -1));
    // While candidates are checked in the lab the proxy may list more channels than INTEL uses.
    for (const s of SOURCES.filter((s) => s.telegram)) expect(list, s.id).toContain(s.telegram);
  });

  it('uses the same proxy as AIR', () => {
    expect(read('../../../air/src/data/feed.ts')).toContain(`BUILTIN_PROXY = '${PROXY}'`);
  });
});
