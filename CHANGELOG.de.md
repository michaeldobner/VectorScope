# Changelog · VectorScope

Änderungen an der Sammlung als Ganzes: Aufbau, Startseite, Build, Prüfungen, Workflows. Änderungen an einem Modul stehen in dessen eigenem Changelog: [AIR](air/CHANGELOG.de.md), [gemeinsame Hülle](shared/CHANGELOG.de.md). [English](CHANGELOG.md)

Das Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), die Versionen folgen [Semantic Versioning](https://semver.org/lang/de/).

## Unveröffentlicht

### Neu
* Das Test-Labor prüft OSINT-Quellkandidaten (Bluesky, RSS, Mastodon, GDELT) auf Existenz, Aktivität und Browserzugriff (`lab/osint.mjs`).

## 0.3.0 (2026-10-05)

### Neu
* **VectorScope wird eine Sammlung.** Das Repository enthält unabhängige Module unter einem Dach. Die Flug-App wird zum Modul AIR in `air/`, der Intelligence-Feed INTEL folgt.
* **Startseite** unter der Hauptadresse: listet die Module, funktioniert ohne Build, lässt sich als eigene App installieren.
* **`modules.json`:** Modulverzeichnis und maßgebliche Quelle für Versionen.
* **`shared/`:** gemeinsame Hülle mit Farb-Tokens, Stilen der Startseite, Icons und Schriften, mit eigener Version.
* **Release-Skript** `npm run release -- <Ziel> <x.y.z>`: macht aus den unveröffentlichten Abschnitten der Changelogs eine Version und passt jede Stelle an, die sie nennt.
* **Prüfungen des Repositorys** in `tests/release.test.ts`: Versionen, Modulaufbau, Startseite, zweisprachige Dokumentation, Links, Schreibstil, Design-Tokens.
* **Rauchtest in Gerätegrößen** (`scripts/e2e.mjs`, Workflow `e2e.yml`): iPhone 15 hoch und quer, iPhone SE, iPad Pro 11 quer, mit Chromium und WebKit.
* Dokumentation der Sammlung auf Englisch und Deutsch: Architektur, Entwicklung, Deployment, Roadmap.

### Geändert
* Die Deployment-Dokumentation ist vom Modul zur Sammlung gewandert, weil GitHub Pages und der Proxy alle Module bedienen.
* Das Test-Labor öffnet AIR unter `/air/`.

## 0.2.3 und früher

Die Versionen bis 0.2.3 waren allein die Flug-App. Ihre Geschichte steht im [Changelog von AIR](air/CHANGELOG.de.md).
