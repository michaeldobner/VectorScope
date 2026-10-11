# Architektur

[English version](../en/architecture.md) · [Übersicht](README.md)

NEWS besteht aus einem Sammler auf dem eigenen Server und einer App ohne Framework, von Vite nach `dist/news/` gebaut. Wie es sich in die Sammlung einfügt, beschreiben die [Architektur der Sammlung](../../../docs/de/architektur.md) und der [eigene Server](../../../docs/de/server.md).

```
iPhone / iPad
 └─ NEWS (statische Dateien vom eigenen Server)
     ├─ /data/news.json ............ die Ausgabe, alle 5 Minuten gefragt
     └─ Bilder ..................... direkt von den Medien

Eigener Server
 ├─ vectorscope-collector ......... server/collector-loop.mjs, alle 10 Minuten
 │   ├─ collector/collect.ts ...... Runde von INTEL
 │   └─ collector/news.ts ......... Runde von NEWS, schreibt /data/news/
 └─ vectorscope-web ............... server/web.mjs, liefert /data/news.json und /news/
```

GitHub sammelt und speichert nichts von NEWS.

## Eine Runde des Sammlers

`collector/news.ts`, gestartet von `server/collector-loop.mjs` nach jeder Runde von INTEL, in einem eigenen Prozess mit 5 Minuten Zeitlimit. Ein Fehler von NEWS berührt INTEL nie.

1. **Feeds lesen:** alle 35, sechs gleichzeitig, 25 Sekunden Zeitlimit, Zeichensatz aus Kopfzeile oder XML-Deklaration (`parse.ts`).
2. **Prüfen:** Unter 100 brauchbaren Meldungen bleibt die letzte Ausgabe stehen, die Runde endet mit Code 1. Eine leere Seite hilft niemandem.
3. **Schlagzeilen übersetzen**, damit das Modell englische Fassungen vergleicht.
4. **Vektoren und Geschichten:** das Modell aus `/data/models`, das INTEL schon geladen hat.
5. **Bilder** von Artikelseiten für Geschichten ohne Feedbild.
6. **Ausgabe bauen**, die Anrisse der Leitquellen übersetzen, Ausgabe erneut bauen.
7. **Schreiben** nach `/data/news/`.

| Datei in `/data/news/` | Inhalt | Aufbewahrung |
|---|---|---|
| `news.json` | Die Ausgabe | ersetzt jede Runde |
| `news-translations.json` | Übersetzungen, Original zu Deutsch und Englisch | 7 Tage ohne Nutzung |
| `news-og.json` | Vorschaubild der Artikelseite je Link | 3 Tage |
| `news-stats.json` | Pro Feed: erreichbar, Zahl der Meldungen, Fehler | ersetzt jede Runde |

Der Herzschlag des Sammlers (`/data/heartbeat.json`) trägt das Ergebnis der letzten NEWS-Runde im Feld `news`.

## Umgebungsvariablen

| Variable | Wirkung |
|---|---|
| `NEWS=0` | NEWS abschalten |
| `DEEPL_KEY` | Übersetzen mit DeepL statt Google |
| `EMBED=0` | Ohne Modell, nur nach Wörtern zusammenführen |
| `VECTORSCOPE_PROXY` | Proxy für Übersetzungen, auf dem Server `http://vectorscope-web:8080/proxy` |
| `TRANSLATE_MAX` | Texte pro Sprache und Runde, Vorgabe 400 |

## Format der Ausgabe

`news.json`, Typen in `news/src/data/types.ts`:

```
{ at, outlets, countries, stories: [
  { id, ressort, score, worldScore, time, first, countries: ["CH", "DE", …],
    lead: { de: { outlet, lang, head, sum, translated }, en: {…}, orig: {…} },
    img: { url, credit },
    sources: [ { outlet, cc, group, lang, de, en, orig, time, link } ] } ] }
```

Zeiten in Millisekunden. `de` oder `en` einer Quelle ist leer, solange die Übersetzung fehlt. Eine Ausgabe hat rund 230 Geschichten und 400 KB.

## App

| Datei | Aufgabe |
|---|---|
| `news/src/main.ts` | Laden, Listen, Blatt, Überblick, Einstellungen, Neues, Gesten |
| `news/src/i18n.ts` | Alle Texte der Bedienung auf Deutsch und Englisch |
| `news/src/styles.css` | Gestaltung, Farben aus `shared/tokens.css`, Schriften Inter und Newsreader |
| `news/public/sw.js` | Hält die App selbst bereit, die Ausgabe kommt immer frisch |

Die App liest `../data/news.json` relativ zu ihrer Adresse. Mit `?data=<Adresse>` lädt sie eine andere Ausgabe, zum Entwickeln. Die letzte Ausgabe bleibt im `localStorage` für den Start ohne Verbindung.

## Tests und Labor

* `news/src/data/edition.test.ts`: Zeichensätze, RSS, Atom, Tagesschau-API, Spitzmarken, Rauschen, Zusammenführen mit und ohne Vektoren, Ressorts, Leitquellen je Sprache, fehlende Übersetzungen, Logos, Alter, Anrisse.
* `tests/release.test.ts` prüft Aufbau, Versionen und Doku des Moduls wie bei allen Modulen.
* `lab/news.mjs` prüft Kandidaten-Feeds mit echtem Internet, nur von Hand, siehe [Quellen](quellen.md).

## Entwickeln

```bash
npm run dev:news                  # App unter http://localhost:5173/
npx tsx collector/news.ts out     # eine Runde in den Ordner out/
```

Lokal hat die App keine Ausgabe unter `../data/news.json`. `?data=` zeigt auf eine Kopie, etwa eine `news.json` vom Server.
