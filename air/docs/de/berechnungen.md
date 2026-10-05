# Berechnungen

[English version](../en/calculations.md) · [Übersicht](README.md)

VectorScope berechnet alles, was deinen Standort betrifft, auf dem Gerät. Der Code liegt in `src/geo/` und ist durch Unit-Tests abgedeckt (`src/geo/geo.test.ts`).

## Distanz und Peilung

| Größe | Verfahren |
|---|---|
| Distanz | Großkreisentfernung mit der Haversine-Formel, Erdradius 6.371.008,8 m |
| Peilung | Anfangspeilung auf dem Großkreis von dir zum Flugzeug, 0° = Norden, im Uhrzeigersinn |
| Himmelsrichtung | Peilung gerundet auf einen von 16 Punkten: N, NNE, NE, ENE, E und so weiter |
| Lokaler Versatz | Für den Closest Point of Approach wird die Flugzeugposition in Meter Ost und Nord in einer Tangentialebene um dich umgerechnet. Innerhalb von 400 km deutlich genauer als 0,1 % |

## Elevationswinkel

Der Elevationswinkel sagt, wie hoch über dem Horizont ein Flugzeug erscheint:

```
Höhe      = Flughöhe − eigene Höhe
Absenkung = Distanz² / (2 · Erdradius)        Erdkrümmung
Elevation = atan2(Höhe − Absenkung, Distanz)
```

Die Flughöhe ist die barometrische Höhe aus ADS-B, umgerechnet von Fuß in Meter. Die eigene Höhe wird in den Einstellungen festgelegt (Standard 120 m).

| Beispiel | Elevation |
|---|---|
| Verkehrsflugzeug in 10.700 m, 3 km entfernt | etwa 74°, ZENITH |
| Verkehrsflugzeug in 10.700 m, 10 km entfernt | etwa 47°, OVERHEAD |
| Verkehrsflugzeug in 10.700 m, 40 km entfernt | etwa 15° |
| Hubschrauber in 400 m, 8 km entfernt | etwa 2°, am Horizont |

## Was als „über mir“ gilt

VectorScope verwendet bewusst keinen festen Radius. Ein Verkehrsflugzeug in 11 km Höhe und 8 km Entfernung steht hoch am Himmel, ein Hubschrauber in 300 m Höhe und 8 km Entfernung steht am Horizont. Die Klassen beruhen deshalb auf dem Elevationswinkel:

| Klasse | Bedingung |
|---|---|
| **Zenith** | Elevation jetzt ≥ 70° |
| **Overhead** | Elevation jetzt ≥ 45° |
| **Approaching** | Nächster Punkt innerhalb der nächsten 600 s, mit einer Elevation an diesem Punkt von ≥ 45° |
| **Visible** | Elevation jetzt ≥ 15° und Entfernung ≤ 30 km |
| Keine | Alles andere und jedes Flugzeug am Boden |

Die Overhead-Liste ist so sortiert: Zenith (höchstes zuerst), Overhead, Approaching (frühestes zuerst), Visible.

## Closest Point of Approach

Für ein Flugzeug mit Geschwindigkeit über Grund `v` und Kurs `θ` am lokalen Versatz `r = (e, n)`:

```
Geschwindigkeit  v⃗ = (v · sin θ, v · cos θ)
t_cpa            = −(r · v⃗) / |v⃗|²         Sekunden bis zum nächsten Punkt
d_cpa            = | r + v⃗ · t_cpa |        horizontaler Abstand an diesem Punkt
Annäherungsrate  = (r · v⃗) / |r|            negativ = Annäherung
```

* `t_cpa < 0`: Der nächste Punkt liegt in der Vergangenheit, das Flugzeug entfernt sich.
* Die Höhe am nächsten Punkt berücksichtigt die aktuelle Steig- oder Sinkrate, begrenzt auf zehn Minuten.
* Die Peilung am nächsten Punkt ist die Richtung, in die du beim Vorbeiflug schauen musst.
* Die Rechnung geht von einem geraden Kurs aus. Flugzeuge unter 15 m/s erhalten keinen nächsten Punkt.

Der Inspector zeigt das als „Closest in 1:09 at 6,0 km · Look S at 58° elevation“. Listen und Inspector zählen jede Sekunde ab dem Zeitpunkt der letzten Berechnung herunter.

## Flüssige Bewegung

Positionen kommen alle paar Sekunden. Zwischen zwei Aktualisierungen bewegt VectorScope jedes Flugzeug mit seiner Geschwindigkeit entlang seines Kurses weiter (Koppelnavigation), höchstens 30 Sekunden voraus. Meldet ADS-B eine Kurvenrate, folgt die Bewegung einem Bogen. Die Karte wird zehnmal pro Sekunde neu gezeichnet.

## Vorausberechneter Kurs

Das ausgewählte Flugzeug erhält eine gestrichelte Linie für die nächsten drei Minuten, berechnet in Schritten von 15 Sekunden aus Geschwindigkeit, Kurs und Kurvenrate.

## Interest Score

Jedes Flugzeug erhält einen Wert von 0 bis 100, nach oben auf 100 begrenzt. Der Code liegt in `src/data/score.ts`, der Katalog in `src/data/catalog.ts`.

| Signal | Punkte | Quelle |
|---|---|---|
| Squawk 7500 (Entführung) oder 7700 (Notfall) | 60 | ADS-B |
| Squawk 7600 (Funkausfall) oder 7400 (Verbindungsverlust UAV) | 35 | ADS-B |
| Notfallstatus ohne besonderen Squawk | 50 | ADS-B |
| Militär | 25 | Datenbank-Kennzeichen von adsb.lol oder bekannte militärische Callsign-Gruppe |
| Rolle: Bomber | 30 | Typkatalog |
| Rolle: historisches Flugzeug | 25 | Typkatalog |
| Rolle: ISR, AEW&C, UAV, Übergroßfracht | 22 | Typkatalog oder Callsign-Gruppe |
| Rolle: Regierung oder VIP | 20 | Callsign-Gruppe oder Name des Betreibers |
| Rolle: Tanker | 18 | Typkatalog (A330 nur, wenn militärisch) |
| Rolle: Seeaufklärung, Kampfflugzeug, Forschung | 15 | Typkatalog oder Callsign-Gruppe |
| Rolle: strategischer Lufttransport | 10 | Typkatalog |
| Rolle: taktischer Lufttransport, sehr großes Flugzeug | 6 | Typkatalog |
| Seltener Typ | Seltenheit × 20, ab Seltenheit 0,5 | Typkatalog |
| Alter 50 Jahre oder mehr | 12 | Baujahr |
| Alter 35 bis 49 Jahre | 6 | Baujahr |
| Besonderes Flugzeug (nicht militärisch) | 15 | Datenbank-Kennzeichen von adsb.lol |
| Treffer der Watchlist | 30 | Deine Watchlist |

### Farbe auf der Karte

| Farbe | Regel |
|---|---|
| Rot | Squawk 7500, 7700 oder Notfallstatus |
| Amber | Squawk 7600 oder 7400 |
| Kobalt | Treffer der Watchlist |
| Ice Blue | Score ab 25 |
| Grau | Alles andere |

### Notable now

Notable now wendet denselben Score auf alle militärischen Flugzeuge und alle Flugzeuge mit Squawk 7700 an, die adsb.lol meldet, behält die im Umkreis von 2.500 km mit einem Score von mindestens 25 und zeigt die besten 25.

### Was der Score nicht wissen kann

Sonderlackierungen, die Zahl der Beobachter eines Flugzeugs oder eine ungewöhnliche Route sind nicht Teil von ADS-B. VectorScope bewertet nur, was sich aus den Daten ableiten lässt. Siehe [Datenquellen](datenquellen.md).
