import { describe, expect, it } from 'vitest';
import { parseTelegram } from './telegram';
import { buildStories, rankStories } from './stories';
import { extractEntities, isCrisisRelated } from './entities';
import { demoItems } from './demo';
import type { EnrichedItem, Item } from './types';

// Shape of the web preview t.me/s/{channel}, reduced to what the parser reads.
const TG = `
<div class="tgme_widget_message_wrap js-widget_message_wrap"><div class="tgme_widget_message text_not_supported_wrap js-widget_message" data-post="rageintel/101" data-view="x">
  <div class="tgme_widget_message_bubble">
    <div class="tgme_widget_message_reply"><div class="tgme_widget_message_text js-message_reply_text">quoted older post</div></div>
    <div class="tgme_widget_message_text js-message_text" dir="auto">🚨<b>BREAKING:</b> Passengers arriving in Moscow from Irkutsk are undergoing mass temperature checks due to the risk of a plague outbreak.<br/><br/>Russian authorities are trying to downplay the situation.</div>
    <div class="tgme_widget_message_footer"><a class="tgme_widget_message_date" href="https://t.me/rageintel/101"><time datetime="2026-10-05T18:02:11+00:00" class="time">18:02</time></a></div>
  </div>
</div></div>
<div class="tgme_widget_message_wrap js-widget_message_wrap"><div class="tgme_widget_message js-widget_message" data-post="rageintel/102">
  <div class="tgme_widget_message_photo_wrap"></div>
  <div class="tgme_widget_message_footer"><time datetime="2026-10-05T18:05:00+00:00" class="time">18:05</time></div>
</div></div>
<div class="tgme_widget_message_wrap js-widget_message_wrap"><div class="tgme_widget_message js-widget_message" data-post="rageintel/103">
  <div class="tgme_widget_message_text js-message_text" dir="auto">🇺🇦 Drone attack on Odesa port<div class="inner">with a nested block</div> and more text</div>
  <time datetime="2026-10-05T18:10:00+00:00" class="time">18:10</time>
</div></div>`;

describe('Telegram', () => {
  it('cleans breaking prefixes and does not cut sentences at abbreviations', () => {
    const page = (t: string) => `<div class="tgme_widget_message js-widget_message" data-post="x/1"><div class="tgme_widget_message_text js-message_text">${t}</div><time datetime="2026-10-05T18:00:00+00:00"></time></div>`;
    expect(parseTelegram(page('#BREAKING Initial reports of an oil tanker attacked near Hormuz.'), 'x')[0].title).toBe('Initial reports of an oil tanker attacked near Hormuz.');
    expect(parseTelegram(page('The aircraft carrier USS Harry S. Truman will undergo a long overhaul. More soon.'), 'x')[0].title).toBe('The aircraft carrier USS Harry S. Truman will undergo a long overhaul.');
    expect(parseTelegram(page('Trump:<br/>Iran will not get a nuclear weapon.'), 'x')[0].title).toBe('Trump: Iran will not get a nuclear weapon.');
  });

  it('reads text posts, skips media without text and quoted replies', () => {
    const items = parseTelegram(TG, 'rageintel');
    expect(items.map((i) => i.url)).toEqual(['https://t.me/rageintel/101', 'https://t.me/rageintel/103']);
    expect(items[0].title).toBe('Passengers arriving in Moscow from Irkutsk are undergoing mass temperature checks due to the risk of a plague outbreak.');
    expect(items[0].text).toBe('Russian authorities are trying to downplay the situation.');
    expect(items[0].time).toBe(Date.parse('2026-10-05T18:02:11Z'));
    expect(items[0].channel).toBe('telegram');
    expect(items[1].title).toContain('Drone attack on Odesa port');
    expect(items[1].title).toContain('and more text');
  });
});

const enrich = (items: Item[]): EnrichedItem[] => items.map((i) => ({ ...i, entities: extractEntities(`${i.title}\n${i.text}`), matches: [] }));

describe('stories', () => {
  const now = Date.parse('2026-10-05T20:00:00Z');
  const stories = buildStories(enrich(demoItems(now)));
  const byTitle = (s: string) => stories.find((x) => x.items.some((i) => i.title.includes(s)))!;

  it('groups reports of the same event from different sources', () => {
    expect(byTitle('FORTE11 on a long orbit').items).toHaveLength(3);
    expect(byTitle('NATO confirms AWACS').items).toHaveLength(2);
    expect(byTitle('Airspace near Rzeszów').items).toHaveLength(2);
  });

  it('keeps unrelated reports apart', () => {
    expect(byTitle('explosion reported in the port of Odesa').items).toHaveLength(1);
    expect(byTitle('Eurofighter nach Rumänien').items).toHaveLength(1);
    expect(stories).toHaveLength(8);
  });

  it('derives the status from the tiers of the sources', () => {
    expect(byTitle('Odesa').status).toBe('signal');
    expect(byTitle('Rzeszów').status).toBe('emerging');
    expect(byTitle('FORTE11').status).toBe('reported');
    expect(byTitle('NATO confirms').status).toBe('confirmed');
  });

  it('measures how far the first unverified report was ahead', () => {
    const s = byTitle('FORTE11');
    expect(s.leadFrom).toBe('demo-fast-a');
    expect(s.leadTo).toBe('demo-press');
    expect(Math.round(s.leadMs! / 60_000)).toBe(66);
    expect(s.lead.sourceId).toBe('demo-press');
  });

  it('lists stories with several sources as developing', () => {
    const { developing, latest } = rankStories(stories, now);
    expect(developing.map((s) => s.items.length)).toEqual([4, 3, 2, 2]);
    expect(latest).toHaveLength(4);
  });

  it('does not chain loosely related reports into one story', () => {
    const r = (id: string, sourceId: string, h: number, title: string): Item => ({ id, sourceId, channel: 'rss', title, text: '', url: `https://x.org/${id}`, time: now - h * 3600_000 });
    const list = enrich([
      r('a', 'demo-fast-a', 5, 'Explosion at the port of Odesa after drone strike'),
      r('b', 'demo-fast-b', 4, 'Drone strike causes explosion in Odesa port, fire on ships'),
      r('c', 'demo-press', 3, 'Fire on ships in Rotterdam harbour, no drone involved'),
      r('d', 'demo-confirm', 2, 'Rotterdam harbour fire under control'),
      r('e', 'demo-osint', 1, 'Unrelated analysis of artillery production in Europe'),
    ]);
    const groups = buildStories(list).map((s) => s.items.map((i) => i.id).join(''));
    expect(groups.sort()).toEqual(['ab', 'cd', 'e']);
  });

  it('counts the channels of one network as one source', () => {
    const r = (id: string, sourceId: string, title: string): Item => ({ id, sourceId, channel: 'telegram', title, text: '', url: `https://x.org/${id}`, time: now - 3600_000 });
    const net = buildStories(enrich([r('a', 'rybar', 'Взрыв на нефтебазе в Туапсе после атаки беспилотников'), r('b', 'rybar-europe', 'Атака беспилотников на нефтебазу в Туапсе, взрыв')]));
    expect(net).toHaveLength(1);
    expect(net[0].independent).toBe(1);
    expect(net[0].status).toBe('signal');
    const mixed = buildStories(enrich([r('a', 'rybar', 'Взрыв на нефтебазе в Туапсе после атаки беспилотников'), r('b', 'rybar-europe', 'Атака беспилотников на нефтебазу в Туапсе, взрыв'), r('c', 'baza', 'Беспилотники атаковали нефтебазу в Туапсе, слышен взрыв')]));
    const story = mixed.find((s) => s.items.length > 1)!;
    expect(story.independent).toBe(2);
    expect(story.echoes).toContain('rybar-europe');
  });

  it('does not link two reports of the same source', () => {
    const one = (id: string, t: number): Item => ({ id, sourceId: 'demo-fast-a', channel: 'telegram', title: 'Explosion in Odesa port', text: '', url: `https://x.org/${id}`, time: t });
    expect(buildStories(enrich([one('a', now), one('b', now - 60_000)]))).toHaveLength(2);
  });
});

describe('relevance of general news', () => {
  const rel = (t: string) => isCrisisRelated(t, extractEntities(t));
  it('keeps security and crisis topics in English and German', () => {
    expect(rel('Passengers from Irkutsk checked for plague')).toBe(true);
    expect(rel('Drohnenangriff auf Kiew')).toBe(true);
    expect(rel('Bundeswehr verlegt Soldaten nach Litauen')).toBe(true);
    expect(rel('NATO jets intercept bomber')).toBe(true);
  });
  it('drops culture, sport and podcasts', () => {
    expect(rel('Frankfurter Buchmesse: Shida Bazyar erhält Deutschen Buchpreis 2026')).toBe(false);
    expect(rel('11KM-Podcast: Machtpoker und Regierungspläne in Sachsen-Anhalt')).toBe(false);
    expect(rel('Bayern gewinnt gegen Dortmund')).toBe(false);
  });
});
