# Sources

[Deutsche Version](../de/quellen.md) · [Overview](README.md)

INTEL reads 62 sources in seven classes, from Russia, Ukraine, the Middle East, Europe, Germany and the USA plus global sensors. Quality over quantity: every source was checked in the test lab with real internet before it was added. The list lives in `src/data/sources.ts`.

## Class and trust

Every source has two fixed properties:

* **Class:** what kind of origin its reports have. It says nothing about whether a single report is true.
* **Trust** from 0 to 100: how reliable the source is in general.

How sure a single event is, is a third value, the **event confidence** of a story. It is calculated from the classes and trust of all independent sources that report the event, see [Stories](stories.md). A partisan channel with trust 40 can be the first of a story that ends at 90 % once a governor and a leading medium follow.

| Class | Weight | Meaning |
|---|---|---|
| **Physical** | 0.6 | Measuring systems: seismometers, satellites, ADS-B. They measure, they do not report. |
| **Primary** | 0.7 | The originator itself: authorities, military, governors, airports. |
| **Early** | 0.3 | Very fast newsrooms and incident channels, often minutes after an event, without verification. |
| **OSINT** | 0.4 | Open source researchers with a track record. |
| **Specialist** | 0.45 | Specialist media with an editorial process. |
| **Perspective** | 0.2 | Fast, but clearly partisan. Valuable as an early signal, weak as confirmation. |
| **Confirming** | 0.55 | Leading news media, the journalistic second confirmation. |

In German the class Perspective is called **Parteiisch**.

## Physical

Measuring systems: seismometers, satellites, ADS-B. They measure, they do not report.

| Source | Region | Language | Trust | Perspective | Channel |
|---|---|---|---|---|---|
| USGS Earthquakes | Global | English | 97 |  | API |
| EMSC Earthquakes | Global | English | 95 |  | API |
| GDACS | Global | English | 92 |  | API |

## Primary

The originator itself: authorities, military, governors, airports.

| Source | Region | Language | Trust | Perspective | Channel |
|---|---|---|---|---|---|
| US National Weather Service | USA | English | 95 |  | API |
| FAA Airport Status | USA | English | 95 |  | API |
| Rosaviatsiya | Russia | Russian | 90 | Russian official | Telegram `favt_info` |
| MChS Russia | Russia | Russian | 85 | Russian official | Telegram `mchs_official` |
| Investigative Committee | Russia | Russian | 75 | Russian official | Telegram `sledcom_press` |
| Governor Belgorod | Russia | Russian | 80 | Russian official | Telegram `vvgladkov` |
| Governor Bryansk | Russia | Russian | 78 | Russian official | Telegram `AVBogomaz` |
| Governor Voronezh | Russia | Russian | 80 | Russian official | Telegram `gusev_36` |
| Governor Sevastopol | Russia | Russian | 78 | Russian official | Telegram `razvozhaev` |
| Krasnodar Operations HQ | Russia | Russian | 80 | Russian official | Telegram `opershtab23` |
| Mayor of Moscow | Russia | Russian | 80 | Russian official | Telegram `mos_sobyanin` |
| Ukrainian Air Force | Ukraine | Ukrainian | 85 | Ukrainian official | Telegram `kpszsu` |
| IDF | Middle East | English | 82 | Israeli official | Telegram `idfofficial` |
| US DoD News | USA | English | 88 | US official | RSS |

## Early

Very fast newsrooms and incident channels, often minutes after an event, without verification.

| Source | Region | Language | Trust | Perspective | Channel |
|---|---|---|---|---|---|
| Baza | Russia | Russian | 62 |  | Telegram `bazabazon` |
| Mash | Russia | Russian | 55 |  | Telegram `mash` |
| SHOT | Russia | Russian | 55 |  | Telegram `shot_shot` |
| 112 | Russia | Russian | 55 |  | Telegram `ENews112` |
| ASTRA | Russia | Russian | 65 | independent Russian | Telegram `astrapress` |
| Ostorozhno, novosti | Russia | Russian | 62 |  | Telegram `ostorozhno_novosti` |
| Ostorozhno, Moskva | Russia | Russian | 58 |  | Telegram `ostorozhno_moskva` |
| Sirena | Russia | Russian | 58 | independent Russian | Telegram `news_sirena` |
| NEXTA | Europe | Russian | 55 | Belarusian opposition | Telegram `nexta_tv` |
| OSINTdefender | Global | English | 58 |  | Telegram `osintdefender` |
| RAGE X | Global | English | 55 |  | Telegram `rageintel` |
| War Monitor | Global | English | 50 |  | Telegram `warmonitors` |
| Insider Paper | Global | English | 55 |  | Telegram `insiderpaper` |
| Clash Report | Global | English | 50 |  | Telegram `ClashReport` |
| Liveuamap | Global | English | 68 |  | Telegram `liveuamap` |

## OSINT

Open source researchers with a track record.

| Source | Region | Language | Trust | Perspective | Channel |
|---|---|---|---|---|---|
| ItaMilRadar | Europe | English | 78 |  | Bluesky, RSS |
| Bellingcat | Global | English | 88 |  | Bluesky, RSS |
| ISW | Global | English | 78 |  | Bluesky |
| Jakub Janovsky (Oryx) | Ukraine | English | 80 |  | Bluesky |
| DeepState | Ukraine | Ukrainian | 75 | Ukrainian | Telegram `DeepStateUA` |
| NetBlocks | Global | English | 88 |  | Telegram `netblocks` |

## Specialist

Specialist media with an editorial process.

| Source | Region | Language | Trust | Perspective | Channel |
|---|---|---|---|---|---|
| The Aviationist | Global | English | 80 |  | Bluesky, RSS |
| The War Zone | Global | English | 80 |  | RSS |
| Defense News | Global | English | 82 |  | Bluesky, RSS |
| Breaking Defense | Global | English | 82 |  | Bluesky, RSS |
| Naval News | Global | English | 82 |  | RSS |
| USNI News | USA | English | 85 |  | RSS |
| hartpunkt | DACH | German | 82 |  | Bluesky, RSS |
| Augen geradeaus! | DACH | German | 85 |  | Bluesky, RSS |
| ESUT | DACH | German | 78 |  | RSS |
| Mediazona | Russia | Russian | 80 | independent Russian | Telegram `mediazzzona` |
| Agentstvo | Russia | Russian | 78 | independent Russian | Telegram `agentstvonews` |
| The Bell | Russia | Russian | 78 | independent Russian | Telegram `thebell_io` |

## Perspective

Fast, but clearly partisan. Valuable as an early signal, weak as confirmation.

| Source | Region | Language | Trust | Perspective | Channel |
|---|---|---|---|---|---|
| Rybar | Russia | Russian | 45 | pro-Russian | Telegram `rybar` |
| WarGonzo | Russia | Russian | 40 | pro-Russian | Telegram `wargonzo` |
| Dva Mayora | Russia | Russian | 40 | pro-Russian | Telegram `dva_majors` |
| Middle East Spectator | Middle East | English | 40 | Iran and resistance aligned | Telegram `Middle_East_Spectator` |
| Abu Ali Express | Middle East | Hebrew | 50 | Israeli | Telegram `abualiexpress` |

## Confirming

Leading news media, the journalistic second confirmation.

| Source | Region | Language | Trust | Perspective | Channel |
|---|---|---|---|---|---|
| Tagesschau | DACH | German | 90 |  | RSS |
| Deutschlandfunk | DACH | German | 90 |  | RSS |
| DW | Europe | English | 86 |  | RSS |
| BBC World | Global | English | 88 |  | RSS |
| Al Jazeera | Middle East | English | 75 | Qatari state funded | RSS |
| Meduza | Russia | Russian | 82 | independent Russian | Telegram `meduzalive` |
| Current Time | Russia | Russian | 78 | US funded, independent of Moscow | Telegram `currenttime` |

## The check

The script `lab/osint.mjs` runs in the test lab on GitHub Actions and checks every candidate: does the channel or feed exist, is it active (newest post, posts per day), can it be read without an account, also through the proxy, and in which script it writes. The result is pushed to the branch `lab-results` as `osint.md`.

## Rejected candidates

| Candidate | Reason |
|---|---|
| Governor Kursk (`Khinshtein`) | No public channel |
| Iran International English, Times of Israel on Telegram | Silent for years, or a placeholder channel |
| Aurora Intel, BNO News, Faytuks News on Telegram | Silent for months |
| OSINT Updates, OSIntOps, Spectator Index | Silent for weeks to years |
| warragex | 15 subscribers, not the channel of RAGE X |
| Visegrad24 | No public channel |
| Disclose.tv | Two posts a day, sensational |
| Al Jazeera English on Telegram | Same content as the Al Jazeera feed |
| OSINTdefender on Bluesky | Official account without posts, included through Telegram |
| GeoConfirmed, OSINTtechnical, Intel Crab, Tyler Rogoway, Michael Kofman, Aircraft Spots | Silent or nearly silent |
| Scramble, ISW website, NATO, Bundeswehr, Janes, Aviation Week, FlugRevue | No working feed |
| GDELT | Rate limited for shared servers like GitHub, again on 2026-10-05 |
| NASA FIRMS | Needs a personal key, planned |

## Channels

| Channel | Access | Interval |
|---|---|---|
| Telegram | Through the proxy route `/tg/{channel}`, cached one minute at the edge. Text posts only | Every five minutes |
| RSS | Through the proxy route `/feed/{id}`. If the proxy fails, INTEL tries the feed directly | Every five minutes |
| Bluesky | Directly from the browser. Own posts only, no replies, no reposts | Every five minutes |
| USGS, EMSC, NWS | Directly from the browser, they allow it | Every five minutes |
| GDACS, FAA | Through the proxy route `/feed/{id}` | Every five minutes |

Reports in Russian, Ukrainian and Hebrew are shown in their language or translated with **DE**. Places and event words in Russian and Ukrainian are recognised in the original, see [Matching](matching.md).

## Adding a source

1. Add the candidate to `lab/osint.mjs` and let the lab check it.
2. Add it to `SOURCES` in `src/data/sources.ts` with class, region, language, trust and, where it matters, perspective.
3. For an RSS feed add the same id and address to `FEEDS` in `proxy/api/proxy.js`, for a Telegram channel its name to `TELEGRAM`. A test fails if the lists differ.
4. Update this page in both languages.
