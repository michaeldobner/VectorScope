import { describe, expect, it } from 'vitest';
import { MEMBERS } from './members';
import { kindOf } from './kinds';
import { lensesOf } from './lens';
import { findMembers, memberParty, PARTY_ORDER, shortName } from './parties';
import { voicesOf } from './voices';

describe('members of the Bundestag', () => {
  it('has all 630 members in six groups', () => {
    expect(PARTY_ORDER.reduce((n, p) => n + MEMBERS[p].length, 0)).toBe(630);
    expect(memberParty('Lars Klingbeil')).toBe('spd');
    expect(memberParty('Alice Weidel')).toBe('afd');
  });

  it('finds members by full name and well known last names', () => {
    expect(findMembers('Lars Klingbeil und Alice Weidel streiten im Bundestag')).toEqual(['Lars Klingbeil', 'Alice Weidel']);
    expect(findMembers('Klingbeils Haushalt: Reichinnek widerspricht')).toEqual(['Lars Klingbeil', 'Heidi Reichinnek']);
    expect(findMembers('Pistorius besucht Litauen')).toEqual(['Boris Pistorius']);
    expect(findMembers('Jan van Aken kritisiert die Regierung')).toEqual(['Jan van Aken']);
  });

  it('does not take plain words or ambiguous last names for members', () => {
    expect(findMembers('Der Merzig-Wadern Kreis und Schmerz')).toEqual([]);
    expect(findMembers('Frau Lang und Herr Hoffmann waren frei')).toEqual([]);
    expect(findMembers('der Klingbeilplan')).toEqual([]);
  });

  it('writes short names for chips', () => {
    expect(shortName('Lars Klingbeil')).toBe('Klingbeil');
    expect(shortName('Jan van Aken')).toBe('van Aken');
  });
});

describe('who says what and kinds', () => {
  const ent = (members: string[]) => ({ callsigns: [], types: [], places: [], actors: [], members });

  it('groups own posts and named members by fraction', () => {
    const voices = voicesOf([
      { sourceId: 'demo-member-a', entities: ent([]) },
      { sourceId: 'demo-politics', entities: ent(['Alice Weidel', 'Lars Klingbeil']) },
    ]);
    expect(voices).toEqual([
      { party: 'afd', own: [], named: ['Alice Weidel'] },
      { party: 'spd', own: ['Demo Member A'], named: ['Lars Klingbeil'] },
    ]);
  });

  it('a named member puts a report into the politics lens', () => {
    const item = { id: 'x', sourceId: 'demo-fast-a', channel: 'telegram' as const, title: 'Klingbeil in Kyiv', text: '', url: 'https://example.org', time: 0 };
    expect(lensesOf(item, item.title, ent(['Lars Klingbeil'])).politics).toBe(true);
  });

  it('knows the kind of a report from the source or the title', () => {
    expect(kindOf({ sourceId: 'demo-votes', title: 'Anything', channel: 'rss' })).toBe('vote');
    expect(kindOf({ sourceId: 'dlfinterview', title: 'Wadephul zur Lage', channel: 'rss' })).toBe('interview');
    expect(kindOf({ sourceId: 'spiegel', title: 'Interview: Was Merz jetzt plant', channel: 'rss' })).toBe('interview');
    expect(kindOf({ sourceId: 'bundestagtv', title: 'Rede von Lars Klingbeil zum Haushalt', channel: 'rss' })).toBe('speech');
    expect(kindOf({ sourceId: 'spiegel', title: 'Merz hält Rede in Paris', channel: 'rss' })).toBeUndefined();
    expect(kindOf({ sourceId: 'fragdenstaat', title: 'Neue Dokumente', channel: 'rss' })).toBe('document');
  });
});
