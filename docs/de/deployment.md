# Deployment

[English version](../en/deployment.md) · [Übersicht](README.md)

| | |
|---|---|
| Adresse | **https://michaeldobner.github.io/-VectorScope/** |
| Hosting | GitHub Pages, gebaut von GitHub Actions |
| Auslöser | Jeder Push auf `main` oder manuell unter Actions > Deploy to GitHub Pages > Run workflow |
| Build | `npm ci`, `npm test`, `npm run build`, Upload von `dist/` |
| Basispfad | Relativ (`base: './'`), damit der Build unter jedem Repository-Namen funktioniert |
| Offline | Service Worker `public/sw.js`, Speicher `vectorscope-v1` |
| Einstellungen und Watchlist | `localStorage` von `michaeldobner.github.io`, Schlüssel `vectorscope.settings.v1` |

## GitHub Pages einschalten (einmalig)

1. Repository > **Settings** > **Pages**.
2. Unter **Build and deployment** bei **Source** die Option **GitHub Actions** wählen.
3. Den Workflow einmal starten: **Actions** > **Deploy to GitHub Pages** > **Run workflow** oder auf `main` pushen.

Schlägt der Deploy-Schritt mit „Ensure GitHub Pages has been enabled“ fehl, fehlt Schritt 2.

## Workflows

| Datei | Läuft bei | Schritte |
|---|---|---|
| `.github/workflows/tests.yml` | Jedem Push und Pull Request | Typprüfung, Unit-Tests, Build |
| `.github/workflows/deploy.yml` | Push auf `main`, manuell | Tests, Build, Upload, Veröffentlichung auf Pages |

## CORS-Proxy auf Vercel

adsb.lol sendet bei den `/v2`-Endpunkten keine CORS-Header. Blockiert der Browser direkte Anfragen, zeigt VectorScope ein Banner und braucht einen Proxy. Der Proxy in `proxy/` läuft kostenlos im Hobby-Tarif von Vercel.

### Einrichtung

1. Bei [vercel.com](https://vercel.com) mit GitHub anmelden.
2. **Add New** > **Project**, dieses Repository importieren.
3. **Root Directory:** `proxy`. **Framework Preset:** Other. Deploy.
4. Optionale Umgebungsvariablen unter Settings > Environment Variables:

| Variable | Wert | Zweck |
|---|---|---|
| `ALLOWED_ORIGIN` | `https://michaeldobner.github.io` | Nur diese Seite darf den Proxy aus dem Browser nutzen |
| `PROXY_TOKEN` | beliebige lange Zufallszeichenkette | Anfragen ohne dieses Token werden abgelehnt |
| `CONTACT` | E-Mail-Adresse oder URL | Kontaktangabe im User-Agent, um die adsb.lol bittet |

5. Nach Änderungen an den Variablen erneut deployen.
6. In VectorScope: **Settings** > **Data source**: Vercel-Adresse (zum Beispiel `https://vectorscope-proxy.vercel.app`) und Token eintragen, **Auto** belassen oder **Proxy** wählen.

### Was der Proxy tut

* Leitet nur lesende Pfade weiter: `/v2/point`, `/v2/closest`, `/v2/lat/…/lon/…/dist/…`, `/v2/mil`, `/v2/ladd`, `/v2/pia`, `/v2/sqk`, `/v2/squawk`, `/v2/hex`, `/v2/icao`, `/v2/callsign`, `/v2/reg`, `/v2/registration`, `/v2/type` und `POST /api/0/routeset`. Alles andere erhält 404, es ist also kein offener Proxy.
* Sendet einen User-Agent mit Kontaktangabe.
* Ergänzt `Access-Control-Allow-Origin` und beantwortet Preflight-Anfragen.
* Hält GET-Antworten zwei Sekunden im Edge-Cache von Vercel, damit mehrere Geräte die Last auf adsb.lol nicht vervielfachen.
* Läuft in Frankfurt (`fra1`).

### Warum nicht Cloudflare Workers

Seit September 2026 beantwortet adsb.lol Anfragen von Cloudflare Workers mit HTTP 429, schon bei der ersten Anfrage. Vercel und normale Server sind nicht betroffen.

## Wie Updates auf die Geräte kommen

Seitenaufrufe gehen zuerst ins Netz, eine neue Version wird also beim nächsten Start verwendet. Die gebauten JavaScript- und CSS-Dateien tragen einen Inhalts-Hash im Namen, alte und neue Dateien mischen sich daher nie. Ohne Netz startet die zuletzt geladene Version.

## Fehlerbehebung

| Problem | Lösung |
|---|---|
| Deploy-Schritt scheitert mit „Ensure GitHub Pages has been enabled“ | Settings > Pages > Source: GitHub Actions, dann den Workflow erneut starten |
| Banner „Your browser blocked direct access to adsb.lol (CORS)“ | Proxy einrichten und seine Adresse in den Einstellungen eintragen |
| Banner „adsb.lol is rate limiting requests“ | VectorScope bremst selbst ab. Das Intervall auf 10 oder 20 s erhöhen |
| Status bleibt CONNECTING | Netz prüfen, Proxy-Adresse prüfen, die Proxy-Adresse mit `/v2/mil` in Safari öffnen |
| Standort wird nicht verwendet | In der installierten App den Standort bei der Abfrage erlauben oder iOS-Einstellungen > Datenschutz > Ortungsdienste > Safari-Websites. Alternativ einen festen Standort in den Einstellungen festlegen |
| Karte bleibt dunkel, Flugzeuge sind sichtbar | OpenFreeMap ist nicht erreichbar. Das Radar funktioniert weiter |
| Kein Foto des Flugzeugs | planespotters.net hat kein Foto oder ist nicht erreichbar |
| Alte Version nach einem Update | App vollständig schließen und neu öffnen. Falls nötig: iOS-Einstellungen > Apps > Safari > Erweitert > Websitedaten, Eintrag `michaeldobner.github.io` löschen (löscht auch Einstellungen und Watchlist) |
| Einstellungen fehlen in der installierten App | Safari und die App auf dem Home-Bildschirm haben getrennte Speicher. In der installierten App einrichten |
| Adresse geändert nach Umbenennen des Repositorys | GitHub Pages verwendet den Repository-Namen in der Adresse. VectorScope erneut zum Home-Bildschirm hinzufügen |
