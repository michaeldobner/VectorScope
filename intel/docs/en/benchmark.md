# Benchmark of Now

[Deutsche Version](../de/messlatte.md) · [Overview](README.md)

Now picks five main stories out of more than a thousand reports a day. Whether it picks the right ones is not a question of taste but of measurement. Since collection 0.19.0 every change to the ranking has to show its number.

## The reference

Once an hour the collector stores the first ten headlines of three newsrooms, in the order of their front page (`collector/reference.ts`, `reference.json` in the data folder, 14 days):

| Newsroom | Where from |
|---|---|
| Tagesschau | The homepage of its app, `tagesschau.de/api2u/homepage/` |
| ntv | RSS of the front page |
| Spiegel | RSS of the headlines |

Headlines only, no texts. Checked in the test lab (`lab/reference.mjs`).

A **major topic** is a topic that at least two of the three have in their top ten at the same time. One newsroom alone can have a scoop or a hobby horse, two agree on news value.

## The measure

`collector/benchmark.ts` computes Now again for every hourly snapshot, from exactly the reports the collector had seen by then, and checks which major topics one of the main stories covers:

| Measure | Meaning |
|---|---|
| Recall@5 | Share of major topics among the five main stories of Now |
| Recall@10 | Share among the first ten |

A topic counts as covered when a main story shares at least two words or names with it, in its headlines or their German or English translation by the collector.

The test lab runs the benchmark once a day and after every change to `intel/src/data` or `collector`. The result is `benchmark.md` on the branch `lab-results`, with the table per hour and, for the latest snapshot, every major topic with its place in Now or "missing".

## Limits

* The reference measures news value for a general audience. VectorScope looks at security and politics. A Nobel Prize for literature is a major topic of the newsrooms and rightly missing in Now. Recall will not reach 100 % and should not; what counts is the trend and the misses that hurt (an attack, a shooting, Kyiv being evacuated).
* The matching is by words: a story in Russian without a translation is not matched. A miss can therefore also be a missing translation.
* Precision is not measured yet: whether the main stories of Now are important when the newsrooms do not have them. Telegram is often first, see "lead time" in [Stories](stories.md). For that a small hand-checked sample per day is planned.
