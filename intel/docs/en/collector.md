# Probe collector

[Deutsche Version](../de/sammler.md) · [Overview](README.md)

INTEL only loads while it is open, and a Telegram channel shows only its last 20 or so posts. Busy channels like Clash Report post more than 300 times a day, so most of it would never be seen. The probe collector closes that gap for one week, at no cost, and answers the question whether a permanent collector is worth it.

## What it does

| | |
|---|---|
| Runs | Every 15 minutes on GitHub Actions (`.github/workflows/collector.yml`), in practice every 15 to 30 minutes because GitHub delays scheduled runs. Also right after every change to the collector or the sources |
| Until | 12 October 2026, then the workflow does nothing. `PROBE_UNTIL` in the workflow changes the date |
| Loads | Every source of INTEL directly from the publishers, no proxy needed on a server |
| Keeps | Every report of the last 7 days with the time it was first seen |
| Publishes | Branch `collector-data` as a single commit, so the repository does not grow |
| Costs | Nothing. GitHub Actions minutes are free for public repositories |

The script is `collector/collect.ts`. It uses the same loaders, parsers and merging as INTEL in the browser.

## Files on the branch collector-data

| File | Contents | Used by |
|---|---|---|
| `latest.json` | Reports of the last 72 hours, excerpts shortened | INTEL in the browser |
| `archive.json` | Every report of the last 7 days | Evaluation |
| `stats.json` | One record per run: per source ok, number of reports, new reports, error | Evaluation |

## In the app

On every refresh INTEL loads `latest.json` from `raw.githubusercontent.com` in addition to the live sources and merges both. Reports that scrolled out of a channel while the app was closed are therefore there. Under Sources the card shows when the collector last ran.

## Evaluation after one week

The evaluation answers:

* How many reports per source and day, and how many of them are noise?
* How often do the fast channels report first, and how far ahead of the confirming sources (lead time per story)?
* Which stories did several sources confirm?
* Did the collector catch the events that were seen first on X?

Based on that it is decided whether INTEL gets a permanent collector, and which sources stay.

## Starting and stopping

* Start by hand: Actions > Collector > Run workflow.
* Stop: disable the workflow under Actions > Collector > ⋯ > Disable workflow, or let the date pass.
* Remove the data: delete the branch `collector-data`. INTEL then works with live sources only.
