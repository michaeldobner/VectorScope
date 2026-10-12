// The feeds of NEWS. Every one checked in the test lab (lab/news.mjs, workflow lab-news.yml, by hand) on 11 October 2026:
// reachable, fresh, machine readable. Not here: swissinfo (feed discontinued), Tages-Anzeiger (not reachable),
// CBC (timeout), CNN (frozen since 2023), Bild (no timestamps, BILDplus), Reuters and AP (no free feeds).
import type { Feed } from './types';

export const FEEDS: Feed[] = [
  // Public broadcasters DACH
  { id: 'tagesschau', outlet: 'Tagesschau', cc: 'DE', group: 'pub', lang: 'de', url: 'https://www.tagesschau.de/api2u/news/', kind: 'tagesschau' },
  { id: 'tagesschau-home', outlet: 'Tagesschau', cc: 'DE', group: 'pub', lang: 'de', url: 'https://www.tagesschau.de/api2u/homepage/', kind: 'homepage' },
  { id: 'zdf', outlet: 'ZDFheute', cc: 'DE', group: 'pub', lang: 'de', url: 'https://www.zdf.de/rss/zdf/nachrichten' },
  { id: 'dlf', outlet: 'Deutschlandfunk', cc: 'DE', group: 'pub', lang: 'de', url: 'https://www.deutschlandfunk.de/nachrichten-100.rss' },
  { id: 'dw-de', outlet: 'DW', cc: 'DE', group: 'pub', lang: 'de', url: 'https://rss.dw.com/xml/rss-de-all' },
  { id: 'srf', outlet: 'SRF', cc: 'CH', group: 'pub', lang: 'de', url: 'https://www.srf.ch/news/bnf/rss/1646' },
  { id: 'srf-schweiz', outlet: 'SRF', cc: 'CH', group: 'pub', lang: 'de', url: 'https://www.srf.ch/news/bnf/rss/1890', ressort: 'dach' },
  { id: 'srf-wirtschaft', outlet: 'SRF', cc: 'CH', group: 'pub', lang: 'de', url: 'https://www.srf.ch/news/bnf/rss/1926', ressort: 'wirtschaft' },
  { id: 'rts', outlet: 'RTS', cc: 'CH', group: 'pub', lang: 'fr', url: 'https://www.rts.ch/info/?format=rss/news' },
  { id: 'rsi', outlet: 'RSI', cc: 'CH', group: 'pub', lang: 'it', url: 'https://www.rsi.ch/info/?f=rss' },
  { id: 'orf', outlet: 'ORF', cc: 'AT', group: 'pub', lang: 'de', url: 'https://rss.orf.at/news.xml' },
  // Quality press and broadcasters
  { id: 'spiegel', outlet: 'Spiegel', cc: 'DE', group: 'press', lang: 'de', url: 'https://www.spiegel.de/schlagzeilen/index.rss' },
  { id: 'ntv', outlet: 'ntv', cc: 'DE', group: 'press', lang: 'de', url: 'https://www.n-tv.de/rss' },
  { id: 'nzz', outlet: 'NZZ', cc: 'CH', group: 'press', lang: 'de', url: 'https://www.nzz.ch/recent.rss', articleImage: true },
  { id: 'nzz-schweiz', outlet: 'NZZ', cc: 'CH', group: 'press', lang: 'de', url: 'https://www.nzz.ch/schweiz.rss', ressort: 'dach', articleImage: true },
  { id: 'standard', outlet: 'Der Standard', cc: 'AT', group: 'press', lang: 'de', url: 'https://www.derstandard.at/rss', articleImage: true },
  { id: 'presse', outlet: 'Die Presse', cc: 'AT', group: 'press', lang: 'de', url: 'https://www.diepresse.com/rss' },
  // International
  { id: 'bbc', outlet: 'BBC', cc: 'GB', group: 'intl', lang: 'en', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { id: 'bbc-africa', outlet: 'BBC', cc: 'GB', group: 'intl', lang: 'en', url: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml', ressort: 'welt' },
  { id: 'guardian', outlet: 'The Guardian', cc: 'GB', group: 'intl', lang: 'en', url: 'https://www.theguardian.com/world/rss' },
  { id: 'npr', outlet: 'NPR', cc: 'US', group: 'intl', lang: 'en', url: 'https://feeds.npr.org/1004/rss.xml' },
  { id: 'aljazeera', outlet: 'Al Jazeera', cc: 'QA', group: 'intl', lang: 'en', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { id: 'dw-en', outlet: 'DW', cc: 'DE', group: 'intl', lang: 'en', url: 'https://rss.dw.com/xml/rss-en-all' },
  { id: 'france24', outlet: 'France 24', cc: 'FR', group: 'intl', lang: 'en', url: 'https://www.france24.com/en/rss' },
  { id: 'euronews', outlet: 'Euronews', cc: 'EU', group: 'intl', lang: 'en', url: 'https://www.euronews.com/rss' },
  { id: 'abc', outlet: 'ABC Australia', cc: 'AU', group: 'intl', lang: 'en', url: 'https://www.abc.net.au/news/feed/51120/rss.xml' },
  { id: 'cna', outlet: 'CNA', cc: 'SG', group: 'intl', lang: 'en', url: 'https://www.channelnewsasia.com/rssfeeds/8395884' },
  { id: 'scmp', outlet: 'SCMP', cc: 'HK', group: 'intl', lang: 'en', url: 'https://www.scmp.com/rss/91/feed' },
  { id: 'toi', outlet: 'Times of India', cc: 'IN', group: 'intl', lang: 'en', url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms' },
  // Business and tech
  // Business section: its links (cnbc.com/2026/10/12/…) name no section, and as world news a single CNBC report,
  // mostly markets, never ranked high enough to be shown.
  { id: 'cnbc', outlet: 'CNBC', cc: 'US', group: 'biz', lang: 'en', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114', ressort: 'wirtschaft' },
  { id: 'heise', outlet: 'heise', cc: 'DE', group: 'tech', lang: 'de', url: 'https://www.heise.de/rss/heise-atom.xml', ressort: 'tech' },
  { id: 'golem', outlet: 'Golem', cc: 'DE', group: 'tech', lang: 'de', url: 'https://rss.golem.de/rss.php?feed=RSS2.0', ressort: 'tech' },
  // Fast: tempo, but little weight for importance
  { id: '20min', outlet: '20 Minuten', cc: 'CH', group: 'fast', lang: 'de', url: 'https://partner-feeds.20min.ch/rss/20minuten', articleImage: true },
  { id: 'blick', outlet: 'Blick', cc: 'CH', group: 'fast', lang: 'de', url: 'https://www.blick.ch/rss.xml', articleImage: true },
  { id: 'watson', outlet: 'watson', cc: 'CH', group: 'fast', lang: 'de', url: 'https://www.watson.ch/api/1.0/rss/index.xml' },
];

export const feedById = (id: string) => FEEDS.find((f) => f.id === id);
export const DACH = ['DE', 'CH', 'AT'];

/** Order of preference for the text of a story, per language. The most factual outlets first. */
export const LEAD_ORDER: Record<'de' | 'en' | 'orig', string[]> = {
  de: ['Tagesschau', 'SRF', 'ZDFheute', 'Deutschlandfunk', 'ORF', 'NZZ', 'DW', 'Der Standard', 'Die Presse', 'Spiegel', 'ntv', 'heise', 'Golem'],
  en: ['BBC', 'The Guardian', 'NPR', 'DW', 'France 24', 'Euronews', 'ABC Australia', 'CNA', 'Al Jazeera', 'SCMP', 'CNBC', 'Times of India'],
  orig: ['Tagesschau', 'SRF', 'BBC', 'ZDFheute', 'Deutschlandfunk', 'ORF', 'NZZ', 'The Guardian', 'DW', 'Der Standard', 'Spiegel', 'NPR', 'Al Jazeera'],
};
