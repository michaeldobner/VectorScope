// Kind of a report in the politics lens: interview, vote, speech or document. Shown as a badge, so a story
// shows at a glance whether someone spoke, voted or published. Most reports are none of these.
import { sourceById } from './sources';
import type { Item } from './types';

export type ItemKind = 'interview' | 'vote' | 'speech' | 'document';

export const KIND_LABEL: Record<ItemKind, { icon: string; en: string; de: string }> = {
  interview: { icon: '🎙', en: 'Interview', de: 'Interview' },
  vote: { icon: '🗳', en: 'Vote', de: 'Abstimmung' },
  speech: { icon: '🗣', en: 'Speech', de: 'Rede' },
  document: { icon: '📄', en: 'Document', de: 'Dokument' },
};

const INTERVIEW = /(?<![\p{L}])(interview\p{L}*|im gespräch mit|im gespräch:|q&a with|интервью|інтерв'?ю)(?![\p{L}])/iu;
// Only in titles of parliament sources: "Rede" in a news text is mostly about a speech, not the speech itself.
const SPEECH = /(?<![\p{L}])(rede|regierungserklärung|plenardebatte|debatte|speech|address to)(?![\p{L}])/iu;
const VOTE = /(?<![\p{L}])(namentliche abstimmung|abstimmung|roll call vote)(?![\p{L}])/iu;

/** The kind a source always delivers wins, then the title decides. */
export function kindOf(item: Pick<Item, 'sourceId' | 'title' | 'channel'>): ItemKind | undefined {
  const src = sourceById(item.sourceId);
  if (src?.kind) return src.kind;
  if (item.channel === 'sensor') return undefined;
  if (INTERVIEW.test(item.title)) return 'interview';
  if (src?.network === 'bundestag' || src?.voice === 'bundestag') {
    if (VOTE.test(item.title)) return 'vote';
    if (SPEECH.test(item.title)) return 'speech';
  }
  return undefined;
}
