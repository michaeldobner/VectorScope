# Changelog · VectorScope

Änderungen an der Sammlung als Ganzes: Aufbau, Startseite, Build, Prüfungen, Workflows. Änderungen an einem Modul stehen in dessen eigenem Changelog: [AIR](air/CHANGELOG.de.md), [INTEL](intel/CHANGELOG.de.md), [gemeinsame Hülle](shared/CHANGELOG.de.md). [English](CHANGELOG.md)

Das Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), die Versionen folgen [Semantic Versioning](https://semver.org/lang/de/).

## 0.20.0 (2026-10-09)

### Geändert
* Messlatte: Der Themenabgleich liegt jetzt in `intel/src/data/topics.ts`, Now nutzt ihn für einen Platz pro Thema. Füllwörter und ein doppelt gezählter Name verbinden keine Überschriften mehr.
* Modul INTEL 0.14.0.

## 0.19.0 (2026-10-09)

### Neu
* **Messlatte für Now:** Einmal pro Stunde legt der Sammler die ersten zehn Überschriften von Tagesschau, ntv und Spiegel ab (`collector/reference.ts`). `collector/benchmark.ts` rechnet Now für jede Stunde neu und misst Recall@5 und @10 der Themen, bei denen sich zwei Redaktionen einig sind. Das Test-Labor misst täglich und nach jeder Änderung an der Datenlogik. Siehe [Messlatte für Now](intel/docs/de/messlatte.md).

## 0.18.0 (2026-10-09)

### Geändert
* **Rohdaten-Archiv nicht mehr öffentlich.** Der GitHub-Sammler schreibt kein Rohdaten-Archiv mehr, `archive.json` auf `collector-data` enthält Auszüge wie `latest.json`. Das Rohdaten-Archiv bleibt auf dem eigenen Server und in seiner täglichen Sicherung, gepusht nur mit `RAW_PUSH_URL`, das auf ein privates Repository zeigen muss.
* Modul INTEL 0.13.0, siehe sein Changelog.

## 0.17.0 (2026-10-09)

### Neu
* Modul INTEL 0.12.0 mit dem Überblick Now, siehe sein Changelog.

## 0.16.0 (2026-10-09)

### Neu
* Startseite: eine Live-Zahl pro Modul, weltweit sendende Militärflugzeuge für AIR, Meldungen der letzten 24 Stunden und der letzten Stunde für INTEL. Der Text von INTEL nennt Sicherheit und Politik.
* Gemeinsame Hülle 1.1.0, Modul AIR 0.5.0 und INTEL 0.11.0, siehe ihre Changelogs.

## 0.15.2 (2026-10-09)

### Behoben
* Modul INTEL 0.10.2.

## 0.15.1 (2026-10-09)

### Behoben
* Übersetzung im Sammler: in Portionen von 20 Texten mit Pause, eine Runde stoppt, sobald Google eine ganze Portion ablehnt, ein abgelehnter Text wird nach 10 Minuten erneut angefragt, danach jeweils dreimal später, nie aufgegeben, solange seine Meldung aktuell ist. Im Labor wurde ein zweiter Durchlauf direkt danach für die Hälfte der Texte abgelehnt.
* Modul INTEL 0.10.1.

## 0.15.0 (2026-10-09)

### Neu
* Der Sammler übersetzt jede Überschrift und jeden Auszug der letzten 72 Stunden einmal ins Englische und Deutsche (`collector/translate.ts`, öffentlicher Google-Zugang), hält sie in `translations.json` und gibt sie INTEL in `latest.json` und der Datenbank.
* Test-Labor misst die Übersetzung des Sammlers: Texte und Zeichen am Tag pro Sprache, wie viele Google ablehnt.
* Modul AIR 0.4.0 und INTEL 0.10.0, siehe ihre Changelogs.

## 0.14.0 (2026-10-08)

### Neu
* Proxy liefert die 12 neuen Feeds der Stimmen der Politik.
* Sammler lädt Quellen, die nur für ihn markiert sind (88 Bundestagsabgeordnete auf Bluesky, Abstimmungen von abgeordnetenwatch.de, POLITICO Berlin Playbook), und legt die Abstimmungen im Rohdaten-Archiv ab, eine Einheit pro Abstimmung.
* Test-Labor: `lab/voices.mjs` speichert Beispiele der neuen Feeds und APIs und probiert die DIP-API des Bundestags. `scripts/members.mjs` schreibt die Abgeordnetenliste aus den Laborergebnissen.
* Modul INTEL 0.9.0, siehe sein [Changelog](intel/CHANGELOG.de.md).

## 0.13.0 (2026-10-08)

### Neu
* Der Proxy liefert die Feeds und Telegram-Kanäle der 20 Politik-Quellen, insgesamt 52 Telegram-Kanäle.
* Das Test-Labor prüft Kandidaten für die Politik-Linse und zeigt pro Feed Einträge pro Tag und die neueste Überschrift.
* Modul INTEL 0.8.0, siehe sein [Changelog](intel/CHANGELOG.de.md).

## 0.12.0 (2026-10-08)

### Neu
* `collector/backfill.ts` füllt die Datenbank des eigenen Servers einmalig aus dem Rohdaten-Archiv: jede Meldung seit 30. September 2026 mit ihrem ersten Sehen und jede Runde. Der Sammler startet es beim Hochfahren, eine Tabelle `meta` merkt sich das. Mit `--force` jederzeit wiederholbar.

## 0.11.2 (2026-10-08)

### Neu
* Eigener Server: `/api/diag` zeigt, ob der Server adsb.lol, Telegram, die Feeds, Bluesky, Google Translate und GitHub erreicht, mit DNS und Zeiten.

### Behoben
* Proxy: Jede Anfrage an einen Herausgeber gibt nach 15 Sekunden auf, eine Übersetzung nach 10. Auf dem eigenen Server ließ eine hängende Verbindung die App ewig laden.
* Eigener Server: Node bevorzugt IPv4, weil Docker-Netze oft kein funktionierendes IPv6 haben.

## 0.11.1 (2026-10-07)

### Geändert
* Eigener Server: Die Adresse ist `vectorscope.duckdns.org`, eine eigene DuckDNS-Domain.

## 0.11.0 (2026-10-07)

### Neu
* **Eigener Server:** `docker-compose.yaml` für Coolify mit Webserver (App, Proxy, Sammlerdaten, `/api/health`, `/api/reports`), Sammler alle 10 Minuten, PostgreSQL 16 und täglicher Sicherung von Datenbank und Rohdaten-Archiv auf den Host. Docker-Healthchecks und die Dienstnamen, die die Statusseite erwartet. Die App nutzt eigenen Proxy und eigene Sammlerdaten, wenn sie unter der eigenen Adresse läuft, GitHub Pages bleibt unverändert. Siehe [Eigener Server](docs/de/server.md).
* Der Sammler auf dem Server pusht jede Rundendatei in den Branch `collector-raw` (`RAW_PUSH_URL`), mit dem Namen `HHMM-srv.jsonl.gz`.

### Geändert
* Der Sammler auf GitHub Actions setzt seine Commits obendrauf, wenn der Server zwischendurch nach `collector-raw` gepusht hat, statt bis zum Ende seines Laufs zu scheitern.
* `collector/parse.ts` zählt Versionen nach unterschiedlichem Inhalt, eine von zwei Sammlern gespeicherte Einheit ist eine Version.

## 0.10.0 (2026-10-07)

### Geändert
* Probe-Sammler und Rohdaten-Archiv laufen bis 31. Januar 2027 statt bis 12. Oktober 2026.

### Neu
* Der Proxy liefert Rybar Tactical und Rybar America, insgesamt 50 Telegram-Kanäle. Das Test-Labor prüft beide.
* Modul INTEL 0.7.0, siehe sein [Changelog](intel/CHANGELOG.de.md).

## 0.9.2 (2026-10-07)

### Behoben
* Rohdaten-Archiv: Der Rundendatensatz zählt den eigenen Sensor auch bei den gefragten Quellen mit, wie schon bei denen mit Antwort.

## 0.9.1 (2026-10-07)

### Behoben
* Rohdaten-Archiv: Telegram-Beiträge gelten nicht mehr als geändert wegen des signierten Aufruf-Tokens, der Reaktionen oder ihrer Position auf der Seite, Bluesky-Beiträge nicht wegen Zählern in zitierten Beiträgen. Antworten von Telegram-Beiträgen werden erkannt, Bluesky-Reposts gelten nicht als Parsing-Problem.

## 0.9.0 (2026-10-07)

### Neu
* **Rohdaten-Archiv:** Der Probe-Sammler behält jede Antwort jeder Quelle so, wie sie kam, zerlegt in Einheiten (ein Beitrag, ein Eintrag, ein Ereignis), nur neue oder geänderte, eine Datei pro Runde im Branch `collector-raw`. Die seit 30. September gesammelten Meldungen werden einmalig mit abgelegt. Siehe [Rohdaten](intel/docs/de/rohdaten.md).
* `collector/parse.ts` macht aus dem Rohdaten-Archiv wieder Meldungen, mit den Parsern von INTEL, einschließlich Weiterleitungen, Antworten, Aufrufen und Links von Telegram-Beiträgen.
* Prüfungen nach jeder Runde in `health.json` und in der Zusammenfassung des Laufs: ausgefallene und stille Quellen, Lücken, Meldungen, die eine Annahme verletzen.

## 0.8.1 (2026-10-06)

### Geändert
* Der Probe-Sammler sammelt alle 10 Minuten in langen Läufen, weil GitHub den 15-Minuten-Zeitplan nur alle paar Stunden gestartet hat.

### Behoben
* Der Probe-Sammler zählt eine Meldung nur einmal als neu und nur, wenn sie jünger als einen Tag ist.

### Neu
* `collector/eval.ts` wertet die gesammelten Meldungen aus.

## 0.8.0 (2026-10-05)

### Neu
* Der Proxy liefert zehn weitere Rybar-Kanäle, insgesamt 48 Telegram-Kanäle.
* Das Testlabor macht eine QA-Runde: jede Quelle dreimal, ein Telegram-Stoß, Übersetzungsblöcke und ein Durchlauf in WebKit (Safari-Engine) mit Deutsch an.
* Modul INTEL 0.5.0, siehe sein [Changelog](intel/CHANGELOG.de.md).

### Behoben
* Die Übersetzung im Proxy liefert, was Google übersetzt hat, und lässt den Rest leer, statt den ganzen Block scheitern zu lassen, zwei Anfragen gleichzeitig.

## 0.7.0 (2026-10-05)

### Neu
* Der Proxy liefert 38 Telegram-Kanäle sowie die Feeds von GDACS und FAA für INTEL.
* Das Test-Labor prüft Telegram-Kandidaten auch auf ihre Sprache und prüft maschinenlesbare Quellen.
* Modul INTEL 0.4.0, siehe sein [Changelog](intel/CHANGELOG.de.md).

## 0.6.0 (2026-10-05)

### Neu
* Proxy-Route `POST /translate` für die deutschen Übersetzungen von INTEL (Google Translate, `proxy/lib/translate.js`).
* Der Probe-Sammler hält auch die Beobachtungen des VectorScope-Sensors fest.
* Modul INTEL 0.3.0, siehe sein [Changelog](intel/CHANGELOG.de.md).

## 0.5.0 (2026-10-05)

### Neu
* **Probe-Sammler** (`collector/collect.ts`, Workflow `collector.yml`): alle 15 Minuten für eine Woche, Daten im Branch `collector-data`.
* Proxy-Route `/tg/{kanal}` für die Telegram-Kanäle von INTEL, fünf weitere RSS-Feeds für die bestätigenden Quellen.
* Das Test-Labor prüft Telegram-Kanäle und Bestätigungsfeeds.
* Modul INTEL 0.2.0 mit Stories, siehe sein [Changelog](intel/CHANGELOG.de.md).

## 0.4.0 (2026-10-05)

### Neu
* **Modul INTEL 0.1.0:** geprüfter OSINT-Feed mit Live-Abgleich, verlinkt von der Startseite. Siehe [Changelog von INTEL](intel/CHANGELOG.de.md).
* Proxy-Route `/feed/{id}` für die RSS-Feeds von INTEL, feste Liste, fünf Minuten zwischengespeichert.
* Das Test-Labor prüft OSINT-Quellkandidaten (Bluesky, RSS, Mastodon, GDELT) auf Existenz, Aktivität und Browserzugriff (`lab/osint.mjs`) und öffnet INTEL mit Live-Daten.
* Der Rauchtest deckt INTEL ab.

## 0.3.0 (2026-10-05)

### Neu
* **VectorScope wird eine Sammlung.** Das Repository enthält unabhängige Module unter einem Dach. Die Flug-App wird zum Modul AIR in `air/`, der Intelligence-Feed INTEL folgt.
* **Startseite** unter der Hauptadresse: listet die Module, funktioniert ohne Build, lässt sich als eigene App installieren.
* **`modules.json`:** Modulverzeichnis und maßgebliche Quelle für Versionen.
* **`shared/`:** gemeinsame Hülle mit Farb-Tokens, Stilen der Startseite, Icons und Schriften, mit eigener Version.
* **Release-Skript** `npm run release -- <Ziel> <x.y.z>`: macht aus den unveröffentlichten Abschnitten der Changelogs eine Version und passt jede Stelle an, die sie nennt.
* **Prüfungen des Repositorys** in `tests/release.test.ts`: Versionen, Modulaufbau, Startseite, zweisprachige Dokumentation, Links, Schreibstil, Design-Tokens.
* **Rauchtest in Gerätegrößen** (`scripts/e2e.mjs`, Workflow `e2e.yml`): iPhone 15 hoch und quer, iPhone SE, iPad Pro 11 quer, mit Chromium und WebKit.
* Dokumentation der Sammlung auf Englisch und Deutsch: Architektur, Entwicklung, Deployment, Roadmap.

### Geändert
* Die Deployment-Dokumentation ist vom Modul zur Sammlung gewandert, weil GitHub Pages und der Proxy alle Module bedienen.
* Das Test-Labor öffnet AIR unter `/air/`.

## 0.2.3 und früher

Die Versionen bis 0.2.3 waren allein die Flug-App. Ihre Geschichte steht im [Changelog von AIR](air/CHANGELOG.de.md).
