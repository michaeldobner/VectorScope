import { describe, expect, it } from 'vitest';
import { buildEdition, classify, findLogos, group, shortTeaser, usableReports } from './edition';
import { feedById } from './feeds';
import { bigger, cleanTitle, decode, imageOf, isNoise, parseFeed } from './parse';
import type { Report } from './types';

const NOW = Date.parse('2026-10-11T00:00:00Z');
const rep = (feed: string, title: string, link: string, extra: Partial<Report> = {}): Report => ({
  feed, title, teaser: '', link, time: NOW - 3600_000, rank: 5, ...extra,
});

describe('parse', () => {
  it('decodes ISO-8859-1 by the XML declaration', () => {
    const bytes = new Uint8Array([...new TextEncoder().encode('<?xml version="1.0" encoding="ISO-8859-1"?><t>'), 0xfc, ...new TextEncoder().encode('</t>')]);
    expect(decode(bytes)).toContain('<t>ü</t>');
  });

  it('reads RSS with entities, CDATA and a picture, skips counting pixels', () => {
    const rss = `<rss><channel><item><title><![CDATA[Trump &uuml;ber Selenskyj]]></title><link>https://www.zdf.de/a</link>
      <pubDate>Sat, 10 Oct 2026 20:03:00 +0200</pubDate><description>&lt;img src="https://cpx.golem.de/cpx.php?x=1"&gt; Ein Anriss.</description>
      <media:thumbnail url="https://ichef.bbci.co.uk/ace/standard/240/x.jpg"/></item></channel></rss>`;
    const [r] = parseFeed(rss, feedById('zdf')!);
    expect(r.title).toBe('Trump über Selenskyj');
    expect(r.time).toBe(Date.parse('2026-10-10T18:03:00Z'));
    expect(r.image).toBe('https://ichef.bbci.co.uk/ace/standard/976/x.jpg');
    expect(imageOf('<description>&lt;img src="https://cpx.golem.de/cpx.php?a=1"&gt;</description>')).toBeUndefined();
  });

  it('reads Atom and the Tagesschau API', () => {
    const atom = '<feed><entry><title>Japan reagiert</title><link href="https://www.heise.de/news/x"/><updated>2026-10-10T15:58:00+02:00</updated></entry></feed>';
    expect(parseFeed(atom, feedById('heise')!)[0].link).toBe('https://www.heise.de/news/x');
    const api = JSON.stringify({ news: [{ title: 'Viele Tote in Riad', shareURL: 'https://www.tagesschau.de/r', date: '2026-10-11T01:12:39+02:00', firstSentence: 'Etwa 40 Millionen.', teaserImage: { imageVariants: { '16x9-960': 'https://img/1.jpg' } } }] });
    const [t] = parseFeed(api, feedById('tagesschau')!);
    expect([t.title, t.teaser, t.image, t.rank]).toEqual(['Viele Tote in Riad', 'Etwa 40 Millionen.', 'https://img/1.jpg', 0]);
  });

  it('asks for larger pictures where the address names the size', () => {
    expect(bigger('https://www.srf.ch/static/cms/images//320ws/cf906b.webp')).toBe('https://www.srf.ch/static/cms/images//960ws/cf906b.webp');
    expect(bigger('https://static.dw.com/image/74689599_302.jpg')).toBe('https://static.dw.com/image/74689599_605.jpg');
    expect(bigger('https://www.zdfheute.de/assets/trump-rally-usa-100~384x216?cb=1')).toBe('https://www.zdfheute.de/assets/trump-rally-usa-100~1280x720?cb=1');
    expect(bigger('https://www.n-tv.de/img/31404053/1791661021/Img_4_3/250/510405839.jpg')).toBe('https://www.n-tv.de/img/31404053/1791661021/Img_16_9/1200/510405839.jpg');
    expect(bigger('https://img.rts.ch/articles/2026/image/13850ea5-29382137.image?w=320&h=180')).toBe('https://img.rts.ch/articles/2026/image/13850ea5-29382137.image?w=1280&h=720');
    expect(bigger('https://cdn.prod.www.spiegel.de/images/d0ebcca7_w520_r2.08_fpx41.35_fpy49.99.jpg')).toBe('https://cdn.prod.www.spiegel.de/images/d0ebcca7_w1200_r1.778_fpx41.35_fpy49.99.jpg');
    expect(bigger('https://www.heise.de/scale/geometry/450/q80//imgs/x.jpg')).toBe('https://www.heise.de/scale/geometry/1200/q80//imgs/x.jpg');
    expect(bigger('https://i.ds.at/awAi3A/rs:fill:150:0/plain/x.jpg')).toBe('https://i.ds.at/awAi3A/rs:fill:150:0/plain/x.jpg');
  });

  it('leaves the picture to the article page where the feed picture is not usable', () => {
    const rss = '<rss><item><title>T</title><link>https://www.nzz.ch/a</link><media:content url="https://img-msp-prod.nzz.ch/x.jpg?width=200&amp;height=200" medium="image"/></item></rss>';
    expect(parseFeed(rss, feedById('nzz')!)[0].image).toBeUndefined();
  });

  it('cleans SRF kickers and labels', () => {
    expect(cleanTitle('Esther Friedli verzichtet – Der Rückzug eröffnet neue Möglichkeiten', feedById('srf')!)).toBe('Esther Friedli verzichtet: Der Rückzug eröffnet neue Möglichkeiten');
    expect(cleanTitle('Krieg in der Ukraine – Ukraine: Mindestens 20 Tote', feedById('srf')!)).toBe('Ukraine: Mindestens 20 Tote');
    expect(cleanTitle('Saudi-Arabien: Huthis greifen an – zwölf Tote', feedById('spiegel')!)).toBe('Saudi-Arabien: Huthis greifen an, zwölf Tote');
    expect(cleanTitle('LIVE-TICKER - Krieg in der Ukraine', feedById('nzz')!)).toBe('Krieg in der Ukraine');
    expect(cleanTitle('Palästinensergebiete - Präsident Abbas verschiebt Wahl', feedById('dlf')!)).toBe('Präsident Abbas verschiebt Wahl');
  });

  it('cleans Flemish labels', () => {
    expect(cleanTitle('LIVEBLOG Federale topministers verlaten piste', feedById('vrt')!)).toBe('Federale topministers verlaten piste');
    expect(cleanTitle('LIVESTREAM WK baanwielrennen: ontgoocheling', feedById('vrt')!)).toBe('WK baanwielrennen: ontgoocheling');
    expect(cleanTitle('Live – Premier De Wever haalt schuldenrem van tafel', feedById('demorgen')!)).toBe('Premier De Wever haalt schuldenrem van tafel');
    expect(cleanTitle('EXCLUSIEF. Broer van Dina Tersago', feedById('hln')!)).toBe('Broer van Dina Tersago');
    expect(cleanTitle('Live - Politie zet traangas in • Ook in Parijs traangas', feedById('hln')!)).toBe('Politie zet traangas in');
    expect(cleanTitle('Livestock prices fall', feedById('bbc')!)).toBe('Livestock prices fall');
  });

  it('knows noise', () => {
    expect(['tagesschau 20:00 Uhr', 'Die Wetteraussichten', 'Anzeige: TV günstig', 'Latest news bulletin | October 10th'].every(isNoise)).toBe(true);
    expect(isNoise('Zwölf Tote in Riad')).toBe(false);
  });
});

describe('edition', () => {
  const reports = [
    rep('tagesschau', 'Viele Tote bei Angriff auf Flughafen in Riad', 'https://www.tagesschau.de/ausland/riad', { teaser: 'Der dritte Angriff in dieser Woche.', image: 'https://img/riad.jpg' }),
    rep('srf', 'Flughafen in Riad erneut angegriffen', 'https://www.srf.ch/news/international/riad'),
    rep('bbc', 'Twelve killed in attack on Riyadh airport', 'https://www.bbc.co.uk/news/riad', { teaser: 'The third attack this week.' }),
    rep('aljazeera', 'Damage seen inside Saudi airport', 'https://www.aljazeera.com/riad'),
    rep('nzz-schweiz', 'Esther Friedli will nicht Bundesrätin werden', 'https://www.nzz.ch/schweiz/friedli'),
    rep('heise', 'Japan reagiert auf Welle von Cyberangriffen', 'https://www.heise.de/news/japan'),
  ];
  // Riad in four languages is one story by meaning: vectors 0 for Riad, 1 and 2 for the others.
  const v = (k: number) => Float32Array.from([0, 1, 2].map((i) => (i === k ? 1 : 0)));
  const vectors = [v(0), v(0), v(0), v(0), v(1), v(2)];
  const tr = (text: string, to: 'de' | 'en') => `[${to}] ${text}`;

  it('groups by meaning across languages, by words without vectors', () => {
    expect(group(reports, vectors).map((g) => g.length).sort()).toEqual([1, 1, 4]);
    const byWords = group([rep('zdf', 'Tote bei Angriff auf Flughafen in Riad', 'a'), rep('dlf', 'Angriff auf Flughafen in Riad: Tote', 'b'), rep('bbc', 'Riyadh airport attack', 'c')]);
    expect(byWords.map((g) => g.length).sort()).toEqual([1, 2]);
  });

  it('classifies by feed, address and words', () => {
    expect(classify(reports[5], feedById('heise')!)).toBe('tech');
    expect(classify(rep('spiegel', 'x', 'https://www.spiegel.de/sport/fussball/x'), feedById('spiegel')!)).toBe('sport');
    expect(classify(rep('zdf', 'CDU diskutiert über die AfD', 'https://www.zdf.de/x'), feedById('zdf')!)).toBe('dach');
    expect(classify(rep('bbc', 'Twelve killed', 'https://www.bbc.co.uk/news/x'), feedById('bbc')!)).toBeNull();
    const cnbc = (title: string) => classify(rep('cnbc-world', title, 'https://www.cnbc.com/2026/10/12/x.html'), feedById('cnbc-world')!);
    expect(cnbc('S&P 500 closes near flat, pressured by higher oil prices and memory chip stock losses')).toBe('wirtschaft');
    expect(cnbc('IonQ to acquire cybersecurity firm Elisity in an all-stock deal')).toBe('wirtschaft');
    expect(cnbc('FAA warns U.S. airlines of safety risks over Saudi Arabia after attacks')).toBeNull();
  });

  it('builds stories with leads per language, importance and pictures', () => {
    const ed = buildEdition({ reports, groups: group(reports, vectors), signals: { homepage: new Map([['https://www.tagesschau.de/ausland/riad', 0]]), now: NOW }, tr });
    const riad = ed.stories[0];
    expect(riad.sources.map((s) => s.outlet)).toHaveLength(4);
    expect(riad.lead.de).toMatchObject({ outlet: 'Tagesschau', head: 'Viele Tote bei Angriff auf Flughafen in Riad', translated: false });
    expect(riad.lead.en).toMatchObject({ outlet: 'BBC', head: 'Twelve killed in attack on Riyadh airport', sum: 'The third attack this week.' });
    expect(riad.lead.orig.outlet).toBe('Tagesschau');
    expect(riad.img).toEqual({ url: 'https://img/riad.jpg', credit: 'Tagesschau' });
    expect(riad.sources.find((s) => s.outlet === 'BBC')!.de).toBe('[de] Twelve killed in attack on Riyadh airport');
    expect(riad.countries).toEqual(['CH', 'DE', 'GB', 'QA']);
    expect(ed.stories.find((s) => s.id.includes('friedli'))!.ressort).toBe('dach');
    // Only German sources: the English text is a translation of the German lead.
    expect(ed.stories.find((s) => s.id.includes('japan'))!.lead.en).toMatchObject({ head: '[en] Japan reagiert auf Welle von Cyberangriffen', translated: true });
    expect(riad.score).toBeGreaterThan(ed.stories[1].score);
  });

  it('counts the order of the CNBC World newsroom like that of ntv', () => {
    const s = (rank: number) => {
      const reports = [rep('cnbc-world', 'S&P 500 closes near flat', `https://www.cnbc.com/${rank}`, { rank })];
      return buildEdition({ reports, groups: [[0]], signals: { homepage: new Map(), now: NOW }, tr: () => undefined }).stories[0].score;
    };
    expect(s(3) - s(12)).toBeCloseTo(1.5);
  });

  it('ranks a Flemish story high from Belgium, not from DACH or the world', () => {
    const be = ['vrt', 'demorgen', 'tijd', 'hln'].map((f, i) => rep(f, `De Wever stelt nieuwe Vlaamse regering voor ${i}`, `https://be/${f}`));
    const de = ['tagesschau', 'zdf', 'srf', 'orf'].map((f, i) => rep(f, `Bundestag beschließt Haushalt ${i}`, `https://de/${f}`));
    const all = [...be, ...de];
    const ed = buildEdition({ reports: all, groups: [[0, 1, 2, 3], [4, 5, 6, 7]], signals: { homepage: new Map(), now: NOW }, tr });
    const flemish = ed.stories.find((s) => s.id.startsWith('https://be/'))!;
    const german = ed.stories.find((s) => s.id.startsWith('https://de/'))!;
    expect(flemish.ressort).toBe('be');
    expect(flemish.beScore).toBeGreaterThan(german.beScore);
    expect(german.score).toBeGreaterThan(flemish.score);
    // Belgian outlets count as home outlets, not as international ones.
    expect(flemish.worldScore).toBeLessThan(2);
    expect(classify(rep('vrt-en', 'Strike on De Lijn', 'https://www.vrt.be/vrtnws/en/2026/10/17/strike'), feedById('vrt-en')!)).toBe('be');
  });

  it('counts the headlines of VRT NWS for Belgium only, and sends Flemish sport to Sport', () => {
    const one = (home: Map<string, number>) =>
      buildEdition({ reports: [rep('vrt', 'Federale topministers verlaten piste van schuldenrem', 'https://vrt/1')], groups: [[0]], signals: { homepage: new Map(), beHomepage: home, now: NOW }, tr }).stories[0];
    expect(one(new Map([['https://vrt/1', 0]])).beScore - one(new Map()).beScore).toBeCloseTo(4);
    expect(one(new Map([['https://vrt/1', 0]])).score).toBe(one(new Map()).score);
    expect(classify(rep('hln', 'Ploegkoers op WK baanwielrennen: België wordt maar zevende', 'https://www.hln.be/x'), feedById('hln')!)).toBe('sport');
    expect(classify(rep('hln', 'Kopecky ontgoocheld', 'https://www.hln.be/wielrennen/x'), feedById('hln')!)).toBe('sport');
  });

  it('joins Flemish headlines of one event by a long word they share', () => {
    const rs = [rep('vrt', 'Topministers verlaten piste van schuldenrem, morgen verder over meerjarenbegroting', 'a'), rep('demorgen', 'De Wever haalt schuldenrem van tafel en zoekt akkoord over meerjarenbegroting', 'b')];
    const close = [Float32Array.from([1, 0]), Float32Array.from([0.72, Math.sqrt(1 - 0.72 ** 2)])];
    expect(group(rs, close, 0.8, ['nl', 'nl'])).toHaveLength(1);
    expect(group([rs[0], rep('demorgen', 'Andere zaak in Gent', 'c')], close, 0.8, ['nl', 'nl'])).toHaveLength(2);
  });

  it('keeps the original text while a translation is missing', () => {
    const ed = buildEdition({ reports: [reports[5]], groups: [[0]], signals: { homepage: new Map(), now: NOW }, tr: () => undefined });
    expect(ed.stories[0].lead.en).toMatchObject({ head: reports[5].title, translated: false, lang: 'de' });
    expect(ed.stories[0].sources[0].en).toBe('');
  });

  it('finds logos and drops old reports', () => {
    const same = ['a', 'b', 'c'].map((l) => rep('npr', l, l, { image: 'https://npr/logo.png' }));
    expect(findLogos(same, new Map())).toEqual(new Set(['https://npr/logo.png']));
    expect(usableReports([rep('bbc', 'Old', 'o', { time: NOW - 40 * 3600_000 }), rep('bbc', 'New', 'n')], NOW, isNoise).map((r) => r.title)).toEqual(['New']);
  });

  it('shortens teasers at a sentence and drops repeated titles', () => {
    expect(shortTeaser('Titel', 'Titel')).toBe('');
    const long = 'Erster Satz mit einigem Inhalt, der etwas länger ist als sonst üblich und viel erzählt. ' + 'Zweiter Satz. '.repeat(30);
    expect(shortTeaser(long, 'x').endsWith('.')).toBe(true);
    expect(shortTeaser(long, 'x').length).toBeLessThanOrEqual(260);
  });
});
