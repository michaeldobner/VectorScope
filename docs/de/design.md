# Design

[English version](../en/design.md) · [Übersicht](README.md)

## Design-Briefing

> Serious, calm, data-dense aviation intelligence interface.
> Deep graphite surfaces, restrained ice-blue accents, precise typography, subtle geospatial visualization and colour used exclusively to communicate meaning.
> No gaming aesthetics. No cyberpunk. No military cosplay. No unnecessary decoration.
> It should feel like a professional intelligence instrument that happens to be beautiful.

Visuelle DNA: **`#0E0E10` + `#F5F5F7` + `#55BDEB`**: neutrales Graphit wie Apple Maps, weiße Schrift und Flugzeuge, Ice Blue als einziger Akzent. Gewählt am 04.10.2026 nach dem Vergleich dreier Farbschemata auf der Live-Karte. `?theme=ice` und `?theme=night` bleiben zum Vergleich verfügbar.

VectorScope bewegt sich zwischen drei Welten: Apple für Ruhe und Präzision, professionelle Intelligence-Terminals für Informationsdichte und moderne Avionik-Displays für die funktionale Sprache. Bewusst vermieden werden grünes Militärradar, Cyberpunk-Neon, schwarzer Hacker-Look, bunte Flugtracker-Symbole und schwere Glaseffekte. Dark first: Karte und Signale wirken auf dunklem Grund besser, und das Produkt liest sich wie ein Lagebild.

<img src="../images/design-target-ipad.png" width="720" alt="Design-Zielbild für iPad quer">

*Zielbild, das die Richtung festgelegt hat. Die Umsetzung folgt ihm, mit den unter [Entscheidungen](#entscheidungen) genannten Korrekturen.*

## Farb-Tokens

| Rolle | Name | Hex |
|---|---|---|
| Haupthintergrund | Graphite | `#0E0E10` |
| Panels | Graphite Panel | `#1C1C1E` |
| Erhöhte Panels | Graphite Raised | `#2C2C2E` |
| Linien und Rahmen | Graphite Line | `#38383A` |
| Haupttext | Off White | `#F5F5F7` |
| Sekundärtext | Grau | `#A1A1A6` |
| Tertiärtext | | `#6E6E73` |
| Primärakzent | Ice Blue | `#55BDEB` |
| Ausgewählt, aktiv | Bright Ice | `#7DD3FC` |
| Watchlist | Cobalt | `#4C7DFF` |
| Warnung, Ereignis | Amber | `#FF9F0A` |
| Kritisch, Notfall | Signal Red | `#FF453A` |

Die Tokens liegen in `src/styles.css` als CSS-Variablen und in `src/ui/tokens.ts` für die Karte. Blau dient nur der Information und Interaktion, nie der Dekoration.

## Informationsebenen

1. **Weiß:** was du jetzt wissen musst, zum Beispiel das Callsign.
2. **Grau:** Metadaten, zum Beispiel Typ und Betreiber.
3. **Blau:** Interaktion und Relevanz, zum Beispiel der Score.
4. **Amber und Rot:** nur echte Abweichungen, zum Beispiel Squawk 7700.

## Flugzeuge

| Bedeutung | Farbe | Zweiter Kanal |
|---|---|---|
| Normal | `#E5E5EA` | Kleines Symbol, Beschriftung erst ab Zoomstufe 9,5 |
| Interessant | Ice Blue | Größeres Symbol, Beschriftung mit Höhe, Spur der letzten fünf Minuten |
| Watchlist | Cobalt | Feiner Ring um das Symbol |
| Ereignis | Amber | Beschriftung |
| Notfall | Signal Red | Rote Beschriftung |
| Ausgewählt | Bright Ice | Lichtkranz, durchgezogene Spur für fünf Minuten, davor gepunktet, gestrichelte Vorausberechnung für drei Minuten |

Jede Bedeutung nutzt Farbe **und** einen zweiten Kanal (Größe, Ring, Beschriftung), damit sie auch im Sonnenlicht und bei Farbsehschwäche lesbar bleibt. Das Flugzeugsymbol wird auf einem Canvas gezeichnet und als SDF-Bild registriert, damit MapLibre es je Flugzeug einfärben kann. Hubschrauber (Kategorie A7) haben ein eigenes Symbol.

## Typografie

| Verwendung | Schrift |
|---|---|
| Oberfläche, Überschriften, Text | Inter 400, 500, 600 |
| Callsigns, Codes, Telemetrie, Zahlen | IBM Plex Mono 400, 500 |
| Kartenbeschriftungen | Noto Sans (vom Schriftserver der Karte) |

Überall tabellarische Ziffern, damit Zahlen beim Aktualisieren nicht springen. Abschnittstitel in kleinen Versalien mit weiter Laufweite. Beide Schriften werden mit der App ausgeliefert, es gibt keine Anfragen an Google Fonts.

## Karte

Ein Air Navigation Display, keine Straßenkarte.

| Ebene | Stil |
|---|---|
| Land | `#1D1D20` |
| Wasser | `#13202C`, leicht bläulich |
| Bebaute Flächen | Ab Zoomstufe 8 kaum sichtbar |
| Staatsgrenzen | Feine Linie `#55555A` |
| Landesgrenzen | Gestrichelt, sehr schwach, ab Zoomstufe 5 |
| Autobahnen | Erst ab Zoomstufe 9 |
| Flughäfen | Ring mit ICAO-Code ab Zoomstufe 6 (international) oder 8,5 (alle), Flugplatzfläche und Pisten ab Zoomstufe 8 bis 9 |
| Ländernamen | Bis Zoomstufe 6, kleine Versalien, dunkel |
| Städtenamen | Zurückhaltend, kleinere Orte ab Zoomstufe 9 |
| Distanzringe | Ice Blue, äußerer Ring 45 % Deckkraft, innerer Ring bei halbem Radius 22 %, Beschriftung „50 KM“ |
| Dein Standort | `◎` Ring mit Punkt in Ice Blue |

Der Stil ist in `src/map/style.ts` definiert. Die Karte dreht und neigt sich nicht.

## Layouts

| | Hochformat | Querformat |
|---|---|---|
| **iPhone** | Karte im Vollbild, Bottom Sheet mit drei Höhen (Vorschau, halb, voll), Inspector im Sheet | Karte plus Seitenpanel, der Inspector ersetzt die Listen |
| **iPad** | Karte oben (56 %), darunter Listen und Inspector nebeneinander | Karte, rechte Spalte (Inspector oder Airspace now und Overhead), Leiste mit Notable now, Interesting nearby und Watchlist |

Das Layout wird aus verfügbarer Breite und Höhe gewählt (`src/ui/useLayout.ts`), nicht aus dem Gerätetyp. Safe Areas für Notch, Dynamic Island und Home-Indikator werden über `env(safe-area-inset-*)` berücksichtigt. Bedienelemente sind mindestens 30 bis 36 Punkt hoch.

<img src="../images/ipad-landscape.jpg" width="720" alt="iPad quer">

## Bewegung

* Flugzeuge gleiten zwischen den Aktualisierungen, zehnmal pro Sekunde neu gezeichnet.
* Das Bottom Sheet bewegt sich mit weicher Kurve (280 ms) und folgt beim Ziehen dem Finger.
* Hinweise gleiten kurz herein und verschwinden nach acht Sekunden.
* Der LIVE-Punkt pulsiert langsam. Sonst blinkt nichts.

## Entscheidungen

Bewusste Korrekturen gegenüber dem Zielbild:

| Zielbild | Umsetzung | Grund |
|---|---|---|
| Normale Flugzeuge `#AAB4BE` | `#7F8A96` | In der Helligkeit zu nah an Ice Blue, besonders bei kleinen Symbolen und im Sonnenlicht |
| Viele orange Flugzeuge auf der Karte | Amber nur für echte Ereignisse | Amber verliert seine Bedeutung, wenn ein Drittel des Himmels orange ist |
| Karte zeigt bei 50 km halb Deutschland | Karte rahmt den gewählten Radius ein | Die Kernfrage ist, was über dir ist |
| Gemischte deutsche und englische Beschriftung | Englische Oberfläche, deutsches Zahlenformat | Die Sprache der Luftfahrt ist Englisch |
| Route mit Abflug- und Ankunftszeit für eine C-17 | „Route not published“ | Militärflüge veröffentlichen keine Routen |
| Chips „Viele Beobachter“, „Ungewöhnliche Route“ | Nicht angezeigt | Keine Datenquelle liefert sie |
| Panel Trending | Notable now | Keine öffentliche API liefert „Most Tracked“-Listen |
