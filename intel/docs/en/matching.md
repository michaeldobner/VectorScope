# Matching

[Deutsche Version](../de/abgleich.md) · [Overview](README.md)

INTEL reads headline and excerpt of every item, recognises callsigns, aircraft types and places, and compares them with the military aircraft that broadcast their position right now. Everything runs in the browser, in `src/data/entities.ts`, `src/data/places.ts` and `src/data/match.ts`.

## Recognition

### Callsigns

| Rule | Example |
|---|---|
| Prefix from the callsign catalogue of AIR, plus prefixes common in OSINT (ETHYL, DOOM, OLIVE, TOPCAT and others) | FORTE, RCH, HOMER, NATO, LAGR, GAF |
| Written in capitals, followed by one to four digits | `FORTE11`, `RCH419` |
| Prefixes of four letters or more may have a space, never with four digits | `FORTE 12` yes, `NATO 2026` no |
| Prefixes of three letters must be written together | `SAM 6` is not a callsign |

### Aircraft types

About 45 types with their usual spellings and names. Each carries the ICAO type designators that ADS-B reports for it.

| Recognised as | Spellings | ADS-B designators |
|---|---|---|
| RQ-4 | RQ-4, RQ4, Global Hawk | Q4 |
| KC-135 | KC-135, KC135R, KC 135, Stratotanker | K35R, K35E |
| E-3 | E-3, E-3A, AWACS, Sentry | E3TF, E3CF |
| RC-135 | RC-135, Rivet Joint, Cobra Ball, Combat Sent | R135 |
| A330 MRTT | A330 MRTT, MRTT, Voyager, Phénix | A332 |
| Eurofighter | Eurofighter, Typhoon FGR4 | EUFI |

Russian and Iranian types (Tu-95, Su-34, A-50, Shahed) are recognised and shown, but they do not broadcast ADS-B and are never matched. Ordinary words are protected: recognition is case sensitive, so a "tornado warning" is not a Tornado, "Typhoon" counts as the Eurofighter only as "Typhoon FGR4", and "Atlas" is not the A400M.

### Russian and Ukrainian

Reports in Russian and Ukrainian are matched in the original. Places are known with their grammatical endings (Воронеж, Воронеже, Воронежской), event words are mapped to English by their stem (взрыв to explosion, беспилотник and БПЛА to drone, пожар to fire), so a Russian incident report and an English article meet in one story.

### Places

About 150 places in English, German and Russian with a representative point and an area radius: seas and regions (Baltic Sea, Ostsee, Black Sea, Schwarzes Meer, GIUK Gap), countries, cities and air bases (Ramstein, Geilenkirchen, Rzeszów, Sigonella, Al Udeid). Names are matched on word boundaries, so "Iranian" counts as Iran but not twice. When a text names several places, the most specific one comes first.

## Live match

The live picture comes from `/v2/mil` of adsb.lol through the proxy: every aircraft that the database marks as military and that broadcasts right now, worldwide, refreshed every two minutes.

| Match | Condition | Shown as |
|---|---|---|
| Callsign | A recognised callsign equals the callsign of a live aircraft | Blue LIVE row, "named in post" |
| Type near place | A recognised type matches the designator of a live aircraft, and the aircraft is within the radius of a named place plus 150 km | Blue LIVE row with distance and place |
| Type | Type matches, no named place nearby | Grey line "Airborne now: 2 × C-17" |

Only items of the last 48 hours are matched. An article from last week says nothing about who is flying now.

## Limits

* Only aircraft that broadcast ADS-B and are marked as military are known. Many military flights fly without transponder or with a hidden identity.
* A match is a hint, not a confirmation. A KC-135 near the Baltic Sea is not necessarily the KC-135 of the article.
* Recognition reads headline and excerpt, not the full article.
* Callsigns are reused daily. FORTE11 today is not FORTE11 of last week, which is why old items are not matched.
