# Architektur

[English version](../en/architecture.md) · [Übersicht](README.md)

INTEL ist das Modul INTEL der VectorScope-Sammlung: eine React Single Page Application ohne eigenes Backend, von Vite nach `dist/intel/` gebaut. Wie es sich in das Repository einfügt, beschreibt die [Architektur der Sammlung](../../../docs/de/architektur.md).

```
iPhone / iPad
 └─ INTEL (statische Dateien von GitHub Pages)
     ├─ public.api.bsky.app ......................... Bluesky-Beiträge, direkt
     ├─ vectorscope-proxy.vercel.app/feed/{id} ...... RSS-Feeds, fünf Minuten zwischengespeichert
     └─ vectorscope-proxy.vercel.app/v2/mil ......... Live-Militärflugzeuge von adsb.lol
```

## Module

```
intel/src/
├─ main.tsx              Start: Schriften, gemeinsame Tokens, Store, Service Worker
├─ App.tsx               Kopfleiste, Reiter, Filter, Feed, Live now, Places, Sources
├─ styles.css            Layout und Komponenten, Farben aus shared/tokens.css
├─ data/
│  ├─ sources.ts         die geprüften Quellen
│  ├─ rss.ts             RSS- und Atom-Parser ohne DOMParser
│  ├─ bluesky.ts         eigene Beiträge eines Accounts aus der öffentlichen API
│  ├─ text.ts            HTML zu Text, Entities, URL-Schlüssel für Duplikate
│  ├─ feed.ts            Laden mit Ausweichweg, Zusammenführen, Live-Flugzeuge
│  ├─ entities.ts        Callsigns und Flugzeugtypen
│  ├─ places.ts          Ortsverzeichnis mit rund 100 Orten
│  ├─ match.ts           Live-Abgleich
│  ├─ demo.ts            synthetische Beiträge und Flugzeuge
│  └─ types.ts           Item, Match, EnrichedItem
├─ state/store.ts        Zustand, Abfragen, Zwischenspeicher, Einstellungen
└─ ui/                   Formatierung, Layout-Hook
```

INTEL nutzt den Callsign-Katalog, den Flugzeug-Parser und die Entfernungsberechnung von AIR (`air/src/data/catalog.ts`, `adsblol.ts`, `geo/geo.ts`). Beide Module erkennen deshalb dieselben Callsigns und rechnen Entfernungen gleich.

## Datenfluss

1. Beim Start erscheint sofort der zuletzt gespeicherte Feed.
2. Die Live-Militärflugzeuge werden geladen, danach alle Quellen, jeweils vier gleichzeitig.
3. Jede Quelle lädt ihre Kanäle parallel. RSS geht über den Proxy und weicht auf eine direkte Anfrage aus. Eine Quelle fällt nur aus, wenn alle ihre Kanäle ausfallen.
4. Alle Einträge werden zusammengeführt: Duplikate nach URL (ein Beitrag und der Artikel, auf den er verlinkt) werden ein Eintrag, Einträge älter als 14 Tage fallen weg.
5. Die Entities werden einmal pro Eintrag erkannt, die Treffer neu berechnet, sobald sich Einträge oder Live-Flugzeuge ändern.
6. Der Feed lädt alle fünf Minuten neu, die Live-Flugzeuge alle zwei Minuten, nur solange die Seite sichtbar ist.

## Proxy-Route

`/feed/{id}` in `proxy/api/proxy.js` liefert nur die Feeds seiner festen Liste `FEEDS`, es ist also kein offener Proxy. Die Route sendet einen User-Agent mit Kontaktangabe und hält Antworten fünf Minuten im Edge-Cache von Vercel. Ein Test prüft, dass `FEEDS` und die RSS-Adressen in `sources.ts` identisch sind und dass INTEL und AIR denselben Proxy nutzen.

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
| `data/sources.test.ts` | Eindeutige Quellen, Proxy-Liste gleich Quellenliste, derselbe Proxy wie AIR |

Der Rauchtest öffnet INTEL im Demo-Modus in vier Gerätegrößen, das Test-Labor öffnet es mit Live-Daten und folgt dem ersten Live-Treffer nach AIR.
