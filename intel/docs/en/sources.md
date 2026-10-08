# Sources

[Deutsche Version](../de/quellen.md) · [Overview](README.md)

INTEL reads 194 sources in seven classes, from Russia, Ukraine, the Middle East, Europe, Germany and the USA plus global sensors. Quality over quantity: every source was checked in the test lab with real internet before it was added. The list lives in `src/data/sources.ts`.

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
| Rybar in English | Russia | English | 45 | pro-Russian, network Rybar | Telegram `rybar_in_english` |
| Rybar DE | DACH | German | 45 | pro-Russian, network Rybar | Telegram `rybarde` |
| Rybar Orientar | Middle East | Russian | 45 | pro-Russian, network Rybar | Telegram `rybar_mena` |
| Rybar Evropar | Europe | Russian | 45 | pro-Russian, network Rybar | Telegram `evropar` |
| Rybar Balkanar | Europe | Russian | 45 | pro-Russian, network Rybar | Telegram `balkanar` |
| Rybar Kavkazar | Russia | Russian | 45 | pro-Russian, network Rybar | Telegram `caucasar` |
| Rybar Aziatar | Global | Russian | 45 | pro-Russian, network Rybar | Telegram `rybar_pacific` |
| Rybar Turanar | Global | Russian | 45 | pro-Russian, network Rybar | Telegram `rybar_stan` |
| Rybar Afrikar | Global | Russian | 45 | pro-Russian, network Rybar | Telegram `rybar_africa` |
| Rybar Latinar | Global | Russian | 45 | pro-Russian, network Rybar | Telegram `rybar_latam` |
| Rybar Tactical | Ukraine | Russian | 45 | pro-Russian, network Rybar | Telegram `rybar_tactical` |
| Rybar America | USA | Russian | 45 | pro-Russian, network Rybar | Telegram `rybar_america` |
| WarGonzo | Russia | Russian | 40 | pro-Russian | Telegram `wargonzo` |
| Dva Mayora | Russia | Russian | 40 | pro-Russian | Telegram `dva_majors` |
| Middle East Spectator | Middle East | English | 40 | Iran and resistance aligned | Telegram `Middle_East_Spectator` |
| Abu Ali Express | Middle East | Hebrew | 50 | Israeli | Telegram `abualiexpress` |

**Networks.** Rybar runs thirteen channels for its regions and topics. Two of them, Tactical and America, were found through the forward graph of the raw archive. They are one editorial team, so INTEL counts them as **one** source: in a story the channel that reported first counts, the others are listed as echoes. Two Rybar channels alone never make a story of several sources.

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

## Politics

Sources of the politics lens (since INTEL 0.8.0). Own voices of actors count as primary, they appear as "In the original". Category politics: in the security lens they count only with security and crisis topics.

| Source | Region | Language | Trust | Class | Note | Channel |
|---|---|---|---|---|---|---|
| Trump (Truth Social) | USA | English | 85 | Primary, own voice | Through the archive trumpstruth.org, Truth Social itself blocks automated access | RSS |
| White House | USA | English | 88 | Primary, own voice | News, network White House | RSS |
| White House, presidential actions | USA | English | 92 | Primary, own voice | Executive orders and proclamations, network White House | RSS |
| Bundestag | DACH | German | 92 | Primary, own voice | Current topics, network Bundestag | RSS |
| Bundestag, heute im bundestag | DACH | German | 92 | Primary, own voice | Committees, inquiries, network Bundestag | RSS |
| European Commission | Europe | English | 90 | Primary, own voice | Press corner | RSS |
| Council of the EU | Europe | English | 90 | Primary, own voice | Press releases | RSS |
| Kremlin | Russia | English | 75 | Primary, own voice | Russian government | RSS |
| Russian Foreign Ministry | Russia | Russian | 70 | Primary | Russian government | Telegram `MID_Russia` |
| Zelensky | Ukraine | Ukrainian | 80 | Primary, own voice | Ukrainian government | Telegram `V_Zelenskiy_official` |
| UN Press | Global | English | 88 | Primary | Meetings coverage | RSS |
| Tagesschau Inland | DACH | German | 90 | Confirming | | RSS |
| Spiegel Politik | DACH | German | 85 | Confirming | | RSS |
| Zeit Politik | DACH | German | 85 | Confirming | | RSS |
| FAZ Politik | DACH | German | 85 | Confirming | | RSS |
| NPR Politics | USA | English | 86 | Confirming | | RSS |
| Handelsblatt Politik | DACH | German | 82 | Specialist | | RSS |
| Politico Europe | Europe | English | 82 | Specialist | | RSS |
| Politico | USA | English | 82 | Specialist | | RSS |
| Axios | USA | English | 80 | Specialist | | RSS |

Checked in the test lab on 8 October 2026. Rejected: Bundesregierung and Euractiv (HTTP 403 for automated requests), Auswärtiges Amt, Federal Ministry of Defence, Federal Constitutional Court and NATO (no working feed, 404), Truth Social directly, AP and the President of Ukraine website (HTTP 403), European Parliament (HTTP 202 without content), EUobserver (feed ended, 410), Süddeutsche Zeitung (works, left out because four German confirming sources are enough), The Hill (about 160 posts a day, too loud), Federal Register (same documents as the White House, two days later), Telegram channels of the Bundeskanzler, the Bundesregierung, the Kremlin, Peskov and Trump (no public channel).

## Voices of German politics

Since INTEL 0.9.0: the federal government in its own words, the votes of the Bundestag, the members of the Bundestag, interviews and documents. Checked in the test lab on 8 October 2026 (`lab/politics.mjs`, `lab/voices.mjs`).

| Source | Trust | Class | Kind | Note | Channel |
|---|---|---|---|---|---|
| Bundesregierung | 92 | Primary, own voice | | Mastodon of the federal government, about 2 posts a day | RSS of social.bund.de |
| Federal Ministry of the Interior | 90 | Primary | | | RSS of social.bund.de |
| Federal Ministry for Digital Affairs | 90 | Primary | | | RSS of social.bund.de |
| Federal Court of Justice | 94 | Primary | | | RSS of social.bund.de |
| BSI | 92 | Primary | | Category infrastructure, security lens | RSS of social.bund.de |
| German Customs | 88 | Primary | | Category general | RSS of social.bund.de |
| abgeordnetenwatch.de, votes | 92 | Primary | 🗳 Vote | Every recorded vote of the Bundestag with its result, data CC0. Collector only | API v2 |
| Bundestag (YouTube) | 92 | Primary, own voice | 🗣 Speech | Debates of the plenary by agenda item, network Bundestag | YouTube RSS |
| Deutschlandfunk, Interview der Woche | 90 | Confirming | 🎙 Interview | | RSS |
| phoenix persönlich | 86 | Confirming | 🎙 Interview | Talk with one guest a week, the link is the audio file | Podcast RSS |
| POLITICO Berlin Playbook (podcast) | 82 | Specialist | | Every morning, the feed has 4.4 MB. Collector only | Podcast RSS |
| FragDenStaat | 82 | Specialist | 📄 Document | Articles on documents released under freedom of information laws | RSS |
| 88 members of the Bundestag | 70 | Primary | | Own posts on Bluesky, grouped by fraction. Collector only | Bluesky |

**Members of the Bundestag.** All 630 members of the 21st Bundestag with their fraction come from abgeordnetenwatch.de (`src/data/members.ts`). INTEL recognises them by full name, by first and last name without middle names, and 27 well known members (Merz, Klingbeil, Weidel, Spahn, Reichinnek, Pistorius and others) by the last name alone. Ambiguous last names like Lang, Bas or Hoffmann are never matched alone. 88 members have a Bluesky profile that the Bluesky search finds and that matches a member by name (`src/data/mdb-bluesky.ts`). Both files are written by `scripts/members.mjs` from the results of the test lab, so they can be refreshed after a change in the Bundestag.

**Collector only.** Sources marked so are loaded every 10 minutes by the collector, not by every refresh of the app: 88 Bluesky accounts or a 4.4 MB feed would make the app slow. Their reports reach the app through the collector data, the source list shows them with a hollow dot.

**Rejected:** DIP, the documentation system of the Bundestag (speeches, minutes, printed papers). Its API needs a key, the help page shows the public key only in the browser, every attempt from the lab answered 401. A personal key is free on request, see the [plan](#plan). phoenix on YouTube (shorts and documentary series, little politics), Auswärtiges Amt and BMWK on Mastodon (silent for more than a year), Heute im Bundestag on Mastodon (same reports as the Bundestag feed hib).

<a id="plan"></a>**Planned:** DIP with a personal key (speeches with speaker, printed papers), how the fractions voted in every vote (abgeordnetenwatch has the 630 votes per poll).

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
