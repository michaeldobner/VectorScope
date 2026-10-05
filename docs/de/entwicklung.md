# Entwicklung der Sammlung

[English version](../en/development.md) · [Übersicht](README.md)

Diese Seite beschreibt, was für jedes Modul gilt: Einrichtung, Skripte, Prüfungen, Releases und Konventionen. Modulspezifisches (URL-Parameter, Katalog, Screenshots) steht in der Dokumentation des jeweiligen Moduls, für AIR in [Entwicklung von AIR](../../air/docs/de/entwicklung.md).

## Voraussetzungen

* Node.js 22 oder neuer, npm 10
* Für Tests auf Geräten: iPhone oder iPad mit Safari

## Einrichtung

```bash
npm install
npm run dev        # Modul AIR unter http://localhost:5173/
```

## Skripte

| Befehl | Zweck |
|---|---|
| `npm run dev` | Entwicklungsserver für AIR mit Hot Reload |
| `npm run typecheck` | TypeScript-Prüfung aller Module |
| `npm test` | Unit-Tests aller Module und Prüfungen des Repositorys |
| `npm run build` | Typprüfung, alle Module, Startseite und gemeinsame Dateien nach `dist/` |
| `npm run preview` | Liefert `dist/` wie GitHub Pages unter `http://localhost:4173/` aus |
| `npm run e2e` | Rauchtest in Gerätegrößen gegen `npm run preview` |
| `npm run release -- <Ziel> <x.y.z>` | Ein Modul, `shared` oder `collection` veröffentlichen |

## Prüfungen

### Unit-Tests

Jedes Modul hält seine Tests neben dem Code (`air/src/**/*.test.ts`). `vitest.config.ts` sammelt sie zusammen mit den Prüfungen des Repositorys.

### Prüfungen des Repositorys

`tests/release.test.ts` hält die Sammlung stimmig. Die Prüfung schlägt fehl, wenn:

| Prüfung | Schlägt fehl, wenn |
|---|---|
| Versionen | Eine README, eine Dokumentationsübersicht, die Startseite, `package.json` oder ein Changelog eine andere Version nennt als `modules.json` |
| Changelogs | Der englische und der deutsche Changelog eines Teils unterschiedliche Versionen auflisten |
| Modulaufbau | Einem Live-Modul `index.html`, Build-Konfiguration, Manifest, Service Worker, README oder Changelog in beiden Sprachen oder die Dokumentation in beiden Sprachen fehlt |
| Service Worker | Der Speicher eines Moduls nicht `vectorscope-<id>-v<n>` heißt |
| Startseite | Ein Live-Modul nicht verlinkt ist oder ein geplantes Modul verlinkt ist |
| Dokumentation | Englische und deutsche Dokumentation unterschiedlich viele Seiten haben oder eine README kein deutsches Gegenstück hat |
| Links | Ein relativer Link oder ein Bild in einer Markdown-Datei auf eine fehlende Datei zeigt |
| Schreibstil | Eine Markdown- oder HTML-Datei einen Gedankenstrich enthält |
| Tokens | `shared/tokens.css` und das Graphite-Schema von AIR voneinander abweichen |

### Rauchtest in Gerätegrößen

`scripts/e2e.mjs` öffnet den Build mit Playwright in den Größen von iPhone 15 hoch und quer, iPhone SE und iPad Pro 11 quer. Er prüft, dass die Startseite die Module listet, dass AIR im Demo-Modus mit Flugzeugen startet, dass keine Seite seitlich scrollt und dass keine Fehler in der Konsole erscheinen. Screenshots landen in `e2e-out/`.

```bash
npm run build
npm run preview &
npm run e2e                       # Chromium
E2E_BROWSER=webkit npm run e2e    # WebKit, die Engine von Safari
```

Der Workflow `e2e.yml` führt beide Browser bei jedem Push aus und hebt die Screenshots als Artefakt auf.

### Test-Labor mit echten Daten

`lab/run.mjs` läuft im Workflow `lab.yml` auf GitHub Actions, wo das Internet offen ist. Es zeichnet echte Antworten jeder Datenquelle auf und macht Screenshots von AIR mit Live-Verkehr. Die Ergebnisse landen im Branch `lab-results`. Nur hier werden die echten Datenquellen vollständig getestet.

## Releases

Jeder Teil hat eine eigene Version: die Sammlung, `shared` und jedes Modul. Änderungen werden zuerst unter `## Unreleased` in `CHANGELOG.md` und unter `## Unveröffentlicht` in `CHANGELOG.de.md` des Teils notiert. Dann:

```bash
npm run release -- air 0.3.1
npm test
```

Das Skript macht aus beiden Abschnitten die neue Version mit dem heutigen Datum und passt jede Stelle an, die die Version nennt: `modules.json`, READMEs, Dokumentationsübersichten, die Startseite und für die Sammlung `package.json`. Die Liste dieser Stellen steht in `scripts/versions.mjs`, Release-Skript und Prüfungen nutzen also dieselbe Liste.

| Änderung | Versionsschritt |
|---|---|
| Fehlerbehebung ohne sichtbare Verhaltensänderung | Patch, 0.3.0 auf 0.3.1 |
| Neue Funktion, neue Ansicht, geändertes Verhalten | Minor, 0.3.1 auf 0.4.0 |
| Geänderte Adresse oder gespeicherte Daten, die eine Aktion auf dem Gerät erfordern | Vor 1.0 Minor, danach Major |

## Ein Modul hinzufügen

1. Einen Eintrag in `modules.json` mit Status `planned` anlegen.
2. Den Ordner anlegen mit `index.html`, Build-Konfiguration, `public/manifest.webmanifest`, `public/sw.js` mit Speicher `vectorscope-<id>-v1`, README, Changelog sowie `docs/en` und `docs/de` in beiden Sprachen.
3. Den Build des Moduls im Skript `build` der `package.json` ergänzen und seine Tests in `vitest.config.ts`.
4. Eine Karte auf der Startseite (`index.html`) mit `data-module` und `data-version` ergänzen und eine Zeile in den Modultabellen beider READMEs im Hauptordner.
5. Den Status auf `live` setzen. Ab dann verlangen die Prüfungen alles oben Genannte.

## Konventionen

* Texte und Dokumentation auf Englisch und Deutsch, beide immer gemeinsam aktualisiert.
* Keine Gedankenstriche. Stattdessen Komma, Punkt, Doppelpunkt oder den Satz umformulieren.
* Oberflächentexte auf Englisch, deutsches Zahlenformat, standardmäßig metrische Einheiten.
* TypeScript im Strict Mode, keine ungenutzten Variablen oder Parameter.
* Reine Logik greift nie auf das Dokument zu und wird in Node.js getestet.
* Farben nur über Tokens, keine neue Farbe ohne Bedeutung.
* Keine Geheimnisse und keine persönlichen Koordinaten im Repository, es ist öffentlich.
* Jede Änderung erhält einen Eintrag in den Changelogs des Teils, den sie ändert.
