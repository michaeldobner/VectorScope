# VectorScope News · Dokumentation

[English version](../en/README.md) · [Zurück zum Modul](../../README.de.md) · [Konzept](../../KONZEPT.md)

## NEWS auf einen Blick

| | |
|---|---|
| Zweck | Die Nachrichten des Tages als Geschichten, mit den Perspektiven vieler Quellen nebeneinander |
| Quellen | 35 Feeds von 29 Medien in 12 Ländern, alle im Test-Labor geprüft |
| Aktualisierung | Der Sammler baut alle 10 Minuten eine neue Ausgabe, die App fragt alle 5 Minuten nach |
| Sprache | App Deutsch oder Englisch, Meldungen Deutsch, Englisch oder im Original |
| Adresse | https://michaeldobner.github.io/VectorScope/news/ |
| Version | 0.1.0 |

## Bedienung

* **Ressorts** liegen unten in der Leiste: Top, Anderer Blick, DACH, Welt, Wirtschaft, Tech, Wissenschaft, Kultur, Sport. Wischen nach links oder rechts blättert zum nächsten Ressort. Auf dem iPad stehen sie links.
* **Top** zeigt den Aufmacher, die Plätze 2 und 3, den anderen Blick als Leiste zum Wischen und die Plätze 4 bis 6.
* **Eine Geschichte antippen** schiebt ein Blatt herein: Schlagzeile, Anriss, woher der Text stammt („Nach Tagesschau“, „Übersetzt aus BBC“), die Perspektivenleiste und alle Quellen nach Gruppen. Hochziehen zeigt alles, Runterwischen schließt. Jede Quelle öffnet ihren Artikel.
* **2 Min** startet den Überblick: zehn Geschichten, eine pro Bildschirm, Tippen blättert weiter, Runterwischen beendet.
* **Regler unten rechts:** App-Sprache, Meldungen, Blickwinkel, Ansicht.
* **Neu:** Ein blauer Punkt markiert Geschichten seit dem letzten Besuch, „+3 Quellen“ gewachsene, die Linie „Bis hier hattest du gelesen“ trennt Neues von Bekanntem. Kommt eine neue Ausgabe mit neuen Geschichten, erscheint unten ein Hinweis, der Inhalt springt nicht.

## Quellen

| Gruppe | Medien | Gewicht |
|---|---|---|
| Öffentlich-rechtlich | Tagesschau (API und Startseite), ZDFheute, Deutschlandfunk, DW, SRF, RTS, RSI, ORF | 1 |
| Qualitätspresse und Sender | Spiegel, ntv, NZZ, Der Standard, Die Presse | 1 |
| International | BBC, The Guardian, NPR, Al Jazeera, DW English, France 24, Euronews, ABC Australia, CNA, SCMP, Times of India | 1 |
| Wirtschaft | CNBC | 0,8 |
| Fachmedien | heise, Golem | 0,7 |
| Tempo | 20 Minuten, Blick, watson | 0,4 |

Geprüft mit `lab/news.mjs` (Workflow `lab-news.yml`, Ergebnis im Branch `lab-news-results`). Nicht dabei: swissinfo (Feed eingestellt), Tages-Anzeiger (nicht erreichbar), CBC (Zeitüberschreitung), CNN (seit 2023 eingefroren), Bild (keine Zeitstempel), Reuters und AP (keine freien Feeds).

## Geschichten und Wichtigkeit

* **Zusammenführen:** Jede Schlagzeile wird ein Vektor des mehrsprachigen Modells `paraphrase-multilingual-MiniLM-L12-v2` (wie bei INTEL, `collector/embed.ts`). Eine Meldung schließt sich der Geschichte an, deren ähnlichste Meldung eine Kosinus-Ähnlichkeit von mindestens 0,8 hat. Ohne Modell zählen gemeinsame Wörter.
* **Wichtigkeit aus DACH:** Summe der Gewichte der Medien, plus 0,5 je Land, plus die Startseite der Tagesschau (Platz 1 bis 3: 4 Punkte, bis 8: 2, bis 15: 1) und die ersten drei Meldungen von ntv (1,5), plus 0,4 je DACH-Medium, minus 0,12 je Stunde seit der letzten Meldung.
* **Wichtigkeit aus der Welt:** Gewichte und Länder nur der Medien außerhalb von DACH, DACH-Medien zählen 0,2.
* **Ressort:** aus Feed, Adresse, Kategorie und Wörtern jeder Meldung. Ein Ressort braucht ein Drittel der Meldungen, sonst Welt.
* **Text:** Schlagzeile und Anriss der sachlichsten Quelle, je Sprache gewählt (Deutsch: Tagesschau, SRF, ZDFheute …, Englisch: BBC, Guardian, NPR …, Original: Tagesschau, SRF, BBC …). Nur wenn keine Quelle in der Sprache berichtet, wird übersetzt, und die App sagt das.
* **Bild:** aus dem Feed, sonst das Vorschaubild der Artikelseite (og:image). Ein Bild, das ein Medium für drei oder mehr Artikel nutzt, ist ein Logo und wird verworfen.

## Aufbau

| Teil | Datei |
|---|---|
| Feeds | `news/src/data/feeds.ts` |
| Lesen der Feeds | `news/src/data/parse.ts` |
| Geschichten, Ressorts, Wichtigkeit, Texte | `news/src/data/edition.ts`, Tests in `edition.test.ts` |
| Sammler | `collector/news.ts`, Workflow `.github/workflows/news.yml` |
| App | `news/src/main.ts`, `news/src/i18n.ts`, `news/src/styles.css` |

Der Sammler legt im Branch `news-data` ab: `news.json` (die Ausgabe), `news-translations.json` (Übersetzungen, 7 Tage), `news-og.json` (Bilder der Artikelseiten, 3 Tage), `news-stats.json` (Zustand jedes Feeds). Übersetzt wird mit DeepL, wenn das Repository das Secret `DEEPL_KEY` hat (DeepL API Free, 500.000 Zeichen im Monat kostenlos). Ohne Schlüssel fragt der Sammler den öffentlichen Google-Übersetzer, direkt und über den Proxy bei Vercel. Google lehnt die Server von GitHub oft ab, dann bleiben Meldungen in ihrer Originalsprache, unmarkiert, und jede Geschichte nimmt ihren Text aus einer Quelle in der gewählten Sprache, wo es eine gibt.

## Recht

NEWS zeigt Schlagzeilen, kurze Anrisse und Vorschaubilder, wie die Verlage sie in ihren Feeds und auf ihren Seiten anbieten, und verlinkt jeden Artikel. Volltexte werden nicht gespeichert. Die App speichert Einstellungen und Gelesen-Status nur auf dem Gerät.
