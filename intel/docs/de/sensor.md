# Sensor und Karte

[English version](../en/sensor.md) · [Übersicht](README.md)

INTEL liest nicht nur, was andere melden. Es beobachtet die Live-Flugdaten selbst und meldet, was es sieht, als Quelle **VectorScope Sensor**. Die Logik steht in `src/data/sensor.ts`, die Karte in `src/ui/IntelMap.tsx`.

## Messsysteme

Neben dem eigenen Sensor liest INTEL Messsysteme und maschinenlesbare Warnungen (`src/data/physical.ts`):

| Quelle | Was | Filter |
|---|---|---|
| USGS, EMSC | Erdbeben weltweit | Ab Magnitude 5 |
| GDACS | Fluten, Zyklone, Erdbeben, Vulkane, Brände (UN und EU) | Orange und rote Warnungen |
| US National Weather Service | Tornado-, Hurrikan-, Tsunami- und ähnliche Warnungen | Schwere Extreme |
| FAA | US-Flughäfen | Ground Stops |

Ihre Meldungen tragen Koordinaten, sie erscheinen deshalb an der genauen Stelle auf der Karte und finden zu Meldungen über dasselbe Ereignis.

## Luftaktivität

Militärflugzeuge von `/v2/mil` bei adsb.lol werden alle zwei Minuten geprüft. Es zählen Flugzeuge dieser Rollen, erkannt an ihrer ICAO-Typkennung im Katalog von AIR:

| Rolle | Beispiele |
|---|---|
| Tanker | KC-135, KC-46, A330 MRTT |
| AWACS | E-3, E-7 |
| Aufklärung | RC-135, E-8, U-2 |
| Seefernaufklärung | P-8, P-3 |
| Drohne | RQ-4, MQ-9 |
| Bomber | B-52, B-1, B-2 |

Flugzeuge innerhalb von 350 km bilden eine Gruppe. Der Sensor meldet eine Gruppe, wenn sie

* mindestens drei Flugzeuge aus mindestens zwei Rollen hat, zum Beispiel Tanker, AWACS und Aufklärer, oder
* mindestens zwei Bomber, oder
* einen Bomber zusammen mit einem Tanker.

Die Meldung liest sich wie eine Überschrift: „Air activity over Baltic Sea: 1 AWACS, 1 tanker, 1 reconnaissance“, die Callsigns stehen im Text. Das Gebiet ist der Ort des Ortsverzeichnisses, dessen Fläche die Gruppe am zentralsten enthält. Jedes Gebiet und jede Kombination von Rollen ist eine Meldung pro Tag, eine lange Mission wird also nicht bei jeder Aktualisierung neu gemeldet.

## Notfälle

Jedes Flugzeug mit Squawk 7700 wird eine Meldung: „Emergency squawk 7700: British Airways BAW2PD, Boeing 777-200 over Switzerland“. Für rund 40 größere Airlines ersetzt der Airline-Name den ICAO-Code des Callsigns, weil Nachrichten die Airline nennen, nicht das Callsign. So finden ein Notfall und die erste Meldung darüber in einer Story zusammen.

## In den Stories

Sensor-Meldungen werden gebündelt wie jede andere Meldung. Sie haben eine eigene Stufe **Sensor**:

| Lage | Status |
|---|---|
| Nur der Sensor hat es gesehen | **Observed** |
| Sensor und Meldungen | Status der Meldungen, der Sensor erscheint als „1 sensor“ auf der Leiter |
| Sensor vor einer bestätigenden Quelle | Vorsprung, zum Beispiel „VectorScope Sensor 40 min ahead of BBC“ |

Der Sensor läuft in der App und im Probe-Sammler, seine Beobachtungen behalten ihren Zeitpunkt also auch, während die App geschlossen ist.

## Karte

Die Ansicht **Map** zeigt die Lage auf der Grundkarte von AIR:

| Element | Bedeutung |
|---|---|
| Kreis | Die Stories an einem Ort, an dem Ort, den die meisten ihrer Meldungen nennen. Größe nach Zahl der unabhängigen Quellen |
| Farbe des Kreises | Weiß bestätigt, blau reported oder emerging, grau ungeprüft, hellblau observed |
| Grauer Punkt | Militärflugzeug, das gerade sendet |
| Blauer Punkt mit Callsign | Von einer Story genanntes Flugzeug |
| Roter Punkt | Squawk 7700 |
| Gestrichelte Linie | Von einem genannten Flugzeug zum Ort seiner Story |

Ein Tipp auf einen Kreis zeigt seine Stories, ein Tipp auf einen Punkt öffnet das Flugzeug in AIR. Filter und Kacheln gelten auch für die Karte. Die Ort-Schaltfläche am Anfang der Filterleiste (◎ Name ✕) oder **All** hebt den Ort-Filter wieder auf.

In der Politik-Linse zeigt die Karte Hauptstädte statt Orte: einen Kreis für die Stories, die Akteure der Hauptstadt nennen, eine Linie zwischen zwei Hauptstädten, deren Akteure eine Story nennt (Washington und Moskau bei einem Telefonat, Brüssel und Moskau bei Sanktionen), dicker bei mehr Stories. Flugzeuge sind dort ausgeblendet. Ein Tipp auf eine Hauptstadt filtert die Stories nach ihren Akteuren.
