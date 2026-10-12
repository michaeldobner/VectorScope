# Deployment

[English version](../en/deployment.md) · [Übersicht](README.md)

| | |
|---|---|
| Startseite | **https://vectorscope.duckdns.org/** |
| Modul AIR | **https://vectorscope.duckdns.org/air/** |
| Modul INTEL | **https://vectorscope.duckdns.org/intel/** |
| Hosting | Eigener Server mit Coolify, siehe [Eigener Server](server.md). GitHub Pages ist seit Sammlung 0.22.5 stillgelegt |
| Auslöser | Deploy in Coolify, es baut `main` |
| Build | `npm ci`, `npm run build` im Docker-Image (`server/Dockerfile`) |
| Basispfad | Relativ (`base: './'`), damit der Build unter jedem Repository-Namen funktioniert |
| Proxy | `/proxy` des Servers. Lokal (`localhost`) nutzt die App `https://vectorscope-proxy.vercel.app` |
| Einstellungen und Watchlist | `localStorage` von `vectorscope.duckdns.org`, gemeinsam für alle Module der Sammlung |

## Was veröffentlicht wird

```
dist/
├─ index.html              Startseite
├─ manifest.webmanifest    Startseite als installierbare App
├─ sw.js                   Service Worker der Startseite
├─ modules.json            Modulverzeichnis
├─ shared/                 tokens.css, hub.css, Icons, Schriften
├─ air/                    Modul AIR, gebaut von Vite
└─ intel/                  Modul INTEL, gebaut von Vite
```

`npm run build` baut zuerst jedes Modul in seinen eigenen Ordner und ergänzt danach mit `scripts/build.mjs` die Startseite. Der Build bricht ab, wenn ein Modul fehlt, das in `modules.json` als `live` eingetragen ist.

## GitHub Pages (stillgelegt)

Bis Sammlung 0.22.4 ging jeder Push nach `michaeldobner.github.io/VectorScope`. Seit 0.22.5 veröffentlicht der Workflow `deploy.yml` dort nur noch einen Abschied, gebaut von `pages-redirect/build.sh`: Jede alte Adresse (Startseite, `/air/`, `/intel/`, `/news/`) leitet auf denselben Pfad unter `vectorscope.duckdns.org` weiter, samt Parametern, und die alten Service Worker löschen ihre Caches und entfernen sich selbst. So öffnet ein Home-Bildschirm-Icon der alten Adresse den Server. Einstellungen und Watchlist ziehen nicht mit um: Sie gehören zur alten Adresse und müssen auf dem Server einmal neu gesetzt werden.

GitHub Pages ganz abschalten: Repository > **Settings** > **Pages** > **Unpublish site**. Dann zeigen alte Adressen eine 404-Seite von GitHub.

## Workflows

| Datei | Läuft bei | Schritte |
|---|---|---|
| `.github/workflows/tests.yml` | Jedem Push und Pull Request | Typprüfung, Unit-Tests und Prüfungen des Repositorys, Build |
| `.github/workflows/deploy.yml` | Änderungen an sich selbst oder `pages-redirect/`, von Hand | Veröffentlicht die Abschieds-Weiterleitung auf GitHub Pages, kein Build der App |
| `.github/workflows/e2e.yml` | Jedem Push und Pull Request | Rauchtest in iPhone- und iPad-Größen mit Chromium und WebKit, Screenshots als Artefakt |
| `.github/workflows/lab.yml` | Push auf `main` mit Änderungen an Modulen, Labor oder Proxy, von Hand | Test-Labor mit echtem Internet: echte API-Antworten und Screenshots mit Live-Daten, Ergebnisse im Branch `lab-results` |

## CORS-Proxy auf Vercel

Browser lassen eine Website Daten eines anderen Servers nur lesen, wenn dieser Server das ausdrücklich erlaubt (CORS, eine Sicherheitsregel jedes Browsers, keine Safari-Einstellung). adsb.lol erlaubt das auf seinen `/v2`-Endpunkten nicht, planespotters.net verlangt eine Kontaktangabe, die ein Browser nicht senden kann, und die meisten Nachrichtenseiten erlauben dem Browser keinen Zugriff auf ihre RSS-Feeds. Die Lösung ist ein kleiner Vermittler, der die Daten auf dem Server abholt und die Erlaubnis ergänzt: der Proxy in `proxy/`, kostenlos im Hobby-Tarif von Vercel.

Der Proxy dieses Projekts läuft unter `https://vectorscope-proxy.vercel.app` und ist fest in der App hinterlegt. Auf den Geräten muss nichts eingetragen werden. Unter der Hauptadresse antwortet eine Statusseite.

### Eigenen Proxy einrichten

Nur für eine Kopie (Fork) des Repositorys nötig.

**Weg A: Deploy-Button**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmichaeldobner%2FVectorScope&root-directory=proxy&project-name=vectorscope-proxy&repository-name=vectorscope-proxy)

1. Button antippen und bei Vercel mit GitHub anmelden.
2. Vercel legt eine Kopie namens `vectorscope-proxy` an und veröffentlicht nur den Ordner `proxy`. Mit **Create** und **Deploy** bestätigen.
3. Die Adresse kopieren, die nach „Congratulations“ angezeigt wird.

**Weg B: dieses Repository importieren**

1. Bei [vercel.com](https://vercel.com) mit GitHub anmelden.
2. **Add New** > **Project**, dieses Repository importieren.
3. **Root Directory:** `proxy`. **Framework Preset:** Other. Deploy.

Danach die Adresse als `BUILTIN_PROXY` in `air/src/data/feed.ts` eintragen oder ein einzelnes Gerät mit einem Tipp verbinden:

```
https://vectorscope.duckdns.org/air/?proxy=https://dein-proxy.vercel.app
```

Das Modul speichert den Proxy dauerhaft und entfernt den Parameter aus der Adresse.

**Optionale Umgebungsvariablen** (Vercel > Project > Settings > Environment Variables, danach neu veröffentlichen):

| Variable | Wert | Zweck |
|---|---|---|
| `ALLOWED_ORIGIN` | `https://michaeldobner.github.io` | Nur diese Seite darf den Proxy aus dem Browser nutzen |
| `PROXY_TOKEN` | beliebige lange Zufallszeichenfolge | Anfragen ohne dieses Token werden abgelehnt. `&token=…` an den Einrichtungslink anhängen |
| `CONTACT` | E-Mail-Adresse oder URL | Kontaktangabe im User-Agent, die adsb.lol und planespotters.net wünschen |

### Was der Proxy tut

* Leitet nur lesende Pfade weiter: `/v2/point`, `/v2/closest`, `/v2/lat/…/lon/…/dist/…`, `/v2/mil`, `/v2/ladd`, `/v2/pia`, `/v2/sqk`, `/v2/squawk`, `/v2/hex`, `/v2/icao`, `/v2/callsign`, `/v2/reg`, `/v2/registration`, `/v2/type`, `POST /api/0/routeset`, `/photos/hex/{hex}` für planespotters.net, `/feed/{id}` für die feste Liste der RSS-Feeds, `/tg/{kanal}` für die feste Liste der Telegram-Kanäle von INTEL und `POST /translate` für dessen deutsche Übersetzungen über Google Translate. Alles andere erhält 404, es ist also kein offener Proxy.
* Sendet einen User-Agent mit Kontaktangabe.
* Ergänzt `Access-Control-Allow-Origin` und beantwortet Preflight-Anfragen.
* Hält GET-Antworten zwei Sekunden im Edge-Cache von Vercel, damit mehrere Geräte die Last auf adsb.lol nicht vervielfachen. RSS-Feeds fünf Minuten.
* Läuft in Frankfurt (`fra1`).

### Warum nicht Cloudflare Workers

Seit September 2026 beantwortet adsb.lol Anfragen von Cloudflare Workers mit HTTP 429, schon bei der ersten Anfrage. Vercel und gewöhnliche Server sind nicht betroffen.

## Wie Updates auf die Geräte kommen

Jeder Teil der Sammlung hat einen eigenen Service Worker mit eigenem Bereich und eigenem Speicher:

| Teil | Service Worker | Bereich | Speicher |
|---|---|---|---|
| Startseite | `sw.js` | `/VectorScope/` | `vectorscope-hub-v1`, nur Startseite und `shared/` |
| AIR | `air/sw.js` | `/VectorScope/air/` | `vectorscope-air-v1` |
| INTEL | `intel/sw.js` | `/VectorScope/intel/` | `vectorscope-intel-v1` |

Der engere Bereich gewinnt, jedes Modul steuert also nur seinen eigenen Ordner. Seitenaufrufe gehen zuerst ins Netz, eine neue Version wird deshalb beim nächsten Start verwendet. Gebaute JavaScript- und CSS-Dateien tragen einen Inhalts-Hash im Namen, alte und neue Dateien werden nie gemischt. Ohne Netz startet die zuletzt geladene Version.

Bis Version 0.2.3 lag die Flug-App unter der Hauptadresse und nutzte den Speicher `vectorscope-v1`. Der Service Worker der Startseite entfernt diesen Speicher beim ersten Start. Einstellungen und Watchlist bleiben erhalten, weil die Adresse der Website gleich bleibt.

## Fehlerbehebung

| Problem | Lösung |
|---|---|
| Das Icon auf dem Home-Bildschirm öffnet die Startseite statt des Radars | Seit 0.3.0 ist die Adresse ohne `/air/` die Startseite. AIR antippen oder `https://vectorscope.duckdns.org/air/` zum Home-Bildschirm hinzufügen |
| Banner „adsb.lol does not allow direct access from browsers (CORS)“ | Der Proxy ist nicht erreichbar. `https://vectorscope-proxy.vercel.app` in Safari öffnen, dort muss die Statusseite erscheinen |
| Banner „adsb.lol is rate limiting requests“ | Das Modul verlangsamt sich selbst. Aktualisierungsintervall auf 10 oder 20 s erhöhen |
| Status bleibt auf CONNECTING | Netz prüfen, Proxy-Adresse unter Einstellungen > Datenquelle prüfen |
| Standort wird nicht verwendet | In der installierten App den Standort bei der Nachfrage erlauben, oder iOS-Einstellungen > Datenschutz > Ortungsdienste > Safari-Websites. Oder in den Einstellungen einen festen Standort setzen |
| Karte bleibt dunkel, Flugzeuge sind sichtbar | OpenFreeMap ist nicht erreichbar. Das Radar funktioniert weiter |
| Kein Flugzeugfoto | planespotters.net hat kein Foto für dieses Flugzeug oder ist nicht erreichbar |
| Alte Version nach einem Update | App vollständig schließen und neu öffnen. Falls nötig: iOS-Einstellungen > Apps > Safari > Erweitert > Websitedaten, `vectorscope.duckdns.org` löschen (löscht auch Einstellungen und Watchlist) |
| Einstellungen fehlen in der installierten App | Safari und die App auf dem Home-Bildschirm haben getrennte Speicher. In der installierten App einstellen |
