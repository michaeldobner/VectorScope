<div align="center">

# ◇ VectorScope Intel

**Verified OSINT and defence news, matched to aircraft in the air right now.** Module INTEL of the [VectorScope collection](../README.md).

<h3><a href="https://michaeldobner.github.io/VectorScope/intel/">michaeldobner.github.io/VectorScope/intel</a></h3>

[**▶ Open VectorScope Intel**](https://michaeldobner.github.io/VectorScope/intel/) · [Deutsch](README.de.md) · [Documentation](docs/en/README.md) · [Changelog](CHANGELOG.md)

<img src="docs/images/iphone-feed.png" width="230" alt="Feed on iPhone with a post that names a drone which is airborne right now">&nbsp;&nbsp;
<img src="docs/images/ipad-landscape.png" width="480" alt="iPad in landscape: feed on the left, live matches, places and sources on the right">

</div>

## Why INTEL

OSINT accounts and defence media report what happens in the air before anyone else. Flight data shows who is flying right now. INTEL brings both together: it reads a short list of verified sources, recognises callsigns, aircraft types and places in every post and checks them against the military aircraft broadcasting at this moment. When an article about an RQ-4 over the Black Sea appears while FORTE11 is orbiting there, INTEL shows it, and one tap opens the aircraft in AIR.

## Highlights

| | |
|---|---|
| **14 verified sources** | ItaMilRadar, The Aviationist, The War Zone, Bellingcat, ISW, Defense News, Naval News, hartpunkt, Augen geradeaus! and more. Each checked for existence, activity and machine readability in the test lab |
| **Bluesky and RSS in one list** | A post that links an article is the same story: it is shown once, with both links |
| **Recognition** | Military callsigns (FORTE11, RCH419, NATO03), about 45 aircraft types in several spellings (KC-135, KC135R, Stratotanker), about 100 places in English and German (Ostsee, Black Sea, Rzeszów, Ramstein) |
| **Live match** | Callsign named in the post and airborne now, or type named and an aircraft of that type near the named place. Highlighted in ice blue, one tap opens it in AIR |
| **Places** | Which places were named in the last 24 hours, one tap filters the feed |
| **Source health** | Every source with its status and the age of its newest post |
| **Calm and private** | No images, no tracking, no account. Read state stays on the device |

## How to use

1. Open INTEL. The feed loads all sources, newest first. New posts since your last visit carry a blue dot.
2. Filter by **Live match**, **Aviation**, **OSINT**, **Naval**, **Defence**, **DACH** or **Official**.
3. A blue **LIVE** row means: this aircraft is in the air now and the post names it or its type near its position. Tap it to open the aircraft in AIR.
4. Tap a place to see only posts that name it.

Full guide: [User guide](docs/en/user-guide.md).

## Documentation

| Document | Contents |
|---|---|
| [User guide](docs/en/user-guide.md) | Views, filters, live matches, places, sources |
| [Sources](docs/en/sources.md) | The verified sources, how they were checked, sources that were rejected and why |
| [Matching](docs/en/matching.md) | Recognition of callsigns, types and places, rules of the live match |
| [Architecture](docs/en/architecture.md) | Modules, data flow, proxy route, storage |
| [Privacy and legal](docs/en/privacy-and-legal.md) | What is loaded from where, excerpts and links, licences |

## Quick start for developers

```bash
npm install            # in the repository root
npm run dev:intel      # this module at http://localhost:5173/
npm test               # unit tests of all modules and repository checks
```

`?demo` shows synthetic items and aircraft, marked as demo.

## Version

Current version: **0.1.1**. See the [changelog](CHANGELOG.md).

Created by Michael Dobner. Licensed under the [MIT licence](../LICENSE).
