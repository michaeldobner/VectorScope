# Rohdaten

[English version](../en/raw-data.md) · [Übersicht](README.md)

Seit Sammlung 0.9.0 behält der Probe-Sammler jede Antwort jeder Quelle so, wie sie kam, dauerhaft. Alles, was INTEL daraus ableitet (Überschriften, Orte, Stories, Event Confidence), lässt sich jederzeit neu berechnen, über die gesamte Historie. Diese Seite beschreibt, wie das Archiv aufgebaut ist, was darin steht, wie man damit arbeitet und wie es weitergeht: auf einem Server, mit Märkten, mit neuen Fragen.

## Grundsatz

Der Aufbau folgt dem kleinen Data-Science-Stack, den David Kriesel für Heimprojekte beschreibt ([Blogbeitrag von 2020](https://www.dkriesel.com/blog/2020/0106_ein_kleiner_technologiestack_fuer_datascience-heimprojekte)):

* **Alle Rohdaten behalten.** „Aussortieren könnt ihr später immer noch, gelöschtes wiederherstellen nicht.“
* **Download und Parsing sind getrennte Schritte.** Der Download muss immer funktionieren und bleibt einfach. Das Parsing darf scheitern und wird einfach neu gestartet.
* **Eine Datei pro Zeitraum, kein Datenbank-Server.** Ein einzelner Nutzer braucht keine Netzwerk-Datenbank, Dateien reichen und lassen sich leicht umziehen.
* **Annahmen über die Daten werden geprüft**, damit eine Änderung bei einer Quelle auffällt, statt still die Daten zu verderben.

| Phase | Kriesel | VectorScope | Code |
|---|---|---|---|
| 1. Download | Python und Requests auf einem Server, eine SQLite-Datei pro Tag | Sammler auf GitHub Actions alle 10 Minuten, eine gzip-Datei mit JSON-Zeilen pro Runde, nur neue oder geänderte Einheiten | `collector/collect.ts`, `collector/archive-raw.ts`, `collector/raw.ts` |
| 2. Parsing | Eigene Skripte, Ergebnis in einer zweiten Datenbank | `collector/parse.ts` mit denselben Parsern wie INTEL, Ergebnis `reports.jsonl.gz` | `collector/parse.ts` |
| 3. Zusammenführen und Prüfen | Jupyter, Pandas, Assertions | Orte, Netzwerke, Stories wie in der App; Prüfungen nach jeder Runde in `health.json` | `collector/checks.ts`, `collector/eval.ts` |
| 4. Analyse | Notebooks, Matplotlib, Gephi | DuckDB auf den Dateien, Gephi für den Weiterleitungs-Graphen, Notebooks nach Bedarf | Beispiele unten |

Bewusste Unterschiede: JSON-Zeilen statt SQLite, weil eine Textdatei pro Runde ins Repository kommt, ohne je eine frühere zu ändern, und DuckDB sie direkt liest. Parquet statt Feather für abgeleitete Datensätze, weil mehr Werkzeuge es lesen.

## Wo die Daten liegen

| Ort | Inhalt | Änderungen |
|---|---|---|
| Branch `collector-raw` | Das Rohdaten-Archiv: `raw/JJJJ/MM/TT/HHMM.jsonl.gz` pro Runde (UTC), einmalig `raw/legacy/archive-JJJJ-MM-TT.jsonl.gz` | Wächst nur. Eine Datei wird nach dem Schreiben nie mehr geändert |
| Branch `collector-data` | Aktueller Stand für INTEL und den Sammler: `latest.json`, `archive.json`, `stats.json`, `health.json`, `raw-state.json` | Wird jede Runde ersetzt, keine Historie |

Beide Branches liegen im Repository `michaeldobner/VectorScope` und haben mit dem Code auf `main` nichts zu tun.

**Größe.** Etwa 20 bis 30 neue Einheiten pro Runde, meist Telegram-Beiträge mit 2 bis 6 KB. Gepackt sind das grob 1 bis 3 MB am Tag, 0,5 bis 1 GB im Jahr. Ein Klon von `main` mit `--single-branch` lädt das Archiv nicht herunter.

## Datensätze

Jede Zeile einer Rundendatei ist ein JSON-Objekt. Das Feld `t` sagt, was es ist.

**`round`**, die erste Zeile jeder Datei:

| Feld | Bedeutung |
|---|---|
| `format` | Version des Datensatzformats, derzeit 1 (`RAW_FORMAT` in `collector/raw.ts`) |
| `round` | Kennung der Runde, Minute in UTC, z. B. `2026-10-08T21:10Z` |
| `at`, `ms` | Beginn der Runde (Epoch ms) und ihre Dauer |
| `sources`, `ok` | Gefragte Quellen, Quellen mit Antwort |
| `units`, `fresh`, `changed` | Einheiten in allen Antworten, davon neu und geändert |

**`fetch`**, eine pro Anfrage, auch wenn sie fehlschlug:

| Feld | Bedeutung |
|---|---|
| `src` | Quellen-ID wie in `intel/src/data/sources.ts`, z. B. `baza`, `rybar-en`, `usgs` |
| `kind`, `api` | `telegram`, `rss`, `bluesky` oder `api`; bei `api` der Dienst: `usgs`, `emsc`, `gdacs`, `nws`, `faa` |
| `url`, `status`, `ms`, `bytes` | Anfrage, HTTP-Status (null, wenn keine Antwort kam), Dauer, Größe der Antwort |
| `units`, `fresh`, `changed` | Einheiten in dieser Antwort, davon neu und geändert |
| `error` | Fehlertext, z. B. `HTTP 503` oder `fetch failed` |

**`unit`**, eine pro neuer oder geänderter Einheit:

| Feld | Bedeutung |
|---|---|
| `key` | Stabiler Schlüssel, siehe unten |
| `v` | Version: 1 beim ersten Sehen, 2, 3, … wenn sich der Inhalt geändert hat |
| `hash` | Fingerabdruck des Inhalts |
| `at` | Zeitpunkt der Anfrage, die diese Version brachte (Epoch ms). Bei `v` 1 ist das der **Zeitpunkt des ersten Sehens**, die wichtigste Zahl des Archivs |
| `src`, `kind`, `api`, `round` | Wie oben |
| `body` | Die Einheit genau so, wie die Quelle sie geschickt hat: HTML des Telegram-Beitrags, XML des RSS-Eintrags, JSON des Bluesky-Beitrags oder des Erdbebens |

**`legacy`**, nur in `raw/legacy/`: die Meldungen des bisherigen Archivs vom 30. September 2026 bis zum Start des Rohdaten-Archivs, bereits zerlegt (`item`), mit dem Zeitpunkt des ersten Sehens, soweit der Sammler ihn hatte.

### Einheiten und Schlüssel

| Quelle | Einheit | Schlüssel |
|---|---|---|
| Telegram | Ein Beitrag der Webvorschau `t.me/s/{Kanal}` | `tg:{Kanal}/{Beitrag}` |
| RSS, Atom, GDACS | Ein `<item>` oder `<entry>` | `rss:{Quelle}:{guid oder Link}`, `gdacs:{guid}` |
| Bluesky | Ein Eintrag des Autoren-Feeds | `bsky:{Beitrags-URI}`, Reposts mit `:repost:{did}` |
| USGS, EMSC, NWS | Ein GeoJSON-Feature | `usgs:{id}`, `emsc:{id}`, `nws:{id}` |
| FAA | Das ganze Statusdokument | `faa:status` |
| Eigener Sensor | Eine Meldung des Sensors | ihre ID, z. B. `sensor:7700:…` |

### Wann eine Einheit als geändert gilt

Der Fingerabdruck lässt weg, was sich ändert, ohne dass sich der Inhalt ändert: bei Telegram der Aufrufzähler, die Reaktionen, das signierte Token `data-view`, das bei jeder Anfrage neu ist, und signierte Bildlinks; bei Bluesky Likes, Reposts, Zitate und Profilbilder, auch von zitierten Beiträgen; die Aktualisierungszeit des FAA-Dokuments. Geprüft an zwei echten Runden: Ohne diese Regeln galten 758 von 1.552 Einheiten als geändert, mit ihnen nur die echten Änderungen (ein FAA-Status, ein GDACS-Update zu einem Wirbelsturm). Ein bearbeiteter Telegram-Beitrag oder eine korrigierte Erdbebenstärke ist eine neue Version. Aufrufe werden deshalb mit jeder Version gespeichert, nicht jede Runde.

### Zustand und Zusicherungen

`raw-state.json` auf `collector-data` kennt jeden Schlüssel mit Fingerabdruck, Version und wann er zuletzt gesehen wurde. Der Workflow pusht zuerst die Rohdatei und veröffentlicht einen Zustand nur, wenn die Rohdatei angekommen ist. Eine Einheit gilt deshalb nie als bekannt, während sie im Archiv fehlt. Im seltenen schlimmsten Fall wird sie doppelt gespeichert, was Phase 2 erkennt. Ein Schlüssel, der 30 Tage nicht gesehen wurde, wird vergessen: Taucht er wieder auf, beginnt er erneut als Version 1.

## Phase 2: Parsing

```bash
# Archiv ohne den Code, nur der Branch
git clone --single-branch --branch collector-raw https://github.com/michaeldobner/VectorScope.git vs-raw
# Im Repository mit dem Code
npx tsx collector/parse.ts ../vs-raw parsed
```

`parsed/reports.jsonl.gz` hat eine Zeile pro Meldung, jeweils die neueste Version einer Einheit:

| Feld | Bedeutung |
|---|---|
| `key`, `kind` | Schlüssel der Einheit; `kind` ist `legacy` bei Meldungen des bisherigen Archivs |
| `id`, `sourceId`, `channel`, `title`, `text`, `url`, `time` | Die Meldung, wie INTEL sie zeigt, `time` ist der Zeitpunkt der Veröffentlichung |
| `lat`, `lon`, `area` | Bei Messquellen |
| `tier`, `region`, `lang` | Klasse, Region und Sprache der Quelle |
| `firstSeen`, `lastChanged`, `versions` | Erstes Sehen, Zeitpunkt der neuesten Version, Zahl der Versionen |
| `telegram` | `forwardedFrom` (Kanal/Beitrag oder Name), `replyTo`, `views`, `edited`, `links`, `mentions`, `media` |

`parsed/problems.jsonl.gz` listet RSS- und Bluesky-Einheiten, die sich nicht zerlegen ließen. Telegram-Beiträge ohne Text, Bluesky-Reposts und Erdbeben unter Stärke 5 sind kein Problem, sie sind einfach keine Meldung.

Ein besserer Parser heißt: `intel/src/data/*.ts` ändern, `parse.ts` erneut laufen lassen, fertig. Das Rohdaten-Archiv bleibt, wie es ist.

**Vorsicht bei den ersten Runden.** Beim Start des Archivs und wenn eine Quelle dazukommt, sieht der Sammler die letzten rund 20 Beiträge auf einmal: Ihr `firstSeen` ist der Start, nicht der Moment ihres Erscheinens. Für Fragen der Geschwindigkeit nur Meldungen mit `firstSeen - time` unter 30 Minuten verwenden.

## Prüfungen

Nach jeder Runde schreibt `collector/checks.ts` die Datei `health.json` nach `collector-data` und hängt die Warnungen an die Zusammenfassung des Laufs unter Actions > Collector:

* Eine Quelle ist 3 Runden in Folge ausgefallen.
* Eine Quelle mit mindestens 8 neuen Meldungen am Tag ist seit 4 ihrer üblichen Abstände still, mindestens 6 Stunden.
* Mehr als 30 Minuten zwischen zwei Runden.
* Weniger als 90 % der Quellen haben geantwortet.
* Meldungen, die eine Annahme verletzen: keine Zeit, Zeit mehr als eine Stunde in der Zukunft, kein Link, keine Überschrift.

Die Zahlen kommen aus `stats.json`, das 8 Tage aufbewahrt. Bis 14. Oktober 2026 stecken darin noch die überhöhten Zahlen aus der Zeit vor Sammlung 0.8.1, die Warnungen zu stillen Quellen sind bis dahin weniger verlässlich.

## Analyse mit DuckDB

[DuckDB](https://duckdb.org) ist ein einzelnes Programm ohne Server. Es liest die gzip-Dateien direkt.

```sql
-- Meldungen je Quelle und Tag
SELECT sourceId, strftime(to_timestamp(firstSeen / 1000), '%Y-%m-%d') AS day, count(*) AS n
FROM read_json_auto('parsed/reports.jsonl.gz') GROUP BY ALL ORDER BY day, n DESC;

-- Weiterleitungs-Graph für Gephi: wer leitet wen weiter
COPY (
  SELECT regexp_extract(key, 'tg:([^/]+)/', 1) AS "Source",
         split_part(telegram.forwardedFrom, '/', 1) AS "Target",
         count(*) AS "Weight"
  FROM read_json_auto('parsed/reports.jsonl.gz')
  WHERE telegram.forwardedFrom IS NOT NULL GROUP BY ALL
) TO 'forwards.csv' (HEADER);

-- Wer hatte einen Ort zuerst
SELECT sourceId, min(to_timestamp(firstSeen / 1000)) AS first
FROM read_json_auto('parsed/reports.jsonl.gz')
WHERE title ILIKE '%Туапсе%' OR title ILIKE '%Tuapse%' GROUP BY ALL ORDER BY first;

-- Bearbeitete Beiträge
SELECT sourceId, title, versions FROM read_json_auto('parsed/reports.jsonl.gz') WHERE versions > 1 ORDER BY versions DESC;

-- Zuverlässigkeit der Quellen: fehlgeschlagene Anfragen je Quelle
SELECT src, count(*) AS requests, count(*) FILTER (WHERE error IS NOT NULL) AS failed
FROM read_json_auto('vs-raw/raw/*/*/*/*.jsonl.gz', union_by_name = true)
WHERE t = 'fetch' GROUP BY ALL ORDER BY failed DESC;

-- Abgeleiteter Datensatz als Parquet
COPY (SELECT * EXCLUDE (text) FROM read_json_auto('parsed/reports.jsonl.gz')) TO 'reports.parquet';
```

**Gephi** ([gephi.org](https://gephi.org), kostenlos): Datei > Tabellenkalkulation importieren > `forwards.csv` als Kantentabelle. Layout ForceAtlas 2, Knotengröße nach Eingangsgrad: Die am häufigsten weitergeleiteten Kanäle stechen heraus.

**Stories über die Historie:** `npx tsx collector/eval.ts <Ordner> [Tage]` bündelt die Meldungen aus `archive.json` wie INTEL und zeigt Status, Vorsprung und Erstmelder. Dasselbe über `reports.jsonl.gz` ist der nächste Schritt, siehe unten.

## Wie es weitergeht

### 1. Nach der Probe weitersammeln

Der Workflow endet am `PROBE_UNTIL` (31. Januar 2027, verlängert vom 12. Oktober 2026). Damit das Archiv darüber hinaus wächst, das Datum in `.github/workflows/collector.yml` verschieben. GitHub Actions ist für öffentliche Repositories kostenlos. Die 6-Stunden-Läufe starten stündlich neu per Zeitplan, Lücken zeigt `health.json`.

### 2. Umzug auf einen Server

Der Stack für einen eigenen Server mit Coolify steht bereit, siehe [Eigener Server](../../../docs/de/server.md): Der Sammler dort schreibt Rundendateien mit dem Namen `HHMM-srv.jsonl.gz` und pusht sie in denselben Branch. Die allgemeinen Schritte, für jeden Server:

1. Den Branch `collector-raw` auf den Server klonen, `raw-state.json` aus `collector-data` kopieren.
2. `npx tsx collector/collect.ts <Daten> <Roh>` jede Minute oder alle paar Minuten per Cron oder systemd-Timer starten. Das Skript hängt nicht an GitHub.
3. `latest.json` vom Server ausliefern (oder weiter nach `collector-data` pushen) und `COLLECTOR_URL` in `intel/src/data/feed.ts` darauf zeigen lassen.
4. Optional: täglich `parse.ts` und eine DuckDB-Datei oder Postgres für schnelle Abfragen. Die Rundendateien bleiben die Grundwahrheit, die Datenbank lässt sich jederzeit daraus neu bauen.
5. Optional: Telegram über die offizielle Client-Schnittstelle (MTProto) mit eigenem Konto statt der Webvorschau. Das bringt vollständige Historie, Weiterleitungen mit Herkunft, Bearbeitungen und Löschungen in Echtzeit. Neue Einheiten bekommen dann eine eigene `kind`, und `RAW_FORMAT` geht auf 2.
6. Den Workflow auf GitHub abschalten.

### 3. Märkte dazunehmen

Marktdaten passen als neue Arten von Einheiten in dasselbe Muster:

| Daten | Quelle | Einheit | Schlüssel |
|---|---|---|---|
| Kurse | z. B. Stooq, Alpha Vantage, Finnhub | Ein Kurs je Instrument und Zeitpunkt | `px:{Kürzel}:{Zeit}` |
| Insiderkäufe USA | SEC EDGAR, Formular 4 | Eine Meldung | `sec4:{Aktenzeichen}` |
| Directors' Dealings EU | BaFin, EQS | Eine Mitteilung | `mar19:{id}` |
| Ad-hoc-Meldungen | EQS, SEC 8-K | Eine Meldung | `adhoc:{id}` |

Schritte: ein Lader nach dem Muster von `intel/src/data/feed.ts`, der `onRaw` aufruft, ein Zerleger in `splitUnits`, ein Parser in `parseUnit`, die neuen Schlüssel auf dieser Seite beschreiben. Die Analyse ist eine Ereignisstudie: Kursbewegung um `firstSeen` einer Story im Vergleich zum Gesamtmarkt.

### 4. Das Format ändern

Felder dürfen jederzeit dazukommen. Ändert ein Feld seine Bedeutung, `RAW_FORMAT` erhöhen, den Unterschied auf dieser Seite beschreiben und `parse.ts` beide Versionen lesen lassen. Alte Dateien nie umschreiben.

## Grenzen

* Die Webvorschau von Telegram zeigt nur die letzten rund 20 Beiträge eines Kanals. Alle 10 Minuten reicht selbst für Clash Report, aber Beiträge, die binnen Minuten gelöscht werden, können fehlen.
* Bilder und Videos werden nicht gespeichert, nur Text, Links und der Hinweis, dass Medien dabei waren.
* `firstSeen` ist nur so genau wie der Abstand der Runden: bis zu 10 Minuten zu spät.
* Das Archiv ist öffentlich wie das Repository. Es enthält nur, was die Quellen selbst veröffentlicht haben, nichts über die Nutzer von INTEL.
