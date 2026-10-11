// Types of the news module: a feed, one report from it, and the edition the collector publishes.

/** Group of an outlet. Decides how much it counts for importance. */
export type Group = 'pub' | 'press' | 'intl' | 'tech' | 'biz' | 'fast';
export type Lang = 'de' | 'en' | 'fr' | 'it';
export type Ressort = 'dach' | 'welt' | 'wirtschaft' | 'tech' | 'wissenschaft' | 'kultur' | 'sport';
/** Language of the reports in the app. 'orig' shows every text as its source wrote it. */
export type MsgLang = 'de' | 'en' | 'orig';

export interface Feed {
  id: string;
  outlet: string;
  /** Country of the outlet, ISO code, EU for Euronews. */
  cc: string;
  group: Group;
  lang: Lang;
  url: string;
  /** rss: RSS or Atom. tagesschau: the JSON API. homepage: only the order of a homepage, no reports. */
  kind?: 'rss' | 'tagesschau' | 'homepage';
  /** Section of every report of this feed, when the feed is one section. */
  ressort?: Ressort;
}

/** One report as read from a feed. */
export interface Report {
  feed: string;
  title: string;
  teaser: string;
  link: string;
  /** Publication time, ms. */
  time: number;
  image?: string;
  category?: string;
  /** Position in its feed, 0 is the first. Homepages and feeds sorted by the editors put the important first. */
  rank: number;
}

/** A report inside a story, as the app shows it. Texts in German, English and the original. */
export interface StorySource {
  outlet: string;
  cc: string;
  group: Group;
  lang: Lang;
  de: string;
  en: string;
  orig: string;
  time: number;
  link: string;
}

/** The text of a story in one language and who wrote it. */
export interface Lead {
  outlet: string;
  lang: Lang;
  head: string;
  sum: string;
  /** True when head and sum are a translation of the outlet's text. */
  translated: boolean;
}

export interface Story {
  /** Stable across rounds: the link of its first report. */
  id: string;
  ressort: Ressort;
  /** Importance from the DACH perspective and from the world perspective. */
  score: number;
  worldScore: number;
  lead: Record<MsgLang, Lead>;
  img?: { url: string; credit: string };
  /** Newest report, ms. */
  time: number;
  /** First report, ms. */
  first: number;
  countries: string[];
  sources: StorySource[];
}

export interface Edition {
  at: number;
  /** Outlets and countries that delivered in this round. */
  outlets: number;
  countries: number;
  stories: Story[];
}
