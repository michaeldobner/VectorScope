# Probe collector

[Deutsche Version](../de/sammler.md) · [Overview](README.md)

INTEL only loads while it is open, and a Telegram channel shows only its last 20 or so posts. Busy channels like Clash Report post more than 300 times a day, so most of it would never be seen. The probe collector closes that gap at no cost until the end of January 2027, keeps the raw archive growing and answers the question whether a permanent collector on a server is worth it.

## What it does

| | |
|---|---|
| Runs | Every 10 minutes on GitHub Actions (`.github/workflows/collector.yml`). GitHub starts scheduled runs on a quiet repository only every few hours, so one run keeps collecting for almost six hours and the hourly schedule queues the next. A change to the collector or the sources replaces the running collection at once |
| Until | 31 January 2027, then the workflow does nothing. `PROBE_UNTIL` in the workflow changes the date |
| Loads | Every source of INTEL directly from the publishers, no proxy needed on a server |
| Keeps | Every report of the last 7 days with the time it was first seen, plus the key of every report ever seen, so a report never counts as new twice |
| Publishes | Branch `collector-data` as a single commit, so the repository does not grow |
| Costs | Nothing. GitHub Actions minutes are free for public repositories |

The script is `collector/collect.ts`. It uses the same loaders, parsers and merging as INTEL in the browser.

## Files on the branch collector-data

| File | Contents | Used by |
|---|---|---|
| `latest.json` | Reports of the last 72 hours, excerpts shortened | INTEL in the browser |
| `archive.json` | Every report of the last 7 days | Evaluation |
| `stats.json` | One record per round: per source ok, number of reports, new reports of the last 24 hours, error | Evaluation, checks |
| `health.json` | Checks after every round: failing and silent sources, gaps, reports that break an assumption | Monitoring |
| `raw-state.json` | Which raw units are known, with fingerprint and version | Collector |

Next to it the branch `collector-raw` keeps every answer of every source for good, one file per round. Structure, format and analysis: [Raw data](raw-data.md).

## In the app

On every refresh INTEL loads `latest.json` from `raw.githubusercontent.com` in addition to the live sources and merges both. Reports that scrolled out of a channel while the app was closed are therefore there. Under Sources the card shows when the collector last ran.

## Evaluation

The evaluation answers:

* How many reports per source and day, and how many of them are noise?
* How often do the fast channels report first, and how far ahead of the confirming sources (lead time per story)?
* Which stories did several sources confirm?
* Did the collector catch the events that were seen first on X?

Based on that it is decided whether INTEL gets a permanent collector, and which sources stay.

`npx tsx collector/eval.ts <folder> [days]` reads `archive.json` from a folder and prints what INTEL would have shown: reports per class, stories with several independent sources, lead times and the first reporters.

## Starting and stopping

* Start by hand: Actions > Collector > Run workflow.
* Stop: disable the workflow under Actions > Collector > ⋯ > Disable workflow, or let the date pass.
* Remove the data: delete the branch `collector-data`. INTEL then works with live sources only.
