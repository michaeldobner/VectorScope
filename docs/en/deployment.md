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

Browsers only let a website read data from another server if that server explicitly allows it (CORS, a security rule of every browser, not a Safari setting). adsb.lol does not allow it on its `/v2` endpoints, so VectorScope shows the banner "adsb.lol does not allow direct access from browsers". The fix is a small relay that fetches the data server-side and adds the permission: the proxy in `proxy/`, free on Vercel's hobby plan. No free flight data API without such a relay currently works from a browser: OpenSky, adsb.fi and avioadsb send no CORS headers either, airplanes.live only serves its feeders.

### Without setup: public relays

In **Auto** mode VectorScope first tries your own proxy, then adsb.lol directly, then the free public relays allorigins and codetabs. They need no account. They are not under your control and can be slow or unavailable, and they see the rounded coordinates of your queries. For reliable everyday use, set up your own proxy.

### Setup in three minutes

**Option A: deploy button (fastest)**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmichaeldobner%2FVectorScope&root-directory=proxy&project-name=vectorscope-proxy&repository-name=vectorscope-proxy)

1. Tap the button and sign in to Vercel with GitHub.
2. Vercel creates a copy of the repository named `vectorscope-proxy` and deploys only the `proxy` folder. Confirm with **Create**, then **Deploy**.
3. When it shows "Congratulations", copy the address, for example `https://vectorscope-proxy.vercel.app`.

**Option B: import this repository**

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New** > **Project**, import this repository.
3. **Root Directory:** `proxy`. **Framework Preset:** Other. Deploy.

**Then connect VectorScope with one tap.** Open this address on the iPhone or iPad, replacing the proxy address with yours:

```
https://michaeldobner.github.io/VectorScope/?proxy=https://vectorscope-proxy.vercel.app
```

VectorScope saves the proxy permanently and removes the parameter from the address. Do this inside the installed Home Screen app as well, or enter the address there under **Settings** > **Data source**. Safari and the installed app keep separate storage.

**Optional environment variables** (Vercel > Project > Settings > Environment Variables, then redeploy):

| Variable | Value | Purpose |
|---|---|---|
| `ALLOWED_ORIGIN` | `https://michaeldobner.github.io` | Only this site may use the proxy from a browser |
| `PROXY_TOKEN` | any long random string | Requests without this token are rejected. Add `&token=…` to the setup link |
| `CONTACT` | e-mail address or URL | Contact in the User-Agent that adsb.lol asks for |

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
| Banner "adsb.lol does not allow direct access from browsers (CORS)" | Set up the proxy and open the one-tap link, see above |
| Banner "adsb.lol is rate limiting requests" | VectorScope slows down by itself. Raise the refresh interval to 10 or 20 s |
| Status stays CONNECTING | Check the network, check the proxy address, open the proxy address with `/v2/mil` in Safari |
| Location is not used | Inside the installed app: allow location when asked, or iOS Settings > Privacy > Location Services > Safari Websites. Or set a fixed location in Settings |
| Map stays dark, aircraft are visible | OpenFreeMap is unreachable. The radar keeps working |
| No aircraft photo | planespotters.net has no photo for this aircraft, or it is unreachable |
| Old version after an update | Close the app completely and open it again. If needed: iOS Settings > Apps > Safari > Advanced > Website Data, delete `michaeldobner.github.io` (this also deletes settings and watchlist) |
| Settings missing in the installed app | Safari and the Home Screen app keep separate storage. Set them inside the installed app |
| Address changed after renaming the repository | GitHub Pages uses the repository name in the address. Add VectorScope to the Home Screen again |
