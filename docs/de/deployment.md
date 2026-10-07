# Deployment

[English version](../en/deployment.md) · [Übersicht](README.md)

| | |
|---|---|
| Startseite | **https://michaeldobner.github.io/VectorScope/** |
| Modul AIR | **https://michaeldobner.github.io/VectorScope/air/** |
| Modul INTEL | **https://michaeldobner.github.io/VectorScope/intel/** |
| Hosting | GitHub Pages, gebaut von GitHub Actions |
| Auslöser | Jeder Push auf `main` oder von Hand unter Actions > Deploy to GitHub Pages > Run workflow |
| Build | `npm ci`, `npm test`, `npm run build`, Upload von `dist/` |
| Basispfad | Relativ (`base: './'`), damit der Build unter jedem Repository-Namen funktioniert |
| Proxy | `https://vectorscope-proxy.vercel.app`, fest in der App hinterlegt |
| Einstellungen und Watchlist | `localStorage` von `michaeldobner.github.io`, gemeinsam für alle Module der Sammlung |

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

## GitHub Pages einschalten (einmalig)

1. Repository > **Settings** > **Pages**.
2. Unter **Build and deployment** die **Source** auf **GitHub Actions** stellen.
3. Den Workflow einmal starten: **Actions** > **Deploy to GitHub Pages** > **Run workflow**, oder auf `main` pushen.

Schlägt der Deploy-Job mit „Ensure GitHub Pages has been enabled“ fehl, fehlt Schritt 2.

Bleibt die Source auf **Deploy from a branch**, veröffentlicht GitHub bei jedem Push zusätzlich das ungebaute Repository. Der Deploy-Workflow wartet auf diesen Lauf und landet immer zuletzt, das Ergebnis stimmt also in beiden Fällen. Die Startseite funktioniert sogar in der ungebauten Fassung, Module zeigen einen Hinweis statt eines schwarzen Bildschirms.

## Workflows

| Datei | Läuft bei | Schritte |
|---|---|---|
| `.github/workflows/tests.yml` | Jedem Push und Pull Request | Typprüfung, Unit-Tests und Prüfungen des Repositorys, Build |
| `.github/workflows/deploy.yml` | Push auf `main`, von Hand | Tests, Build, Upload, Veröffentlichung auf Pages |
| `.github/workflows/e2e.yml` | Jedem Push und Pull Request | Rauchtest in iPhone- und iPad-Größen mit Chromium und WebKit, Screenshots als Artefakt |
| `.github/workflows/collector.yml` | Alle 10 Minuten bis 12. Oktober 2026, von Hand | Probe-Sammler für INTEL, aktuelle Daten im Branch `collector-data`, Rohdaten-Archiv in `collector-raw`, siehe [Rohdaten](../../intel/docs/de/rohdaten.md) und [Probe-Sammler](../../intel/docs/de/sammler.md) |
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
https://michaeldobner.github.io/VectorScope/air/?proxy=https://dein-proxy.vercel.app
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
| Deploy-Job schlägt mit „Ensure GitHub Pages has been enabled“ fehl | Settings > Pages > Source: GitHub Actions, dann den Workflow erneut starten |
| Ein Modul zeigt „did not start, this is the unbuilt source code“ | Der Branch-Build von GitHub Pages kam nach dem Deploy. Deploy-Workflow erneut starten oder Settings > Pages > Source auf GitHub Actions stellen |
| Das Icon auf dem Home-Bildschirm öffnet die Startseite statt des Radars | Seit 0.3.0 ist die Adresse ohne `/air/` die Startseite. AIR antippen oder `https://michaeldobner.github.io/VectorScope/air/` zum Home-Bildschirm hinzufügen |
| Banner „adsb.lol does not allow direct access from browsers (CORS)“ | Der Proxy ist nicht erreichbar. `https://vectorscope-proxy.vercel.app` in Safari öffnen, dort muss die Statusseite erscheinen |
| Banner „adsb.lol is rate limiting requests“ | Das Modul verlangsamt sich selbst. Aktualisierungsintervall auf 10 oder 20 s erhöhen |
| Status bleibt auf CONNECTING | Netz prüfen, Proxy-Adresse unter Einstellungen > Datenquelle prüfen |
| Standort wird nicht verwendet | In der installierten App den Standort bei der Nachfrage erlauben, oder iOS-Einstellungen > Datenschutz > Ortungsdienste > Safari-Websites. Oder in den Einstellungen einen festen Standort setzen |
| Karte bleibt dunkel, Flugzeuge sind sichtbar | OpenFreeMap ist nicht erreichbar. Das Radar funktioniert weiter |
| Kein Flugzeugfoto | planespotters.net hat kein Foto für dieses Flugzeug oder ist nicht erreichbar |
| Alte Version nach einem Update | App vollständig schließen und neu öffnen. Falls nötig: iOS-Einstellungen > Apps > Safari > Erweitert > Websitedaten, `michaeldobner.github.io` löschen (löscht auch Einstellungen und Watchlist) |
| Einstellungen fehlen in der installierten App | Safari und die App auf dem Home-Bildschirm haben getrennte Speicher. In der installierten App einstellen |
