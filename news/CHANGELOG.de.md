# Changelog · VectorScope News

Alle wesentlichen Änderungen am Modul NEWS. [English](CHANGELOG.md) · [Changelog der Sammlung](../CHANGELOG.de.md)

Das Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), die Versionen folgen [Semantic Versioning](https://semver.org/lang/de/).

## 0.1.0 (2026-10-11)

### Neu
* **Erste Version.** Nachrichten aus 35 im Test-Labor geprüften Feeds in 12 Ländern, als Geschichten mit Perspektivenleiste, Ressorts, dem anderen Blick und dem 2-Minuten-Überblick.
* **Sammler** `collector/news.ts` auf GitHub Actions, alle 10 Minuten: Feeds lesen, Meldungen nach Bedeutung zu Geschichten zusammenführen, Ressort und Wichtigkeit bestimmen, fehlende Übersetzungen holen, Vorschaubilder von Artikelseiten, Logos verwerfen. Die Ausgabe liegt im Branch `news-data`.
* **Wichtigkeit aus drei Signalen:** unabhängige Quellen aus vielen Ländern, die Startseite der Tagesschau und die ersten Meldungen von ntv, und der Bezug zu DACH. Der Blickwinkel „Aus der Welt“ zählt Quellen außerhalb von DACH.
* **Kein Sprachmodell:** Schlagzeile und Anriss einer Geschichte stammen von ihrer sachlichsten Quelle, je Sprache gewählt, übersetzt nur wo keine Quelle in der Sprache berichtet.
* **Einstellungen:** App-Sprache Deutsch oder Englisch, Meldungen Deutsch, Englisch oder Original, Blickwinkel aus DACH oder aus der Welt, Ansicht ruhig oder bildstark. Der erste Start folgt der Sprache des Geräts, Uhrzeiten stehen in der Zeitzone des Geräts.
* **Neu und gewachsen:** blauer Punkt für neue Geschichten, „+3 Quellen“ für gewachsene, die Linie „Bis hier hattest du gelesen“, neue Geschichten erscheinen erst nach einem Tipp auf den Hinweis unten.
* **Ohne Verbindung** zeigt NEWS die letzte geladene Ausgabe mit Hinweis.
