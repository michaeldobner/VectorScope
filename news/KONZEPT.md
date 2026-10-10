# NEWS · Nachrichten: Konzept

Stand: Oktober 2026 · Status: Konzept, klickbarer Prototyp mit echten Schlagzeilen vom 11. Oktober 2026

Die dritte Komponente von VectorScope ersetzt die klassische Nachrichten-App. Ohne Werbung, ohne Konto, ohne Tracking. Sie beantwortet eine Frage: **Was ist heute wichtig, und wie sieht es die Welt?**

## Blattlinie

Sachlich, schnell, mit Ende. Die App ordnet **Geschichten**, nicht Artikel. Ein Ereignis steht einmal da, darunter die Quellen, die darüber berichten. Wer die App öffnet, ist in zwei Minuten auf dem Stand und kann an jeder Stelle tiefer gehen.

## Redaktion

### Aufbau der ersten Seite

1. **Aufmacher:** die Geschichte mit den meisten unabhängigen Quellen aus den meisten Ländern. Großes Bild, Schlagzeile, zwei Sätze, darunter zum Beispiel „14 Quellen · 6 Länder“.
2. **Top 5:** nach derselben Logik.
3. **Ressorts:** DACH, Welt, Wirtschaft, Tech, Wissenschaft, Kultur, Sport. In den Ressorts stehen nur die Schlagzeilen, also was gerade wirklich Thema ist.
4. **Der andere Blick:** Geschichten, die international groß sind, in den DACH-Medien aber kaum vorkommen.
5. **Ende:** „Du bist auf dem Stand.“ Kein endloses Scrollen.

### Redaktionsregeln, automatisch angewendet

- Dieselbe Geschichte erscheint nur einmal. Die Hauptschlagzeile kommt von der sachlichsten Quelle (Tagesschau, SRF, BBC), die anderen Titel stehen in der Perspektivenleiste.
- Wichtigkeit entsteht aus Übereinstimmung: unabhängige Quellen, verschiedene Länder, verschiedene Gruppen.
- Boulevardquellen (Blick, 20 Minuten, watson) bringen Tempo, zählen aber weniger für die Wichtigkeit. Sie bestimmen nie, was oben steht.
- Gefiltert werden Wetter, Sendungshinweise („tagesschau 20:00 Uhr“), doppelte Liveticker und Fluten von Sportergebnissen.

### Quellen

Alle Quellen sind im Test-Labor geprüft (`lab/news.mjs`, Ergebnis im Branch `lab-news-results`).

| Gruppe | Quellen | Gewicht |
|---|---|---|
| Öffentlich-rechtlich DACH | Tagesschau (RSS und API), ZDFheute, Deutschlandfunk, SRF, RTS, RSI, ORF | hoch |
| Qualitätspresse | Spiegel, NZZ, Der Standard, Die Presse | hoch |
| International | BBC, Guardian, NPR, Al Jazeera, DW, France 24, Euronews, ABC Australia, CNA, SCMP, Times of India | hoch |
| Fach | Heise, Golem | für Tech |
| Tempo | 20 Minuten, Blick, watson | niedrig |

Nicht verfügbar: swissinfo (Feed eingestellt), Tages-Anzeiger (nicht erreichbar), CBC (Zeitüberschreitung). Reuters und AP bieten keine offiziellen kostenlosen Feeds.

### Sprache

Schlagzeilen und Anrisse stehen auf Deutsch, die Originalsprache ist einen Tipp entfernt. Eine Einstellung zeigt auf Wunsch alles im Original. Grund: Der schnelle Überblick und der Vergleich der Perspektiven funktionieren nur in einer Sprache.

## Bedienung

### Grundregel: Oben wird nur geschaut, unten wird bedient

- **Oben** steht nur eine ruhige Zeile mit Datum und Uhrzeit, mit Abstand zur Kamera und auf festem Hintergrund. Dort sitzt kein Bedienelement. Neuere iOS-Versionen zeichnen den Bereich unter Statusleiste und Dynamic Island weich, Symbole dort wirken verwaschen.
- **Unten** im Daumenbereich liegt die Ressortleiste.
- **Wischen** nach links oder rechts blättert zum nächsten Ressort.

### Geschichte öffnen

- Ein Tipp schiebt von unten ein Blatt herein: zuerst halbhoch mit Schlagzeile, zwei Sätzen und Perspektivenleiste, hochgezogen mit allem.
- Runterwischen schließt das Blatt.
- **Perspektivenleiste:** Jede Quelle hat eine Karte mit Land, eigener Schlagzeile und Uhrzeit. Ein Tipp öffnet den Originalartikel.

### Lesen in zwei Stufen

1. **In der App:** die Geschichtenseite mit allen Schlagzeilen, Anrissen, Bildern und Perspektiven.
2. **Originalartikel:** öffnet als Fenster über der App, „Fertig“ führt zurück. Kein kopierter Volltext: rechtlich heikel und an Bezahlschranken zum Scheitern verurteilt.

### Was neu ist

- Neue Geschichten tragen einen kleinen eisblauen Punkt.
- Im Strom steht die Linie „Bis hier hattest du gelesen“.
- Wächst eine Geschichte, steht „+3 Quellen“ daran.
- Neue Meldungen schieben den Inhalt nicht weg. Unten erscheint „5 neue Geschichten“, ein Tipp holt sie herein.

### 2-Minuten-Überblick

Ein Knopf unten startet die zehn wichtigsten Geschichten, eine pro Bildschirm, mit Bild, Schlagzeile und zwei Sätzen. Tippen blättert weiter, am Ende steht „Du bist auf dem Stand“. Der Fortschritt liegt unten, nicht an der Kamera.

### iPad

- **Quer:** drei Spalten. Ressorts, Geschichten, rechts die geöffnete Geschichte mit allen Perspektiven.
- **Hochkant:** zwei Spalten, Ressortleiste unten.

### Optik

VectorScope-Graphit mit Eisblau. Bilder nur an den wichtigen Stellen: groß beim Aufmacher, mittel bei den Top-Geschichten, sonst klein. Der Prototyp hat einen Schalter zwischen „ruhig“ und „bildstark“, die Entscheidung fällt am Gerät.

## Technik

- **Sammler statt Browser:** Die meisten Feeds erlauben keinen Abruf aus dem Browser (kein CORS). Der Sammler holt die Feeds, führt Meldungen zu Geschichten zusammen (Themen nach Bedeutung, wie bei INTEL), übersetzt und legt eine fertige Ausgabe als JSON ab. Die App lädt nur diese Ausgabe.
- **Bilder:** Al Jazeera, DW English, Euronews, ORF, Die Presse, NPR und Golem liefern im Feed kein brauchbares Bild. Der Sammler holt dann das Vorschaubild der Artikelseite (og:image). Im Labor fand sich so bei 43 von 46 Meldungen ein Bild, nur Golem liefert keins. Manche Quellen nennen als Vorschaubild nur ihr Logo (NPR, Die Presse). Der Sammler verwirft deshalb Bilder, die bei vielen Artikeln einer Quelle gleich sind. Golem setzt ein Zählpixel statt eines Bildes, das wird erkannt und übersprungen. Kleine Feedbilder (BBC 240 px, SRF 320 px) werden über die Bildadresse in größerer Auflösung geholt.
- **Kodierung:** Golem liefert ISO-8859-1, ZDF schreibt Umlaute als HTML-Entities. Der Parser beachtet beides.
- **Bildrechte:** Bilder werden aus der Quelle angezeigt und verlinkt, nicht dauerhaft gespeichert.

## Später

- **Ausbreitung:** ein dünner Strich an jeder Geschichte, der zeigt, wann welche Quelle eingestiegen ist.
- Weitere Länder für die Perspektivenleiste, zum Beispiel Lateinamerika und Afrika.
