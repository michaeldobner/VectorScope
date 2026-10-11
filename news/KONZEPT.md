# NEWS · Nachrichten: Konzept

Stand: Oktober 2026 · Status: Konzept, klickbarer Prototyp mit echten Schlagzeilen vom 11. Oktober 2026

Die dritte Komponente von VectorScope ersetzt die klassische Nachrichten-App. Ohne Werbung, ohne Konto, ohne Tracking. Sie beantwortet eine Frage: **Was ist heute wichtig, und wie sieht es die Welt?**

## Blattlinie

Sachlich, schnell, mit Ende. Die App ordnet **Geschichten**, nicht Artikel. Ein Ereignis steht einmal da, darunter die Quellen, die darüber berichten. Wer die App öffnet, ist in zwei Minuten auf dem Stand und kann an jeder Stelle tiefer gehen.

## Redaktion

### Aufbau der ersten Seite

1. **Aufmacher:** die wichtigste Geschichte nach der Wichtigkeitsregel unten. Großes Bild, Schlagzeile, zwei Sätze, darunter zum Beispiel „14 Quellen · 6 Länder“.
2. **Plätze 2 und 3.**
3. **Der andere Blick:** als Leiste zum Wischen direkt nach Platz 3, nicht am Ende. Geschichten, die international groß sind, in den DACH-Medien aber kaum vorkommen. Jede Karte sagt, wie viele DACH-Quellen berichten.
4. **Plätze 4 bis 6.**
5. **Ressorts:** DACH, Welt, Wirtschaft, Tech, Wissenschaft, Kultur, Sport. In den Ressorts stehen nur die Schlagzeilen, also was gerade wirklich Thema ist. „Anderer Blick“ steht in der Ressortleiste direkt neben „Top“.
6. **Ende:** „Du bist auf dem Stand.“ Kein endloses Scrollen.

### Redaktionsregeln, automatisch angewendet

- Dieselbe Geschichte erscheint nur einmal. Die Hauptschlagzeile kommt von der sachlichsten Quelle (Tagesschau, SRF, BBC), die anderen Titel stehen in der Perspektivenleiste.
- Wichtigkeit entsteht aus drei Signalen:
  1. **Übereinstimmung:** unabhängige Quellen, verschiedene Länder, verschiedene Gruppen.
  2. **Startseiten:** was die Leitmedien selbst nach oben stellen. Die Tagesschau-Startseite liefert ihre Reihenfolge als API, ntv und ZDF liefern sie über die Reihenfolge im Feed. INTEL misst dasselbe schon im Benchmark von Now.
  3. **DACH-Bezug:** Betroffenheit für Leser in Deutschland, der Schweiz und Österreich.
- Redaktionsprüfung am 11. Oktober, 01:43 Uhr, gegen ntv, Bild, CNN und CNBC: Die reine Übereinstimmung hätte Riad (19 Quellen) zum Aufmacher gemacht. ntv, Tagesschau-Startseite, ZDF und CNBC hatten aber den Diesel-Streit zwischen Trump und Selenskyj oben, nur CNN machte mit Riad auf. Mit Startseiten und DACH-Bezug wird Trump und Selenskyj Aufmacher und Riad Platz 2. Beide Signale sind deshalb Pflicht.
- Boulevardquellen (Blick, 20 Minuten, watson) bringen Tempo, zählen aber weniger für die Wichtigkeit. Sie bestimmen nie, was oben steht.
- Gefiltert werden Wetter, Sendungshinweise („tagesschau 20:00 Uhr“), doppelte Liveticker und Fluten von Sportergebnissen.

### Quellen

Alle Quellen sind im Test-Labor geprüft (`lab/news.mjs`, Ergebnis im Branch `lab-news-results`).

| Gruppe | Quellen | Gewicht |
|---|---|---|
| Öffentlich-rechtlich DACH | Tagesschau (RSS und API), ZDFheute, Deutschlandfunk, SRF, RTS, RSI, ORF | hoch |
| Qualitätspresse und Sender | Spiegel, NZZ, Der Standard, Die Presse, ntv | hoch |
| International | BBC, Guardian, NPR, Al Jazeera, DW, France 24, Euronews, ABC Australia, CNA, SCMP, Times of India | hoch |
| Wirtschaft | CNBC (ohne Bilder im Feed) | für Wirtschaft |
| Fach | Heise, Golem | für Tech |
| Tempo | 20 Minuten, Blick, watson | niedrig |

Nicht verfügbar: swissinfo (Feed eingestellt), Tages-Anzeiger (nicht erreichbar), CBC (Zeitüberschreitung). CNN: Der Feed antwortet, ist aber seit 2023 eingefroren. Bild: Der Feed hat keine Zeitstempel, viele Artikel liegen hinter BILDplus, und der Ton passt nicht zur Blattlinie. Reuters und AP bieten keine offiziellen kostenlosen Feeds.

### Lücken aus der Redaktionsprüfung

- **Reaktionen aus Deutschland** wie die von Strack-Zimmermann auf Trump stehen bei ntv im Liveticker, nicht im Feed. Liveticker brauchen eine eigene Auswertung.
- **Märkte:** CNBC zeigt oben die Börsen, Wirtschaft in NEWS hat keine. Eine Zeile mit DAX, SMI, ATX, Dow, Öl und Franken braucht eine eigene Datenquelle.
- **Details** wie „ein Amerikaner unter den Toten“ (CNN) fehlen, wenn die Zusammenfassung nur aus Schlagzeilen und Anrissen entsteht. Der Sammler sollte die Anrisse aller Quellen einer Geschichte zusammenführen.

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
- **Bilder:** Al Jazeera, DW English, Euronews, ORF, Die Presse, NPR und Golem liefern im Feed kein brauchbares Bild. Der Sammler holt dann das Vorschaubild der Artikelseite (og:image). Im Labor fand sich so bei 41 von 47 Meldungen ein Bild, nur Golem liefert keins. Manche Quellen nennen als Vorschaubild nur ihr Logo (NPR, Die Presse). Der Sammler verwirft deshalb Bilder, die bei vielen Artikeln einer Quelle gleich sind. Golem setzt ein Zählpixel statt eines Bildes, das wird erkannt und übersprungen. Kleine Feedbilder (BBC 240 px, SRF 320 px) werden über die Bildadresse in größerer Auflösung geholt.
- **Kodierung:** Golem liefert ISO-8859-1, ZDF schreibt Umlaute als HTML-Entities. Der Parser beachtet beides.
- **Bildrechte:** Bilder werden aus der Quelle angezeigt und verlinkt, nicht dauerhaft gespeichert.

## Später

- **Ausbreitung:** ein dünner Strich an jeder Geschichte, der zeigt, wann welche Quelle eingestiegen ist.
- Weitere Länder für die Perspektivenleiste, zum Beispiel Lateinamerika und Afrika.
