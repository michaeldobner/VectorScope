# Privacy and legal

[Deutsche Version](../de/datenschutz-und-recht.md) · [Overview](README.md)

## What leaves the device

| Request | To | Contains |
|---|---|---|
| Bluesky posts | `public.api.bsky.app` | The handle of the source. No account, no login |
| RSS feeds, Telegram channels | `vectorscope-proxy.vercel.app` | The id of the feed or the name of the channel |
| Collected reports | `raw.githubusercontent.com` | Nothing, the file is the same for everyone |
| Translations, only with DE | `vectorscope-proxy.vercel.app`, from there Google Translate | Headlines and excerpts of public reports, nothing personal |
| Live aircraft | `vectorscope-proxy.vercel.app` | Nothing personal, `/v2/mil` is the same for everyone |

INTEL does not use your location. It loads no images, so publishers only see a request when you open an article yourself.

## What stays on the device

Filter, place filter, the time of the last seen item and the last 300 items, in the `localStorage` of `michaeldobner.github.io`. Deleting the website data in Safari removes everything.

## Probe collector

The collector stores public reports of the sources with the time it first saw them on the branch `collector-data` of the public repository, for at most 7 days. It stores nothing about the user.

## Content of third parties

INTEL shows headlines and short excerpts as the publishers provide them in their feeds and posts, with the name of the source and a link to the original. The full text stays with the publisher. Rights to the content remain with the respective publishers. Posts are shown in their original language and are not changed, except that dashes used as punctuation are shown as commas.

## Licences

Live aircraft © adsb.lol contributors, licensed under ODbL 1.0. Bluesky posts through the public AT Protocol API. VectorScope is a personal, non-commercial project and is not affiliated with any of the sources.

## Interpretation

A live match is a hint that a post and an aircraft might belong together, not a confirmation. Reports of the tier Breaking are unverified and marked as such, a story is only as reliable as its sources. INTEL does not derive operations, missions or patterns and shows only what sources publish and aircraft broadcast publicly.
