# Sources

[Deutsche Version](../de/quellen.md) · [Overview](README.md)

INTEL reads a short, fixed list of sources. Quality over quantity: every source was checked in the test lab with real internet on 2026-10-05 before it was added. The list lives in `src/data/sources.ts`.

## The check

The script `lab/osint.mjs` runs in the test lab on GitHub Actions and checks every candidate:

| Question | How |
|---|---|
| Does the account exist, and is it the official one? | Bluesky account search, profile with followers and number of posts |
| Is it active? | Age of the newest post, share of own posts among the last five (reposts do not count) |
| Can a machine read it? | RSS: HTTP status, number of items, newest date. Bluesky and Mastodon: public API |
| Can a browser read it directly? | `Access-Control-Allow-Origin` header |

The result is pushed to the branch `lab-results` as `osint.md` and `osint.json`.

## Verified sources

| Source | Category | Bluesky | RSS | Newest post at check |
|---|---|---|---|---|
| ItaMilRadar | Aviation | itamilradar.com, 3.000 followers | ✓ | 1 h |
| The Aviationist | Aviation | theaviationist.com, 6.300 | ✓ | under 1 h |
| The War Zone | Aviation | | ✓ | 11 h |
| Bellingcat | OSINT | bellingcat.com, 275.000 | ✓ | 1 h |
| ISW | OSINT | thestudyofwar.bsky.social, 102.000 | | 11 h |
| Jakub Janovsky (Oryx) | OSINT | rebel44cz.bsky.social, 30.000 | | 4 h |
| Defense News | Defence | defensenews.bsky.social, 7.500 | ✓ | 1 h |
| Breaking Defense | Defence | breakingdefense.com, 4.300 | ✓ | 3 d |
| Naval News | Naval | | ✓ | 3 h |
| USNI News | Naval | | ✓ | 2 d |
| hartpunkt | DACH | hartpunkt.bsky.social, 1.000 | ✓ | under 1 h |
| Augen geradeaus! | DACH | wiegold.de, 16.000 | ✓ | 3 h |
| ESUT | DACH | | ✓ | 1 h |
| US DoD News | Official | | ✓ | 2 d |

Naval News also has a Bluesky account (navalnews.com, 15.000 followers), but its feed answered with HTTP 400 in the live test. INTEL reads its RSS feed only.

## Rejected candidates

| Candidate | Reason |
|---|---|
| OSINTdefender | Official Bluesky account without posts, the active accounts are unofficial mirrors. Telegram channel posts under another name |
| GeoConfirmed | Last post 11 days old |
| Liveuamap | Last post 4 days old, no RSS |
| OSINTtechnical, Intel Crab, Faytuks News, Tyler Rogoway, Michael Kofman, Aircraft Spots | Silent for months |
| ELINT News | 20 posts in total |
| Oryx | Blog feed almost two years old. Jakub Janovsky, one of the authors, is included instead |
| Scramble, ISW website, NATO, Bundeswehr, Janes, Aviation Week, FlugRevue | No working feed (403, 404 or HTML) |
| Mastodon | Only Bellingcat is active there, already included through Bluesky and RSS |
| GDELT | Rate limited during the check, not decided yet |

## Channels

| Channel | Access | Interval |
|---|---|---|
| Bluesky | Directly from the browser, `public.api.bsky.app` allows it. Own posts only, no replies, no reposts | Every five minutes |
| RSS | Through the proxy route `/feed/{id}`, because most publishers do not allow browser access. Cached five minutes at the edge. If the proxy fails, INTEL tries the feed directly | Every five minutes |

## Adding a source

1. Add the candidate to `lab/osint.mjs` and let the lab check it.
2. Add it to `SOURCES` in `src/data/sources.ts`.
3. For an RSS feed add the same id and address to `FEEDS` in `proxy/api/proxy.js`. A test fails if both lists differ.
4. Update this page in both languages.
