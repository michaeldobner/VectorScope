# Datenquellen

[English version](../en/data-sources.md) · [Übersicht](README.md)

VectorScope betreibt keinen eigenen Empfänger und keine eigene Datenbank. Alle Daten stammen aus öffentlichen, kostenlosen Diensten und werden auf dem Gerät verarbeitet.

## Übersicht

| Daten | Quelle | Aktualisierung | Lizenz |
|---|---|---|---|
| Live-Positionen um dich | adsb.lol `/v2/point` | alle 5 s (einstellbar 3 bis 20 s) | ODbL 1.0 |
| Militärverkehr weltweit | adsb.lol `/v2/mil` | alle 60 s | ODbL 1.0 |
| Notfälle weltweit | adsb.lol `/v2/sqk/7700` | alle 60 s | ODbL 1.0 |
| Suche | adsb.lol `/v2/callsign`, `/v2/reg`, `/v2/hex` | bei Bedarf | ODbL 1.0 |
| Start und Ziel | adsb.lol `/api/0/routeset` | beim Öffnen des Inspectors, 30 min zwischengespeichert | ODbL 1.0 |
| Foto des Flugzeugs | Öffentliche Foto-API von planespotters.net | beim Öffnen des Inspectors | Nennung und Link der Fotografin oder des Fotografen Pflicht |
| Grundkarte | Vektorkacheln und Schriften von OpenFreeMap | beim Verschieben und Zoomen | OpenMapTiles, OpenStreetMap (ODbL) |
| Rollen, Seltenheit, Callsign-Gruppen | Kuratierter Katalog in `src/data/catalog.ts` | mit jeder Version | Teil von VectorScope |

## Warum adsb.lol

adsb.lol ist ein Gemeinschaftsnetz von ADS-B-Empfängern. Es ist kostenlos, braucht keinen Schlüssel, filtert keine Militärflugzeuge und veröffentlicht seine Daten unter der Open Database Licence. Weitere Dienste wurden in der Projektphase geprüft:

| Dienst | Grund, warum er nicht die Hauptquelle ist |
|---|---|
| airplanes.live | API seit 2026 nur noch von IP-Adressen eigener Empfänger erreichbar |
| adsb.fi | Nur private Nutzung, keine CORS-Header |
| OpenSky Network | Betrieb in einem Live-Produkt erfordert eine schriftliche Vereinbarung, 5 bis 10 s Verzögerung |
| ADS-B Exchange | 10.000 Anfragen pro Monat im kleinsten Tarif |
| Flightradar24 API | Kostenpflichtig, gefiltert, kein Endpunkt für „Most Tracked“ |
| FlightAware AeroAPI | Abrechnung pro Anfrage, Personal-Tarif nur privat |

## adsb.lol im Detail

### Anfragen

| Anfrage | Zweck |
|---|---|
| `GET /v2/point/{lat}/{lon}/{radius_nm}` | Flugzeuge in einem Radius in Seemeilen, höchstens 250 |
| `GET /v2/mil` | Alle als militärisch gekennzeichneten Flugzeuge |
| `GET /v2/sqk/{squawk}` | Alle Flugzeuge mit einem bestimmten Squawk |
| `GET /v2/callsign/{cs}`, `/v2/reg/{reg}`, `/v2/hex/{hex}` | Suche |
| `POST /api/0/routeset` | Plausible Routen für bis zu 100 Callsigns, Inhalt `{"planes":[{"callsign","lat","lng"}]}` |

VectorScope fragt einen Radius ab, der 25 % größer ist als der angezeigte, plus 2 km. So sind anfliegende Flugzeuge früh bekannt. Die Koordinaten werden vor jeder Anfrage auf zwei Nachkommastellen gerundet (etwa 1 km).

### Verwendete Felder

| readsb-Feld | Bedeutung | In VectorScope |
|---|---|---|
| `hex` | 24-Bit-ICAO-Adresse | Identität, Schlüssel |
| `flight` | Callsign | Beschriftung, Watchlist, Routenabfrage |
| `r` | Kennzeichen | Inspector, Watchlist |
| `t`, `desc` | ICAO-Typcode und Beschreibung | Typ, Rolle, Seltenheit |
| `ownOp`, `year` | Betreiber, Baujahr | Inspector, Alter |
| `dbFlags` | 1 Militär, 2 interessant, 4 PIA, 8 LADD | Score |
| `category` | ADS-B-Kategorie, A7 = Drehflügler | Hubschraubersymbol |
| `lat`, `lon`, `seen_pos` | Position und ihr Alter | Karte, Geometrie |
| `alt_baro`, `alt_geom` | Barometrische und geometrische Höhe in Fuß, am Boden `"ground"` | Höhe, Elevation |
| `gs`, `track`, `track_rate` | Geschwindigkeit über Grund in Knoten, Kurs, Kurvenrate | Bewegung, nächster Punkt |
| `baro_rate`, `geom_rate` | Steig- oder Sinkrate in ft/min | Vertikalgeschwindigkeit |
| `squawk`, `emergency` | Transpondercode, Notfallstatus | Hinweise, Farbe |
| `type` | Herkunft der Meldung: adsb, mlat, tisb | Herkunft der Position |

Positionen, die älter als 60 Sekunden sind, werden verworfen.

### Grenzen und Zugang

adsb.lol nutzt dynamische Anfragegrenzen und kündigt an, künftig API-Schlüssel für Empfängerbetreiber zu verlangen. VectorScope reagiert auf HTTP 429, indem es das Intervall verdoppelt, bis zum Zwölffachen des Grundwerts, und fragt nur bei sichtbarer App ab. Die `/v2`-Endpunkte senden keine CORS-Header, Browser können direkte Anfragen deshalb blockieren. Dann wird der [Proxy](../../../docs/de/deployment.md#cors-proxy-auf-vercel) benötigt.

## Was ADS-B liefert und was nicht

| Direkt aus ADS-B | Aus Datenbanken ergänzt | Nicht verfügbar |
|---|---|---|
| ICAO-Adresse, Callsign, Position, Höhe, Geschwindigkeit über Grund, Kurs, Steig- und Sinkrate, Squawk, Notfallstatus, Kategorie | Kennzeichen, Typ, Betreiber, Baujahr, Kennzeichen für Militär und Privatsphäre, plausible Route | Flugnummer bei Militärflügen, Routen militärischer und privater Flüge, Sonderlackierungen, Zahl der Beobachter, Flugzeuge ohne Transponder oder mit abgeschaltetem ADS-B |

Routen sind Schätzungen: adsb.lol gleicht das Callsign mit einer Routendatenbank ab und prüft, ob die aktuelle Position dazu passt. VectorScope zeigt nur Routen, die als plausibel markiert sind, und fragt für Militärflugzeuge keine Routen ab.

## Fotos

Die öffentliche API von planespotters.net liefert zu einer ICAO-Adresse ein Foto, sofern vorhanden. VectorScope zeigt das große Vorschaubild mit dem Namen der Fotografin oder des Fotografen und verlinkt auf die Fotoseite, wie es die Nutzungsbedingungen verlangen.

## Grundkarte

OpenFreeMap liefert Vektorkacheln im OpenMapTiles-Schema ohne Schlüssel und ohne Anfragelimit. VectorScope verwendet einen eigenen Stil (siehe [Design](design.md#karte)) und nur diese Ebenen: Wasser, Flüsse, bebaute Flächen, Grenzen, Autobahnen, Flugplätze, Pisten und Ortsnamen. Ist OpenFreeMap nicht erreichbar, bleibt die Karte dunkel, Flugzeuge, Ringe und dein Standort werden aber weiterhin gezeichnet.

## Kuratierter Katalog

`src/data/catalog.ts` enthält öffentliche, allgemein bekannte Angaben:

* 61 ICAO-Typcodes mit Rolle und Seltenheit (0 bis 1), zum Beispiel `K35R` Tanker, `E3TF` AEW&C, `Q4` UAV, `B52` Bomber, `A124` Übergroßfracht, `JU52` historisch,
* 37 militärische, staatliche und Forschungs-Callsign-Gruppen, zum Beispiel `FORTE` (RQ-4), `RCH` (Air Mobility Command), `NATO` (AEW&C), `GAF` (Luftwaffe), `SAM` (Special Air Mission),
* Namensmuster von Betreibern staatlicher Transporte.

Wie man ihn erweitert: [Entwicklung](entwicklung.md#katalog-erweitern).
