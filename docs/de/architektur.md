# Architektur der Sammlung

[English version](../en/architecture.md) · [Übersicht](README.md)

VectorScope ist eine Sammlung unabhängiger Module unter einem Dach: ein Repository, eine Adresse, eine Designsprache. Jedes Modul beantwortet eine Frage zur Lage um dich herum. Die Startseite unter der Hauptadresse listet die Module, der Ordner `shared/` enthält, was sie gemeinsam haben.

## Aufbau des Repositorys

```
VectorScope/
├─ index.html              Startseite: Liste der Module, statisch, ohne Build lauffähig
├─ manifest.webmanifest    Startseite als installierbare App
├─ sw.js                   Service Worker der Startseite (nur Startseite und shared/)
├─ modules.json            Modulverzeichnis: ID, Kürzel, Status, Version, Pfad, Beschreibung
├─ shared/                 gemeinsame Hülle
│  ├─ tokens.css           Farb-Tokens Graphite mit Ice Blue
│  ├─ hub.css              Layout der Startseite
│  ├─ icons/               Icons der Sammlung
│  ├─ fonts/               Inter für die Startseite
│  └─ README, CHANGELOG    eigene Version
├─ air/                    Modul AIR: Live-Luftlagebild (React, TypeScript, MapLibre)
│  ├─ index.html, vite.config.ts, public/, src/
│  ├─ docs/en, docs/de     Modul-Dokumentation
│  └─ README, CHANGELOG    eigene Version
├─ intel/                  Modul INTEL: geprüfter OSINT-Feed mit Live-Abgleich (React, TypeScript)
├─ proxy/                  CORS-Proxy auf Vercel, für alle Module
├─ lab/                    Test-Labor mit echtem Internet (GitHub Actions)
├─ collector/              Probe-Sammler und Rohdaten-Archiv für INTEL (GitHub Actions, eigener Server)
├─ server/                 Webserver, Sammler-Schleife und Image für den eigenen Server, siehe server.md
├─ docker-compose.yaml     der Stack für Coolify
├─ scripts/
│  ├─ build.mjs            ergänzt Startseite und gemeinsame Dateien in dist/
│  ├─ serve.mjs            liefert dist/ aus wie GitHub Pages
│  ├─ e2e.mjs              Rauchtest in Gerätegrößen
│  ├─ release.mjs          Modul, shared oder Sammlung veröffentlichen
│  └─ versions.mjs         alle Stellen, an denen eine Version steht
├─ tests/release.test.ts   Prüfungen des Repositorys
├─ docs/en, docs/de        Dokumentation der Sammlung
└─ .github/workflows/      Tests, E2E, Deploy, Labor, Sammler
```

## Module

| Kürzel | Ordner | Status | Technik | Frage |
|---|---|---|---|---|
| AIR | `air/` | Live | React 18, TypeScript, Vite, MapLibre GL | Was fliegt gerade über mir? |
| INTEL | `intel/` | Live | React 18, TypeScript, Vite | Was melden geprüfte Quellen, und welches Flugzeug in der Luft betrifft es? |

`modules.json` ist die einzige maßgebliche Quelle. Die Startseite verlinkt jedes Modul mit Status `live`, der Build bricht ab, wenn ein solches Modul fehlt, und die Prüfungen des Repositorys vergleichen jede genannte Version mit dem Verzeichnis.

### Regeln für ein Modul

* Liegt in einem eigenen Ordner, benannt nach seiner ID, mit `index.html` als Einstieg.
* Baut nach `dist/<id>/` mit relativem Basispfad und läuft so unter jeder Adresse.
* Hat eigene `README.md`, `README.de.md`, `CHANGELOG.md`, `CHANGELOG.de.md`, `docs/en` und `docs/de` und eine eigene Version.
* Registriert einen eigenen Service Worker aus seinem Ordner, mit einem Speicher namens `vectorscope-<id>-v<n>`.
* Bezieht seine Farben aus `shared/tokens.css`.
* Speichert Daten in `localStorage` mit Schlüsseln, die mit `vectorscope.` beginnen.
* Führt über sein Logo zurück zur Startseite (`../`).

## Gemeinsame Hülle

`shared/` hat eine eigene Version, weil eine Änderung dort jedes Modul betrifft.

| Datei | Inhalt | Genutzt von |
|---|---|---|
| `tokens.css` | Farb-Tokens des Graphite-Schemas: Flächen, Text, Akzent, Signalfarben, Flugzeugtöne, Radien | Startseite, AIR, INTEL |
| `hub.css` | Layout der Startseite | Startseite |
| `icons/` | App-Icons der Sammlung | Startseite |
| `fonts/` | Inter 400 und 600 für die Startseite | Startseite |

AIR bindet `tokens.css` beim Build ein und überschreibt die Farbvariablen zur Laufzeit, wenn ein anderes Farbschema gewählt ist (`air/src/ui/tokens.ts`). Eine Prüfung des Repositorys stellt sicher, dass `tokens.css` und das Graphite-Schema von AIR identisch bleiben.

## Build

```
npm run build
 ├─ tsc --noEmit                         Typprüfung des gesamten TypeScript
 ├─ vite build --config air/vite.config.ts   air/ → dist/air/
 ├─ vite build --config intel/vite.config.ts intel/ → dist/intel/
 └─ node scripts/build.mjs               index.html, Manifest, sw.js, modules.json, shared/ → dist/
```

Eine `package.json` im Hauptordner enthält Abhängigkeiten und Skripte aller Module. INTEL nutzt den Callsign-Katalog, den Flugzeug-Parser und die Entfernungsberechnung von AIR, indem es sie aus `air/src/` importiert. Vitest findet die Tests aller Module und die Prüfungen des Repositorys (`vitest.config.ts`).

## Adressen und Speicher

| | Adresse | Bereich des Service Workers | Speicher |
|---|---|---|---|
| Startseite | `/VectorScope/` | `/VectorScope/` | `vectorscope-hub-v1` |
| AIR | `/VectorScope/air/` | `/VectorScope/air/` | `vectorscope-air-v1` |
| INTEL | `/VectorScope/intel/` | `/VectorScope/intel/` | `vectorscope-intel-v1` |

Alle Teile teilen sich einen Ursprung (`michaeldobner.github.io`), `localStorage` ist deshalb gemeinsam. Darum trägt jeder Schlüssel das Präfix `vectorscope.` und bei Bedarf den Modulnamen. Der Service Worker der Startseite beantwortet nur Anfragen für die Startseite und `shared/`, alles andere geht ins Netz oder an den Worker des Moduls.

## Netzwerk

```
iPhone / iPad (Safari, installierte Web-App)
 └─ VectorScope (statische Dateien von GitHub Pages)
     ├─ AIR ── vectorscope-proxy.vercel.app ── adsb.lol, planespotters.net
     │    ├─ adsbdb.com, hexdb.io ............. Routen, Airlines, Flugzeugdaten
     │    └─ OpenFreeMap ...................... Grundkarte
     └─ INTEL ── public.api.bsky.app ......... Bluesky-Beiträge, direkt
          ├─ derselbe Proxy .................. RSS-Feeds (/feed/{id}), Telegram (/tg/{kanal}), Militärflugzeuge (/v2/mil)
          └─ raw.githubusercontent.com ....... Meldungen des Probe-Sammlers
```

Es gibt kein eigenes Backend. Der Proxy leitet nur eine Whitelist lesender Pfade weiter und speichert nichts. Einzelheiten: [Deployment](deployment.md#cors-proxy-auf-vercel).
