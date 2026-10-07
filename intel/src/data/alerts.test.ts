import { describe, expect, it } from 'vitest';
import { isAirTrack } from './alerts';
import type { Item } from './types';

const post = (title: string, sourceId = 'kpszsu', text = ''): Item => ({ id: title, sourceId, channel: 'telegram', title, text, url: 'https://t.me/kpszsu/1', time: 0 });

describe('air alerts', () => {
  it('treats short tracks of the Ukrainian Air Force as alerts', () => {
    expect(isAirTrack(post('Реактивний БпЛА на Бориспіль.'))).toBe(true);
    expect(isAirTrack(post('КАБи на Донеччину.'))).toBe(true);
  });
  it('keeps bomber takeoffs, summaries and other sources as reports', () => {
    expect(isAirTrack(post('Зафіксовано зліт 3 бортів Ту-160 з аеродрому «Бєлая»!'))).toBe(false);
    expect(isAirTrack(post('ЗБИТО/ПОДАВЛЕНО 161 ЦІЛЬ ПРОТИВНИКА:'))).toBe(false);
    expect(isAirTrack(post('Drone on Boryspil.', 'baza'))).toBe(false);
  });
});
