# VectorScope News · Dokumentation

[English version](../en/README.md) · [Zurück zum Modul](../../README.de.md)

Diese Dokumentation beschreibt das Modul NEWS: die Bedienung, welche Quellen es liest, wie aus Meldungen Geschichten werden und was wichtig ist, wie es aufgebaut ist und was mit Daten geschieht. Warum NEWS so gebaut ist, steht im [Konzept](../../KONZEPT.md). Hosting, Server und Entwicklung der Sammlung beschreibt die [Dokumentation der Sammlung](../../../docs/de/README.md).

| Dokument | Inhalt | Zielgruppe |
|---|---|---|
| [Bedienung](bedienung.md) | Ansichten, Ressorts, Geschichten, Perspektiven, 2-Minuten-Überblick, Einstellungen, Neues | Alle |
| [Quellen](quellen.md) | Die 35 Feeds, Gruppen und Gewichte, die Prüfung im Labor, verworfene Kandidaten | Alle |
| [Geschichten und Wichtigkeit](geschichten.md) | Zusammenführen nach Bedeutung, Ressorts, die drei Signale der Wichtigkeit, Texte, Bilder, Übersetzung | Alle, Entwicklung |
| [Architektur](architektur.md) | Sammler auf dem Server, Ablauf einer Runde, Format der Ausgabe, App, Tests | Entwicklung |
| [Datenschutz und Recht](datenschutz-und-recht.md) | Anfragen, Speicherung, Inhalte Dritter, Lizenzen | Alle |

## NEWS auf einen Blick

| | |
|---|---|
| Zweck | Die Nachrichten des Tages als Geschichten, mit den Perspektiven vieler Quellen nebeneinander |
| Quellen | 35 Feeds von 29 Medien in 12 Ländern, alle im Test-Labor geprüft |
| Ansichten | Top, Anderer Blick, DACH, Welt, Wirtschaft, Tech, Wissenschaft, Kultur, Sport, 2-Minuten-Überblick |
| Aktualisierung | Der Sammler auf dem eigenen Server baut alle 10 Minuten eine neue Ausgabe, die App fragt alle 5 Minuten nach |
| Sprache | App Deutsch oder Englisch, Meldungen Deutsch, Englisch oder im Original |
| Blickwinkel | Aus DACH oder aus der Welt |
| Adresse | Der eigene Server, Pfad `/news/` |
| Version | 0.1.1 |
