# Probe-Sammler

[English version](../en/collector.md) · [Übersicht](README.md)

INTEL lädt nur, solange es geöffnet ist, und ein Telegram-Kanal zeigt nur seine letzten rund 20 Beiträge. Fleißige Kanäle wie Clash Report posten mehr als 300 Mal am Tag, das meiste würde also nie gesehen. Der Probe-Sammler schließt diese Lücke für eine Woche, kostenlos, und beantwortet die Frage, ob sich ein dauerhafter Sammler lohnt.

## Was er tut

| | |
|---|---|
| Läuft | Alle 10 Minuten auf GitHub Actions (`.github/workflows/collector.yml`). GitHub startet zeitgesteuerte Läufe bei einem ruhigen Repository nur alle paar Stunden, deshalb sammelt ein Lauf fast sechs Stunden lang, und der stündliche Zeitplan reiht den nächsten ein. Eine Änderung am Sammler oder an den Quellen ersetzt die laufende Sammlung sofort |
| Bis | 12. Oktober 2026, danach tut der Workflow nichts mehr. `PROBE_UNTIL` im Workflow ändert das Datum |
| Lädt | Jede Quelle von INTEL direkt bei den Herausgebern, auf einem Server ist kein Proxy nötig |
| Behält | Jede Meldung der letzten 7 Tage mit dem Zeitpunkt, an dem er sie zuerst gesehen hat, dazu den Schlüssel jeder je gesehenen Meldung, damit keine Meldung zweimal als neu zählt |
| Veröffentlicht | Branch `collector-data` als einzelner Commit, das Repository wächst also nicht |
| Kosten | Keine. Minuten auf GitHub Actions sind für öffentliche Repositories kostenlos |

Das Skript ist `collector/collect.ts`. Es nutzt dieselben Lade-, Lese- und Zusammenführungsfunktionen wie INTEL im Browser.

## Dateien im Branch collector-data

| Datei | Inhalt | Genutzt von |
|---|---|---|
| `latest.json` | Meldungen der letzten 72 Stunden, Auszüge gekürzt | INTEL im Browser |
| `archive.json` | Jede Meldung der letzten 7 Tage | Auswertung |
| `stats.json` | Ein Eintrag pro Runde: je Quelle ok, Zahl der Meldungen, neue Meldungen der letzten 24 Stunden, Fehler | Auswertung, Prüfungen |
| `health.json` | Prüfungen nach jeder Runde: ausgefallene und stille Quellen, Lücken, Meldungen, die eine Annahme verletzen | Überwachung |
| `raw-state.json` | Welche Roh-Einheiten bekannt sind, mit Fingerabdruck und Version | Sammler |

Daneben behält der Branch `collector-raw` jede Antwort jeder Quelle dauerhaft, eine Datei pro Runde. Aufbau, Format und Auswertung: [Rohdaten](rohdaten.md).

## In der App

Bei jeder Aktualisierung lädt INTEL zusätzlich zu den Live-Quellen `latest.json` von `raw.githubusercontent.com` und führt beides zusammen. Meldungen, die aus einem Kanal gerutscht sind, während die App geschlossen war, sind deshalb da. Unter Sources steht, wann der Sammler zuletzt lief.

## Auswertung nach einer Woche

Die Auswertung beantwortet:

* Wie viele Meldungen je Quelle und Tag, und wie viel davon ist Lärm?
* Wie oft melden die schnellen Kanäle zuerst, und wie weit vor den bestätigenden Quellen (Vorsprung je Story)?
* Welche Stories haben mehrere Quellen bestätigt?
* Hat der Sammler die Ereignisse erwischt, die zuerst auf X zu sehen waren?

Danach wird entschieden, ob INTEL einen dauerhaften Sammler bekommt und welche Quellen bleiben.

`npx tsx collector/eval.ts <Ordner> [Tage]` liest `archive.json` aus einem Ordner und zeigt, was INTEL angezeigt hätte: Meldungen je Klasse, Stories mit mehreren unabhängigen Quellen, Vorsprung und Erstmelder.

## Starten und stoppen

* Von Hand starten: Actions > Collector > Run workflow.
* Stoppen: Den Workflow unter Actions > Collector > ⋯ > Disable workflow abschalten oder das Datum verstreichen lassen.
* Daten entfernen: Den Branch `collector-data` löschen. INTEL arbeitet dann nur mit Live-Quellen.
