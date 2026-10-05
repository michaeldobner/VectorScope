# Quellen

[English version](../en/sources.md) · [Übersicht](README.md)

INTEL liest 72 Quellen in sieben Klassen, aus Russland, der Ukraine, Nahost, Europa, Deutschland und den USA sowie globale Sensoren. Qualität vor Menge: Jede Quelle wurde im Test-Labor mit echtem Internet geprüft, bevor sie aufgenommen wurde. Die Liste steht in `src/data/sources.ts`.

## Klasse und Trust

Jede Quelle hat zwei feste Eigenschaften:

* **Klasse:** welche Art von Herkunft ihre Meldungen haben. Sie sagt nichts darüber, ob eine einzelne Meldung stimmt.
* **Trust** von 0 bis 100: wie verlässlich die Quelle allgemein ist.

Wie sicher ein einzelnes Ereignis ist, ist ein dritter Wert, die **Event Confidence** einer Story. Sie wird aus Klassen und Trust aller unabhängigen Quellen berechnet, die das Ereignis melden, siehe [Stories](stories.md). Ein parteiischer Kanal mit Trust 40 kann der erste einer Story sein, die bei 90 % endet, sobald ein Gouverneur und ein Leitmedium nachziehen.

| Klasse | Gewicht | Bedeutung |
|---|---|---|
| **Messung** (Physical) | 0,6 | Messende Systeme: Seismometer, Satelliten, ADS-B. Sie messen, sie berichten nicht. |
| **Primär** (Primary) | 0,7 | Der Urheber selbst: Behörden, Militär, Gouverneure, Flughäfen. |
| **Früh** (Early) | 0,3 | Sehr schnelle Redaktionen und Incident-Kanäle, oft Minuten nach einem Ereignis, ohne Prüfung. |
| **OSINT** (OSINT) | 0,4 | Open-Source-Rechercheure mit Erfahrung. |
| **Fachmedium** (Specialist) | 0,45 | Fachmedien mit Redaktion. |
| **Parteiisch** (Perspective) | 0,2 | Schnell, aber klar interessengeleitet. Wertvoll als frühes Signal, schwach als Bestätigung. |
| **Bestätigend** (Confirming) | 0,55 | Leitmedien, die journalistische zweite Bestätigung. |

## Messung

Messende Systeme: Seismometer, Satelliten, ADS-B. Sie messen, sie berichten nicht.

| Quelle | Region | Sprache | Trust | Perspektive | Kanal |
|---|---|---|---|---|---|
| USGS Earthquakes | Global | Englisch | 97 |  | API |
| EMSC Earthquakes | Global | Englisch | 95 |  | API |
| GDACS | Global | Englisch | 92 |  | API |

## Primär

Der Urheber selbst: Behörden, Militär, Gouverneure, Flughäfen.

| Quelle | Region | Sprache | Trust | Perspektive | Kanal |
|---|---|---|---|---|---|
| US National Weather Service | USA | Englisch | 95 |  | API |
| FAA Airport Status | USA | Englisch | 95 |  | API |
| Rosaviatsiya | Russland | Russisch | 90 | Russian official | Telegram `favt_info` |
| MChS Russia | Russland | Russisch | 85 | Russian official | Telegram `mchs_official` |
| Investigative Committee | Russland | Russisch | 75 | Russian official | Telegram `sledcom_press` |
| Governor Belgorod | Russland | Russisch | 80 | Russian official | Telegram `vvgladkov` |
| Governor Bryansk | Russland | Russisch | 78 | Russian official | Telegram `AVBogomaz` |
| Governor Voronezh | Russland | Russisch | 80 | Russian official | Telegram `gusev_36` |
| Governor Sevastopol | Russland | Russisch | 78 | Russian official | Telegram `razvozhaev` |
| Krasnodar Operations HQ | Russland | Russisch | 80 | Russian official | Telegram `opershtab23` |
| Mayor of Moscow | Russland | Russisch | 80 | Russian official | Telegram `mos_sobyanin` |
| Ukrainian Air Force | Ukraine | Ukrainisch | 85 | Ukrainian official | Telegram `kpszsu` |
| IDF | Nahost | Englisch | 82 | Israeli official | Telegram `idfofficial` |
| US DoD News | USA | Englisch | 88 | US official | RSS |

## Früh

Sehr schnelle Redaktionen und Incident-Kanäle, oft Minuten nach einem Ereignis, ohne Prüfung.

| Quelle | Region | Sprache | Trust | Perspektive | Kanal |
|---|---|---|---|---|---|
| Baza | Russland | Russisch | 62 |  | Telegram `bazabazon` |
| Mash | Russland | Russisch | 55 |  | Telegram `mash` |
| SHOT | Russland | Russisch | 55 |  | Telegram `shot_shot` |
| 112 | Russland | Russisch | 55 |  | Telegram `ENews112` |
| ASTRA | Russland | Russisch | 65 | independent Russian | Telegram `astrapress` |
| Ostorozhno, novosti | Russland | Russisch | 62 |  | Telegram `ostorozhno_novosti` |
| Ostorozhno, Moskva | Russland | Russisch | 58 |  | Telegram `ostorozhno_moskva` |
| Sirena | Russland | Russisch | 58 | independent Russian | Telegram `news_sirena` |
| NEXTA | Europa | Russisch | 55 | Belarusian opposition | Telegram `nexta_tv` |
| OSINTdefender | Global | Englisch | 58 |  | Telegram `osintdefender` |
| RAGE X | Global | Englisch | 55 |  | Telegram `rageintel` |
| War Monitor | Global | Englisch | 50 |  | Telegram `warmonitors` |
| Insider Paper | Global | Englisch | 55 |  | Telegram `insiderpaper` |
| Clash Report | Global | Englisch | 50 |  | Telegram `ClashReport` |
| Liveuamap | Global | Englisch | 68 |  | Telegram `liveuamap` |

## OSINT

Open-Source-Rechercheure mit Erfahrung.

| Quelle | Region | Sprache | Trust | Perspektive | Kanal |
|---|---|---|---|---|---|
| ItaMilRadar | Europa | Englisch | 78 |  | Bluesky, RSS |
| Bellingcat | Global | Englisch | 88 |  | Bluesky, RSS |
| ISW | Global | Englisch | 78 |  | Bluesky |
| Jakub Janovsky (Oryx) | Ukraine | Englisch | 80 |  | Bluesky |
| DeepState | Ukraine | Ukrainisch | 75 | Ukrainian | Telegram `DeepStateUA` |
| NetBlocks | Global | Englisch | 88 |  | Telegram `netblocks` |

## Fachmedium

Fachmedien mit Redaktion.

| Quelle | Region | Sprache | Trust | Perspektive | Kanal |
|---|---|---|---|---|---|
| The Aviationist | Global | Englisch | 80 |  | Bluesky, RSS |
| The War Zone | Global | Englisch | 80 |  | RSS |
| Defense News | Global | Englisch | 82 |  | Bluesky, RSS |
| Breaking Defense | Global | Englisch | 82 |  | Bluesky, RSS |
| Naval News | Global | Englisch | 82 |  | RSS |
| USNI News | USA | Englisch | 85 |  | RSS |
| hartpunkt | DACH | Deutsch | 82 |  | Bluesky, RSS |
| Augen geradeaus! | DACH | Deutsch | 85 |  | Bluesky, RSS |
| ESUT | DACH | Deutsch | 78 |  | RSS |
| Mediazona | Russland | Russisch | 80 | independent Russian | Telegram `mediazzzona` |
| Agentstvo | Russland | Russisch | 78 | independent Russian | Telegram `agentstvonews` |
| The Bell | Russland | Russisch | 78 | independent Russian | Telegram `thebell_io` |

## Parteiisch

Schnell, aber klar interessengeleitet. Wertvoll als frühes Signal, schwach als Bestätigung.

| Quelle | Region | Sprache | Trust | Perspektive | Kanal |
|---|---|---|---|---|---|
| Rybar | Russland | Russisch | 45 | pro-Russian | Telegram `rybar` |
| Rybar in English | Russland | Englisch | 45 | pro-Russian, Netzwerk Rybar | Telegram `rybar_in_english` |
| Rybar DE | DACH | Deutsch | 45 | pro-Russian, Netzwerk Rybar | Telegram `rybarde` |
| Rybar Orientar | Nahost | Russisch | 45 | pro-Russian, Netzwerk Rybar | Telegram `rybar_mena` |
| Rybar Evropar | Europa | Russisch | 45 | pro-Russian, Netzwerk Rybar | Telegram `evropar` |
| Rybar Balkanar | Europa | Russisch | 45 | pro-Russian, Netzwerk Rybar | Telegram `balkanar` |
| Rybar Kavkazar | Russland | Russisch | 45 | pro-Russian, Netzwerk Rybar | Telegram `caucasar` |
| Rybar Aziatar | Global | Russisch | 45 | pro-Russian, Netzwerk Rybar | Telegram `rybar_pacific` |
| Rybar Turanar | Global | Russisch | 45 | pro-Russian, Netzwerk Rybar | Telegram `rybar_stan` |
| Rybar Afrikar | Global | Russisch | 45 | pro-Russian, Netzwerk Rybar | Telegram `rybar_africa` |
| Rybar Latinar | Global | Russisch | 45 | pro-Russian, Netzwerk Rybar | Telegram `rybar_latam` |
| WarGonzo | Russland | Russisch | 40 | pro-Russian | Telegram `wargonzo` |
| Dva Mayora | Russland | Russisch | 40 | pro-Russian | Telegram `dva_majors` |
| Middle East Spectator | Nahost | Englisch | 40 | Iran and resistance aligned | Telegram `Middle_East_Spectator` |
| Abu Ali Express | Nahost | Hebräisch | 50 | Israeli | Telegram `abualiexpress` |

**Netzwerke.** Rybar betreibt elf Kanäle für seine Regionen. Dahinter steht eine Redaktion, deshalb zählt INTEL sie als **eine** Quelle: In einer Story zählt der Kanal, der zuerst gemeldet hat, die anderen stehen als Echo dabei. Zwei Rybar-Kanäle allein ergeben nie eine Story mehrerer Quellen.

## Bestätigend

Leitmedien, die journalistische zweite Bestätigung.

| Quelle | Region | Sprache | Trust | Perspektive | Kanal |
|---|---|---|---|---|---|
| Tagesschau | DACH | Deutsch | 90 |  | RSS |
| Deutschlandfunk | DACH | Deutsch | 90 |  | RSS |
| DW | Europa | Englisch | 86 |  | RSS |
| BBC World | Global | Englisch | 88 |  | RSS |
| Al Jazeera | Nahost | Englisch | 75 | Qatari state funded | RSS |
| Meduza | Russland | Russisch | 82 | independent Russian | Telegram `meduzalive` |
| Current Time | Russland | Russisch | 78 | US funded, independent of Moscow | Telegram `currenttime` |

## Die Prüfung

Das Skript `lab/osint.mjs` läuft im Test-Labor auf GitHub Actions und prüft jeden Kandidaten: Gibt es den Kanal oder Feed, ist er aktiv (neuester Beitrag, Beiträge pro Tag), lässt er sich ohne Konto lesen, auch über den Proxy, und in welcher Schrift schreibt er. Das Ergebnis landet im Branch `lab-results` als `osint.md`.

## Verworfene Kandidaten

| Kandidat | Grund |
|---|---|
| Gouverneur Kursk (`Khinshtein`) | Kein öffentlicher Kanal |
| Iran International English, Times of Israel auf Telegram | Seit Jahren still oder ein Platzhalter-Kanal |
| Aurora Intel, BNO News, Faytuks News auf Telegram | Seit Monaten still |
| OSINT Updates, OSIntOps, Spectator Index | Seit Wochen bis Jahren still |
| warragex | 15 Abonnenten, nicht der Kanal von RAGE X |
| Visegrad24 | Kein öffentlicher Kanal |
| Disclose.tv | Zwei Beiträge am Tag, reißerisch |
| Al Jazeera English auf Telegram | Derselbe Inhalt wie der Al-Jazeera-Feed |
| OSINTdefender auf Bluesky | Offizieller Account ohne Beiträge, über Telegram aufgenommen |
| GeoConfirmed, OSINTtechnical, Intel Crab, Tyler Rogoway, Michael Kofman, Aircraft Spots | Still oder fast still |
| Scramble, ISW-Website, NATO, Bundeswehr, Janes, Aviation Week, FlugRevue | Kein funktionierender Feed |
| GDELT | Sperrt geteilte Server wie GitHub wegen zu vieler Anfragen, erneut am 05.10.2026 |
| NASA FIRMS | Braucht einen persönlichen Schlüssel, geplant |

## Kanäle

| Kanal | Zugriff | Intervall |
|---|---|---|
| Telegram | Über die Proxy-Route `/tg/{kanal}`, eine Minute im Edge-Cache. Nur Textbeiträge | Alle fünf Minuten |
| RSS | Über die Proxy-Route `/feed/{id}`. Fällt der Proxy aus, versucht INTEL den Feed direkt | Alle fünf Minuten |
| Bluesky | Direkt aus dem Browser. Nur eigene Beiträge, keine Antworten, keine Reposts | Alle fünf Minuten |
| USGS, EMSC, NWS | Direkt aus dem Browser, sie erlauben es | Alle fünf Minuten |
| GDACS, FAA | Über die Proxy-Route `/feed/{id}` | Alle fünf Minuten |

Meldungen auf Russisch, Ukrainisch und Hebräisch erscheinen in ihrer Sprache oder mit **DE** übersetzt. Orte und Ereigniswörter auf Russisch und Ukrainisch werden im Original erkannt, siehe [Abgleich](abgleich.md).

## Eine Quelle hinzufügen

1. Den Kandidaten in `lab/osint.mjs` aufnehmen und vom Labor prüfen lassen.
2. In `SOURCES` in `src/data/sources.ts` eintragen, mit Klasse, Region, Sprache, Trust und, wo es zählt, Perspektive.
3. Für einen RSS-Feed dieselbe ID und Adresse in `FEEDS` in `proxy/api/proxy.js` eintragen, für einen Telegram-Kanal seinen Namen in `TELEGRAM`. Ein Test schlägt fehl, wenn die Listen abweichen.
4. Diese Seite in beiden Sprachen aktualisieren.
