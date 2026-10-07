// Sources of the intelligence feed. Every source was checked in the test lab before it was added:
// it exists, posts itself and published recently. See docs/en/sources.md.
// RSS feeds and Telegram channels are read through the proxy, which must list the same ids (checked by a test).

/**
 * Class of a source: what kind of origin its reports have. Independent of how true a single report is.
 * physical: measuring systems (seismometers, satellites, ADS-B). primary: the originator itself
 * (authority, military, governor). early: very fast newsrooms and incident channels. osint: open source
 * researchers. specialist: specialist media. perspective: fast but clearly partisan. confirming: leading media.
 */
export type Tier = 'physical' | 'primary' | 'early' | 'osint' | 'specialist' | 'perspective' | 'confirming';
export type Region = 'global' | 'europe' | 'dach' | 'russia' | 'ukraine' | 'mideast' | 'usa';
export type Category = 'general' | 'aviation' | 'military' | 'naval' | 'defence' | 'osint' | 'disaster' | 'infrastructure' | 'politics' | 'news';
export type Lang = 'en' | 'de' | 'ru' | 'uk' | 'he';

export interface Source {
  id: string;
  name: string;
  tier: Tier;
  category: Category;
  region: Region;
  lang: Lang;
  /** Source trust 0 to 100: how reliable this source is in general. Not the confidence of a single event. */
  trust: number;
  /** Whose view the source represents, where that matters (official Russian, pro-Russian, Iran aligned …). */
  perspective?: string;
  /** Channels of one network (Rybar and its regional channels) count as one source for confirmation. */
  network?: string;
  /** Bluesky handle, read directly from the public Bluesky API. */
  bluesky?: string;
  /** RSS or Atom feed, read through the proxy route /feed/{id}. */
  rss?: string;
  /** Public Telegram channel, read through the proxy route /tg/{channel}. */
  telegram?: string;
  /** Machine readable sensor or warning system, see data/physical.ts. */
  api?: 'usgs' | 'emsc' | 'gdacs' | 'nws' | 'faa';
  site: string;
}

const tg = (channel: string) => ({ telegram: channel, site: `https://t.me/s/${channel}` });

export const SOURCES: Source[] = [
  // Physical sensors and warning systems
  { id: 'usgs', name: 'USGS Earthquakes', tier: 'physical', category: 'disaster', region: 'global', lang: 'en', trust: 97, api: 'usgs', site: 'https://earthquake.usgs.gov' },
  { id: 'emsc', name: 'EMSC Earthquakes', tier: 'physical', category: 'disaster', region: 'global', lang: 'en', trust: 95, api: 'emsc', site: 'https://www.emsc-csem.org' },
  { id: 'gdacs', name: 'GDACS', tier: 'physical', category: 'disaster', region: 'global', lang: 'en', trust: 92, api: 'gdacs', site: 'https://www.gdacs.org' },
  { id: 'nws', name: 'US National Weather Service', tier: 'primary', category: 'disaster', region: 'usa', lang: 'en', trust: 95, api: 'nws', site: 'https://www.weather.gov' },
  { id: 'faa', name: 'FAA Airport Status', tier: 'primary', category: 'aviation', region: 'usa', lang: 'en', trust: 95, api: 'faa', site: 'https://nasstatus.faa.gov' },
  // Primary: authorities, military, governors
  { id: 'favt', name: 'Rosaviatsiya', tier: 'primary', category: 'aviation', region: 'russia', lang: 'ru', trust: 90, perspective: 'Russian official', ...tg('favt_info') },
  { id: 'mchs', name: 'MChS Russia', tier: 'primary', category: 'disaster', region: 'russia', lang: 'ru', trust: 85, perspective: 'Russian official', ...tg('mchs_official') },
  { id: 'sledcom', name: 'Investigative Committee', tier: 'primary', category: 'general', region: 'russia', lang: 'ru', trust: 75, perspective: 'Russian official', ...tg('sledcom_press') },
  { id: 'gladkov', name: 'Governor Belgorod', tier: 'primary', category: 'general', region: 'russia', lang: 'ru', trust: 80, perspective: 'Russian official', ...tg('vvgladkov') },
  { id: 'bogomaz', name: 'Governor Bryansk', tier: 'primary', category: 'general', region: 'russia', lang: 'ru', trust: 78, perspective: 'Russian official', ...tg('AVBogomaz') },
  { id: 'gusev', name: 'Governor Voronezh', tier: 'primary', category: 'general', region: 'russia', lang: 'ru', trust: 80, perspective: 'Russian official', ...tg('gusev_36') },
  { id: 'razvozhaev', name: 'Governor Sevastopol', tier: 'primary', category: 'general', region: 'russia', lang: 'ru', trust: 78, perspective: 'Russian official', ...tg('razvozhaev') },
  { id: 'opershtab23', name: 'Krasnodar Operations HQ', tier: 'primary', category: 'general', region: 'russia', lang: 'ru', trust: 80, perspective: 'Russian official', ...tg('opershtab23') },
  { id: 'sobyanin', name: 'Mayor of Moscow', tier: 'primary', category: 'general', region: 'russia', lang: 'ru', trust: 80, perspective: 'Russian official', ...tg('mos_sobyanin') },
  { id: 'kpszsu', name: 'Ukrainian Air Force', tier: 'primary', category: 'military', region: 'ukraine', lang: 'uk', trust: 85, perspective: 'Ukrainian official', ...tg('kpszsu') },
  { id: 'idf', name: 'IDF', tier: 'primary', category: 'military', region: 'mideast', lang: 'en', trust: 82, perspective: 'Israeli official', ...tg('idfofficial') },
  { id: 'dod', name: 'US DoD News', tier: 'primary', category: 'military', region: 'usa', lang: 'en', trust: 88, perspective: 'US official', rss: 'https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=945&max=10', site: 'https://www.defense.gov' },
  // Early: fast newsrooms and incident channels
  { id: 'baza', name: 'Baza', tier: 'early', category: 'general', region: 'russia', lang: 'ru', trust: 62, ...tg('bazabazon') },
  { id: 'mash', name: 'Mash', tier: 'early', category: 'general', region: 'russia', lang: 'ru', trust: 55, ...tg('mash') },
  { id: 'shot', name: 'SHOT', tier: 'early', category: 'general', region: 'russia', lang: 'ru', trust: 55, ...tg('shot_shot') },
  { id: 'news112', name: '112', tier: 'early', category: 'general', region: 'russia', lang: 'ru', trust: 55, ...tg('ENews112') },
  { id: 'astra', name: 'ASTRA', tier: 'early', category: 'general', region: 'russia', lang: 'ru', trust: 65, perspective: 'independent Russian', ...tg('astrapress') },
  { id: 'ostorozhno', name: 'Ostorozhno, novosti', tier: 'early', category: 'general', region: 'russia', lang: 'ru', trust: 62, network: 'ostorozhno', ...tg('ostorozhno_novosti') },
  { id: 'ostorozhnomsk', name: 'Ostorozhno, Moskva', tier: 'early', category: 'general', region: 'russia', lang: 'ru', trust: 58, network: 'ostorozhno', ...tg('ostorozhno_moskva') },
  { id: 'sirena', name: 'Sirena', tier: 'early', category: 'general', region: 'russia', lang: 'ru', trust: 58, perspective: 'independent Russian', ...tg('news_sirena') },
  { id: 'nexta', name: 'NEXTA', tier: 'early', category: 'general', region: 'europe', lang: 'ru', trust: 55, perspective: 'Belarusian opposition', ...tg('nexta_tv') },
  { id: 'osintdefender', name: 'OSINTdefender', tier: 'early', category: 'general', region: 'global', lang: 'en', trust: 58, ...tg('osintdefender') },
  { id: 'rageintel', name: 'RAGE X', tier: 'early', category: 'general', region: 'global', lang: 'en', trust: 55, ...tg('rageintel') },
  { id: 'warmonitors', name: 'War Monitor', tier: 'early', category: 'general', region: 'global', lang: 'en', trust: 50, ...tg('warmonitors') },
  { id: 'insiderpaper', name: 'Insider Paper', tier: 'early', category: 'general', region: 'global', lang: 'en', trust: 55, ...tg('insiderpaper') },
  { id: 'clashreport', name: 'Clash Report', tier: 'early', category: 'general', region: 'global', lang: 'en', trust: 50, ...tg('ClashReport') },
  { id: 'liveuamap', name: 'Liveuamap', tier: 'early', category: 'military', region: 'global', lang: 'en', trust: 68, ...tg('liveuamap') },
  // OSINT
  { id: 'itamilradar', name: 'ItaMilRadar', tier: 'osint', category: 'aviation', region: 'europe', lang: 'en', trust: 78, bluesky: 'itamilradar.com', rss: 'https://www.itamilradar.com/feed/', site: 'https://www.itamilradar.com' },
  { id: 'bellingcat', name: 'Bellingcat', tier: 'osint', category: 'osint', region: 'global', lang: 'en', trust: 88, bluesky: 'bellingcat.com', rss: 'https://www.bellingcat.com/feed/', site: 'https://www.bellingcat.com' },
  { id: 'isw', name: 'ISW', tier: 'osint', category: 'osint', region: 'global', lang: 'en', trust: 78, bluesky: 'thestudyofwar.bsky.social', site: 'https://understandingwar.org' },
  { id: 'janovsky', name: 'Jakub Janovsky (Oryx)', tier: 'osint', category: 'osint', region: 'ukraine', lang: 'en', trust: 80, bluesky: 'rebel44cz.bsky.social', site: 'https://bsky.app/profile/rebel44cz.bsky.social' },
  { id: 'deepstate', name: 'DeepState', tier: 'osint', category: 'military', region: 'ukraine', lang: 'uk', trust: 75, perspective: 'Ukrainian', ...tg('DeepStateUA') },
  { id: 'netblocks', name: 'NetBlocks', tier: 'osint', category: 'infrastructure', region: 'global', lang: 'en', trust: 88, ...tg('netblocks') },
  // Specialist media
  { id: 'aviationist', name: 'The Aviationist', tier: 'specialist', category: 'aviation', region: 'global', lang: 'en', trust: 80, bluesky: 'theaviationist.com', rss: 'https://theaviationist.com/feed/', site: 'https://theaviationist.com' },
  { id: 'twz', name: 'The War Zone', tier: 'specialist', category: 'aviation', region: 'global', lang: 'en', trust: 80, rss: 'https://www.twz.com/feed', site: 'https://www.twz.com' },
  { id: 'defensenews', name: 'Defense News', tier: 'specialist', category: 'defence', region: 'global', lang: 'en', trust: 82, bluesky: 'defensenews.bsky.social', rss: 'https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml', site: 'https://www.defensenews.com' },
  { id: 'breakingdefense', name: 'Breaking Defense', tier: 'specialist', category: 'defence', region: 'global', lang: 'en', trust: 82, bluesky: 'breakingdefense.com', rss: 'https://breakingdefense.com/feed/', site: 'https://breakingdefense.com' },
  { id: 'navalnews', name: 'Naval News', tier: 'specialist', category: 'naval', region: 'global', lang: 'en', trust: 82, rss: 'https://www.navalnews.com/feed/', site: 'https://www.navalnews.com' },
  { id: 'usni', name: 'USNI News', tier: 'specialist', category: 'naval', region: 'usa', lang: 'en', trust: 85, rss: 'https://news.usni.org/feed', site: 'https://news.usni.org' },
  { id: 'hartpunkt', name: 'hartpunkt', tier: 'specialist', category: 'defence', region: 'dach', lang: 'de', trust: 82, bluesky: 'hartpunkt.bsky.social', rss: 'https://www.hartpunkt.de/feed/', site: 'https://www.hartpunkt.de' },
  { id: 'augengeradeaus', name: 'Augen geradeaus!', tier: 'specialist', category: 'defence', region: 'dach', lang: 'de', trust: 85, bluesky: 'wiegold.de', rss: 'https://augengeradeaus.net/feed/', site: 'https://augengeradeaus.net' },
  { id: 'esut', name: 'ESUT', tier: 'specialist', category: 'defence', region: 'dach', lang: 'de', trust: 78, rss: 'https://esut.de/feed/', site: 'https://esut.de' },
  { id: 'mediazona', name: 'Mediazona', tier: 'specialist', category: 'news', region: 'russia', lang: 'ru', trust: 80, perspective: 'independent Russian', ...tg('mediazzzona') },
  { id: 'agentstvo', name: 'Agentstvo', tier: 'specialist', category: 'politics', region: 'russia', lang: 'ru', trust: 78, perspective: 'independent Russian', ...tg('agentstvonews') },
  { id: 'thebell', name: 'The Bell', tier: 'specialist', category: 'politics', region: 'russia', lang: 'ru', trust: 78, perspective: 'independent Russian', ...tg('thebell_io') },
  // Perspective: fast, clearly partisan
  // Rybar: one network of channels, counted as one source
  { id: 'rybar', name: 'Rybar', tier: 'perspective', category: 'military', trust: 45, perspective: 'pro-Russian', network: 'rybar', region: 'russia', lang: 'ru', ...tg('rybar') },
  { id: 'rybar-en', name: 'Rybar in English', tier: 'perspective', category: 'military', trust: 45, perspective: 'pro-Russian', network: 'rybar', region: 'russia', lang: 'en', ...tg('rybar_in_english') },
  { id: 'rybar-de', name: 'Rybar DE', tier: 'perspective', category: 'military', trust: 45, perspective: 'pro-Russian', network: 'rybar', region: 'dach', lang: 'de', ...tg('rybarde') },
  { id: 'rybar-mena', name: 'Rybar Orientar (Middle East)', tier: 'perspective', category: 'military', trust: 45, perspective: 'pro-Russian', network: 'rybar', region: 'mideast', lang: 'ru', ...tg('rybar_mena') },
  { id: 'rybar-europe', name: 'Rybar Evropar (Europe)', tier: 'perspective', category: 'military', trust: 45, perspective: 'pro-Russian', network: 'rybar', region: 'europe', lang: 'ru', ...tg('evropar') },
  { id: 'rybar-balkans', name: 'Rybar Balkanar (Balkans)', tier: 'perspective', category: 'military', trust: 45, perspective: 'pro-Russian', network: 'rybar', region: 'europe', lang: 'ru', ...tg('balkanar') },
  { id: 'rybar-caucasus', name: 'Rybar Kavkazar (Caucasus)', tier: 'perspective', category: 'military', trust: 45, perspective: 'pro-Russian', network: 'rybar', region: 'russia', lang: 'ru', ...tg('caucasar') },
  { id: 'rybar-asia', name: 'Rybar Aziatar (Asia)', tier: 'perspective', category: 'military', trust: 45, perspective: 'pro-Russian', network: 'rybar', region: 'global', lang: 'ru', ...tg('rybar_pacific') },
  { id: 'rybar-turan', name: 'Rybar Turanar (Central Asia)', tier: 'perspective', category: 'military', trust: 45, perspective: 'pro-Russian', network: 'rybar', region: 'global', lang: 'ru', ...tg('rybar_stan') },
  { id: 'rybar-africa', name: 'Rybar Afrikar (Africa)', tier: 'perspective', category: 'military', trust: 45, perspective: 'pro-Russian', network: 'rybar', region: 'global', lang: 'ru', ...tg('rybar_africa') },
  { id: 'rybar-latam', name: 'Rybar Latinar (Latin America)', tier: 'perspective', category: 'military', trust: 45, perspective: 'pro-Russian', network: 'rybar', region: 'global', lang: 'ru', ...tg('rybar_latam') },
  { id: 'rybar-tactical', name: 'Rybar Tactical', tier: 'perspective', category: 'military', trust: 45, perspective: 'pro-Russian', network: 'rybar', region: 'ukraine', lang: 'ru', ...tg('rybar_tactical') },
  { id: 'rybar-america', name: 'Rybar America', tier: 'perspective', category: 'military', trust: 45, perspective: 'pro-Russian', network: 'rybar', region: 'usa', lang: 'ru', ...tg('rybar_america') },
  { id: 'wargonzo', name: 'WarGonzo', tier: 'perspective', category: 'military', region: 'russia', lang: 'ru', trust: 40, perspective: 'pro-Russian', ...tg('wargonzo') },
  { id: 'dvamajora', name: 'Dva Mayora', tier: 'perspective', category: 'military', region: 'russia', lang: 'ru', trust: 40, perspective: 'pro-Russian', ...tg('dva_majors') },
  { id: 'mes', name: 'Middle East Spectator', tier: 'perspective', category: 'military', region: 'mideast', lang: 'en', trust: 40, perspective: 'Iran and resistance aligned', ...tg('Middle_East_Spectator') },
  { id: 'abualiexpress', name: 'Abu Ali Express', tier: 'perspective', category: 'military', region: 'mideast', lang: 'he', trust: 50, perspective: 'Israeli', ...tg('abualiexpress') },
  // Confirming: leading media
  { id: 'tagesschau', name: 'Tagesschau', tier: 'confirming', category: 'news', region: 'dach', lang: 'de', trust: 90, rss: 'https://www.tagesschau.de/index~rss2.xml', site: 'https://www.tagesschau.de' },
  { id: 'dlf', name: 'Deutschlandfunk', tier: 'confirming', category: 'news', region: 'dach', lang: 'de', trust: 90, rss: 'https://www.deutschlandfunk.de/nachrichten-100.rss', site: 'https://www.deutschlandfunk.de' },
  { id: 'dw', name: 'DW', tier: 'confirming', category: 'news', region: 'europe', lang: 'en', trust: 86, rss: 'https://rss.dw.com/rdf/rss-en-top', site: 'https://www.dw.com' },
  { id: 'bbc', name: 'BBC World', tier: 'confirming', category: 'news', region: 'global', lang: 'en', trust: 88, rss: 'https://feeds.bbci.co.uk/news/world/rss.xml', site: 'https://www.bbc.com/news/world' },
  { id: 'aljazeera', name: 'Al Jazeera', tier: 'confirming', category: 'news', region: 'mideast', lang: 'en', trust: 75, perspective: 'Qatari state funded', rss: 'https://www.aljazeera.com/xml/rss/all.xml', site: 'https://www.aljazeera.com' },
  { id: 'meduza', name: 'Meduza', tier: 'confirming', category: 'news', region: 'russia', lang: 'ru', trust: 82, perspective: 'independent Russian', ...tg('meduzalive') },
  { id: 'currenttime', name: 'Current Time', tier: 'confirming', category: 'news', region: 'russia', lang: 'ru', trust: 78, perspective: 'US funded, independent of Moscow', ...tg('currenttime') },
];

export const CATEGORY_LABEL: Record<Category, string> = {
  general: 'General',
  aviation: 'Aviation',
  military: 'Military',
  naval: 'Naval',
  defence: 'Defence',
  osint: 'OSINT',
  disaster: 'Disaster',
  infrastructure: 'Infrastructure',
  politics: 'Politics',
  news: 'News',
};

export const REGION_LABEL: Record<Region, string> = {
  global: 'Global',
  europe: 'Europe',
  dach: 'DACH',
  russia: 'Russia',
  ukraine: 'Ukraine',
  mideast: 'Middle East',
  usa: 'USA',
};

/** Labels of the classes, English and German. "Perspective" is "Parteiisch" in German. */
export const TIER_LABEL: Record<Tier, { en: string; de: string }> = {
  physical: { en: 'Physical', de: 'Messung' },
  primary: { en: 'Primary', de: 'Primär' },
  early: { en: 'Early', de: 'Früh' },
  osint: { en: 'OSINT', de: 'OSINT' },
  specialist: { en: 'Specialist', de: 'Fachmedium' },
  perspective: { en: 'Perspective', de: 'Parteiisch' },
  confirming: { en: 'Confirming', de: 'Bestätigend' },
};

/** VectorScope itself: activity and emergencies detected in live flight data (data/sensor.ts). */
export const SENSOR_SOURCE: Source = {
  id: 'sensor',
  name: 'VectorScope Sensor',
  tier: 'physical',
  category: 'aviation',
  region: 'global',
  lang: 'en',
  trust: 90,
  site: 'https://michaeldobner.github.io/VectorScope/air/',
};

/** Sources of the demo mode, so ?demo shows every status without pretending to quote a real outlet. */
export const DEMO_SOURCES: Source[] = [
  { id: 'demo-fast-a', name: 'Demo Telegram A', tier: 'early', category: 'general', region: 'global', lang: 'en', trust: 55, site: 'https://example.org' },
  { id: 'demo-fast-b', name: 'Demo Telegram B', tier: 'early', category: 'general', region: 'global', lang: 'en', trust: 55, site: 'https://example.org' },
  { id: 'demo-osint', name: 'Demo OSINT', tier: 'osint', category: 'osint', region: 'global', lang: 'en', trust: 80, site: 'https://example.org' },
  { id: 'demo-press', name: 'Demo Aviation Press', tier: 'specialist', category: 'aviation', region: 'global', lang: 'en', trust: 80, site: 'https://example.org' },
  { id: 'demo-de', name: 'Demo Fachmedium', tier: 'specialist', category: 'defence', region: 'dach', lang: 'de', trust: 80, site: 'https://example.org' },
  { id: 'demo-confirm', name: 'Demo Wire Service', tier: 'confirming', category: 'news', region: 'global', lang: 'en', trust: 88, site: 'https://example.org' },
  { id: 'demo-primary', name: 'Demo Governor', tier: 'primary', category: 'general', region: 'russia', lang: 'ru', trust: 80, perspective: 'Demo official', site: 'https://example.org' },
  { id: 'demo-ru', name: 'Demo Incident Channel', tier: 'early', category: 'general', region: 'russia', lang: 'ru', trust: 55, site: 'https://example.org' },
  { id: 'demo-quake', name: 'Demo Seismometer', tier: 'physical', category: 'disaster', region: 'global', lang: 'en', trust: 95, site: 'https://example.org' },
  { id: 'demo-side', name: 'Demo Partisan Channel', tier: 'perspective', category: 'military', region: 'russia', lang: 'ru', trust: 40, perspective: 'Demo partisan', site: 'https://example.org' },
];

/** Key under which a source counts as independent: its network, or itself. */
/**
 * Sources with a broad remit, whose reports count only with security and crisis topics: general news media,
 * authorities with general duties (governors, mayors, the Investigative Committee) and the Russian
 * incident channels, which mix attacks and fires with celebrities and fraud.
 */
export const isBroad = (s: Source | undefined) =>
  !!s && (s.category === 'news' || (s.category === 'general' && (s.tier === 'primary' || (s.tier === 'early' && s.region === 'russia'))));

export const independenceKey = (id: string) => sourceById(id)?.network ?? id;

export const sourceById = (id: string) => (id === 'sensor' ? SENSOR_SOURCE : (SOURCES.find((s) => s.id === id) ?? DEMO_SOURCES.find((s) => s.id === id)));
