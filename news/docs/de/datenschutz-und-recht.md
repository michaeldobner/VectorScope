# Datenschutz und Recht

[English version](../en/privacy-and-legal.md) · [Übersicht](README.md)

## Was das Gerät verlässt

| Anfrage | An | Enthält |
|---|---|---|
| Die Ausgabe | Der eigene Server, `/data/news.json` | Nichts, die Datei ist für alle gleich |
| Bilder | Die Server der Medien | Die übliche Anfrage eines Browsers. Das Medium sieht die IP-Adresse, aber keine Herkunftsseite, NEWS schickt keinen Referrer |
| Artikel | Das Medium, wenn du einen Artikel öffnest | Wie jeder Besuch einer Website |

NEWS nutzt keinen Standort, kein Konto, keine Werbung und keine Statistik.

## Was auf dem Gerät bleibt

Im `localStorage` der Adresse des Servers, alle Schlüssel beginnen mit `vectorscope.news.`:

| Schlüssel | Inhalt |
|---|---|
| `ui`, `msg`, `persp`, `view` | Die Einstellungen |
| `seen` | Kennungen geöffneter Geschichten, nur solche der aktuellen Ausgabe |
| `visit` | Zeitpunkt des letzten Besuchs |
| `counts` | Zahl der Quellen je Geschichte beim letzten Besuch, für „+3 Quellen“ |
| `edition` | Die letzte Ausgabe, für den Start ohne Verbindung |

Das Löschen der Websitedaten in Safari entfernt alles.

## Was der Server speichert

Nur öffentliche Meldungen der Medien: die aktuelle Ausgabe, Übersetzungen von Schlagzeilen und Anrissen für sieben Tage, Bildadressen für drei Tage, den Zustand der Feeds. Über Nutzerinnen und Nutzer speichert der Sammler nichts. Volltexte werden nicht gelesen und nicht gespeichert.

## Inhalte Dritter

NEWS zeigt Schlagzeilen, kurze Anrisse und Vorschaubilder so, wie die Medien sie in ihren Feeds und auf ihren Seiten bereitstellen, mit dem Namen des Mediums und einem Link zum Original. Bilder werden nicht kopiert, sondern beim Medium geladen. Der vollständige Text bleibt beim Medium. Die Rechte an den Inhalten liegen bei den jeweiligen Medien. NEWS ist ein persönliches, nicht kommerzielles Projekt.

Übersetzte Titel sind als übersetzt markiert, das Original ist einen Tipp entfernt. Übersetzt wird mit DeepL oder dem Google-Übersetzer.

## Lizenzen

| Teil | Lizenz |
|---|---|
| Code von VectorScope | MIT, siehe [LICENSE](../../../LICENSE) |
| Modell `paraphrase-multilingual-MiniLM-L12-v2` | Apache 2.0 |
| Schriften Inter und Newsreader | SIL Open Font License 1.1 |
| Schlagzeilen, Anrisse, Bilder | bei den jeweiligen Medien |
