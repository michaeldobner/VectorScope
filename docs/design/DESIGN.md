# Design brief: Modern Aviation Intelligence

> Serious, calm, data-dense aviation intelligence interface.
> Deep graphite surfaces, restrained ice-blue accents, precise typography, subtle geospatial visualization and colour used exclusively to communicate meaning.
> No gaming aesthetics. No cyberpunk. No military cosplay. No unnecessary decoration.
> It should feel like a professional intelligence instrument that happens to be beautiful.

Visual DNA: `#0B0F14` + `#EDF2F6` + `#55BDEB`

## Colour tokens

| Role | Name | Hex |
|---|---|---|
| Main background | Deep Graphite | `#0B0F14` |
| Panels | Graphite Blue | `#111821` |
| Raised panels | Slate | `#17212B` |
| Lines, borders | Steel | `#25313D` |
| Primary text | Off White | `#EDF2F6` |
| Secondary text | Cool Grey | `#8F9BA8` |
| Primary accent | Ice Blue | `#55BDEB` |
| Selected, active | Bright Ice | `#7DD3FC` |
| Watchlist | Cobalt | `#4C7DFF` |
| Warning, event | Amber | `#E9A23B` |
| Critical, emergency | Signal Red | `#E55757` |

Blue is used only for information and interaction. Never paint everything blue.

## Aircraft

| Meaning | Colour | Second channel |
|---|---|---|
| Standard | `#7F8A96` (darker than the brief's `#AAB4BE` so it separates from Ice Blue by brightness, not only hue) | small icon, no label below zoom 9.5 |
| Interesting | Ice Blue | larger icon, label, short trail |
| Watchlist | Cobalt | thin ring around the icon |
| Event (7600, 7400) | Amber | label |
| Emergency (7700, 7500) | Signal Red | red label |
| Selected | Bright Ice | halo, track history (solid 5 min, dotted before), dashed 3 min projection |

## Typography

Inter for UI and text. IBM Plex Mono for callsigns, codes and telemetry. Tabular figures everywhere so numbers do not jitter. Fonts are self-hosted (no Google Fonts requests).

## Information levels

1. White: what the user needs to know now (callsign).
2. Grey: metadata (type, operator).
3. Blue: interaction and relevance (score).
4. Amber, red: real deviations only (squawk 7700).

## Map

Air navigation display, not a road map: graphite land, slightly bluish water, hairline borders, muted city names, motorways only from zoom 9, airports emphasised with runway geometry. Own position `◎` with subtle range rings.

## Layouts

| | Portrait | Landscape |
|---|---|---|
| iPhone | Full map, bottom sheet (peek, half, full), inspector in the sheet | Map plus side panel |
| iPad | Map on top, lists and inspector side by side below | Map, inspector on the right, strip with Notable, Interesting nearby, Watchlist |

Layout follows available width (works in Split View). Dark-first, no light mode for now.
