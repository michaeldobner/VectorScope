# Entwicklung

[English version](../en/development.md) · [Übersicht](README.md)

## Voraussetzungen

* Node.js 22 oder neuer, npm 10
* Ein moderner Browser. Für Tests auf Geräten: iPhone oder iPad mit Safari

## Lokal starten

Alles läuft aus dem Hauptordner des Repositorys, dort liegt die eine `package.json` für alle Module.

```bash
npm install
npm run dev
```

Dann `http://localhost:5173/` öffnen. Nützliche URL-Parameter:

| Parameter | Wirkung |
|---|---|
| `?demo` | Simulierter Verkehr, kein Netzzugriff auf adsb.lol |
| `?lat=50.11&lon=8.68` | Fester Standort, GPS aus |
| `?shot` | Hält den WebGL-Puffer für automatische Screenshots lesbar |
| `?hex=ae5420` | Wählt dieses Flugzeug aus und verfolgt es, genutzt von INTEL für Live-Treffer |

Parameter lassen sich kombinieren: `?demo&lat=48.35&lon=11.79`.

## Skripte

| Befehl | Zweck |
|---|---|
| `npm run dev` | Entwicklungsserver für dieses Modul mit Hot Reload |
| `npm run typecheck` | TypeScript-Prüfung ohne Ausgabe |
| `npm test` | Unit-Tests aller Module und die Prüfungen des Repositorys |
| `npm run build` | Typprüfung, dieses Modul nach `dist/air/`, danach Startseite und gemeinsame Dateien nach `dist/` |
| `npm run preview` | `dist/` wie GitHub Pages unter `http://localhost:4173/` ausliefern, dieses Modul unter `/air/` |
| `npm run e2e` | Rauchtest in iPhone- und iPad-Größen gegen den Build |
| `npm run release -- air x.y.z` | Dieses Modul veröffentlichen, siehe [Entwicklung der Sammlung](../../../docs/de/entwicklung.md#releases) |

## Tests

`src/geo/geo.test.ts` deckt die Berechnungen ab, auf denen alles andere aufbaut, `src/data/enrich.test.ts` die Routenwahl mit aufgezeichneten echten Antworten von adsbdb und hexdb:

| Test | Prüft |
|---|---|
| Distanz Frankfurt nach München | Haversine-Ergebnis zwischen 300 und 308 km |
| Zielpunkt und Peilung | Hin und zurück auf Meter und ein Grad genau |
| Elevation | 90° senkrecht, 45° bei gleicher Entfernung und Höhe |
| Nächster Punkt bei direktem Anflug | Zeit bis zum nächsten Punkt und Abstand unter 50 m, Annäherung |
| Nächster Punkt mit seitlichem Versatz | Abstand und Seite |
| Sich entfernendes Flugzeug | Negative Zeit, positive Annäherungsrate |
| Vorausberechnung mit Kurve | Viertelkreis endet im richtigen Sektor |
| Himmelsklassen | Zenith, Anflug, tiefer Hubschrauber auf kreuzendem Kurs, Verkehr am Boden |
| Routenwahl | Es gewinnt die Routendatenbank, deren Strecke am Flugzeug vorbeiführt (EXS95LV: Mytilene nach Birmingham, nicht das veraltete Madeira nach Bristol) |

GitHub Actions führt Typprüfung, Tests und Build bei jedem Push und Pull Request aus (`.github/workflows/tests.yml`), dazu den Rauchtest in Gerätegrößen und das Test-Labor mit echten Daten, siehe [Entwicklung der Sammlung](../../../docs/de/entwicklung.md).

### Zusätzlich von Hand prüfen

1. Alle vier Layouts: iPhone hoch und quer, iPad hoch und quer, iPad Split View.
2. Bottom Sheet: ziehen, antippen, Inspector öffnen und schließen.
3. Overhead-Countdown läuft, Flugzeuge gleiten flüssig.
4. Watchlist: hinzufügen, entfernen, Stern im Inspector, Hinweis beim Eintritt in den Radius.
5. Einstellungen: auf der Karte wählen, Koordinaten, Einheiten, Datenquelle, Radius-Schieberegler.
6. Fehlerbanner ohne Netz und Wechsel in den Demo-Modus.
7. Installation auf dem Home-Bildschirm, Start im Vollbild, Notch und Home-Indikator.

## Test auf iPhone oder iPad

1. Auf dem Rechner `npm run dev -- --host` starten.
2. Auf dem iPhone in Safari `http://<IP-des-Rechners>:5173/` öffnen.

Ohne HTTPS gibt der Browser keinen Standort frei und der Service Worker startet nicht. Dann die Koordinaten in den Einstellungen oder `?lat=…&lon=…` verwenden oder über die veröffentlichte Adresse testen.

**Fehlersuche mit dem Mac:** Auf dem iPhone Einstellungen > Apps > Safari > Erweitert > Web-Inspektor einschalten, per Kabel verbinden, dann auf dem Mac in Safari: Entwickler > Name des iPhones > Seite wählen.

## Screenshots für die Dokumentation

Die Bilder in `docs/images/` entstehen im Demo-Modus mit Playwright und Chromium in Gerätegröße (iPhone 393 × 852 mit Faktor 3, iPad 1180 × 820 mit Faktor 2). Headless Chromium nimmt das WebGL-Canvas nicht in Screenshots auf, deshalb kopiert das Skript das Canvas vorher in ein Bild. Die Seite muss mit `?demo&shot` geöffnet werden.

## Konventionen

* TypeScript im Strict Mode, keine unbenutzten Variablen oder Parameter.
* Reine Logik (`geo/`, `data/score.ts`, `data/adsblol.ts`) greift nie auf das Dokument zu.
* Farben nur über Tokens (`styles.css`, `ui/tokens.ts`). Keine neue Farbe ohne Bedeutung.
* Zahlen nur über `lib/format.ts`, damit deutsches Zahlenformat und Einheiten überall gelten.
* Texte der Oberfläche sind Englisch. Dokumentation auf Englisch und Deutsch, beide immer gemeinsam aktualisiert.
* Keine Gedankenstriche in Texten.
* Jede Änderung erhält einen Eintrag in `CHANGELOG.md` und `CHANGELOG.de.md`.

## Katalog erweitern

### Neuer Typ

In `src/data/catalog.ts` einen Eintrag in `TYPE_CATALOG` ergänzen:

```ts
P8: { role: 'maritime-patrol', rarity: 0.6, name: 'Boeing P-8 Poseidon' },
```

* `role` bestimmt die Rollenpunkte und die Bezeichnung im Inspector.
* `rarity` von 0 bis 1. Ab 0,5 gibt es `rarity × 20` Punkte.
* Typen, die nur militärisch besonders sind (A330 MRTT, Global Express), erhalten `rarity: 0` und einen Eintrag in `MILITARY_ONLY_ROLE` in `score.ts`.

### Neue Callsign-Gruppe

Einen Eintrag in `CALLSIGN_PREFIX` ergänzen:

```ts
HOMER: { label: 'US Navy P-8 Poseidon', role: 'maritime-patrol' },
```

Es gewinnt das längste passende Präfix mit mindestens drei Buchstaben. Jede Callsign-Gruppe außer DLR und NASA gilt als militärisch.

### Neue Ansicht oder Datenquelle

1. Die Anfrage in `data/feed.ts` ergänzen und dabei alle drei Übertragungswege bedenken (direkt, Proxy, Demo).
2. Den Pfad in die Whitelist in `proxy/api/proxy.js` aufnehmen.
3. Die Demo-Daten in `data/demo.ts` erweitern, damit Screenshots und Offline-Entwicklung weiter funktionieren.
4. In beiden Sprachen dokumentieren.

## Roadmap

| Version | Geplant |
|---|---|
| 0.4 | Kompassmodus mit dem Bewegungssensor des Geräts, Gebietsüberwachung mit Polygonen |
| 0.5 | Push-Benachrichtigungen über ntfy und einen zeitgesteuerten Worker |

Der Intelligence-Feed aus Bluesky und RSS wird ein eigenes Modul INTEL, siehe [Roadmap der Sammlung](../../../docs/de/roadmap.md).
