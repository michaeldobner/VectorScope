# VectorScope Intel · Dokumentation

[English version](../en/README.md) · [Zurück zum Modul](../../README.de.md)

Diese Dokumentation beschreibt das Modul INTEL: die Bedienung, welche Quellen es liest und warum, wie es Callsigns, Typen und Orte erkennt, wie der Live-Abgleich funktioniert und wie es aufgebaut ist. Hosting, Proxy und Entwicklung der Sammlung beschreibt die [Dokumentation der Sammlung](../../../docs/de/README.md).

| Dokument | Inhalt | Zielgruppe |
|---|---|---|
| [Bedienung](bedienung.md) | Ansichten, Filter, Live-Treffer, Orte, Quellen, neue Beiträge | Alle |
| [Stories](stories.md) | Stufen der Quellen, Status einer Story, Bündelung, Vorsprung | Alle |
| [Sensor und Karte](sensor.md) | Eigene Beobachtungen in den Live-Flugdaten: Luftaktivität, Notfälle, Lagekarte | Alle |
| [Quellen](quellen.md) | Die 62 geprüften Quellen, die Prüfung, verworfene Kandidaten | Alle |
| [Abgleich](abgleich.md) | Erkennung von Callsigns, Typen und Orten, Regeln und Grenzen des Live-Abgleichs | Alle, Entwicklung |
| [Architektur](architektur.md) | Module, Datenfluss, Proxy-Routen, Speicher, Tests | Entwicklung |
| [Probe-Sammler](sammler.md) | Eine Woche Sammeln auf GitHub Actions, Dateien, Auswertung | Alle, Entwicklung |
| [Datenschutz und Recht](datenschutz-und-recht.md) | Anfragen, Speicherung, Auszüge und Links, Lizenzen | Alle |

## INTEL auf einen Blick

| | |
|---|---|
| Zweck | Geprüfte OSINT- und Verteidigungsnachrichten, abgeglichen mit Flugzeugen, die gerade in der Luft sind |
| Ansichten | Stories, Wire, Map, Live now, Places, Sources |
| Quellen | 62 in sieben Klassen, von Telegram, Bluesky, RSS und Messsystemen |
| Live-Daten | Militärflugzeuge von adsb.lol (ODbL), alle zwei Minuten |
| Aktualisierung | Feed alle fünf Minuten, solange die App geöffnet ist |
| Sprache | Englische Oberfläche, Meldungen in ihrer Originalsprache oder mit **DE** ins Deutsche übersetzt |
| Adresse | https://michaeldobner.github.io/VectorScope/intel/ |
| Version | 0.4.0 |
