# Changelog · VectorScope News

Alle wesentlichen Änderungen am Modul NEWS. [English](CHANGELOG.md) · [Changelog der Sammlung](../CHANGELOG.de.md)

Das Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), die Versionen folgen [Semantic Versioning](https://semver.org/lang/de/).

## 0.2.1 (2026-10-12)

### Behoben
* CNBC erscheint: Seine Meldungen gehören zum Ressort Wirtschaft. Seine Links nennen kein Ressort, deshalb zählte eine einzelne CNBC-Meldung, meist Börse, als Weltnachricht und kam nie weit genug nach oben, obwohl der Feed jede Runde gelesen wurde.

## 0.2.0 (2026-10-11)

### Neu
* **2-Minuten-Überblick neu:** sichtbare Knöpfe Zurück und Weiter mit „3 / 10“, Wischen zur Seite, gedrückt halten pausiert, beim ersten Öffnen ein Hinweis. Auf dem iPad quer Bild und Text nebeneinander.
* **Teilen:** im Überblick und in jeder Geschichte, über das Teilen-Menü des Geräts, mit Schlagzeile und Link zum Originalartikel.

### Geändert
* **Bilder werden nie beschnitten:** ganzes Bild im Rahmen 16:9 auf einer unscharfen Kopie seiner selbst, beim Aufmacher, in der Geschichte und im Überblick. Kleine Bilder werden nicht aufgeblasen.
* **Bessere Auflösung:** größere Fassungen bei ZDF, DW, SRF, RTS, Spiegel, ntv, ABC und heise, das Bild der Artikelseite bei NZZ, Der Standard, Blick und 20 Minuten, gemessen mit dem neuen `lab/news-images.ts`. The Guardian liefert die größte Fassung aus dem Feed.

## 0.1.1 (2026-10-11)

### Geändert
* Dokumentation wie bei den anderen Modulen: Übersicht, Bedienung, Quellen mit jedem Feed, Geschichten und Wichtigkeit, Architektur, Datenschutz und Recht, auf Deutsch und Englisch, mit Screenshots.
* Einstellungen und Gelesen-Status liegen unter `vectorscope.news.` wie in jedem Modul, statt `vs-news-`. Vorher gewählte Einstellungen werden einmal neu gesetzt.

## 0.1.0 (2026-10-11)

### Neu
* **Erste Version.** Nachrichten aus 35 im Test-Labor geprüften Feeds in 12 Ländern, als Geschichten mit Perspektivenleiste, Ressorts, dem anderen Blick und dem 2-Minuten-Überblick.
* **Sammler** `collector/news.ts` auf dem eigenen Server, nach jeder Runde von INTEL alle 10 Minuten: Feeds lesen, Meldungen nach Bedeutung zu Geschichten zusammenführen, Ressort und Wichtigkeit bestimmen, fehlende Übersetzungen holen, Vorschaubilder von Artikelseiten, Logos verwerfen. Die Ausgabe liegt in `/data/news/` und kommt als `/data/news.json` zur App. Nichts davon landet auf GitHub.
* **Wichtigkeit aus drei Signalen:** unabhängige Quellen aus vielen Ländern, die Startseite der Tagesschau und die ersten Meldungen von ntv, und der Bezug zu DACH. Der Blickwinkel „Aus der Welt“ zählt Quellen außerhalb von DACH.
* **Kein Sprachmodell:** Schlagzeile und Anriss einer Geschichte stammen von ihrer sachlichsten Quelle, je Sprache gewählt, übersetzt nur wo keine Quelle in der Sprache berichtet.
* **Einstellungen:** App-Sprache Deutsch oder Englisch, Meldungen Deutsch, Englisch oder Original, Blickwinkel aus DACH oder aus der Welt, Ansicht ruhig oder bildstark. Der erste Start folgt der Sprache des Geräts, Uhrzeiten stehen in der Zeitzone des Geräts.
* **Neu und gewachsen:** blauer Punkt für neue Geschichten, „+3 Quellen“ für gewachsene, die Linie „Bis hier hattest du gelesen“, neue Geschichten erscheinen erst nach einem Tipp auf den Hinweis unten.
* **Ohne Verbindung** zeigt NEWS die letzte geladene Ausgabe mit Hinweis.
* **Übersetzung** mit DeepL, wenn auf dem Server `DEEPL_KEY` gesetzt ist, sonst über den öffentlichen Google-Übersetzer, direkt oder über den Proxy.
