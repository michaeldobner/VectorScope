# Raw data

[Deutsche Version](../de/rohdaten.md) · [Overview](README.md)

Since collection 0.9.0 the probe collector keeps every answer of every source as it came, for good. Everything INTEL derives from it (headlines, places, stories, confidence) can be computed again at any time, over the whole history. This page describes how the archive is built, what is in it, how to work with it and how to continue: on a server, with markets, with new questions.

## Principle

The structure follows the small data science stack David Kriesel describes for home projects ([blog post from 2020](https://www.dkriesel.com/blog/2020/0106_ein_kleiner_technologiestack_fuer_datascience-heimprojekte)):

* **Keep all raw data.** "You can always sort out later, you cannot restore what was deleted."
* **Download and parsing are separate steps.** The download has to work every time and stays simple. Parsing may fail and is simply run again.
* **One file per period, no database server.** A single user needs no network database, files are enough and easy to move.
* **Assumptions about the data are checked**, so a change at a source is noticed instead of silently spoiling the data.

| Phase | Kriesel | VectorScope | Code |
|---|---|---|---|
| 1. Download | Python and Requests on a server, one SQLite file per day | Collector on GitHub Actions every 10 minutes, one gzip file of JSON lines per round, new or changed units only | `collector/collect.ts`, `collector/archive-raw.ts`, `collector/raw.ts` |
| 2. Parsing | Separate scripts, result in a second database | `collector/parse.ts` with the same parsers as INTEL, result `reports.jsonl.gz` | `collector/parse.ts` |
| 3. Merging and checks | Jupyter, Pandas, assertions | Places, networks, stories as in the app; checks after every round in `health.json` | `collector/checks.ts`, `collector/eval.ts` |
| 4. Analysis | Notebooks, Matplotlib, Gephi | DuckDB on the files, Gephi for the forward graph, notebooks if wanted | examples below |

Differences on purpose: JSON lines instead of SQLite, because a text file per round can be added to the repository without ever changing an earlier one, and DuckDB reads it directly. Parquet instead of Feather for derived data sets, because more tools read it.

## Where the data lives

| Place | Contents | Changes |
|---|---|---|
| Branch `collector-raw` | The raw archive: `raw/YYYY/MM/DD/HHMM.jsonl.gz` per round (UTC), once `raw/legacy/archive-YYYY-MM-DD.jsonl.gz` | Only grows. A file is never changed after it was written |
| Branch `collector-data` | Current state for INTEL and the collector: `latest.json`, `archive.json`, `stats.json`, `health.json`, `raw-state.json` | Replaced every round, no history |

Both branches are in the repository `michaeldobner/VectorScope` and have nothing to do with the code on `main`.

**Size.** About 20 to 30 new units per round, most of them Telegram posts of 2 to 6 KB. Compressed that is roughly 1 to 3 MB a day, 0.5 to 1 GB a year. A clone of `main` with `--single-branch` does not download the archive.

## Records

Every line of a round file is one JSON object. The field `t` says what it is.

**`round`**, the first line of every file:

| Field | Meaning |
|---|---|
| `format` | Version of the record format, currently 1 (`RAW_FORMAT` in `collector/raw.ts`) |
| `round` | Round id, minute in UTC, e.g. `2026-10-08T21:10Z` |
| `at`, `ms` | Start of the round (epoch ms) and its duration |
| `sources`, `ok` | Sources asked, sources that answered |
| `units`, `fresh`, `changed` | Units in all answers, of them new and changed |

**`fetch`**, one per request, also when it failed:

| Field | Meaning |
|---|---|
| `src` | Source id as in `intel/src/data/sources.ts`, e.g. `baza`, `rybar-en`, `usgs` |
| `kind`, `api` | `telegram`, `rss`, `bluesky` or `api`; for `api` the service: `usgs`, `emsc`, `gdacs`, `nws`, `faa` |
| `url`, `status`, `ms`, `bytes` | Request, HTTP status (null if no answer came), duration, size of the answer |
| `units`, `fresh`, `changed` | Units in this answer, of them new and changed |
| `error` | Error text, e.g. `HTTP 503` or `fetch failed` |

**`unit`**, one per new or changed unit:

| Field | Meaning |
|---|---|
| `key` | Stable key, see below |
| `v` | Version: 1 when first seen, 2, 3, … when the content changed |
| `hash` | Fingerprint of the content |
| `at` | Time of the request that brought this version (epoch ms). For `v` 1 this is the **first time seen**, the most important number of the archive |
| `src`, `kind`, `api`, `round` | As above |
| `body` | The unit exactly as the source sent it: HTML of the Telegram post, XML of the RSS item, JSON of the Bluesky post or the earthquake |

**`legacy`**, only in `raw/legacy/`: the reports of the earlier archive from 30 September 2026 to the start of the raw archive, already parsed (`item`), with the time first seen where the collector had it.

### Units and keys

| Source | Unit | Key |
|---|---|---|
| Telegram | One post of the web preview `t.me/s/{channel}` | `tg:{channel}/{post}` |
| RSS, Atom, GDACS | One `<item>` or `<entry>` | `rss:{source}:{guid or link}`, `gdacs:{guid}` |
| Bluesky | One entry of the author feed | `bsky:{post uri}`, reposts with `:repost:{did}` |
| USGS, EMSC, NWS | One GeoJSON feature | `usgs:{id}`, `emsc:{id}`, `nws:{id}` |
| FAA | The whole status document | `faa:status` |
| Own sensor | One report of the sensor | its id, e.g. `sensor:7700:…` |

### When a unit counts as changed

The fingerprint leaves out what changes without the content changing: in Telegram the view counter, the reactions, the signed token `data-view` that is new on every request and signed image links; in Bluesky likes, reposts, quotes and avatars, also of quoted posts; the update time of the FAA document. Checked on two real rounds: without these rules 758 of 1,552 units counted as changed, with them only the real changes (an FAA status, a GDACS cyclone update). An edited Telegram post or a revised earthquake magnitude is a new version. Views are therefore stored with each version, not every round.

### State and guarantees

`raw-state.json` on `collector-data` knows every key with its fingerprint, version and when it was last seen. The workflow pushes the raw file first and publishes a state only if the raw file arrived. A unit therefore never counts as known while it is missing in the archive. In the rare worst case it is stored twice, which phase 2 recognises. A key not seen for 30 days is forgotten: should it come back, it starts again as version 1.

## Phase 2: parsing

```bash
# Archive without the code, only the branch
git clone --single-branch --branch collector-raw https://github.com/michaeldobner/VectorScope.git vs-raw
# In the repository with the code
npx tsx collector/parse.ts ../vs-raw parsed
```

`parsed/reports.jsonl.gz` has one line per report, the newest version of each unit:

| Field | Meaning |
|---|---|
| `key`, `kind` | Key of the unit; `kind` is `legacy` for reports of the earlier archive |
| `id`, `sourceId`, `channel`, `title`, `text`, `url`, `time` | The report as INTEL shows it, `time` is the time of publication |
| `lat`, `lon`, `area` | For measuring sources |
| `tier`, `region`, `lang` | Class, region and language of the source |
| `firstSeen`, `lastChanged`, `versions` | First time seen, time of the newest version, number of versions |
| `telegram` | `forwardedFrom` (channel/post or name), `replyTo`, `views`, `edited`, `links`, `mentions`, `media` |

`parsed/problems.jsonl.gz` lists RSS and Bluesky units that did not parse. Telegram posts without text, Bluesky reposts and earthquakes below magnitude 5 are no problem, they are simply no report.

A better parser means: change `intel/src/data/*.ts`, run `parse.ts` again, done. The raw archive stays as it is.

**Mind the first rounds.** When the archive starts and when a source is added, the collector sees the last 20 or so posts at once: their `firstSeen` is the start, not the moment they appeared. For questions of speed use only reports with `firstSeen - time` below 30 minutes.

## Checks

After every round `collector/checks.ts` writes `health.json` to `collector-data` and adds the warnings to the summary of the run under Actions > Collector:

* A source failed 3 rounds in a row.
* A source with at least 8 new reports a day has been quiet for 4 of its typical gaps, at least 6 hours.
* More than 30 minutes between two rounds.
* Less than 90 % of the sources answered.
* Reports that break an assumption: no time, time more than an hour in the future, no link, no headline.

The counts come from `stats.json`, which keeps 8 days. Until 14 October 2026 it still contains the inflated counts of the time before collection 0.8.1, the silence warnings are less reliable until then.

## Analysis with DuckDB

[DuckDB](https://duckdb.org) is a single program without a server. It reads the gzip files directly.

```sql
-- Reports per source and day
SELECT sourceId, strftime(to_timestamp(firstSeen / 1000), '%Y-%m-%d') AS day, count(*) AS n
FROM read_json_auto('parsed/reports.jsonl.gz') GROUP BY ALL ORDER BY day, n DESC;

-- Forward graph for Gephi: who forwards whom
COPY (
  SELECT regexp_extract(key, 'tg:([^/]+)/', 1) AS "Source",
         split_part(telegram.forwardedFrom, '/', 1) AS "Target",
         count(*) AS "Weight"
  FROM read_json_auto('parsed/reports.jsonl.gz')
  WHERE telegram.forwardedFrom IS NOT NULL GROUP BY ALL
) TO 'forwards.csv' (HEADER);

-- Who had a place first
SELECT sourceId, min(to_timestamp(firstSeen / 1000)) AS first
FROM read_json_auto('parsed/reports.jsonl.gz')
WHERE title ILIKE '%Туапсе%' OR title ILIKE '%Tuapse%' GROUP BY ALL ORDER BY first;

-- Edited posts
SELECT sourceId, title, versions FROM read_json_auto('parsed/reports.jsonl.gz') WHERE versions > 1 ORDER BY versions DESC;

-- Reliability of the sources: failed requests per source
SELECT src, count(*) AS requests, count(*) FILTER (WHERE error IS NOT NULL) AS failed
FROM read_json_auto('vs-raw/raw/*/*/*/*.jsonl.gz', union_by_name = true)
WHERE t = 'fetch' GROUP BY ALL ORDER BY failed DESC;

-- Derived data set as Parquet
COPY (SELECT * EXCLUDE (text) FROM read_json_auto('parsed/reports.jsonl.gz')) TO 'reports.parquet';
```

**Gephi** ([gephi.org](https://gephi.org), free): File > Import spreadsheet > `forwards.csv` as edge table. Layout ForceAtlas 2, node size by in-degree: the channels that are forwarded most stand out.

**Stories over the history:** `npx tsx collector/eval.ts <folder> [days]` groups the reports of `archive.json` like INTEL and prints statuses, lead times and first reporters. Running it over `reports.jsonl.gz` is the next step, see below.

## How to continue

### 1. Keep collecting after the probe

The workflow stops on `PROBE_UNTIL` (31 January 2027, moved from 12 October 2026). To keep the archive growing beyond that, move the date in `.github/workflows/collector.yml`. GitHub Actions is free for public repositories. The 6 hour runs restart every hour by schedule, gaps show in `health.json`.

### 2. Move to a server

The stack for an own server with Coolify is ready, see [Own server](../../../docs/en/server.md): the collector there writes round files named `HHMM-srv.jsonl.gz` and pushes them to the same branch. The general steps, for any server:

1. Clone the branch `collector-raw` onto the server, copy `raw-state.json` from `collector-data`.
2. Run `npx tsx collector/collect.ts <data> <raw>` every minute or every few minutes by cron or a systemd timer. The script does not depend on GitHub.
3. Serve `latest.json` from the server (or keep pushing it to `collector-data`) and point `COLLECTOR_URL` in `intel/src/data/feed.ts` at it.
4. Optional: daily `parse.ts` and a DuckDB file or Postgres for fast queries. The round files stay the source of truth, the database can always be rebuilt from them.
5. Optional: Telegram through the official client interface (MTProto) with an own account instead of the web preview. That brings complete history, forwards with their origin, edits and deletions in real time. New units then get their own `kind`, and `RAW_FORMAT` goes to 2.
6. Disable the workflow on GitHub.

### 3. Add markets

Market data fits into the same pattern as new kinds of units:

| Data | Source | Unit | Key |
|---|---|---|---|
| Prices | e.g. Stooq, Alpha Vantage, Finnhub | One price per instrument and time | `px:{symbol}:{time}` |
| Insider trades USA | SEC EDGAR, Form 4 | One filing | `sec4:{accession number}` |
| Directors' dealings EU | BaFin, EQS | One notification | `mar19:{id}` |
| Ad hoc disclosures | EQS, SEC 8-K | One disclosure | `adhoc:{id}` |

Steps: a loader in the style of `intel/src/data/feed.ts` that calls `onRaw`, a splitter in `splitUnits`, a parser in `parseUnit`, describe the new keys on this page. The analysis is an event study: price movement around `firstSeen` of a story compared with the market as a whole.

### 4. Change the format

Fields may be added at any time. If a field changes its meaning, raise `RAW_FORMAT`, describe the difference on this page and let `parse.ts` read both versions. Never rewrite old files.

## Limits

* The web preview of Telegram shows only the last 20 or so posts of a channel. Every 10 minutes is enough even for Clash Report, but posts deleted within minutes can be missed.
* Pictures and videos are not stored, only text, links and the note that media were attached.
* `firstSeen` is only as exact as the interval of the rounds: up to 10 minutes late.
* The archive is public like the repository. It contains only what the sources published themselves, nothing of the users of INTEL.
