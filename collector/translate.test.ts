import { describe, expect, it } from 'vitest';
import type { Item } from '../intel/src/data/types';
import { textsOf, translateMissing, withTranslations, type TrCache } from './translate';

const item = (title: string, text = '', sourceId = 'demo-ru', time = 0): Item => ({ id: title, sourceId, channel: 'telegram', title, text, url: `https://example.org/${title}`, time });

describe('translation in the collector', () => {
  it('asks only for what is not written in the target language yet', () => {
    expect(textsOf(item('Взрыв в Воронеже, горит НПЗ'), 'de')).toEqual(['Взрыв в Воронеже, горит НПЗ']);
    expect(textsOf(item('Luftwaffe verlegt Eurofighter nach Rumänien', '', 'demo-de'), 'de')).toEqual([]);
    expect(textsOf(item('Luftwaffe verlegt Eurofighter nach Rumänien', '', 'demo-de'), 'en')).toEqual(['Luftwaffe verlegt Eurofighter nach Rumänien']);
  });

  it('translates once, asks a refused text again later and attaches the result', async () => {
    const cache: TrCache = {};
    const calls: string[][] = [];
    const translate = async (texts: string[], to: string) => {
      calls.push(texts);
      return texts.map((t) => (t.includes('НПЗ') ? `[${to}] ${t}` : null));
    };
    const items = [item('Взрыв в Воронеже, горит НПЗ', 'Очевидцы сообщают о взрыве на заводе.')];
    const first = await translateMissing(items, cache, { now: 1, translate, pauseMs: 0 });
    expect(first).toMatchObject({ translated: 2, refused: 2 });
    // Ten minutes later, not before, the refused excerpt is asked again, in both languages.
    await translateMissing(items, cache, { now: 2, translate, pauseMs: 0 });
    expect(calls).toHaveLength(2);
    await translateMissing(items, cache, { now: 1 + 10 * 60_000, translate, pauseMs: 0 });
    expect(calls).toHaveLength(4);
    expect(withTranslations(items[0], cache).tr).toEqual({ en: { title: '[en] Взрыв в Воронеже, горит НПЗ' }, de: { title: '[de] Взрыв в Воронеже, горит НПЗ' } });
  });

  it('stops the round when Google refuses a whole slice, without counting it as tried', async () => {
    const cache: TrCache = {};
    let calls = 0;
    const refuse = async (texts: string[]) => (calls++, texts.map(() => null));
    const items = Array.from({ length: 50 }, (_, i) => item(`Взрыв номер ${i} в Воронеже`));
    const r = await translateMissing(items, cache, { now: 1, translate: refuse, pauseMs: 0 });
    expect(calls).toBe(2);
    expect(r.refused).toBe(40);
    expect(Object.keys(cache)).toHaveLength(0);
  });
});
