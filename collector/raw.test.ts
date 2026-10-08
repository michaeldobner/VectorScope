import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { RawResponse } from '../intel/src/data/feed';
import { roundPath, writeLegacy, writeRawRound } from './archive-raw';
import { checkHealth, itemProblem } from './checks';
import { parseArchive, rawFiles, readRecords } from './parse';
import { countOf, parseUnit, splitUnits, telegramMeta } from './raw';

// Shape of the web preview t.me/s/{channel}, reduced to what the collector reads.
const post = (id: number, text: string, views = '1.2K', extra = '') => `
<div class="tgme_widget_message_wrap js-widget_message_wrap"><div class="tgme_widget_message text_not_supported_wrap js-widget_message" data-post="bazabazon/${id}" data-view="x">
  <div class="tgme_widget_message_bubble">${extra}
    <div class="tgme_widget_message_text js-message_text" dir="auto">${text}</div>
    <div class="tgme_widget_message_footer compact js-message_footer"><div class="tgme_widget_message_info short js-message_info">
      <span class="tgme_widget_message_views">${views}</span><span class="tgme_widget_message_meta"><a class="tgme_widget_message_date" href="https://t.me/bazabazon/${id}"><time datetime="2026-10-08T10:0${id % 10}:00+00:00" class="time">10:0${id % 10}</time></a></span>
    </div></div>
  </div>
</div></div>`;
const page = (...posts: string[]) => `<html><body><section class="tgme_channel_history js-message_history">${posts.join('')}</section></body></html>`;
const FWD = '<div class="tgme_widget_message_forwarded_from accent_color">Forwarded from <a class="tgme_widget_message_forwarded_from_name" href="https://t.me/rybar/555"><span dir="auto">Рыбарь</span></a></div><a class="tgme_widget_message_reply user-color-default" href="https://t.me/bazabazon/40"></a>';

const tg = (body: string, at: number): RawResponse => ({ sourceId: 'baza', kind: 'telegram', url: 'https://t.me/s/bazabazon', at, ms: 300, status: 200, body });

describe('raw units', () => {
  it('splits a Telegram page into posts and ignores changing view counters', () => {
    const a = splitUnits(tg(page(post(41, 'Взрыв на нефтебазе в Туапсе.'), post(42, 'Пожар в порту.')), 0));
    const b = splitUnits(tg(page(post(41, 'Взрыв на нефтебазе в Туапсе.', '9.9K'), post(42, 'Пожар в порту, есть пострадавшие.')), 0));
    expect(a.map((u) => u.key)).toEqual(['tg:bazabazon/41', 'tg:bazabazon/42']);
    expect(b[0].hash).toBe(a[0].hash);
    expect(b[1].hash).not.toBe(a[1].hash);
    expect(a[1].body).not.toContain('</section>');
  });

  it('ignores the signed view token, reactions and the position on the page', () => {
    const p = (view: string, reaction: string) => post(41, 'Взрыв на нефтебазе в Туапсе.', '1K', `<span class="tgme_reaction"><i class="emoji"><b>🙏</b></i>${reaction}</span>`).replace('data-view="x"', `data-view="${view}"`);
    const last = splitUnits(tg(page(p('abc', '154')), 0))[0];
    const middle = splitUnits(tg(page(p('def', '190'), post(42, 'Пожар в порту.')), 0))[0];
    expect(middle.hash).toBe(last.hash);
  });

  it('splits RSS by item with guid or link as key', () => {
    const xml = '<rss><channel><title>x</title><item><title>A</title><link>https://x.org/a</link><guid>id-1</guid><pubDate>Thu, 08 Oct 2026 10:00:00 GMT</pubDate></item><item><title>B</title><link>https://x.org/b</link><pubDate>Thu, 08 Oct 2026 11:00:00 GMT</pubDate></item></channel></rss>';
    const units = splitUnits({ sourceId: 'bbc', kind: 'rss', body: xml });
    expect(units.map((u) => u.key)).toEqual(['rss:bbc:id-1', 'rss:bbc:https://x.org/b']);
    expect(parseUnit({ src: 'bbc', kind: 'rss', body: units[1].body, at: 0 })[0].url).toBe('https://x.org/b');
  });

  it('keeps Bluesky likes out of the fingerprint', () => {
    const entry = (likes: number) => ({ post: { uri: 'at://did:x/app.bsky.feed.post/1', author: { did: 'did:x', handle: 'a.bsky.social', avatar: `https://cdn/${likes}` }, record: { text: 'Drone attack on Odesa port', createdAt: '2026-10-08T10:00:00Z' }, likeCount: likes } });
    const a = splitUnits({ sourceId: 'x', kind: 'bluesky', body: JSON.stringify({ feed: [entry(1)] }) });
    const b = splitUnits({ sourceId: 'x', kind: 'bluesky', body: JSON.stringify({ feed: [entry(50)] }) });
    expect(a[0].key).toBe('bsky:at://did:x/app.bsky.feed.post/1');
    expect(b[0].hash).toBe(a[0].hash);
    expect(parseUnit({ src: 'x', kind: 'bluesky', body: a[0].body, at: 0 })[0].title).toContain('Odesa');
  });

  it('splits GeoJSON of USGS by feature id', () => {
    const f = { id: 'us7000abc', properties: { mag: 5.6, place: '10 km S of Sochi, Russia', time: 1, url: 'https://earthquake.usgs.gov/x' }, geometry: { coordinates: [39.7, 43.5, 10] } };
    const units = splitUnits({ sourceId: 'usgs', kind: 'api', api: 'usgs', body: JSON.stringify({ features: [f] }) });
    expect(units[0].key).toBe('usgs:us7000abc');
    expect(parseUnit({ src: 'usgs', kind: 'api', api: 'usgs', body: units[0].body, at: 0 })[0].area).toBe('Sochi, Russia');
  });

  it('reads forward, reply, views and links of a Telegram post', () => {
    const block = splitUnits(tg(page(post(43, 'Подробности <a href="https://meduza.io/x">тут</a> и @rybar', '12.3K', FWD)), 0))[0].body;
    const meta = telegramMeta(block);
    expect(meta.forwardedFrom).toBe('rybar/555');
    expect(meta.replyTo).toBe('bazabazon/40');
    expect(meta.views).toBe(12300);
    expect(meta.links).toEqual(['https://meduza.io/x']);
    expect(meta.mentions).toContain('rybar');
    expect(countOf('1.5M')).toBe(1_500_000);
  });
});

describe('raw archive', () => {
  const dirs: string[] = [];
  const temp = () => {
    const d = mkdtempSync(join(tmpdir(), 'raw-'));
    dirs.push(d);
    return d;
  };
  afterEach(() => dirs.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true })));

  it('stores new and changed units only, and parses them back with the first time seen', () => {
    const raw = temp();
    const state = join(temp(), 'raw-state.json');
    const t0 = Date.parse('2026-10-08T10:10:00Z');
    const round = (at: number, body: string) => writeRawRound({ rawDir: raw, stateFile: state, at, ms: 1000, responses: [tg(body, at)], sensorItems: [], sources: 1, ok: 1 });

    const r1 = round(t0, page(post(41, 'Взрыв на нефтебазе в Туапсе.')));
    const r2 = round(t0 + 600_000, page(post(41, 'Взрыв на нефтебазе в Туапсе.', '5K')));
    const r3 = round(t0 + 1_200_000, page(post(41, 'Взрыв на нефтебазе в Туапсе, двое погибших.'), post(42, 'Пожар в порту.')));
    expect([r1.round.fresh, r2.round.fresh, r2.round.changed, r3.round.fresh, r3.round.changed]).toEqual([1, 0, 0, 1, 1]);
    expect(r1.file.endsWith(roundPath(t0))).toBe(true);
    expect(roundPath(t0)).toBe('raw/2026/10/08/1010.jsonl.gz');

    const files = [...rawFiles(raw)];
    expect(files).toHaveLength(3);
    const second = [...readRecords(files[1])];
    expect(second.map((r) => r.t)).toEqual(['round', 'fetch']);

    const { reports } = parseArchive(raw);
    const p41 = reports.find((r) => r.key === 'tg:bazabazon/41')!;
    expect(p41.versions).toBe(2);
    expect(p41.firstSeen).toBe(t0);
    expect(p41.title).toContain('двое погибших');
    expect(p41.tier).toBe('early');
  });

  it('keeps failed requests as fetch records', () => {
    const raw = temp();
    const at = Date.parse('2026-10-08T10:20:00Z');
    writeRawRound({ rawDir: raw, stateFile: join(temp(), 's.json'), at, ms: 1, responses: [{ sourceId: 'navalnews', kind: 'rss', url: 'https://x', at, ms: 15000, status: 503, error: 'HTTP 503' }], sensorItems: [], sources: 1, ok: 0 });
    const records = [...readRecords([...rawFiles(raw)][0])];
    expect(records[1]).toMatchObject({ t: 'fetch', src: 'navalnews', status: 503, error: 'HTTP 503', units: 0 });
  });

  it('keeps the earlier archive once and does not count it twice', () => {
    const raw = temp();
    const at = Date.parse('2026-10-08T10:30:00Z');
    const item = { id: 'tg:bazabazon/41', sourceId: 'baza', channel: 'telegram' as const, title: 'old', text: '', url: 'https://t.me/bazabazon/41', time: at - 86400_000, seen: at - 86000_000 };
    const other = { ...item, id: 'tg:bazabazon/7', url: 'https://t.me/bazabazon/7' };
    writeLegacy(raw, [item, other], at);
    writeRawRound({ rawDir: raw, stateFile: join(temp(), 's.json'), at, ms: 1, responses: [tg(page(post(41, 'Взрыв на нефтебазе в Туапсе.')), at)], sensorItems: [], sources: 1, ok: 1 });
    expect(readdirSync(join(raw, 'raw', 'legacy'))).toHaveLength(1);
    const { reports } = parseArchive(raw);
    expect(reports.map((r) => r.key).sort()).toEqual(['tg:bazabazon/41', 'tg:bazabazon/7']);
    expect(reports.find((r) => r.key === 'tg:bazabazon/7')!.kind).toBe('legacy');
  });
});

describe('checks', () => {
  const H = 3600_000;
  const now = Date.parse('2026-10-08T12:00:00Z');
  const run = (at: number, ok: boolean, fresh: number) => ({ at, ms: 1, sources: { clashreport: { ok, items: 20, fresh, ...(ok ? {} : { error: 'fetch failed' }) } } });

  it('warns about a failing source and a busy source gone silent', () => {
    const runs = [...Array.from({ length: 48 }, (_, i) => run(now - (72 - i) * H, true, 2)), ...Array.from({ length: 24 }, (_, i) => run(now - (24 - i) * H + 1, i < 21, 0))];
    const h = checkHealth(runs, [], now);
    expect(h.warnings.some((w) => w.startsWith('clashreport: failed 3 rounds'))).toBe(true);
    expect(h.warnings.some((w) => w.includes('no new report for'))).toBe(true);
    expect(h.maxGapMin).toBe(60);
  });

  it('names reports that break an assumption', () => {
    const base = { id: 'x', sourceId: 'baza', channel: 'telegram' as const, title: 'A', text: '', url: 'https://t.me/x/1', time: now };
    expect(itemProblem(base, now)).toBeNull();
    expect(itemProblem({ ...base, time: now + 5 * H }, now)).toBe('time in the future');
    expect(itemProblem({ ...base, url: 'x' }, now)).toBe('no link');
  });
});

describe('backfill', () => {
  it('turns the raw archive into report items with first sight and round rows', async () => {
    const { reportItem, roundsFromArchive } = await import('./backfill');
    const raw = mkdtempSync(join(tmpdir(), 'raw-'));
    const state = join(mkdtempSync(join(tmpdir(), 'st-')), 's.json');
    try {
      const t0 = Date.parse('2026-10-08T10:10:00Z');
      const page = `<section><div class="tgme_widget_message js-widget_message" data-post="bazabazon/41"><div class="tgme_widget_message_text js-message_text">Взрыв на нефтебазе в Туапсе.</div><time datetime="2026-10-08T10:05:00+00:00"></time></div></section>`;
      const res = (at: number, extra: Partial<RawResponse> = {}): RawResponse => ({ sourceId: 'baza', kind: 'telegram', url: 'https://t.me/s/bazabazon', at, ms: 1, status: 200, body: page, ...extra });
      writeRawRound({ rawDir: raw, stateFile: state, at: t0, ms: 900, responses: [res(t0), { ...res(t0), sourceId: 'navalnews', kind: 'rss', body: undefined, status: 503, error: 'HTTP 503' }], sensorItems: [], sources: 2, ok: 1 });
      writeRawRound({ rawDir: raw, stateFile: state, at: t0 + 600_000, ms: 800, responses: [res(t0 + 600_000)], sensorItems: [], sources: 1, ok: 1 });
      const { reports } = parseArchive(raw);
      const item = reportItem(reports[0]);
      expect(item.seen).toBe(t0);
      expect(item.url).toBe('https://t.me/bazabazon/41');
      expect('firstSeen' in item).toBe(false);
      const rounds = roundsFromArchive(raw);
      expect(rounds).toHaveLength(2);
      expect(rounds[0]).toMatchObject({ ms: 900, ok: 1, total: 2, fresh: 1 });
      expect(rounds[0].sources.navalnews).toMatchObject({ ok: false, error: 'HTTP 503' });
      expect(rounds[0].sources.baza).toMatchObject({ ok: true, items: 1, fresh: 1 });
    } finally {
      rmSync(raw, { recursive: true, force: true });
    }
  });
});
