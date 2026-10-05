# Deployment

[Deutsche Version](../de/deployment.md) · [Overview](README.md)

| | |
|---|---|
| Hub | **https://michaeldobner.github.io/VectorScope/** |
| Module AIR | **https://michaeldobner.github.io/VectorScope/air/** |
| Module INTEL | **https://michaeldobner.github.io/VectorScope/intel/** |
| Hosting | GitHub Pages, built by GitHub Actions |
| Trigger | Every push to `main`, or manually under Actions > Deploy to GitHub Pages > Run workflow |
| Build | `npm ci`, `npm test`, `npm run build`, upload of `dist/` |
| Base path | Relative (`base: './'`), so the build works under any repository name |
| Proxy | `https://vectorscope-proxy.vercel.app`, built into the app |
| Settings and watchlist | `localStorage` of `michaeldobner.github.io`, shared by all modules of the collection |

## What gets published

```
dist/
├─ index.html              hub
├─ manifest.webmanifest    hub as an installable app
├─ sw.js                   hub service worker
├─ modules.json            module registry
├─ shared/                 tokens.css, hub.css, icons, fonts
├─ air/                    module AIR, built by Vite
└─ intel/                  module INTEL, built by Vite
```

`npm run build` first builds each module into its own folder and then adds the hub with `scripts/build.mjs`. The build stops if a module marked `live` in `modules.json` is missing.

## Enabling GitHub Pages (once)

1. Repository > **Settings** > **Pages**.
2. Under **Build and deployment** set **Source** to **GitHub Actions**.
3. Run the workflow once: **Actions** > **Deploy to GitHub Pages** > **Run workflow**, or push to `main`.

If the deploy job fails with "Ensure GitHub Pages has been enabled", step 2 is missing.

If the source stays on **Deploy from a branch**, GitHub additionally publishes the unbuilt repository on every push. The deploy workflow waits for that run and always lands last, so the result is correct either way. The hub works even in the unbuilt version, modules show a notice instead of a black screen.

## Workflows

| File | Runs on | Steps |
|---|---|---|
| `.github/workflows/tests.yml` | Every push and pull request | Type check, unit tests and repository checks, build |
| `.github/workflows/deploy.yml` | Push to `main`, manual | Tests, build, upload, deploy to Pages |
| `.github/workflows/e2e.yml` | Every push and pull request | Smoke test on iPhone and iPad sizes in Chromium and WebKit, screenshots as artifact |
| `.github/workflows/collector.yml` | Every 15 minutes until 12 October 2026, manual | Probe collector for INTEL, data on the branch `collector-data`, see [Probe collector](../../intel/docs/en/collector.md) |
| `.github/workflows/lab.yml` | Push to `main` with changes to modules, lab or proxy, manual | Test lab with real internet: real API responses and screenshots with live data, results on the branch `lab-results` |

## CORS proxy on Vercel

Browsers only let a website read data from another server if that server explicitly allows it (CORS, a security rule of every browser, not a Safari setting). adsb.lol does not allow it on its `/v2` endpoints, planespotters.net asks for a contact address that a browser cannot send, and most news sites do not allow browser access to their RSS feeds. The fix is a small relay that fetches the data server-side and adds the permission: the proxy in `proxy/`, free on Vercel's hobby plan.

The proxy of this project runs at `https://vectorscope-proxy.vercel.app` and is built into the app. Nothing needs to be entered on the devices. Its status page answers at the root address.

### Setting up your own proxy

Only needed for a fork of the repository.

**Option A: deploy button**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmichaeldobner%2FVectorScope&root-directory=proxy&project-name=vectorscope-proxy&repository-name=vectorscope-proxy)

1. Tap the button and sign in to Vercel with GitHub.
2. Vercel creates a copy named `vectorscope-proxy` and deploys only the `proxy` folder. Confirm with **Create**, then **Deploy**.
3. Copy the address shown after "Congratulations".

**Option B: import this repository**

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New** > **Project**, import this repository.
3. **Root Directory:** `proxy`. **Framework Preset:** Other. Deploy.

Then set the address as `BUILTIN_PROXY` in `air/src/data/feed.ts`, or connect a single device with one tap:

```
https://michaeldobner.github.io/VectorScope/air/?proxy=https://your-proxy.vercel.app
```

The module saves the proxy permanently and removes the parameter from the address.

**Optional environment variables** (Vercel > Project > Settings > Environment Variables, then redeploy):

| Variable | Value | Purpose |
|---|---|---|
| `ALLOWED_ORIGIN` | `https://michaeldobner.github.io` | Only this site may use the proxy from a browser |
| `PROXY_TOKEN` | any long random string | Requests without this token are rejected. Add `&token=…` to the setup link |
| `CONTACT` | e-mail address or URL | Contact in the User-Agent that adsb.lol and planespotters.net ask for |

### What the proxy does

* Forwards only read-only paths: `/v2/point`, `/v2/closest`, `/v2/lat/…/lon/…/dist/…`, `/v2/mil`, `/v2/ladd`, `/v2/pia`, `/v2/sqk`, `/v2/squawk`, `/v2/hex`, `/v2/icao`, `/v2/callsign`, `/v2/reg`, `/v2/registration`, `/v2/type`, `POST /api/0/routeset`, `/photos/hex/{hex}` for planespotters.net, `/feed/{id}` for the fixed list of RSS feeds, `/tg/{channel}` for the fixed list of Telegram channels of INTEL and `POST /translate` for its German translations through Google Translate. Everything else gets 404, so it is not an open proxy.
* Sends a User-Agent with contact information.
* Adds `Access-Control-Allow-Origin` and answers preflight requests.
* Caches GET responses for two seconds at Vercel's edge, so several devices do not multiply the load on adsb.lol. RSS feeds for five minutes.
* Runs in Frankfurt (`fra1`).

### Why not Cloudflare Workers

Since September 2026 adsb.lol answers requests from Cloudflare Workers with HTTP 429, even on the first request. Vercel and ordinary servers are not affected.

## How updates reach devices

Every part of the collection has its own service worker with its own scope and cache:

| Part | Service worker | Scope | Cache |
|---|---|---|---|
| Hub | `sw.js` | `/VectorScope/` | `vectorscope-hub-v1`, only hub and `shared/` |
| AIR | `air/sw.js` | `/VectorScope/air/` | `vectorscope-air-v1` |
| INTEL | `intel/sw.js` | `/VectorScope/intel/` | `vectorscope-intel-v1` |

The narrower scope wins, so each module controls only its own folder. Page requests go to the network first, so a new version is used on the next start. Built JavaScript and CSS files have content hashes in their names, so old and new files are never mixed. Without network the last loaded version starts.

Up to version 0.2.3 the flights app lived at the root address and used the cache `vectorscope-v1`. The hub service worker removes that cache on its first start. Settings and watchlist are kept, because the address of the site stays the same.

## Troubleshooting

| Problem | Solution |
|---|---|
| Deploy job fails with "Ensure GitHub Pages has been enabled" | Settings > Pages > Source: GitHub Actions, then run the workflow again |
| A module shows "did not start, this is the unbuilt source code" | The branch build of GitHub Pages landed after the deploy. Run the deploy workflow again, or set Settings > Pages > Source to GitHub Actions |
| Home Screen icon opens the hub instead of the radar | Since 0.3.0 the address without `/air/` is the hub. Tap AIR, or add `https://michaeldobner.github.io/VectorScope/air/` to the Home Screen |
| Banner "adsb.lol does not allow direct access from browsers (CORS)" | The proxy is unreachable. Open `https://vectorscope-proxy.vercel.app` in Safari, it must show the status page |
| Banner "adsb.lol is rate limiting requests" | The module slows down by itself. Raise the refresh interval to 10 or 20 s |
| Status stays CONNECTING | Check the network, check the proxy address under Settings > Data source |
| Location is not used | Inside the installed app: allow location when asked, or iOS Settings > Privacy > Location Services > Safari Websites. Or set a fixed location in Settings |
| Map stays dark, aircraft are visible | OpenFreeMap is unreachable. The radar keeps working |
| No aircraft photo | planespotters.net has no photo for this aircraft, or it is unreachable |
| Old version after an update | Close the app completely and open it again. If needed: iOS Settings > Apps > Safari > Advanced > Website Data, delete `michaeldobner.github.io` (this also deletes settings and watchlist) |
| Settings missing in the installed app | Safari and the Home Screen app keep separate storage. Set them inside the installed app |
