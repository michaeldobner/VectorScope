import { describe, expect, it } from 'vitest';
import { buildStories } from '../intel/src/data/stories';
import { extractEntities } from '../intel/src/data/entities';
import type { Item } from '../intel/src/data/types';
import { assignTopics, withTopic, type EmbedState } from './embed';

// Stand-in for the model: one direction per subject, so the test does not need the 120 MB download.
const SUBJECTS = ['hinrichtung|execution|казн', 'schröder|schroeder|шрёдер', 'nobel'];
const fake = async (texts: string[]) =>
  texts.map((t) => {
    const v = new Float32Array(8);
    SUBJECTS.forEach((s, i) => new RegExp(s, 'i').test(t) && (v[i] = 1));
    if (!v.some(Boolean)) v[7] = 1;
    return v;
  });
const at = Date.parse('2026-10-09T15:00:00Z');
const item = (id: string, sourceId: string, title: string, hAgo: number, en?: string): Item => ({
  id,
  sourceId,
  channel: 'rss',
  title,
  text: '',
  url: `https://example.org/${id}`,
  time: at - hAgo * 3600_000,
  ...(en ? { tr: { en: { title: en } } } : {}),
});

describe('topics by meaning', () => {
  it('gives reports about the same thing one topic, across languages and without a shared word', async () => {
    const items = [
      item('a', 'bbc', 'Fort Hood gunman execution to be streamed live', 3),
      item('b', 'tagesschau', 'Hinrichtung des Fort-Hood-Attentäters soll live übertragen werden', 2),
      item('c', 'baza', 'В США покажут казнь в прямом эфире', 1, 'The US will broadcast the execution live'),
      item('d', 'faz', 'Schröder feiert Putins Geburtstag', 1),
    ];
    const state: EmbedState = {};
    const r = await assignTopics(items, state, { embed: fake, now: at });
    expect(r).toEqual({ embedded: 4, joined: 2 });
    const topic = (i: Item) => withTopic(i, state).topic;
    expect(topic(items[1])).toBe(topic(items[0]));
    expect(topic(items[2])).toBe(topic(items[0]));
    expect(topic(items[3])).not.toBe(topic(items[0]));
    // Known reports keep their topic and are not embedded again.
    expect(await assignTopics(items, state, { embed: fake, now: at })).toEqual({ embedded: 0, joined: 0 });
  });

  it('joins only within 36 hours and forgets after 72', async () => {
    const state: EmbedState = {};
    await assignTopics([item('a', 'bbc', 'Nobel prize for Pillay', 50), item('b', 'dw', 'Nobel peace prize goes to Pillay', 2)], state, { embed: fake, now: at });
    expect(state['example.org/a']?.topic).not.toBe(state['example.org/b']?.topic);
    await assignTopics([], state, { embed: fake, now: at + 30 * 3600_000 });
    expect(state['example.org/a']).toBeUndefined();
  });

  it('lets INTEL group a topic into one story although no headline word is shared', async () => {
    const state: EmbedState = {};
    const items = [item('a', 'bbc', 'Fort Hood gunman execution to be streamed live', 3), item('b', 'tagesschau', 'Hinrichtung des Attentäters soll live übertragen werden', 2)];
    await assignTopics(items, state, { embed: fake, now: at });
    const enriched = items.map((i) => ({ ...withTopic(i, state), entities: extractEntities(i.title), matches: [] }));
    expect(buildStories(enriched)).toHaveLength(1);
    expect(buildStories(items.map((i) => ({ ...i, entities: extractEntities(i.title), matches: [] })))).toHaveLength(2);
  });

  it('does not chain: a report joins a topic only if it is close to its first report', async () => {
    const vec: Record<string, number[]> = { 'first report about the topic': [1, 0], 'second report a bit apart': [0.8, 0.6], 'third report further apart again': [0.6, 0.8] };
    const embed = async (texts: string[]) => texts.map((x) => Float32Array.from(vec[x]));
    const items = Object.keys(vec).map((title, k) => item(`c${k}`, 'bbc', title, 3 - k));
    const state: EmbedState = {};
    await assignTopics(items, state, { embed, now: at, threshold: 0.75 });
    const topic = (i: Item) => withTopic(i, state).topic;
    expect(topic(items[1])).toBe(topic(items[0]));
    // Close to the second (0.96), not to the first (0.6): a topic of its own.
    expect(topic(items[2])).not.toBe(topic(items[0]));
  });

  it('gives drone tracks and one-word posts a topic of their own', async () => {
    const same = async (texts: string[]) => texts.map(() => Float32Array.from([1, 0]));
    const items = [item('s1', 'bbc', 'Радомишль', 2), item('s2', 'bbc', 'Жмеринка!', 1), item('s3', 'kpszsu', 'Реактивний БпЛА на Житомирщині в напрямку Житомира', 1)];
    const state: EmbedState = {};
    await assignTopics([...items, item('s4', 'bbc', 'Strike on a depot in Zhytomyr region overnight', 0.5)], state, { embed: same, now: at });
    expect(new Set(items.map((i) => withTopic(i, state).topic)).size).toBe(3);
  });
});
