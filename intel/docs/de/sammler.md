# Probe-Sammler

[English version](../en/collector.md) · [Übersicht](README.md)

INTEL lädt nur, solange es geöffnet ist, und ein Telegram-Kanal zeigt nur seine letzten rund 20 Beiträge. Fleißige Kanäle wie Clash Report posten mehr als 300 Mal am Tag, das meiste würde also nie gesehen. Der Probe-Sammler schließt diese Lücke für eine Woche, kostenlos, und beantwortet die Frage, ob sich ein dauerhafter Sammler lohnt.

## Was er tut

| | |
|---|---|
| Läuft | Alle 15 Minuten auf GitHub Actions (`.github/workflows/collector.yml`), praktisch alle 15 bis 30 Minuten, weil GitHub zeitgesteuerte Läufe verzögert. Außerdem direkt nach jeder Änderung am Sammler oder an den Quellen |
| Bis | 12. Oktober 2026, danach tut der Workflow nichts mehr. `PROBE_UNTIL` im Workflow ändert das Datum |
| Lädt | Jede Quelle von INTEL direkt bei den Herausgebern, auf einem Server ist kein Proxy nötig |
| Behält | Jede Meldung der letzten 7 Tage mit dem Zeitpunkt, an dem er sie zuerst gesehen hat |
| Veröffentlicht | Branch `collector-data` als einzelner Commit, das Repository wächst also nicht |
| Kosten | Keine. Minuten auf GitHub Actions sind für öffentliche Repositories kostenlos |

Das Skript ist `collector/collect.ts`. Es nutzt dieselben Lade-, Lese- und Zusammenführungsfunktionen wie INTEL im Browser.

## Dateien im Branch collector-data

| Datei | Inhalt | Genutzt von |
|---|---|---|
| `latest.json` | Meldungen der letzten 72 Stunden, Auszüge gekürzt | INTEL im Browser |
| `archive.json` | Jede Meldung der letzten 7 Tage | Auswertung |
| `stats.json` | Ein Eintrag pro Lauf: je Quelle ok, Zahl der Meldungen, neue Meldungen, Fehler | Auswertung |

## In der App

Bei jeder Aktualisierung lädt INTEL zusätzlich zu den Live-Quellen `latest.json` von `raw.githubusercontent.com` und führt beides zusammen. Meldungen, die aus einem Kanal gerutscht sind, während die App geschlossen war, sind deshalb da. Unter Sources steht, wann der Sammler zuletzt lief.

## Auswertung nach einer Woche

Die Auswertung beantwortet:

* Wie viele Meldungen je Quelle und Tag, und wie viel davon ist Lärm?
* Wie oft melden die schnellen Kanäle zuerst, und wie weit vor den bestätigenden Quellen (Vorsprung je Story)?
* Welche Stories haben mehrere Quellen bestätigt?
* Hat der Sammler die Ereignisse erwischt, die zuerst auf X zu sehen waren?

Danach wird entschieden, ob INTEL einen dauerhaften Sammler bekommt und welche Quellen bleiben.

## Starten und stoppen

* Von Hand starten: Actions > Collector > Run workflow.
* Stoppen: Den Workflow unter Actions > Collector > ⋯ > Disable workflow abschalten oder das Datum verstreichen lassen.
* Daten entfernen: Den Branch `collector-data` löschen. INTEL arbeitet dann nur mit Live-Quellen.
