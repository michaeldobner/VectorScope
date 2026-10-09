# Eigener Server

[English version](../en/server.md) · [Übersicht](README.md)

Seit Sammlung 0.11.0 kann VectorScope auf einem eigenen Server laufen, ausgerollt mit [Coolify](https://coolify.io): App, Proxy, Sammler, Datenbank und Rohdaten-Archiv unter einer Adresse. GitHub Pages, der Proxy auf Vercel und der Sammler auf GitHub Actions laufen weiter wie bisher, damit nichts kaputtgeht, solange der Server eingerichtet wird.

## Was läuft

`docker-compose.yaml` im Hauptordner des Repositorys beschreibt vier Dienste. Web und Sammler nutzen ein gemeinsames Image (`server/Dockerfile`).

| Dienst | Aufgabe | Healthcheck |
|---|---|---|
| `vectorscope-web` | Liefert die gebaute App (Startseite, AIR, INTEL) wie GitHub Pages, den Proxy unter `/proxy`, die Sammlerdaten unter `/data/latest.json` und eine kleine API. Port 8080 innerhalb des Stacks (`server/web.mjs`) | `/healthz` antwortet |
| `vectorscope-collector` | Alle 10 Minuten eine Sammler-Runde (`server/collector-loop.mjs` startet `collector/collect.ts`). Schreibt die Dateien, das Rohdaten-Archiv und die Datenbank, pusht das Rohdaten-Archiv zu GitHub | Letzte gute Runde jünger als 30 Minuten (`server/collector-health.mjs`) |
| `vectorscope-db` | PostgreSQL 16, nur innerhalb des Stacks erreichbar | `pg_isready` |
| `vectorscope-backup` | Einmal am Tag ein Abzug der Datenbank nach `/var/backups/vectorscope` auf dem Host, behält 7 Tage. Kopiert außerdem neue Dateien des Rohdaten-Archivs nach `/var/backups/vectorscope/raw` | keiner |

Ein Container mit fehlschlagendem Healthcheck erscheint auf der Statusseite und löst dort den Telegram-Alarm aus.

### Adressen

| Adresse | Inhalt |
|---|---|
| `https://vectorscope.duckdns.org/` | Startseite, `/air/`, `/intel/` |
| `/proxy/...` | Dieselben Routen wie der Proxy auf Vercel (adsb.lol, Feeds, Telegram, Übersetzung, Fotos) |
| `/data/latest.json` | Meldungen der letzten 72 Stunden, gelesen von INTEL unter dieser Adresse |
| `/api/health` | Zustand für die Statusseite, siehe unten |
| `/api/reports?hours=24&source=baza&q=Tuapse&limit=200` | Meldungen aus der Datenbank |
| `/api/diag` | Ob der Server die Herausgeber erreicht: DNS und eine Anfrage pro Host mit Zeit. Erste Anlaufstelle, wenn die App ewig lädt |
| `/healthz` | Lebenszeichen für Docker |

Die App erkennt, wo sie läuft: Auf GitHub Pages (`*.github.io`) und lokal nutzt sie den Proxy auf Vercel und die Sammlerdaten auf GitHub, unter jeder anderen Adresse ihr eigenes `/proxy` und `/data`. Ein Build bedient beides.

### `/api/health`

```json
{
  "ok": true,
  "version": "0.11.0",
  "collector": { "last_round": "2026-10-08T21:10:00.000Z", "age_min": 3.2, "ok_sources": 74, "sources": 75, "items": 1480, "exit": 0, "raw_push": "pushed", "reports_24h": 1650 },
  "db": { "ok": true, "reports_24h": 1650, "reports": 5200, "rounds": 140 }
}
```

`ok` ist wahr, wenn der Sammler eine Runde geschrieben hat und die Datenbank antwortet. `raw_push` ist `off` (kein `RAW_PUSH_URL`), `pushed`, `nothing to push`, `failed` oder `branch not reachable`.

## Daten

| Wo | Was | Sicherung |
|---|---|---|
| Volume `vectorscope-data`, Ordner `/data` | `latest.json`, `archive.json`, `stats.json`, `health.json`, `raw-state.json`, `heartbeat.json` | Baut der Sammler neu auf |
| `/data/raw` | Das Rohdaten-Archiv mit allen Dateien. Nicht öffentlich: die vollen Texte der Herausgeber | Täglich `/var/backups/vectorscope/raw`. Mit `RAW_PUSH_URL` zusätzlich nach jeder Runde gepusht, dann nur in ein **privates** Repository |
| Volume `vectorscope-pg` | Datenbank: Tabelle `reports` (eine Zeile pro Meldung, frühester Zeitpunkt und erstes Sehen), `rounds` und `meta`. Beim ersten Start füllt der Sammler sie einmalig aus dem Rohdaten-Archiv (`collector/backfill.ts`), damit sie die Historie seit 30. September 2026 enthält | Täglicher Abzug nach `/var/backups/vectorscope` |

Das Rohdaten-Archiv ist die Grundwahrheit ([Rohdaten](../../intel/docs/de/rohdaten.md)). Die Datenbank leitet der Sammler ab, sie lässt sich neu aufbauen. Rundendateien des Servers heißen `HHMM-srv.jsonl.gz`, die von GitHub Actions `HHMM.jsonl.gz`, deshalb können beide ohne Kollision in denselben Branch schreiben. Findet einer von beiden den Branch weitergerückt, setzt er seine eigenen Commits obendrauf und pusht erneut.

## Einrichten in Coolify

Schritte nach Stand Coolify 4. Menünamen können je nach Version leicht abweichen.

1. **GitHub-Token für das Rohdaten-Archiv** (optional, empfohlen). Auf GitHub: Settings > Developer settings > Fine-grained personal access tokens > Generate new token. Repository access: nur `michaeldobner/VectorScope`. Permissions: Contents, Read and write. Ablauf: bis nach der Probe, z. B. 1. März 2027. Token kopieren, er wird nur einmal angezeigt.
2. **Neue Ressource.** Im Coolify-Projekt: New resource > Public repository, `https://github.com/michaeldobner/VectorScope`, Branch `main`. Build pack: Docker Compose, Datei `/docker-compose.yaml`.
3. **Domain.** Beim Dienst `vectorscope-web`: Domain `https://vectorscope.duckdns.org:8080`. Der Port sagt Coolify, dass der Container auf 8080 lauscht, die Adresse selbst bleibt ohne Port. Die anderen Dienste bekommen keine Domain.
4. **Umgebungsvariablen.** `SERVICE_PASSWORD_POSTGRES` erzeugt Coolify selbst. `RAW_PUSH_URL` nur, wenn das Rohdaten-Archiv zusätzlich zu GitHub soll, und dann nur in ein **privates** Repository: `https://x-access-token:<Token>@github.com/<Besitzer>/<privates Repository>.git`. Ohne bleibt das Archiv auf dem Server und in seiner täglichen Sicherung (seit Sammlung 0.18.0, das Repository VectorScope ist öffentlich). Optional: `ALLOWED_ORIGIN`, wenn die Adresse abweicht, `CONTACT` für den User-Agent, `EMBED=0` schaltet die Themen nach Bedeutung ab (standardmäßig an, das Modell mit rund 120 MB wird einmal nach `/data/models` geladen).
5. **Deploy.** Der Build dauert einige Minuten (Typprüfung und Build aller Module). Danach `https://vectorscope.duckdns.org/api/health` öffnen.
6. **Erste Runde.** Beim ersten Start übernimmt der Sammler `archive.json`, `stats.json` und `raw-state.json` des GitHub-Sammlers, damit keine Meldung zweimal als neu zählt, und checkt den Branch `collector-raw` aus. Nach 10 bis 15 Minuten ist `collector.age_min` klein und `raw_push` meldet `pushed`.

## Umstieg von GitHub

1. **Ein bis zwei Wochen beide laufen lassen.** In `/api/health` und `stats.json` beider vergleichen: Quellen ok, neue Meldungen pro Tag, Lücken. Beide schreiben in `collector-raw`. Einen Beitrag, den beide sehen, gibt es im Archiv doppelt, `collector/parse.ts` zählt ihn einmal.
2. **GitHub Actions abschalten.** `PROBE_UNTIL` in `.github/workflows/collector.yml` auf ein vergangenes Datum setzen oder den Workflow unter Actions > Collector deaktivieren. Ab dann sammelt nur noch der Server.
3. **GitHub Pages auf den Server zeigen lassen (optional).** `COLLECTOR_URL` in `intel/src/data/feed.ts` und die Proxy-Adressen können auf den Server zeigen, dann profitiert auch die App auf GitHub Pages. Der Proxy auf Vercel kann danach weg.
4. **Kürzerer Takt (optional).** `EVERY_MIN` in `docker-compose.yaml`, z. B. 2. Ob Telegram diesen Takt für seine Webvorschau aus einem Rechenzentrum akzeptiert, ist noch nicht getestet, in den ersten Tagen `health.json` beobachten.

## Betrieb

| Aufgabe | Wie |
|---|---|
| Logs | Coolify > Ressource > Logs, je Dienst. Der Sammler schreibt pro Runde eine Zusammenfassung und `WARN`-Zeilen der Prüfungen |
| Neustart | Coolify > Restart. Der Sammler macht mit seinen Dateien weiter, nichts geht verloren |
| Aktualisieren | Push auf `main`, Coolify rollt aus (automatisch, wenn der Webhook an ist) |
| Datenbank aus dem Rohdaten-Archiv neu aufbauen | Tabellen leeren oder im Sammler-Container (Coolify > Terminal) `npx tsx collector/backfill.ts /data/raw --force` ausführen. Beliebig wiederholbar |
| Datenbank wiederherstellen | `gunzip -c /var/backups/vectorscope/vectorscope-<Datum>.sql.gz \| docker exec -i <DB-Container> psql -U vectorscope vectorscope` |
| Rohdaten-Archiv wiederherstellen | `/var/backups/vectorscope/raw` kopieren oder das private Repository von `RAW_PUSH_URL` klonen |
| Abfragen | `/api/reports` oder `docker exec -it <DB-Container> psql -U vectorscope vectorscope` |

## Geprüft und noch nicht geprüft

Lokal ohne Docker geprüft: Webserver (App, Proxy-Routen, `/api/health`, Weiterleitungen, Pfad-Schutz), die Browsertests der Sammlung dagegen, die Sammler-Schleife mit Herzschlag und Push in ein Test-Repository, auch wenn der andere Sammler dazwischen gepusht hat. Noch nicht geprüft: das Docker-Image, Coolify, PostgreSQL im Stack und die Domain. Das ist der erste Deploy.
