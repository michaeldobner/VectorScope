// Verified sources of the intelligence feed. Checked in the test lab on 2026-10-05:
// every source exists, posts itself and published within the last days. See docs/en/sources.md.
// RSS feeds are read through the proxy (route /feed/{id}), which must list the same id and URL.

export type Category = 'aviation' | 'osint' | 'naval' | 'defence' | 'dach' | 'official';

export interface Source {
  id: string;
  name: string;
  category: Category;
  lang: 'en' | 'de';
  /** Bluesky handle, read directly from the public Bluesky API. */
  bluesky?: string;
  /** RSS or Atom feed, read through the proxy. */
  rss?: string;
  site: string;
}

export const SOURCES: Source[] = [
  { id: 'itamilradar', name: 'ItaMilRadar', category: 'aviation', lang: 'en', bluesky: 'itamilradar.com', rss: 'https://www.itamilradar.com/feed/', site: 'https://www.itamilradar.com' },
  { id: 'aviationist', name: 'The Aviationist', category: 'aviation', lang: 'en', bluesky: 'theaviationist.com', rss: 'https://theaviationist.com/feed/', site: 'https://theaviationist.com' },
  { id: 'twz', name: 'The War Zone', category: 'aviation', lang: 'en', rss: 'https://www.twz.com/feed', site: 'https://www.twz.com' },
  { id: 'bellingcat', name: 'Bellingcat', category: 'osint', lang: 'en', bluesky: 'bellingcat.com', rss: 'https://www.bellingcat.com/feed/', site: 'https://www.bellingcat.com' },
  { id: 'isw', name: 'ISW', category: 'osint', lang: 'en', bluesky: 'thestudyofwar.bsky.social', site: 'https://understandingwar.org' },
  { id: 'janovsky', name: 'Jakub Janovsky (Oryx)', category: 'osint', lang: 'en', bluesky: 'rebel44cz.bsky.social', site: 'https://bsky.app/profile/rebel44cz.bsky.social' },
  { id: 'defensenews', name: 'Defense News', category: 'defence', lang: 'en', bluesky: 'defensenews.bsky.social', rss: 'https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml', site: 'https://www.defensenews.com' },
  { id: 'breakingdefense', name: 'Breaking Defense', category: 'defence', lang: 'en', bluesky: 'breakingdefense.com', rss: 'https://breakingdefense.com/feed/', site: 'https://breakingdefense.com' },
  { id: 'navalnews', name: 'Naval News', category: 'naval', lang: 'en', rss: 'https://www.navalnews.com/feed/', site: 'https://www.navalnews.com' },
  { id: 'usni', name: 'USNI News', category: 'naval', lang: 'en', rss: 'https://news.usni.org/feed', site: 'https://news.usni.org' },
  { id: 'hartpunkt', name: 'hartpunkt', category: 'dach', lang: 'de', bluesky: 'hartpunkt.bsky.social', rss: 'https://www.hartpunkt.de/feed/', site: 'https://www.hartpunkt.de' },
  { id: 'augengeradeaus', name: 'Augen geradeaus!', category: 'dach', lang: 'de', bluesky: 'wiegold.de', rss: 'https://augengeradeaus.net/feed/', site: 'https://augengeradeaus.net' },
  { id: 'esut', name: 'ESUT', category: 'dach', lang: 'de', rss: 'https://esut.de/feed/', site: 'https://esut.de' },
  { id: 'dod', name: 'US DoD News', category: 'official', lang: 'en', rss: 'https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=945&max=10', site: 'https://www.defense.gov' },
];

export const CATEGORY_LABEL: Record<Category, string> = {
  aviation: 'Aviation',
  osint: 'OSINT',
  naval: 'Naval',
  defence: 'Defence',
  dach: 'DACH',
  official: 'Official',
};

export const sourceById = (id: string) => SOURCES.find((s) => s.id === id);
