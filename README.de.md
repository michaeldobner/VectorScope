<div align="center">

# ◇ VectorScope

**Ein persönliches Live-Lagebild für iPhone und iPad.**

Eine Sammlung ruhiger, präziser Module unter einem Dach. Jedes beantwortet eine Frage zu dem, was um dich herum passiert, in einer gemeinsamen Designsprache: tiefes Graphit, Ice Blue, Farbe nur dort, wo sie etwas bedeutet.

<h3><a href="https://michaeldobner.github.io/VectorScope/">michaeldobner.github.io/VectorScope</a></h3>

[**▶ VectorScope öffnen**](https://michaeldobner.github.io/VectorScope/) · [English](README.md) · [Dokumentation](docs/de/README.md) · [Changelog](CHANGELOG.de.md)

[![Tests](https://github.com/michaeldobner/VectorScope/actions/workflows/tests.yml/badge.svg)](https://github.com/michaeldobner/VectorScope/actions/workflows/tests.yml)
[![E2E](https://github.com/michaeldobner/VectorScope/actions/workflows/e2e.yml/badge.svg)](https://github.com/michaeldobner/VectorScope/actions/workflows/e2e.yml)
[![Deploy](https://github.com/michaeldobner/VectorScope/actions/workflows/deploy.yml/badge.svg)](https://github.com/michaeldobner/VectorScope/actions/workflows/deploy.yml)

<img src="air/docs/images/iphone-radar.jpg" width="230" alt="Modul AIR: Radaransicht auf dem iPhone mit Distanzringen um den eigenen Standort">&nbsp;&nbsp;
<img src="air/docs/images/iphone-overhead.jpg" width="230" alt="Modul AIR: Overhead-Liste mit Countdown und Blickrichtung">&nbsp;&nbsp;
<img src="air/docs/images/iphone-score.jpg" width="230" alt="Modul AIR: Aircraft Inspector mit Interest Score und Begründungen">

</div>

## Module

| Modul | Frage | Status | Version |
|---|---|---|---|
| [**AIR**](air/README.de.md) · Airspace | Was fliegt gerade über mir, was kommt als nächstes, was ist einen Blick wert? | Live · [öffnen](https://michaeldobner.github.io/VectorScope/air/) | 0.3.1 |
| [**INTEL**](intel/README.de.md) · Intelligence feed | Was melden geprüfte OSINT-Quellen und Fachmedien, und welches Flugzeug in der Luft betrifft es? | Live · [öffnen](https://michaeldobner.github.io/VectorScope/intel/) | 0.5.0 |

## Warum VectorScope

Flugtracker und Nachrichten-Apps zeigen alles, bunt und mit Werbung. VectorScope macht das Gegenteil: Jedes Modul beantwortet eine Frage sehr gut, und alle Module sehen gleich aus und verhalten sich gleich. Keine Werbung, kein Konto, kein Tracking. Alles läuft als Web-App auf GitHub Pages, persönliche Daten bleiben auf deinem Gerät.

## Installation auf iPhone oder iPad

1. **https://michaeldobner.github.io/VectorScope/** in **Safari** öffnen.
2. **Teilen** antippen, dann **Zum Home-Bildschirm**.
3. VectorScope vom Home-Bildschirm aus öffnen und ein Modul wählen.

Um ein Modul direkt zu öffnen, seine eigene Adresse zum Home-Bildschirm hinzufügen: **https://michaeldobner.github.io/VectorScope/air/** oder **https://michaeldobner.github.io/VectorScope/intel/**. Safari und die installierte App haben getrennte Speicher, den Standort deshalb in der installierten App festlegen.

## Aufbau des Repositorys

```
VectorScope/
├─ index.html              Startseite: Liste der Module
├─ modules.json            Modulverzeichnis, maßgebliche Quelle für Versionen
├─ shared/                 gemeinsame Hülle: Tokens, Stile der Startseite, Icons, Schriften
├─ air/                    Modul AIR: Live-Luftlagebild
├─ intel/                  Modul INTEL: geprüfter OSINT-Feed mit Live-Abgleich
├─ proxy/                  CORS-Proxy auf Vercel, für alle Module
├─ lab/                    Test-Labor mit echtem Internet
├─ scripts/                Build, lokaler Server, Rauchtest, Release
├─ tests/                  Prüfungen des Repositorys
├─ docs/                   Dokumentation der Sammlung (en, de)
└─ .github/workflows/      Tests, E2E, Deploy, Labor
```

Einzelheiten: [Architektur](docs/de/architektur.md).

## Dokumentation

| Dokument | Inhalt |
|---|---|
| [Architektur](docs/de/architektur.md) | Aufbau des Repositorys, Modulverzeichnis, gemeinsame Hülle, Build, Service Worker |
| [Entwicklung](docs/de/entwicklung.md) | Einrichtung, Skripte, Prüfungen, Rauchtest, Test-Labor, Releases, Modul hinzufügen |
| [Deployment](docs/de/deployment.md) | GitHub Pages, CORS-Proxy auf Vercel, Fehlerbehebung |
| [Roadmap](docs/de/roadmap.md) | Nächste Schritte, Ideen mit Serverbedarf, zurückgestellte Ideen |
| [Modul AIR](air/docs/de/README.md) | Bedienung, Berechnungen, Datenquellen, Design, Architektur |
| [Modul INTEL](intel/docs/de/README.md) | Bedienung, Quellen, Abgleich, Architektur |
| [Gemeinsame Hülle](shared/README.de.md) | Tokens und Startseite |

## Schnellstart für Entwickler

```bash
npm install
npm run dev        # Modul AIR unter http://localhost:5173/
npm run dev:intel  # Modul INTEL unter http://localhost:5173/
npm test           # Unit-Tests aller Module und Prüfungen des Repositorys
npm run build      # Startseite und alle Module nach dist/
npm run preview    # dist/ wie GitHub Pages unter http://localhost:4173/
```

Jeder Push auf `main` wird getestet und auf GitHub Pages veröffentlicht.

## Daten und Quellen

Verkehrsdaten © Mitwirkende von [adsb.lol](https://adsb.lol), lizenziert unter ODbL 1.0. Routen und Flugzeugdaten von [adsbdb](https://www.adsbdb.com) und [hexdb.io](https://hexdb.io). Karte © [OpenFreeMap](https://openfreemap.org), © OpenMapTiles, © OpenStreetMap-Mitwirkende. Flugzeugfotos © die Fotografinnen und Fotografen von [planespotters.net](https://www.planespotters.net). Überschriften und Auszüge in INTEL © ihre Herausgeber, mit Link zum Original. VectorScope ist ein persönliches, nichtkommerzielles Projekt und steht in keiner Verbindung zu diesen Diensten.

## Version

Aktuelle Version: **0.8.0**. Siehe [Changelog](CHANGELOG.de.md).

Erstellt von Michael Dobner. Lizenziert unter der [MIT-Lizenz](LICENSE).
