# Geschichten und Wichtigkeit

[English version](../en/stories.md) · [Übersicht](README.md)

Aus über tausend Meldungen pro Runde macht NEWS rund 230 Geschichten, ordnet sie Ressorts zu und bestimmt, was oben steht. Alles in `news/src/data/edition.ts`, ohne Sprachmodell: Texte schreibt keine KI, sie stammen von den Medien.

## Welche Meldungen zählen

Meldungen der letzten 36 Stunden. Nicht dabei sind Sendungshinweise („tagesschau 20:00 Uhr“), Wetter, Anzeigen, Bulletins, Live-Hinweise, Podcasts und Bildergalerien der Woche. Zwei Feeds mit derselben Meldung (NZZ Neueste und NZZ Schweiz) zählen einmal.

## Zusammenführen nach Bedeutung

Jede Schlagzeile wird ein Vektor des mehrsprachigen Modells `paraphrase-multilingual-MiniLM-L12-v2`, desselben wie bei INTEL (`collector/embed.ts`). Verglichen wird die englische Fassung der Schlagzeile, wo es eine Übersetzung gibt.

* Meldungen werden nach Zeit durchgegangen. Eine Meldung schließt sich der Geschichte an, deren ähnlichste Meldung eine Kosinus-Ähnlichkeit von mindestens **0,8** hat.
* Sind zwei Vektoren in verschiedenen Sprachen entstanden, weil eine Übersetzung fehlt, sinkt die Schwelle um **0,08**. So finden „Viele Tote bei Angriff auf Flughafen in Riad“ und „Twelve killed in attack on Riyadh airport“ zusammen. In der ersten echten Runde wurde Riad so eine Geschichte mit 16 Quellen.
* Zwei Meldungen desselben Feeds kommen nie über den Vergleich miteinander in eine Geschichte.
* Ohne Modell zählen gemeinsame Wörter (Jaccard ab 0,5). Das findet nur Meldungen in derselben Sprache.

Die Kennung einer Geschichte ist der Link ihrer ersten Meldung. So bleibt sie über Runden gleich, und die App erkennt Neues und Gewachsenes.

## Ressorts

Jede Meldung bekommt ein Ressort, wenn etwas es sagt, in dieser Reihenfolge:

1. Der Feed ist ein Ressort (SRF Schweiz, SRF Wirtschaft, NZZ Schweiz, heise, Golem).
2. Die Adresse des Artikels: `/sport/`, `/wirtschaft/`, `/wissen/`, `/kultur/`, `/inland/`, `/schweiz/` und ähnliche, auf Deutsch und Englisch.
3. Die Kategorie im Feed, bei der Tagesschau zum Beispiel „inland“.
4. Wörter im Titel: Ergebnis mit Sportbegriff wird Sport, Bundestag, Kanton, ÖVP, Merz, Zürich und ähnliche in einem deutschsprachigen Titel werden DACH.

Die Geschichte nimmt das Ressort mit den meisten Stimmen, bei Gleichstand in der Reihenfolge Sport, Tech, Wirtschaft, Wissenschaft, Kultur, DACH. **Ein Ressort braucht ein Drittel der Meldungen**, sonst wird es Welt. So macht ein Wirtschaftsfeed unter vier Weltmeldungen keine Wirtschaftsgeschichte.

## Wichtigkeit

Drei Signale, aus der Redaktionsprüfung gegen ntv, Bild, CNN und CNBC am 11. Oktober 2026: Die reine Zahl der Quellen hätte Riad zum Aufmacher gemacht, die Leitmedien hatten aber den Diesel-Streit zwischen Trump und Selenskyj oben.

**Aus DACH** (`score`):

| Signal | Punkte |
|---|---|
| Übereinstimmung | Summe der Gewichte aller Medien der Geschichte, siehe [Quellen](quellen.md) |
| Breite | 0,5 je Land |
| Redaktionen | Startseite der Tagesschau: Platz 1 bis 3 gibt 4, bis 8 gibt 2, bis 15 gibt 1. Unter den ersten drei Meldungen von ntv und den ersten fünf von CNBC World (beide nach Redaktion sortiert, nicht nach Zeit): 1,5. Es zählt das höchste |
| DACH-Bezug | 0,4 je Medium aus Deutschland, der Schweiz oder Österreich (ohne DW English) |
| Alter | minus 0,12 je Stunde seit der neuesten Meldung |

**Aus der Welt** (`worldScore`): Gewichte und Länder nur der Medien außerhalb von DACH, DW English zählt international, dazu 0,2 je DACH-Medium und dasselbe Alter.

Die Top-Seite zeigt die sechs Geschichten mit der höchsten Wichtigkeit im gewählten Blickwinkel. In den Ressorts stehen die Top-Geschichten nicht noch einmal.

## Der andere Blick

| Blickwinkel | Der andere Blick zeigt | Sortiert nach |
|---|---|---|
| Aus DACH | Geschichten ohne DACH-Quelle mit mindestens zwei internationalen | Zahl der Quellen |
| Aus der Welt | Geschichten ohne internationale Quelle mit mindestens zwei aus DACH | Zahl der Quellen |

Jede Karte sagt, wie viele Quellen der anderen Seite berichten: „Keine DACH-Quelle“ oder „Keine internationale Quelle“.

## Der Text einer Geschichte

Für jede Sprache wählt NEWS eine Leitquelle, deren Schlagzeile und Anriss oben stehen:

| Meldungen | Reihenfolge |
|---|---|
| Deutsch | Tagesschau, SRF, ZDFheute, Deutschlandfunk, ORF, NZZ, DW, Der Standard, Die Presse, Spiegel, ntv, heise, Golem |
| Englisch | BBC, The Guardian, NPR, DW, France 24, Euronews, ABC Australia, CNA, Al Jazeera, SCMP, CNBC, Times of India |
| Original | Tagesschau, SRF, BBC, ZDFheute, Deutschlandfunk, ORF, NZZ, The Guardian, DW, Der Standard, Spiegel, NPR, Al Jazeera |

Berichtet ein Medium in der gewählten Sprache, kommt der Text von ihm, unverändert. Nur wenn keines in der Sprache berichtet, wird die Leitquelle übersetzt, und die App sagt „Übersetzt aus …“. Fehlt die Übersetzung noch, steht das Original da, ohne Marke, die nächste Runde holt sie nach. Der Anriss wird auf etwa 260 Zeichen am Satzende gekürzt und weggelassen, wenn er nur den Titel wiederholt.

## Bilder

1. Das Bild der Leitquelle, sonst das erste Bild einer Quelle außerhalb der Tempo-Gruppe, sonst irgendeines.
2. Nennt die Adresse die Größe, holt NEWS eine größere Fassung: ZDF, DW, SRF, RTS, Spiegel, ntv, ABC, heise und BBC, jede im Labor geprüft (`lab/news-images.ts`).
3. Bei NZZ, Der Standard, Blick und 20 Minuten taugt das Feedbild nicht: zu klein mit signierter Adresse, oder bei 20 Minuten bis 5000 Pixel und 1 MB groß. Dort gilt das Bild der Artikelseite.
4. Hat eine Geschichte so kein Bild, liest der Sammler bis zu 60 Artikelseiten pro Runde und nimmt deren Vorschaubild (`og:image`), drei Tage zwischengespeichert.
5. Ein Bild, das ein Medium für drei oder mehr verschiedene Artikel nutzt, ist ein Logo und wird verworfen.

Bilder werden nicht kopiert, die App lädt sie direkt vom Medium.

## Übersetzung

Übersetzt werden die Schlagzeilen aller Meldungen in die jeweils anderen Sprachen und die Anrisse der Leitquellen, höchstens 400 Texte pro Sprache und Runde, sieben Tage zwischengespeichert:

1. Mit **DeepL**, wenn auf dem Server `DEEPL_KEY` gesetzt ist. DeepL API Free übersetzt 500.000 Zeichen im Monat kostenlos.
2. Sonst über den öffentlichen **Google-Übersetzer**, wie bei INTEL, und lehnt Google ab, über den Proxy.

Lehnt auch der ab, bleiben Meldungen in ihrer Sprache. Die App funktioniert dann trotzdem, weil jede Geschichte ihren Text aus einer Quelle in der gewählten Sprache nimmt, wo es eine gibt.
