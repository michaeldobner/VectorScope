import { describe, expect, it } from 'vitest';
import type { Item } from '../intel/src/data/types';
import { benchmarkSnapshot, majorTopics } from './benchmark';
import { parseOrderedFeed, parseTagesschau, takeSnapshot, type ReferenceFile } from './reference';

const at = Date.parse('2026-10-09T01:18:00Z');
// Headlines of the night of 9 October 2026, as the lab read them.
const snap = {
  at,
  top: {
    tagesschau: ['USA klagen Maduro wegen Folter an', 'Fort Hood: Hinrichtung soll live übertragen werden', 'Mindestens 30 Tote bei russischen Angriffen auf Busse'],
    ntv: ['Zwei Behördenmitarbeiter sterben: Festnahme nach tödlichen Schüssen bei Waffenkontrolle in Berngau', 'Altkanzler besucht Kremlchef: Schröder feiert Putins Geburtstag in Moskau', 'Hegseth spricht von Abschreckung: Hinrichtung von Amokläufer soll live übertragen werden'],
    spiegel: ['Berngau in der Oberpfalz: Zwei Behördenmitarbeiter erschossen, 60-Jähriger festgenommen', 'Schröder feiert in Moskau Geburtstag von Putin', 'US-Justiz klagt Maduro wegen Folter an'],
  },
};
const item = (id: string, sourceId: string, title: string, minAgo: number, de?: string): Item => ({
  id,
  sourceId,
  channel: 'rss',
  title,
  text: '',
  url: `https://example.org/${id}`,
  time: at - minAgo * 60_000,
  seen: at - minAgo * 60_000,
  ...(de ? { tr: { de: { title: de } } } : {}),
});

describe('benchmark of Now', () => {
  it('finds the topics two newsrooms agree on', () => {
    const topics = majorTopics(snap);
    expect(topics.map((t) => Object.keys(t.titles).length)).toEqual([2, 2, 2, 2]);
  });

  it('counts a major topic as covered when a main story is about it, through the German translation too', () => {
    const items = [
      item('a', 'bbc', 'Fort Hood gunman execution to be broadcast live, Pentagon says', 50, 'Hinrichtung des Fort-Hood-Schützen soll live übertragen werden'),
      item('b', 'dw', 'Execution of Fort Hood shooter will be streamed live', 40, 'Hinrichtung des Fort-Hood-Schützen wird live übertragen'),
      item('c', 'tagesschau', 'Zwei Behördenmitarbeiter in Berngau erschossen, Festnahme', 30),
      item('d', 'spiegel', 'Berngau: Zwei Behördenmitarbeiter bei Waffenkontrolle erschossen', 20),
    ];
    const r = benchmarkSnapshot(items, snap);
    expect(r.major).toBe(4);
    expect(r.topics.find((t) => /Hinrichtung/.test(t.title))?.place).not.toBeNull();
    expect(r.topics.find((t) => /Schröder/.test(t.title))?.place).toBeNull();
    // A report seen after the snapshot does not count.
    expect(benchmarkSnapshot([{ ...items[0], seen: at + 60_000 }], snap).at10).toBe(0);
  });

  it('reads the references in the order of the front page and keeps one snapshot an hour', async () => {
    expect(parseTagesschau({ news: [{ title: 'Erste' }, { title: 'Video', type: 'video' }, { title: 'Zweite' }] })).toEqual(['Erste', 'Zweite']);
    const rss = `<rss><channel><title>n-tv.de</title><item><title>Neuere zuerst?</title><link>https://x.org/1</link><pubDate>Fri, 09 Oct 2026 01:00:00 GMT</pubDate></item><item><title>Aufmacher von gestern</title><link>https://x.org/2</link><pubDate>Fri, 09 Oct 2026 03:00:00 GMT</pubDate></item></channel></rss>`;
    expect(parseOrderedFeed(rss)).toEqual(['Neuere zuerst?', 'Aufmacher von gestern']);
    const file: ReferenceFile = { snapshots: [] };
    const fetchText = async (url: string) => (url.includes('tagesschau') ? JSON.stringify({ news: [{ title: 'A' }] }) : rss);
    expect(await takeSnapshot(file, at, fetchText)).not.toBeNull();
    expect(await takeSnapshot(file, at + 30 * 60_000, fetchText)).toBeNull();
    expect(await takeSnapshot(file, at + 60 * 60_000, fetchText)).not.toBeNull();
    expect(file.snapshots).toHaveLength(2);
  });
});
