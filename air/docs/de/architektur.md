# Architektur

[English version](../en/architecture.md) · [Übersicht](README.md)

## Überblick

VectorScope Air ist das Modul AIR der VectorScope-Sammlung und eine Single Page Application ohne eigenes Backend. Wie es sich in das Repository einfügt (Startseite, `shared/`, Build, Bereiche der Service Worker), beschreibt die [Architektur der Sammlung](../../../docs/de/architektur.md). Vite baut sie zu statischen Dateien, GitHub Pages liefert sie aus. Alles Persönliche bleibt im Browser. Die einzige optionale Serverkomponente ist ein kleiner Proxy, der den Antworten von adsb.lol CORS-Header hinzufügt.

```
iPhone / iPad (Safari, installierte Web-App)
 └─ VectorScope (statische Dateien von GitHub Pages)
     ├─ adsb.lol ............ Live-Positionen, Militär, Notfälle, Suche, Routen
     │    └─ optional: Vercel-Proxy (proxy/), wenn der Browser den direkten Zugriff blockiert
     ├─ OpenFreeMap ......... Vektorkacheln und Schriften der Grundkarte
     └─ planespotters.net ... Fotos der Flugzeuge
```

Grundprinzip: **Datenquelle → Speicher → abgeleiteter Zustand → Ansicht.** Geometrie und Bewertung sind reine Funktionen ohne Zugriff auf das Dokument und werden deshalb in Node.js getestet.

## Module

```
src/
├─ main.tsx              Start: Schriften, Styles, Verkehrsspeicher, Service Worker
├─ App.tsx               Layouts, Kopfleiste, Suche, Kartensteuerung, Bottom Sheet, Fehlerbanner, Hinweise
├─ styles.css            Layouts und Komponenten, Farben aus shared/tokens.css
├─ geo/
│  ├─ geo.ts             Distanz, Peilung, Zielpunkt, lokaler Versatz, Elevation, nächster Punkt, Vorausberechnung
│  ├─ overhead.ts        Himmelsgeometrie je Flugzeug, Overhead-Klassen, Sortierung
│  └─ geo.test.ts        Unit-Tests
├─ data/
│  ├─ types.ts           einheitliches Aircraft-Modell, Datenbank-Kennzeichen
│  ├─ adsblol.ts         Parser für readsb-v2-JSON und Routenantworten
│  ├─ feed.ts            Übertragungswege (direkt, Proxy, Demo), Anfragen, Routen- und Fotozwischenspeicher
│  ├─ demo.ts            simulierter Verkehr für Demo-Modus und Screenshots
│  ├─ catalog.ts         Rollen, Seltenheit, Callsign-Gruppen, staatliche Betreiber
│  └─ score.ts           Interest Score, Ton (Farbbedeutung), Anzeigename des Typs
├─ state/
│  ├─ settings.ts        Einstellungen in localStorage, URL-Parameter
│  ├─ traffic.ts         Live-Speicher: Abfragen, Verlauf, Hinweise, Auswahl, Standort
│  └─ watch.ts           Abgleich mit der Watchlist
├─ map/
│  ├─ MapView.tsx        MapLibre-Karte, Overlay-Ebenen, Animationsschleife, Interaktion
│  ├─ style.ts           Stil der Grundkarte
│  └─ icons.ts           Flugzeug- und Hubschraubersymbol
├─ lib/format.ts         deutsches Zahlenformat, Einheiten
└─ ui/
   ├─ Inspector.tsx      Aircraft Inspector
   ├─ Lists.tsx          Airspace now, Nearby, Overhead, Notable, Watchlist
   ├─ SettingsSheet.tsx  Einstellungen
   ├─ useLayout.ts       Wahl des Layouts, Sekundentakt
   └─ tokens.ts          Farben für die Karte
```

## Datenfluss einer Aktualisierung

1. `traffic.ts` ruft alle `pollSec` Sekunden `fetchNearby(lat, lon, radius)` auf, solange die Seite sichtbar ist.
2. `feed.ts` wählt den Übertragungsweg. Im Modus **auto** wird adsb.lol direkt versucht. Blockiert der Browser die Anfrage (CORS) oder antwortet adsb.lol mit 403 und ist ein Proxy eingetragen, wechselt VectorScope zum Proxy und merkt sich das für die Sitzung.
3. `adsblol.ts` wandelt das readsb-JSON in `Aircraft`-Objekte um: Hex in Großbuchstaben, Höhe in Fuß oder `onGround`, Herkunft der Position, Zeitpunkt der Position.
4. `ingest()` in `traffic.ts` baut die neue Flugzeugliste. Für jedes Flugzeug wird
   * die Position an den Verlauf angehängt (erst nach 60 m Bewegung, 30 Minuten lang aufbewahrt),
   * die Watchlist abgeglichen,
   * der Interest Score berechnet (`score.ts`),
   * die Himmelsgeometrie berechnet (`overhead.ts`),
   * ein Hinweis erzeugt, wenn ein Watchlist-Treffer oder ein besonderer Squawk in den Radius kommt.
5. Der Speicher meldet eine neue Version. React-Komponenten, die über `useSyncExternalStore` abonniert haben, zeichnen neu.
6. `MapView` aktualisiert die Overlay-Quellen. Unabhängig davon bewegt eine Animationsschleife jedes Flugzeug zehnmal pro Sekunde per Koppelnavigation weiter.

Notable now läuft genauso alle 60 Sekunden mit `/v2/mil` und `/v2/sqk/7700`.

## Zustand

| Speicher | Inhalt | Dauerhaft gespeichert |
|---|---|---|
| `settings.ts` | Standort, GPS an oder aus, eigene Höhe, Radius, Datenquelle, Proxy, Intervall, Einheiten, Watchlist, Filter | `localStorage`, Schlüssel `vectorscope.settings.v1` |
| `traffic.ts` | Standort, Flugzeuge mit Verlauf, Score und Geometrie, Status, Fehler, Übertragungsweg, Notable now, Auswahl, Hinweise | Nur im Arbeitsspeicher |

Beide Speicher sind kleine beobachtbare Module ohne Framework. Komponenten lesen sie mit `useSyncExternalStore`.

## Darstellung der Karte

`MapView.tsx` erzeugt eine MapLibre-Karte und fügt die Overlay-Quellen und Ebenen hinzu, sobald der Stil eingelesen ist, ohne auf die Kacheln der Grundkarte zu warten. Fällt der Kachelserver aus, erscheinen die Flugzeuge trotzdem.

| Ebene | Typ | Inhalt |
|---|---|---|
| `rings`, `ring-labels` | Linie, Symbol | Distanzringe und Beschriftung |
| `trails` | Linie | Fünf-Minuten-Spuren interessanter Flugzeuge |
| `sel-trail`, `sel-trail-old` | Linie | Spur des ausgewählten Flugzeugs, durchgezogen und gepunktet |
| `projection` | Linie | Gestrichelte Vorausberechnung für drei Minuten |
| `ac-watch-ring`, `ac-selected` | Kreis | Watchlist-Ring, Lichtkranz der Auswahl |
| `ac-icon` | Symbol | Flugzeugsymbol, eingefärbt, gedreht, nach Wichtigkeit sortiert |
| `ac-label-std`, `ac-label-hi` | Symbol | Beschriftungen für normale (ab Zoomstufe 9,5) und hervorgehobene Flugzeuge |
| `observer-ring`, `observer-dot` | Kreis | Dein Standort |

Ein Tipp fragt ein Feld von 32 × 32 Pixeln ab und wählt das wichtigste Flugzeug unter dem Finger.

## Layouts

`useLayout()` liefert aus der Fenstergröße eines von vier Layouts:

| Layout | Bedingung |
|---|---|
| `wide` | Breite ≥ 1000 und Breite ≥ Höhe, oder Breite ≥ 700 im Querformat |
| `tablet-portrait` | Breite ≥ 700 und Höhe > Breite |
| `phone-landscape` | Querformat mit Höhe < 560 |
| `phone-portrait` | Alles andere |

`App.tsx` setzt dieselben Bausteine (Karte, Airspace now, Listen, Inspector) je Layout unterschiedlich zusammen. Der Kartenrand folgt dem Layout, damit der Radius im sichtbaren Teil der Karte eingerahmt wird.

## Offline und Updates

`public/sw.js` speichert die App-Hülle in `vectorscope-air-v1`. Er wird aus `air/` registriert und steuert deshalb nur dieses Modul. Seitenaufrufe gehen zuerst ins Netz und greifen nur ohne Verbindung auf den Speicher zurück. Dateien mit Hash im Namen kommen aus dem Speicher. Live-Daten, Kacheln und Fotos speichert der Service Worker nie.

## Proxy

`proxy/api/proxy.js` ist eine Serverless-Funktion für Vercel. Sie leitet nur eine Whitelist lesender adsb.lol-Pfade weiter, setzt einen User-Agent mit Kontaktangabe, wie adsb.lol es wünscht, ergänzt CORS-Header, prüft optional ein gemeinsames Token und hält GET-Antworten zwei Sekunden im Edge-Cache. Einzelheiten: [Deployment](../../../docs/de/deployment.md#cors-proxy-auf-vercel).
