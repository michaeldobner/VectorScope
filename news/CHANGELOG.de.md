# Changelog · VectorScope News

Alle wesentlichen Änderungen am Modul NEWS. [English](CHANGELOG.md) · [Changelog der Sammlung](../CHANGELOG.de.md)

Das Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), die Versionen folgen [Semantic Versioning](https://semver.org/lang/de/).

## 0.3.1 (2026-10-17)

### Geändert
* **Belgische Feeds nach der ersten Runde auf dem Server:** VRT NWS, De Morgen und HLN liefern. De Standaard und Het Nieuwsblad weisen den Server ab (403) und sind raus. De Tijd und Brussels Times probieren mehrere Adressen nacheinander; `news-stats.json` nennt die Adresse, die liefert, und wenn keine liefert, den Anfang der Antwort.
* **Die Schlagzeilen von VRT NWS** zählen für die belgische Wichtigkeit wie die Tagesschau-Startseite für DACH.
* **Gruppierung:** Zwei Titel mit einem gemeinsamen langen Wort (Haushalt, Autobahn) finden leichter zusammen, so werden flämische Liveticker und Schlagzeilen zu einem Ereignis eine Geschichte.
* **Ressorts:** Flämischer Sport (`wielrennen`, `voetbal`, Bahnradsport, Rote Teufel) kommt in Sport statt Belgien; niederländische Adressen für Kultur und Wirtschaft zählen auch. Eine einzelne Meldung eines Tempo-Mediums rückt nicht mehr vor, nur weil sie neu ist.
* **Titel:** „Live -“, „LIVEBLOG“, „LIVESTREAM“, „EXCLUSIEF“ fallen weg, von zwei mit „•“ verbundenen Schlagzeilen bleibt die erste.

## 0.3.0 (2026-10-17)

### Neu
* **Belgien, zuerst Flandern:** VRT NWS (Niederländisch und Englisch), De Standaard, De Morgen, De Tijd, Brussels Times, HLN und Het Nieuwsblad. Auf Probe: Der Entwicklungsrechner erreicht belgische Seiten nicht, der eigene Server prüft die Feeds in jeder Runde.
* **Blickwinkel Belgien** mit eigener Wichtigkeit (`beScore`), dem Ressort Belgien und einem eigenen anderen Blick. Ein Gerät mit Niederländisch oder Region Belgien startet mit Englisch und Belgien. Die Medien der anderen Heimatregion zählen zusammen wie eines, so drängen flämische Geschichten nicht in die Top-Seite aus DACH und umgekehrt.
* **`/data/news-stats.json`** auf dem eigenen Server: pro Feed der letzten Runde, ob er liefert, wie viele Meldungen und welcher Fehler.

### Behoben
* Die Erklärungen unter Meldungen und Blickwinkel in den Einstellungen erschienen als dunkler Kasten mitten im Bild: Der Hinweis des Überblicks trug denselben Namen.

## 0.2.4 (2026-10-12)

### Behoben
* Der Börsenschluss in New York bleibt in Wirtschaft: Die ersten fünf Meldungen von CNBC World zählen wie die ersten drei von ntv (1,5), denn beide Feeds sind nach Redaktion sortiert, nicht nach Zeit. Eine einzelne CNBC-Meldung blieb vorher nie in einer Ausgabe, auch nicht mit 20 Plätzen pro Ressort: Gemessen im Test-Labor am 12. Oktober 2026 steht „S&P 500 closes near flat“ jetzt auf Platz 4 von Wirtschaft.

## 0.2.3 (2026-10-12)

### Behoben
* NEWS aktualisiert sich, während die App offen ist: Eine neue Ausgabe erscheint sofort, wenn du oben in der Liste bist und keine Geschichte offen ist, auch beim Zurückkehren zur App. Vorher wartete jede Ausgabe mit einer neuen Geschichte hinter dem Hinweis „↑ neue Geschichten“, oft verdeckt von einer offenen Geschichte, und die App wirkte eingefroren, bis man sie schloss und neu öffnete. Beim Lesen bleibt der Hinweis, die wartende Ausgabe kommt herein, sobald du wieder oben bist. Zusätzlich prüft die App bei `pageshow` und `focus`, für Home-Bildschirm-Apps, die iOS aus dem Speicher holt.

## 0.2.2 (2026-10-12)

### Neu
* Feed CNBC World News: Er enthält den Börsenschluss in New York („S&P 500 closes near flat …“), Top News nicht. Geprüft im Test-Labor am 12. Oktober 2026, 13 CNBC-Feeds verglichen.

### Geändert
* CNBC-Meldungen kommen nach ihrem Titel ins Ressort Wirtschaft, nur wenn es um Börse und Unternehmen geht (S&P 500, Wall Street, Quartalszahlen, Zinsen, Öl, Übernahmen). Seit 0.2.1 galt das für jede CNBC-Meldung, auch für Politik.

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
