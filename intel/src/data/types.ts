import type { Aircraft } from '../../../air/src/data/types';
import type { Entities } from './entities';

/** One post or article, normalised from Bluesky or RSS. */
export interface Item {
  /** Stable id: channel plus URL or post URI. */
  id: string;
  sourceId: string;
  channel: 'bluesky' | 'rss';
  title: string;
  text: string;
  /** Link to the article, or to the post when it links nothing. */
  url: string;
  /** Link to the Bluesky post itself, when the item came from Bluesky. */
  postUrl?: string;
  /** Epoch ms of publication. */
  time: number;
}

export interface Match {
  ac: Aircraft;
  /** callsign: named in the text. type-area: type named and aircraft near a named place. type: type named. */
  kind: 'callsign' | 'type-area' | 'type';
  /** Matched callsign or type label. */
  label: string;
  /** Distance to the nearest named place in metres, if any. */
  distM?: number;
  place?: string;
}

export interface EnrichedItem extends Item {
  entities: Entities;
  matches: Match[];
}
