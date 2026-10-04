# Deployment

[Deutsche Version](../de/deployment.md) · [Overview](README.md)

| | |
|---|---|
| Address | **https://michaeldobner.github.io/VectorScope/** |
| Hosting | GitHub Pages, built by GitHub Actions |
| Trigger | Every push to `main`, or manually under Actions > Deploy to GitHub Pages > Run workflow |
| Build | `npm ci`, `npm test`, `npm run build`, upload of `dist/` |
| Base path | Relative (`base: './'`), so the build works under any repository name |
| Offline | Service worker `public/sw.js`, cache `vectorscope-v1` |
| Settings and watchlist | `localStorage` of `michaeldobner.github.io`, key `vectorscope.settings.v1` |

## Enabling GitHub Pages (once)

1. Repository > **Settings** > **Pages**.
2. Under **Build and deployment** set **Source** to **GitHub Actions**.
3. Run the workflow once: **Actions** > **Deploy to GitHub Pages** > **Run workflow**, or push to `main`.

If the deploy job fails with "Ensure GitHub Pages has been enabled", step 2 is missing.

## Workflows

| File | Runs on | Steps |
|---|---|---|
| `.github/workflows/tests.yml` | Every push and pull request | Type check, unit tests, build |
| `.github/workflows/deploy.yml` | Push to `main`, manual | Tests, build, upload, deploy to Pages |

## CORS proxy on Vercel

adsb.lol does not send CORS headers on its `/v2` endpoints. If the browser blocks direct requests, VectorScope shows a banner and needs a proxy. The proxy in `proxy/` runs free on Vercel's hobby plan.

### Setup

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New** > **Project**, import this repository.
3. **Root Directory:** `proxy`. **Framework Preset:** Other. Deploy.
4. Optional environment variables under Settings > Environment Variables:

| Variable | Value | Purpose |
|---|---|---|
| `ALLOWED_ORIGIN` | `https://michaeldobner.github.io` | Only this site may use the proxy from a browser |
| `PROXY_TOKEN` | any long random string | Requests without this token are rejected |
| `CONTACT` | e-mail address or URL | Contact in the User-Agent that adsb.lol asks for |

5. Redeploy after changing variables.
6. In VectorScope: **Settings** > **Data source**: paste the Vercel address (for example `https://vectorscope-proxy.vercel.app`) and the token, keep **Auto** or choose **Proxy**.

### What the proxy does

* Forwards only read-only paths: `/v2/point`, `/v2/closest`, `/v2/lat/…/lon/…/dist/…`, `/v2/mil`, `/v2/ladd`, `/v2/pia`, `/v2/sqk`, `/v2/squawk`, `/v2/hex`, `/v2/icao`, `/v2/callsign`, `/v2/reg`, `/v2/registration`, `/v2/type`, and `POST /api/0/routeset`. Everything else gets 404, so it is not an open proxy.
* Sends a User-Agent with contact information.
* Adds `Access-Control-Allow-Origin` and answers preflight requests.
* Caches GET responses for two seconds at Vercel's edge, so several devices do not multiply the load on adsb.lol.
* Runs in Frankfurt (`fra1`).

### Why not Cloudflare Workers

Since September 2026 adsb.lol answers requests from Cloudflare Workers with HTTP 429, even on the first request. Vercel and ordinary servers are not affected.

## How updates reach devices

Page requests go to the network first, so a new version is used on the next start. The built JavaScript and CSS files have content hashes in their names, so old and new files are never mixed. Without network the last loaded version starts.

## Troubleshooting

| Problem | Solution |
|---|---|
| Deploy job fails with "Ensure GitHub Pages has been enabled" | Settings > Pages > Source: GitHub Actions, then run the workflow again |
| Page is blank or shows the README | Pages is set to "Deploy from a branch" and publishes the unbuilt source. Settings > Pages > Source: GitHub Actions |
| Banner "Your browser blocked direct access to adsb.lol (CORS)" | Set up the proxy and enter its address in Settings |
| Banner "adsb.lol is rate limiting requests" | VectorScope slows down by itself. Raise the refresh interval to 10 or 20 s |
| Status stays CONNECTING | Check the network, check the proxy address, open the proxy address with `/v2/mil` in Safari |
| Location is not used | Inside the installed app: allow location when asked, or iOS Settings > Privacy > Location Services > Safari Websites. Or set a fixed location in Settings |
| Map stays dark, aircraft are visible | OpenFreeMap is unreachable. The radar keeps working |
| No aircraft photo | planespotters.net has no photo for this aircraft, or it is unreachable |
| Old version after an update | Close the app completely and open it again. If needed: iOS Settings > Apps > Safari > Advanced > Website Data, delete `michaeldobner.github.io` (this also deletes settings and watchlist) |
| Settings missing in the installed app | Safari and the Home Screen app keep separate storage. Set them inside the installed app |
| Address changed after renaming the repository | GitHub Pages uses the repository name in the address. Add VectorScope to the Home Screen again |
