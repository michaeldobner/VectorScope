# Architecture

[Deutsche Version](../de/architektur.md) · [Overview](README.md)

NEWS consists of a collector on the own server and an app without a framework, built by Vite into `dist/news/`. How it fits into the collection is described in the [architecture of the collection](../../../docs/en/architecture.md) and the [own server](../../../docs/en/server.md).

```
iPhone / iPad
 └─ NEWS (static files from the own server)
     ├─ /data/news.json ............ the edition, asked every 5 minutes
     └─ pictures ................... directly from the outlets

Own server
 ├─ vectorscope-collector ......... server/collector-loop.mjs, every 10 minutes
 │   ├─ collector/collect.ts ...... round of INTEL
 │   └─ collector/news.ts ......... round of NEWS, writes /data/news/
 └─ vectorscope-web ............... server/web.mjs, serves /data/news.json and /news/
```

GitHub collects and stores nothing of NEWS.

## One round of the collector

`collector/news.ts`, started by `server/collector-loop.mjs` after every round of INTEL, in its own process with a 5 minute limit. A failure of NEWS never touches INTEL.

1. **Read the feeds:** all 35, six at a time, 25 second timeout, charset from the header or the XML declaration (`parse.ts`).
2. **Check:** below 100 usable reports the last edition stays, the round ends with code 1. An empty page helps nobody.
3. **Translate the headlines**, so the model compares English versions.
4. **Vectors and stories:** the model in `/data/models` that INTEL has already loaded.
5. **Pictures** from article pages for stories without a picture in any feed.
6. **Build the edition**, translate the teasers of the leads, build the edition again.
7. **Write** to `/data/news/`.

| File in `/data/news/` | Content | Kept |
|---|---|---|
| `news.json` | The edition | replaced every round |
| `news-translations.json` | Translations, original to German and English | 7 days without use |
| `news-og.json` | Preview picture of the article page per link | 3 days |
| `news-stats.json` | Per feed: reachable, number of reports, error | replaced every round |

The heartbeat of the collector (`/data/heartbeat.json`) carries the result of the last NEWS round in the field `news`.

## Environment variables

| Variable | Effect |
|---|---|
| `NEWS=0` | Turns NEWS off |
| `DEEPL_KEY` | Translate with DeepL instead of Google |
| `EMBED=0` | No model, group by words only |
| `VECTORSCOPE_PROXY` | Proxy for translations, on the server `http://vectorscope-web:8080/proxy` |
| `TRANSLATE_MAX` | Texts per language and round, default 400 |

## Format of the edition

`news.json`, types in `news/src/data/types.ts`:

```
{ at, outlets, countries, stories: [
  { id, ressort, score, worldScore, time, first, countries: ["CH", "DE", …],
    lead: { de: { outlet, lang, head, sum, translated }, en: {…}, orig: {…} },
    img: { url, credit },
    sources: [ { outlet, cc, group, lang, de, en, orig, time, link } ] } ] }
```

Times in milliseconds. `de` or `en` of a source is empty while its translation is missing. An edition has about 230 stories and 400 KB.

## App

| File | Task |
|---|---|
| `news/src/main.ts` | Loading, lists, sheet, briefing, settings, what is new, gestures |
| `news/src/i18n.ts` | All texts of the interface in German and English |
| `news/src/styles.css` | Design, colours from `shared/tokens.css`, fonts Inter and Newsreader |
| `news/public/sw.js` | Keeps the app itself ready, the edition always comes fresh |

The app reads `../data/news.json` relative to its address. With `?data=<address>` it loads another edition, for development. The last edition stays in `localStorage` for starting without a connection.

## Tests and lab

* `news/src/data/edition.test.ts`: charsets, RSS, Atom, Tagesschau API, kickers, noise, grouping with and without vectors, sections, leads per language, missing translations, logos, age, teasers.
* `tests/release.test.ts` checks structure, versions and documentation of the module like for every module.
* `lab/news.mjs` checks candidate feeds with real internet, by hand only, see [Sources](sources.md).

## Development

```bash
npm run dev:news                  # app at http://localhost:5173/
npx tsx collector/news.ts out     # one round into the folder out/
```

Locally the app has no edition at `../data/news.json`. `?data=` points to a copy, for example a `news.json` from the server.
