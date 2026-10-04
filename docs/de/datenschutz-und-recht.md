# Datenschutz und Recht

[English version](../en/privacy-and-legal.md) · [Übersicht](README.md)

## Datenschutz

VectorScope ist so gebaut, dass dein Standort nie auf einem Server gespeichert wird.

| Daten | Wo sie liegen | Wer sie erhält |
|---|---|---|
| Genauer Standort (GPS oder von dir festgelegt) | Arbeitsspeicher und `localStorage` auf deinem Gerät | Niemand |
| Standort für Abfragen | Auf zwei Nachkommastellen gerundet, etwa 1 km | adsb.lol und, falls genutzt, dein Proxy |
| Watchlist, Einstellungen | `localStorage` auf deinem Gerät | Niemand |
| Ausgewähltes Flugzeug | Arbeitsspeicher | adsb.lol (Route), planespotters.net (Foto) |
| Kartenausschnitt | Arbeitsspeicher | OpenFreeMap (Kacheln für den sichtbaren Bereich) |

* Kein Konto, keine Analyse, keine Cookies, keine Werbung.
* Das Repository ist öffentlich und enthält keine Koordinaten, Schlüssel oder persönlichen Einstellungen.
* Der optionale Proxy protokolliert und speichert selbst nichts. Vercel führt für die Inhaberin oder den Inhaber des Projekts die üblichen Zugriffsprotokolle.
* Das Löschen der Websitedaten von `michaeldobner.github.io` in Safari entfernt alles, was VectorScope gespeichert hat.

## Lizenzen und Quellenangaben

| Bestandteil | Lizenz | Quellenangabe in der App |
|---|---|---|
| Quellcode von VectorScope | MIT, siehe [LICENSE](../../LICENSE) | |
| Verkehrsdaten von adsb.lol | Open Database Licence 1.0 | Kartenvermerk und Einstellungen |
| Grundkarte OpenFreeMap, OpenMapTiles, OpenStreetMap | OpenMapTiles-Lizenz, ODbL für OSM-Daten | Kartenvermerk |
| Fotos der Flugzeuge | Urheberrecht der Fotografinnen und Fotografen, Bedingungen von planespotters.net | Name und Link an jedem Foto |
| MapLibre GL JS | BSD 3-Clause | |
| Inter, IBM Plex Mono | SIL Open Font Licence 1.1 | |

VectorScope speichert Daten von adsb.lol nicht dauerhaft und gibt sie nicht als Datenbank weiter. Ändert sich das, gilt für die abgeleitete Datenbank die Share-Alike-Regel der ODbL.

## Rechtliche Hinweise

Dies ist ein Überblick, keine Rechtsberatung.

* **Empfang von ADS-B:** VectorScope empfängt selbst keine Funksignale. Es nutzt Daten, die ein Gemeinschaftsnetz veröffentlicht. ADS-B wird unverschlüsselt für jeden empfangbar ausgesendet und von Flugverfolgungsdiensten verbreitet genutzt.
* **Nutzungsbedingungen:** adsb.lol, OpenFreeMap und planespotters.net werden über ihre öffentlichen Schnittstellen und im Rahmen ihrer Bedingungen genutzt. VectorScope liest keine Webseiten automatisiert aus. Flightradar24 und ADS-B Exchange werden nur verlinkt, nicht abgefragt.
* **Personenbezogene Daten:** Kennzeichen und Bewegungen privat gehaltener Flugzeuge können sich auf natürliche Personen beziehen (DSGVO). VectorScope zeigt nur, was die Datenquelle veröffentlicht, erstellt keine Bewegungsprofile von Personen, hält den Flugverlauf nur 30 Minuten im Arbeitsspeicher und zeigt keine Namen von Haltern.
* **PIA und LADD:** Flugzeuge in den Privatsphäre-Programmen der FAA tragen Datenbank-Kennzeichen. VectorScope gibt über sie keine zusätzlichen Informationen preis.
* **Militärflugzeuge:** VectorScope zeigt, was Flugzeuge öffentlich aussenden. Stationierungen oder Einsatzmuster werden nicht als Funktion abgeleitet.
* **Nichtkommerziell:** VectorScope ist ein persönliches Projekt. Eine kommerzielle Nutzung erfordert für die meisten Datenquellen eigene Lizenzen.
