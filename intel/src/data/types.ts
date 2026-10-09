import type { Aircraft } from '../../../air/src/data/types';
import type { Entities } from './entities';
import type { ItemKind } from './kinds';

/** One post or article, normalised from Bluesky or RSS. */
export interface Item {
  /** Stable id: channel plus URL or post URI. */
  id: string;
  sourceId: string;
  channel: 'bluesky' | 'rss' | 'telegram' | 'sensor' | 'api';
  title: string;
  text: string;
  /** Link to the article, or to the post when it links nothing. */
  url: string;
  /** Link to the Bluesky post itself, when the item came from Bluesky. */
  postUrl?: string;
  /** Epoch ms of publication. */
  time: number;
  /** Epoch ms when the collector first saw it, if it came through the collector. */
  seen?: number;
  /** Coordinates of the event, for physical sensors (earthquakes, disaster alerts). */
  lat?: number;
  lon?: number;
  /** Name of the area at these coordinates, as the sensor names it. */
  area?: string;
  /** Topic by meaning, from the multilingual model of the collector (collector/embed.ts): same id, same story. */
  topic?: string;
  /** Translations by the collector (collector/translate.ts): headline and clipped excerpt in English and German. */
  tr?: Partial<Record<'en' | 'de', { title?: string; text?: string }>>;
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

export type Lens = 'security' | 'politics';

export interface EnrichedItem extends Item {
  entities: Entities;
  matches: Match[];
  /** Lenses the report belongs to: security and crisis, politics, or both (a sanctions package). */
  lens?: Partial<Record<Lens, true>>;
  /** Interview, vote, speech or document (kinds.ts). */
  kind?: ItemKind;
}
