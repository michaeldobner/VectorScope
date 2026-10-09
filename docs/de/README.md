# VectorScope · Dokumentation

[English version](../en/README.md) · [Zurück zum Projekt](../../README.de.md)

Diese Dokumentation beschreibt die VectorScope-Sammlung als Ganzes: wie das Repository aufgebaut ist, wie es veröffentlicht wird, wie man darin entwickelt und wohin es geht. Jedes Modul hat für seine Funktionen eine eigene Dokumentation.

## Sammlung

| Dokument | Inhalt | Zielgruppe |
|---|---|---|
| [Architektur](architektur.md) | Aufbau des Repositorys, Modulverzeichnis, gemeinsame Hülle, Build, Adressen, Bereiche der Service Worker, Speicher | Entwicklung |
| [Entwicklung](entwicklung.md) | Einrichtung, Skripte, Unit-Tests, Prüfungen des Repositorys, Rauchtest, Test-Labor, Releases, Modul hinzufügen, Konventionen | Entwicklung |
| [Deployment](deployment.md) | GitHub Pages, CORS-Proxy auf Vercel, Updates auf den Geräten, Fehlerbehebung | Betrieb |
| [Eigener Server](server.md) | App, Proxy, Sammler, Datenbank und Rohdaten-Archiv auf einem eigenen Server mit Coolify, Einrichtung, Umstieg, Betrieb | Betrieb |
| [Roadmap](roadmap.md) | Was als Nächstes kommt, was einen Server braucht, was zurückgestellt ist | Alle |

## Module

| Modul | Dokumentation |
|---|---|
| AIR · Airspace | [Bedienung](../../air/docs/de/bedienung.md), [Berechnungen](../../air/docs/de/berechnungen.md), [Datenquellen](../../air/docs/de/datenquellen.md), [Design](../../air/docs/de/design.md), [Architektur](../../air/docs/de/architektur.md), [Entwicklung](../../air/docs/de/entwicklung.md), [Datenschutz und Recht](../../air/docs/de/datenschutz-und-recht.md) |
| INTEL · Intelligence feed | [Bedienung](../../intel/docs/de/bedienung.md), [Quellen](../../intel/docs/de/quellen.md), [Abgleich](../../intel/docs/de/abgleich.md), [Architektur](../../intel/docs/de/architektur.md), [Datenschutz und Recht](../../intel/docs/de/datenschutz-und-recht.md) |
| [Gemeinsame Hülle](../../shared/README.de.md) | Tokens, Stile der Startseite, Icons, Schriften |

## VectorScope auf einen Blick

| | |
|---|---|
| Zweck | Persönliches Live-Lagebild, ein Modul pro Frage |
| Module | AIR live, INTEL live |
| Plattform | Progressive Web Apps für iPhone und iPad, laufen in jedem modernen Browser |
| Hosting | GitHub Pages, Proxy auf Vercel |
| Datenschutz | Kein Konto, keine Speicherung auf Servern, Standort nur auf dem Gerät |
| Adresse | https://michaeldobner.github.io/VectorScope/ |
| Version | 0.20.0 |
