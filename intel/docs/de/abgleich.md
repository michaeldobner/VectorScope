# Abgleich

[English version](../en/matching.md) · [Übersicht](README.md)

INTEL liest Überschrift und Auszug jedes Eintrags, erkennt Callsigns, Flugzeugtypen und Orte und vergleicht sie mit den Militärflugzeugen, die gerade ihre Position senden. Alles läuft im Browser, in `src/data/entities.ts`, `src/data/places.ts` und `src/data/match.ts`.

## Erkennung

### Callsigns

| Regel | Beispiel |
|---|---|
| Präfix aus dem Callsign-Katalog von AIR, dazu Präfixe, die im OSINT-Umfeld üblich sind (ETHYL, DOOM, OLIVE, TOPCAT und weitere) | FORTE, RCH, HOMER, NATO, LAGR, GAF |
| In Großbuchstaben geschrieben, gefolgt von einer bis vier Ziffern | `FORTE11`, `RCH419` |
| Präfixe ab vier Buchstaben dürfen ein Leerzeichen haben, nie mit vier Ziffern | `FORTE 12` ja, `NATO 2026` nein |
| Präfixe mit drei Buchstaben müssen zusammen geschrieben sein | `SAM 6` ist kein Callsign |

### Flugzeugtypen

Rund 45 Typen mit ihren üblichen Schreibweisen und Namen. Jeder trägt die ICAO-Typkennungen, die ADS-B für ihn meldet.

| Erkannt als | Schreibweisen | ADS-B-Kennungen |
|---|---|---|
| RQ-4 | RQ-4, RQ4, Global Hawk | Q4 |
| KC-135 | KC-135, KC135R, KC 135, Stratotanker | K35R, K35E |
| E-3 | E-3, E-3A, AWACS, Sentry | E3TF, E3CF |
| RC-135 | RC-135, Rivet Joint, Cobra Ball, Combat Sent | R135 |
| A330 MRTT | A330 MRTT, MRTT, Voyager, Phénix | A332 |
| Eurofighter | Eurofighter, Typhoon FGR4 | EUFI |

Russische und iranische Typen (Tu-95, Su-34, A-50, Shahed) werden erkannt und angezeigt, senden aber kein ADS-B und werden nie abgeglichen. Gewöhnliche Wörter sind geschützt: Die Erkennung unterscheidet Groß- und Kleinschreibung, eine „tornado warning“ ist also kein Tornado, „Typhoon“ zählt nur als „Typhoon FGR4“ als Eurofighter, und „Atlas“ ist nicht der A400M.

### Russisch und Ukrainisch

Meldungen auf Russisch und Ukrainisch werden im Original abgeglichen. Orte sind mit ihren grammatischen Endungen bekannt (Воронеж, Воронеже, Воронежской), Ereigniswörter werden über ihren Stamm auf Englisch abgebildet (взрыв zu explosion, беспилотник und БПЛА zu drone, пожар zu fire). So finden eine russische Incident-Meldung und ein englischer Artikel in einer Story zusammen.

### Orte

Rund 150 Orte auf Englisch, Deutsch und Russisch mit einem repräsentativen Punkt und einem Gebietsradius: Meere und Regionen (Baltic Sea, Ostsee, Black Sea, Schwarzes Meer, GIUK Gap), Länder, Städte und Flugplätze (Ramstein, Geilenkirchen, Rzeszów, Sigonella, Al Udeid). Namen werden an Wortgrenzen erkannt, „Iranian“ zählt also als Iran, aber nicht doppelt. Nennt ein Text mehrere Orte, steht der genaueste vorn.

## Live-Abgleich

Das Live-Bild kommt von `/v2/mil` bei adsb.lol über den Proxy: jedes Flugzeug, das die Datenbank als militärisch kennzeichnet und das gerade sendet, weltweit, alle zwei Minuten neu.

| Treffer | Bedingung | Darstellung |
|---|---|---|
| Callsign | Ein erkanntes Callsign entspricht dem Callsign eines Live-Flugzeugs | Blaue LIVE-Zeile, „named in post“ |
| Typ nahe Ort | Ein erkannter Typ passt zur Kennung eines Live-Flugzeugs, und das Flugzeug ist im Radius eines genannten Orts plus 150 km | Blaue LIVE-Zeile mit Entfernung und Ort |
| Typ | Typ passt, kein genannter Ort in der Nähe | Graue Zeile „Airborne now: 2 × C-17“ |

Abgeglichen werden nur Einträge der letzten 48 Stunden. Ein Artikel von letzter Woche sagt nichts darüber, wer jetzt fliegt.

## Grenzen

* Bekannt sind nur Flugzeuge, die ADS-B senden und als militärisch gekennzeichnet sind. Viele Militärflüge fliegen ohne Transponder oder mit verborgener Identität.
* Ein Treffer ist ein Hinweis, keine Bestätigung. Eine KC-135 nahe der Ostsee ist nicht zwingend die KC-135 aus dem Artikel.
* Die Erkennung liest Überschrift und Auszug, nicht den ganzen Artikel.
* Callsigns werden täglich neu vergeben. FORTE11 heute ist nicht FORTE11 von letzter Woche, deshalb werden alte Einträge nicht abgeglichen.
