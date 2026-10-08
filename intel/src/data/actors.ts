// Actors of the politics lens: people and institutions, recognised in English, German, Russian and Ukrainian.
// Each actor belongs to a capital, which places political stories on the map and draws lines between capitals.

export type CapitalId = 'washington' | 'berlin' | 'brussels' | 'moscow' | 'kyiv' | 'beijing' | 'paris' | 'london' | 'jerusalem' | 'ankara' | 'tehran';

export interface Capital {
  id: CapitalId;
  name: string;
  lat: number;
  lon: number;
}

export const CAPITALS: Record<CapitalId, Capital> = {
  washington: { id: 'washington', name: 'Washington', lat: 38.9, lon: -77.04 },
  berlin: { id: 'berlin', name: 'Berlin', lat: 52.52, lon: 13.4 },
  brussels: { id: 'brussels', name: 'Brussels', lat: 50.85, lon: 4.35 },
  moscow: { id: 'moscow', name: 'Moscow', lat: 55.75, lon: 37.62 },
  kyiv: { id: 'kyiv', name: 'Kyiv', lat: 50.45, lon: 30.52 },
  beijing: { id: 'beijing', name: 'Beijing', lat: 39.9, lon: 116.4 },
  paris: { id: 'paris', name: 'Paris', lat: 48.86, lon: 2.35 },
  london: { id: 'london', name: 'London', lat: 51.51, lon: -0.13 },
  jerusalem: { id: 'jerusalem', name: 'Jerusalem', lat: 31.77, lon: 35.21 },
  ankara: { id: 'ankara', name: 'Ankara', lat: 39.93, lon: 32.86 },
  tehran: { id: 'tehran', name: 'Tehran', lat: 35.69, lon: 51.39 },
};

export interface Actor {
  id: string;
  name: string;
  capital: CapitalId;
  /** Names in the languages of the sources. Matched as words, Russian and Ukrainian forms as stems. */
  re: RegExp;
  /** Named mostly in military reports (NATO): shown as actor, but alone it does not make a report political. */
  weak?: true;
}

// \p{L} lookarounds instead of \b, so Cyrillic words are words too. Stems end open: Трамп, Трампа, Трампом.
const w = (body: string) => new RegExp(`(?<![\\p{L}])(?:${body})`, 'iu');
const word = (body: string) => new RegExp(`(?<![\\p{L}])(?:${body})(?![\\p{L}])`, 'iu');

export const ACTORS: Actor[] = [
  { id: 'trump', name: 'Trump', capital: 'washington', re: w('Trump|Трамп') },
  { id: 'whitehouse', name: 'White House', capital: 'washington', re: w('White House|Wei(?:ß|ss)e[nm]? Haus|Белый дом|Белого дома|Білий дім|Білого дому') },
  { id: 'merz', name: 'Merz', capital: 'berlin', re: w('Merz(?![\\p{L}])|Мерц') },
  { id: 'bundesregierung', name: 'Bundesregierung', capital: 'berlin', re: w('Bundesregierung|German government|Bundeskanzler|German chancellor|правительство ФРГ|канцлер Германии') },
  { id: 'bundestag', name: 'Bundestag', capital: 'berlin', re: w('Bundestag|Бундестаг') },
  { id: 'vonderleyen', name: 'von der Leyen', capital: 'brussels', re: w('von der Leyen|фон дер Ляйен') },
  { id: 'eucommission', name: 'EU Commission', capital: 'brussels', re: w('European Commission|EU-Kommission|EU Commission|Europäische Kommission|Еврокомисси|Єврокомісі') },
  { id: 'eu', name: 'EU', capital: 'brussels', re: word('EU|European Union|Europäische Union|Евросоюз\\p{L}*|ЕС|Євросоюз\\p{L}*|ЄС') },
  { id: 'putin', name: 'Putin', capital: 'moscow', re: w('Putin|Путин|Путін') },
  { id: 'kremlin', name: 'Kremlin', capital: 'moscow', re: w('Kremlin|Kreml|Кремл|Peskov|Peskow|Песков') },
  { id: 'zelensky', name: 'Zelensky', capital: 'kyiv', re: w('Zelensk|Selensk|Зеленск|Зеленськ') },
  { id: 'nato', name: 'NATO', capital: 'brussels', re: word('NATO|Nato|НАТО|Rutte|Рютте'), weak: true },
  { id: 'macron', name: 'Macron', capital: 'paris', re: w('Macron|Макрон') },
  { id: 'starmer', name: 'Starmer', capital: 'london', re: w('Starmer|Стармер') },
  { id: 'xi', name: 'Xi Jinping', capital: 'beijing', re: w('Xi Jinping|Си Цзиньпин|Сі Цзіньпін') },
  { id: 'netanyahu', name: 'Netanyahu', capital: 'jerusalem', re: w('Netanyahu|Netanjahu|Нетаньяху|Нетаньягу') },
  { id: 'erdogan', name: 'Erdoğan', capital: 'ankara', re: w('Erdo(?:g|ğ)an|Эрдоган|Ердоган') },
  { id: 'khamenei', name: 'Khamenei', capital: 'tehran', re: w('Khamenei|Chamenei|Хаменеи|Хаменеї') },
];

export const actorById = (id: string) => ACTORS.find((a) => a.id === id);

/** Actor ids named in a text, each once, in the order of the list. */
export function findActors(text: string): string[] {
  return ACTORS.filter((a) => a.re.test(text)).map((a) => a.id);
}

/** Capitals of the actors, each once. */
export const capitalsOf = (actors: string[]) => [...new Set(actors.map((id) => actorById(id)?.capital).filter((c): c is CapitalId => !!c))];

/**
 * Political vocabulary: a report about government, parliament, elections, laws, diplomacy or trade policy
 * belongs to the politics lens even without a known actor.
 */
const POLITICS =
  /(?<![\p{L}])(parliament\p{L}*|government|chancellor|coalition|cabinet|minister\p{L}*|election\p{L}*|vote[sd]?|voting|referendum|bill|law|legislation|budget|tariffs?|sanctions?|summit|treaty|agreement|diplomat\p{L}*|talks|negotiat\p{L}*|president\p{L}*|prime minister|executive order|congress|senate|supreme court|court ruling|impeach\p{L}*|bundestag|bundesrat|regierung|kanzler\p{L}*|koalition|kabinett|minister\p{L}*|wahl\p{L}*|abstimmung|gesetz\p{L}*|haushalt|zölle?n?|sanktion\p{L}*|gipfel\p{L}*|vertrag|verhandl\p{L}*|präsident\p{L}*|erlass|parlament\p{L}*|verfassungsgericht|urteil)(?![\p{L}])/iu;

// Russian and Ukrainian are bent: stems count with any ending, but only at the start of a word,
// so администрация (administration) is no министр, незаконный (illegal) no закон, указал (pointed out) no указ.
const POLITICS_RU =
  /(?<![\p{L}])(правительств|парламент|госдум|выбор|голосовани|закон(?!чи)|бюджет|пошлин|санкци|саммит|переговор|договор|президент|премьер|министр|дипломат|посол(?:ь|ом|а|ы|ов)?(?![\p{L}])|указ(?:ом|а|е|ы)?(?![\p{L}])|верховн\p{L}* рад|уряд|вибор|санкці|міністр)/iu;

export function isPoliticsRelated(text: string, actors: string[]): boolean {
  return actors.some((id) => !actorById(id)?.weak) || POLITICS.test(text) || POLITICS_RU.test(text);
}

/** A decision: something passed, signed, ruled or adopted. Feeds the politics tile "decisions today". */
export const DECISION =
  /(?<![\p{L}])(passed|passes|approved|adopted|signs?|signed|enacted|ruled|ruling|executive order|vetoed|beschlossen|beschließt|verabschiedet|verabschiedet|unterzeichnet|billigt|gebilligt|urteil\p{L}*|erlass|принял\p{L}*|подписал\p{L}*|утвердил\p{L}*|одобрил\p{L}*|ухвалив|підписав)(?![\p{L}])/iu;
