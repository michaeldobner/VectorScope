// Translation route of the proxy, with a fake Google endpoint.
import { describe, expect, it } from 'vitest';
// @ts-expect-error plain JavaScript module without types
import { chunk, parseGoogle, translateAll } from '../proxy/lib/translate.js';

const fakeGoogle = (mode: 'lines' | 'merge') => async (url: string) => {
  const q = decodeURIComponent(new URL(url).searchParams.get('q')!);
  const lines = q.split('\n').map((l) => `DE(${l})`);
  // Google returns sentences as segments, line breaks stay inside the segments.
  const text = mode === 'lines' ? lines.join('\n') : lines.join(' ');
  return { ok: true, json: async () => [[[text, q, null, null]], null, 'en'] } as unknown as Response;
};

describe('translation', () => {
  it('parses the segments of a Google answer', () => {
    expect(parseGoogle([[['Hallo. ', 'Hello. '], ['Welt.', 'World.']], null, 'en'])).toBe('Hallo. Welt.');
    expect(parseGoogle(null)).toBe('');
  });

  it('packs texts into chunks below the limit', () => {
    const texts = Array.from({ length: 10 }, (_, i) => `${i}`.repeat(400));
    const parts = chunk(texts);
    expect(parts.flat()).toEqual(texts);
    for (const p of parts) expect(p.join('\n').length).toBeLessThanOrEqual(1500);
  });

  it('keeps the order and one translation per text', async () => {
    expect(await translateAll(['One', 'Two\nlines', 'Three'], 'de', fakeGoogle('lines'))).toEqual(['DE(One)', 'DE(Two lines)', 'DE(Three)']);
  });

  it('falls back to one request per text when Google merges lines', async () => {
    expect(await translateAll(['One', 'Two'], 'de', fakeGoogle('merge'))).toEqual(['DE(One)', 'DE(Two)']);
  });
});
