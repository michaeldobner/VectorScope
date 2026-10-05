// Sources of the intelligence feed. Every source was checked in the test lab before it was added:
// it exists, posts itself and published within the last days. See docs/en/sources.md.
// RSS feeds and Telegram channels are read through the proxy, which must list the same ids (checked by a test).

export type Category = 'breaking' | 'aviation' | 'osint' | 'naval' | 'defence' | 'dach' | 'official' | 'news';

/**
 * How far a report of this source carries.
 * breaking: fast, unverified (Telegram newsrooms). osint: open source researchers.
 * press: specialist media with editorial process. confirm: authorities and leading news media.
 */
export type Tier = 'breaking' | 'osint' | 'press' | 'confirm';

export interface Source {
  id: string;
  name: string;
  category: Category;
  tier: Tier;
  lang: 'en' | 'de';
  /** Bluesky handle, read directly from the public Bluesky API. */
  bluesky?: string;
  /** RSS or Atom feed, read through the proxy route /feed/{id}. */
  rss?: string;
  /** Public Telegram channel, read through the proxy route /tg/{channel}. */
  telegram?: string;
  site: string;
}

export const SOURCES: Source[] = [
  // Breaking: fast, unverified. Checked 2026-10-05: active, English, posts itself.
  { id: 'osintdefender', name: 'OSINTdefender', category: 'breaking', tier: 'breaking', lang: 'en', telegram: 'osintdefender', site: 'https://t.me/s/osintdefender' },
  { id: 'rageintel', name: 'RAGE X', category: 'breaking', tier: 'breaking', lang: 'en', telegram: 'rageintel', site: 'https://t.me/s/rageintel' },
  { id: 'warmonitors', name: 'War Monitor', category: 'breaking', tier: 'breaking', lang: 'en', telegram: 'warmonitors', site: 'https://t.me/s/warmonitors' },
  { id: 'insiderpaper', name: 'Insider Paper', category: 'breaking', tier: 'breaking', lang: 'en', telegram: 'insiderpaper', site: 'https://t.me/s/insiderpaper' },
  { id: 'clashreport', name: 'Clash Report', category: 'breaking', tier: 'breaking', lang: 'en', telegram: 'ClashReport', site: 'https://t.me/s/ClashReport' },
  // Aviation
  { id: 'itamilradar', name: 'ItaMilRadar', category: 'aviation', tier: 'osint', lang: 'en', bluesky: 'itamilradar.com', rss: 'https://www.itamilradar.com/feed/', site: 'https://www.itamilradar.com' },
  { id: 'aviationist', name: 'The Aviationist', category: 'aviation', tier: 'press', lang: 'en', bluesky: 'theaviationist.com', rss: 'https://theaviationist.com/feed/', site: 'https://theaviationist.com' },
  { id: 'twz', name: 'The War Zone', category: 'aviation', tier: 'press', lang: 'en', rss: 'https://www.twz.com/feed', site: 'https://www.twz.com' },
  // OSINT research
  { id: 'bellingcat', name: 'Bellingcat', category: 'osint', tier: 'osint', lang: 'en', bluesky: 'bellingcat.com', rss: 'https://www.bellingcat.com/feed/', site: 'https://www.bellingcat.com' },
  { id: 'isw', name: 'ISW', category: 'osint', tier: 'osint', lang: 'en', bluesky: 'thestudyofwar.bsky.social', site: 'https://understandingwar.org' },
  { id: 'janovsky', name: 'Jakub Janovsky (Oryx)', category: 'osint', tier: 'osint', lang: 'en', bluesky: 'rebel44cz.bsky.social', site: 'https://bsky.app/profile/rebel44cz.bsky.social' },
  // Defence and naval media
  { id: 'defensenews', name: 'Defense News', category: 'defence', tier: 'press', lang: 'en', bluesky: 'defensenews.bsky.social', rss: 'https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml', site: 'https://www.defensenews.com' },
  { id: 'breakingdefense', name: 'Breaking Defense', category: 'defence', tier: 'press', lang: 'en', bluesky: 'breakingdefense.com', rss: 'https://breakingdefense.com/feed/', site: 'https://breakingdefense.com' },
  { id: 'navalnews', name: 'Naval News', category: 'naval', tier: 'press', lang: 'en', rss: 'https://www.navalnews.com/feed/', site: 'https://www.navalnews.com' },
  { id: 'usni', name: 'USNI News', category: 'naval', tier: 'press', lang: 'en', rss: 'https://news.usni.org/feed', site: 'https://news.usni.org' },
  // DACH
  { id: 'hartpunkt', name: 'hartpunkt', category: 'dach', tier: 'press', lang: 'de', bluesky: 'hartpunkt.bsky.social', rss: 'https://www.hartpunkt.de/feed/', site: 'https://www.hartpunkt.de' },
  { id: 'augengeradeaus', name: 'Augen geradeaus!', category: 'dach', tier: 'press', lang: 'de', bluesky: 'wiegold.de', rss: 'https://augengeradeaus.net/feed/', site: 'https://augengeradeaus.net' },
  { id: 'esut', name: 'ESUT', category: 'dach', tier: 'press', lang: 'de', rss: 'https://esut.de/feed/', site: 'https://esut.de' },
  // Confirmation: authorities and leading news media
  { id: 'dod', name: 'US DoD News', category: 'official', tier: 'confirm', lang: 'en', rss: 'https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=945&max=10', site: 'https://www.defense.gov' },
  { id: 'tagesschau', name: 'Tagesschau', category: 'news', tier: 'confirm', lang: 'de', rss: 'https://www.tagesschau.de/index~rss2.xml', site: 'https://www.tagesschau.de' },
  { id: 'dlf', name: 'Deutschlandfunk', category: 'news', tier: 'confirm', lang: 'de', rss: 'https://www.deutschlandfunk.de/nachrichten-100.rss', site: 'https://www.deutschlandfunk.de' },
  { id: 'dw', name: 'DW', category: 'news', tier: 'confirm', lang: 'en', rss: 'https://rss.dw.com/rdf/rss-en-top', site: 'https://www.dw.com' },
  { id: 'bbc', name: 'BBC World', category: 'news', tier: 'confirm', lang: 'en', rss: 'https://feeds.bbci.co.uk/news/world/rss.xml', site: 'https://www.bbc.com/news/world' },
  { id: 'aljazeera', name: 'Al Jazeera', category: 'news', tier: 'confirm', lang: 'en', rss: 'https://www.aljazeera.com/xml/rss/all.xml', site: 'https://www.aljazeera.com' },
];

export const CATEGORY_LABEL: Record<Category, string> = {
  breaking: 'Breaking',
  aviation: 'Aviation',
  osint: 'OSINT',
  naval: 'Naval',
  defence: 'Defence',
  dach: 'DACH',
  official: 'Official',
  news: 'News',
};

export const TIER_LABEL: Record<Tier, string> = {
  breaking: 'Unverified',
  osint: 'OSINT',
  press: 'Specialist',
  confirm: 'Confirming',
};

/** Sources of the demo mode, so ?demo shows every status without pretending to quote a real outlet. */
export const DEMO_SOURCES: Source[] = [
  { id: 'demo-fast-a', name: 'Demo Telegram A', category: 'breaking', tier: 'breaking', lang: 'en', site: 'https://example.org' },
  { id: 'demo-fast-b', name: 'Demo Telegram B', category: 'breaking', tier: 'breaking', lang: 'en', site: 'https://example.org' },
  { id: 'demo-osint', name: 'Demo OSINT', category: 'osint', tier: 'osint', lang: 'en', site: 'https://example.org' },
  { id: 'demo-press', name: 'Demo Aviation Press', category: 'aviation', tier: 'press', lang: 'en', site: 'https://example.org' },
  { id: 'demo-de', name: 'Demo Fachmedium', category: 'dach', tier: 'press', lang: 'de', site: 'https://example.org' },
  { id: 'demo-confirm', name: 'Demo Wire Service', category: 'news', tier: 'confirm', lang: 'en', site: 'https://example.org' },
];

export const sourceById = (id: string) => SOURCES.find((s) => s.id === id) ?? DEMO_SOURCES.find((s) => s.id === id);
