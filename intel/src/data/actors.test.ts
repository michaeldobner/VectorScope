import { describe, expect, it } from 'vitest';
import { DECISION, capitalsOf, findActors, isPoliticsRelated } from './actors';
import { extractEntities } from './entities';
import { lensesOf } from './lens';
import type { Item } from './types';

describe('actors', () => {
  it('recognises actors in English, German, Russian and Ukrainian', () => {
    expect(findActors('Trump says the Strait of Hormuz belongs to the US Navy')).toEqual(['trump']);
    expect(findActors('Дональд Трамп планирует позвонить Владимиру Путину')).toEqual(['trump', 'putin']);
    expect(findActors('Bundeskanzler Merz spricht im Bundestag')).toEqual(['merz', 'bundesregierung', 'bundestag']);
    expect(findActors('Зеленський зустрівся з фон дер Ляйен')).toEqual(['vonderleyen', 'zelensky']);
    expect(findActors('Der Kreml weist die Vorwürfe zurück, sagt Peskow')).toEqual(['kremlin']);
  });

  it('does not read actors into other words', () => {
    expect(findActors('Im März wurde gewählt')).toEqual([]);
    expect(findActors('The museum reopened')).toEqual([]);
    expect(findActors('Trumpet concert in Vienna')).toEqual(['trump']);
  });

  it('places actors at their capitals', () => {
    expect(capitalsOf(['trump', 'putin', 'whitehouse'])).toEqual(['washington', 'moscow']);
    expect(capitalsOf(['eucommission', 'nato'])).toEqual(['brussels']);
  });

  it('knows political vocabulary and decisions', () => {
    expect(isPoliticsRelated('Koalition streitet über den Haushalt', [])).toBe(true);
    expect(isPoliticsRelated('Госдума приняла закон', [])).toBe(true);
    expect(isPoliticsRelated('Lawrence wins the cup final', [])).toBe(false);
    expect(DECISION.test('Bundestag debattiert das Wehrdienstgesetz')).toBe(false);
    expect(DECISION.test('Bundestag beschließt Wehrdienstgesetz')).toBe(true);
    expect(DECISION.test('Bundestag hat das Gesetz beschlossen')).toBe(true);
    expect(DECISION.test('Trump signs executive order on tariffs')).toBe(true);
  });
});

describe('lenses', () => {
  const item = (sourceId: string, title: string): Item => ({ id: title, sourceId, channel: 'rss', title, text: '', url: 'https://x.org', time: 0 });
  const lens = (sourceId: string, title: string) => lensesOf(item(sourceId, title), title, extractEntities(title));

  it('puts a report into security, politics or both', () => {
    expect(lens('tagesschau', 'Drohnenangriff auf Raffinerie in Woronesch')).toEqual({ security: true });
    expect(lens('tagesschau', 'Bundestag debattiert über den Haushalt')).toEqual({ politics: true });
    expect(lens('tagesschau', 'EU beschließt Sanktionen wegen Angriffen auf Schiffe')).toEqual({ security: true, politics: true });
    expect(lens('tagesschau', 'Pokal: Bayern gewinnt in Mainz')).toEqual({});
  });

  it('keeps security sources in security and adds politics only with political content', () => {
    expect(lens('osintdefender', 'B-1 bombers leave RAF Fairford')).toEqual({ security: true });
    expect(lens('osintdefender', 'Trump: we will talk to Putin today')).toEqual({ security: true, politics: true });
  });
});

describe('Russian political vocabulary', () => {
  it('needs the start of a word', () => {
    expect(isPoliticsRelated('Администрация района сообщила о пожаре', [])).toBe(false);
    expect(isPoliticsRelated('Незаконную стоянку закрыли', [])).toBe(false);
    expect(isPoliticsRelated('Он указал на ошибку', [])).toBe(false);
    expect(isPoliticsRelated('Министр обороны прибыл в Минск', [])).toBe(true);
    expect(isPoliticsRelated('Президент подписал указ о мобилизации', [])).toBe(true);
  });
});

describe('stories in lenses', () => {
  it('needs half of the reports for politics, one for security', async () => {
    const { storyInLens } = await import('./lens');
    const s = [{ lens: { security: true as const } }, { lens: { security: true as const } }, { lens: { security: true as const, politics: true as const } }];
    expect(storyInLens(s, 'security')).toBe(true);
    expect(storyInLens(s, 'politics')).toBe(false);
    expect(storyInLens([...s, { lens: { politics: true as const } }], 'politics')).toBe(true);
  });
});

describe('weak actors', () => {
  it('NATO alone does not make a military report political', () => {
    expect(isPoliticsRelated('NATO AWACS and tanker active over the Baltic Sea', findActors('NATO AWACS and tanker active over the Baltic Sea'))).toBe(false);
    expect(isPoliticsRelated('NATO summit agrees on new spending target', findActors('NATO summit agrees on new spending target'))).toBe(true);
  });
});

describe('bridges', () => {
  it('links a story to a story of the other lens with the same actor or city on the same day', async () => {
    const { bridgesFor } = await import('./bridges');
    const { buildStories } = await import('./stories');
    const now = Date.parse('2026-10-08T12:00:00Z');
    const mk = (id: string, sourceId: string, title: string, lens: 'security' | 'politics', h: number) => ({
      id, sourceId, channel: 'rss' as const, title, text: '', url: `https://x.org/${id}`, time: now - h * 3600_000, entities: extractEntities(title), matches: [], lens: { [lens]: true as const },
    });
    const stories = buildStories([
      mk('a', 'bbc', 'Drone attack on tanker off Sochi', 'security', 2),
      mk('b', 'aljazeera', 'Tanker hit by drones off Sochi, fire on board', 'security', 1.5),
      mk('c', 'politicoeu', 'Kremlin blames Kyiv for Sochi tanker attack, talks in doubt', 'politics', 1),
      mk('d', 'faz', 'Kreml macht Kiew für Angriff auf Tanker bei Sotschi verantwortlich', 'politics', 0.5),
      mk('e', 'spiegel', 'Bundestag debattiert über Rente', 'politics', 1),
    ]);
    const security = stories.filter((s) => s.items.some((i) => i.lens?.security));
    const bridges = bridgesFor(security, stories, 'security');
    const linked = [...bridges.values()].flat();
    expect(linked).toHaveLength(1);
    expect(['p:Sochi', 'a:kremlin']).toContain(linked[0].key);
    expect(linked[0].story.lead.title).toMatch(/Kremlin|Kreml/);
  });

  it('does not link by an actor or city that many stories name that day', async () => {
    const { bridgesFor } = await import('./bridges');
    const { buildStories } = await import('./stories');
    const now = Date.parse('2026-10-08T12:00:00Z');
    const mk = (id: string, sourceId: string, title: string, lens: 'security' | 'politics', h: number) => ({
      id, sourceId, channel: 'rss' as const, title, text: '', url: `https://x.org/${id}`, time: now - h * 3600_000, entities: extractEntities(title), matches: [], lens: { [lens]: true as const },
    });
    const stories = buildStories([
      mk('a', 'bbc', 'Trump approves firing squad execution for soldier', 'security', 2),
      mk('b', 'aljazeera', 'Trump signs firing squad execution order, first since WWII', 'security', 1.5),
      mk('c', 'politicous', 'Trump says senate candidate Talarico is missing', 'politics', 1),
      mk('d', 'npr', 'Trump attacks Talarico campaign in Texas senate race', 'politics', 0.8),
      mk('e', 'axios', 'Trump tariffs on steel rise again next month', 'politics', 0.6),
      mk('f', 'politicoeu', 'Trump tariffs: EU prepares answer on steel', 'politics', 0.5),
      mk('g', 'whitehouse', 'Trump hosts Japanese prime minister at the White House', 'politics', 0.4),
      mk('h', 'npr', 'Trump meets Japanese prime minister, trade deal in reach', 'politics', 0.3),
    ]);
    const security = stories.filter((s) => s.items.some((i) => i.lens?.security));
    expect([...bridgesFor(security, stories, 'security').values()].flat()).toHaveLength(0);
  });
});
