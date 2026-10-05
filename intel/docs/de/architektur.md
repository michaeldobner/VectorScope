# Architektur

[English version](../en/architecture.md) · [Übersicht](README.md)

INTEL ist das Modul INTEL der VectorScope-Sammlung: eine React Single Page Application ohne eigenes Backend, von Vite nach `dist/intel/` gebaut. Wie es sich in das Repository einfügt, beschreibt die [Architektur der Sammlung](../../../docs/de/architektur.md).

```
iPhone / iPad
 └─ INTEL (statische Dateien von GitHub Pages)
     ├─ public.api.bsky.app ......................... Bluesky-Beiträge, direkt
     ├─ vectorscope-proxy.vercel.app/tg/{kanal} ..... Telegram-Kanäle, eine Minute zwischengespeichert
     ├─ raw.githubusercontent.com ................... Meldungen des Probe-Sammlers, Branch collector-data
     ├─ vectorscope-proxy.vercel.app/feed/{id} ...... RSS-Feeds, fünf Minuten zwischengespeichert
     └─ vectorscope-proxy.vercel.app/v2/mil ......... Live-Militärflugzeuge von adsb.lol
```

## Module

```
intel/src/
├─ main.tsx              Start: Schriften, gemeinsame Tokens, Store, Service Worker
├─ App.tsx               Kopfleiste, Reiter, Filter, Stories, Wire, Live now, Places, Sources
├─ styles.css            Layout und Komponenten, Farben aus shared/tokens.css
├─ data/
│  ├─ sources.ts         die geprüften Quellen
│  ├─ rss.ts             RSS- und Atom-Parser ohne DOMParser
│  ├─ bluesky.ts         eigene Beiträge eines Accounts aus der öffentlichen API
│  ├─ telegram.ts        Beiträge eines Kanals aus der Webansicht t.me/s
│  ├─ stories.ts         Bündelung zu Stories, Echo-Detektor, Status, Vorsprung
│  ├─ sensor.ts          eigene Beobachtungen: Luftaktivität, Squawk 7700
│  ├─ physical.ts        USGS, EMSC, GDACS, NWS, FAA
│  ├─ text.ts            HTML zu Text, Entities, URL-Schlüssel für Duplikate
│  ├─ feed.ts            Laden mit Ausweichweg, Zusammenführen, Live-Flugzeuge
│  ├─ entities.ts        Callsigns und Flugzeugtypen
│  ├─ places.ts          Ortsverzeichnis mit rund 100 Orten
│  ├─ match.ts           Live-Abgleich
│  ├─ demo.ts            synthetische Beiträge und Flugzeuge
│  └─ types.ts           Item, Match, EnrichedItem
├─ state/store.ts        Zustand, Abfragen, Zwischenspeicher, Einstellungen
├─ state/translate.ts    Deutsche Übersetzungen: Warteschlange, Pakete, Speicher auf dem Gerät
└─ ui/                   Formatierung, Layout-Hook, IntelMap.tsx (Lagekarte, bei Bedarf geladen)
```

INTEL nutzt den Callsign-Katalog, den Flugzeug-Parser und die Entfernungsberechnung von AIR (`air/src/data/catalog.ts`, `adsblol.ts`, `geo/geo.ts`). Beide Module erkennen deshalb dieselben Callsigns und rechnen Entfernungen gleich.

## Datenfluss

1. Beim Start erscheint sofort der zuletzt gespeicherte Feed.
2. Die Live-Militärflugzeuge werden geladen, danach alle Quellen, jeweils vier gleichzeitig, zusammen mit den Meldungen des Probe-Sammlers.
3. Jede Quelle lädt ihre Kanäle parallel. RSS geht über den Proxy und weicht auf eine direkte Anfrage aus. Eine Quelle fällt nur aus, wenn alle ihre Kanäle ausfallen.
4. Alle Einträge werden zusammengeführt: Duplikate nach URL (ein Beitrag und der Artikel, auf den er verlinkt) werden ein Eintrag, Einträge älter als 14 Tage fallen weg.
5. Die Entities werden einmal pro Eintrag erkannt, Treffer und Stories neu berechnet, sobald sich Einträge oder Live-Flugzeuge ändern.
6. Der Feed lädt alle fünf Minuten neu, die Live-Flugzeuge alle zwei Minuten, nur solange die Seite sichtbar ist.

## Proxy-Routen

`POST /translate` in `proxy/api/proxy.js` übersetzt bis zu 60 Texte mit je 600 Zeichen über Google Translate (`proxy/lib/translate.js`), zeilenweise zu wenigen Anfragen gebündelt. `/feed/{id}` und `/tg/{kanal}` liefern nur die Feeds in `FEEDS` und die Kanäle in `TELEGRAM`, der Proxy ist also kein offener Proxy. Die Route sendet einen User-Agent mit Kontaktangabe und hält Antworten fünf Minuten im Edge-Cache von Vercel. Ein Test prüft, dass `FEEDS` und `TELEGRAM` zu den Quellen in `sources.ts` passen und dass INTEL und AIR denselben Proxy nutzen.

## Speicher

| Schlüssel | Inhalt |
|---|---|
| `vectorscope.intel.v1` | Filter, Ortsfilter, Zeitpunkt des zuletzt gesehenen Eintrags |
| `vectorscope.intel.cache.v1` | Die letzten 300 Einträge, für einen sofortigen Start und die Nutzung offline |

Der Service Worker `public/sw.js` mit dem Speicher `vectorscope-intel-v1` hält die App-Hülle. Feeds und Live-Daten gehen immer ins Netz.

## Tests

| Datei | Deckt ab |
|---|---|
| `data/rss.test.ts` | RSS mit CDATA und Entities, Atom, WordPress-Fußzeilen, Gedankenstriche, Bluesky, Zusammenführen, Altersgrenze |
| `data/entities.test.ts` | Callsigns, Fehltreffer, Typen, Orte auf Englisch und Deutsch, Wortgrenzen, Regeln des Live-Abgleichs |
| `data/sources.test.ts` | Eindeutige Quellen, Proxy-Listen gleich Quellenliste, derselbe Proxy wie AIR |
| `data/physical.test.ts` | Erdbeben, GDACS, NWS, FAA, Koordinaten als Ort, Event Confidence, der Voronezh-Fall auf Russisch |
| `data/sensor.test.ts` | Gebiet eines Punkts, Aktivitätsgruppen, Notfälle mit Airline, Sensor in Stories, Echo-Detektor |
| `tests/translate.test.ts` | Google-Antwort, Pakete, Reihenfolge, Ausweichweg je Text |
| `data/stories.test.ts` | Telegram-Webansicht, Bündelung, Status, Vorsprung, Reihenfolge, keine Selbstbestätigung |

Der Probe-Sammler `collector/collect.ts` nutzt dieselben Module in Node.js, siehe [Probe-Sammler](sammler.md).

Der Rauchtest öffnet INTEL im Demo-Modus in vier Gerätegrößen, das Test-Labor öffnet es mit Live-Daten und folgt dem ersten Live-Treffer nach AIR.
