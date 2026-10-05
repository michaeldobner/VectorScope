import { describe, expect, it } from 'vitest';
import { demoItems, demoLive } from './demo';
import { detectActivity, detectEmergencies, placeFor } from './sensor';
import { buildStories, isEcho } from './stories';
import { extractEntities } from './entities';
import type { EnrichedItem, Item } from './types';

const now = Date.parse('2026-10-05T20:00:00Z');
const enrich = (items: Item[]): EnrichedItem[] => items.map((i) => ({ ...i, entities: extractEntities(`${i.title}\n${i.text}`), matches: [] }));

describe('sensor', () => {
  it('names the most specific area that contains a point', () => {
    expect(placeFor(55.5, 18)).toEqual({ name: 'Baltic Sea', over: true });
    expect(placeFor(43.4, 33.5)).toEqual({ name: 'Black Sea', over: true });
  });

  it('detects tanker, AWACS and reconnaissance flying together', () => {
    const [activity, ...rest] = detectActivity(demoLive(), now);
    expect(rest).toEqual([]);
    expect(activity.title).toBe('Air activity over Baltic Sea: 1 AWACS, 1 tanker, 1 reconnaissance');
    expect(activity.text).toContain('NATO03 (E3TF)');
    expect(activity.id).toBe('sensor:activity:Baltic Sea:awacs+isr+tanker:2026-10-05');
    expect(activity.sourceId).toBe('sensor');
  });

  it('ignores single aircraft and transports', () => {
    expect(detectActivity(demoLive().filter((a) => a.callsign !== 'JAKE11'), now)).toEqual([]);
  });

  it('reports emergencies with the airline name', () => {
    const [e] = detectEmergencies(demoLive(), now);
    expect(e.title).toBe('Emergency squawk 7700: British Airways BAW2PD, Boeing 777-200 over Switzerland');
  });

  it('joins the observation with reports about the same activity', () => {
    const stories = buildStories(enrich([...demoItems(now), ...detectActivity(demoLive(), now)]));
    const baltic = stories.find((s) => s.items.some((i) => i.sourceId === 'sensor'))!;
    expect(baltic.items.map((i) => i.sourceId).sort()).toEqual(['demo-confirm', 'demo-osint', 'sensor']);
    expect(baltic.status).toBe('confirmed');
    expect(baltic.tiers.sensor).toBe(1);
  });

  it('a story seen only by the sensor is observed', () => {
    const [only] = buildStories(enrich(detectActivity(demoLive(), now)));
    expect(only.status).toBe('observed');
  });
});

describe('echo detector', () => {
  const r = (id: string, sourceId: string, h: number, title: string, text = ''): Item => ({ id, sourceId, channel: 'telegram', title, text, url: `https://x.org/${id}`, time: now - h * 3600_000 });
  const original = r('a', 'demo-fast-a', 2, 'Large explosion reported at the port of Odesa, several ships on fire', 'Local channels show smoke over the harbour.');
  const copy = r('b', 'demo-fast-b', 1, 'BREAKING: Large explosion reported at the port of Odesa, several ships on fire', 'Local channels show smoke.');
  const own = r('c', 'demo-osint', 1, 'Odesa port explosion: satellite image shows burning grain terminal', 'Our analysis of the damage.');

  it('recognises a copy and an own report', () => {
    const [a, b, c] = enrich([original, copy, own]);
    expect(isEcho(a, b)).toBe(true);
    expect(isEcho(a, c)).toBe(false);
  });

  it('does not count the copy as a source', () => {
    const [story] = buildStories(enrich([original, copy]));
    expect(story.items).toHaveLength(2);
    expect(story.echoes).toEqual(['demo-fast-b']);
    expect(story.status).toBe('signal');
  });
});
