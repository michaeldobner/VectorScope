# ◇ VectorScope · Shared shell

[Deutsch](README.de.md) · [Back to the collection](../README.md) · [Changelog](CHANGELOG.md)

What all parts of VectorScope have in common. A change here affects every module, so the shared shell has its own version.

## Contents

| File | Contents | Used by |
|---|---|---|
| `tokens.css` | Colour tokens of the Graphite theme as CSS custom properties | Hub, AIR |
| `hub.css` | Layout of the hub: header, module cards, footer | Hub |
| `icons/` | App icons of the collection: SVG, 192 and 512 pixels, Apple touch icon | Hub |
| `fonts/` | Inter 400 and 600, Latin subset | Hub |

## Colour tokens

| Variable | Role | Value |
|---|---|---|
| `--bg` | Main background | `#0E0E10` |
| `--panel` | Panels | `#1C1C1E` |
| `--raised` | Raised panels | `#2C2C2E` |
| `--border` | Lines and borders | `#38383A` |
| `--text` | Primary text | `#F5F5F7` |
| `--text-2` | Secondary text | `#A1A1A6` |
| `--text-3` | Tertiary text | `#6E6E73` |
| `--accent` | Ice Blue, the only accent | `#55BDEB` |
| `--active` | Selected, active | `#7DD3FC` |
| `--info` | Watchlist | `#4C7DFF` |
| `--warning` | Warning, event | `#FF9F0A` |
| `--critical` | Critical, emergency | `#FF453A` |
| `--tone-*` | Aircraft tones: standard, interesting, watch, event, emergency | as above, standard `#E5E5EA` |
| `--radius`, `--radius-sm` | Corner radii | 14 px, 8 px |

Blue is used for information and interaction only, never as decoration. Amber and red only for real deviations. The reasoning is in the [design of AIR](../air/docs/en/design.md).

## Usage

In a module built with Vite:

```ts
import '../../shared/tokens.css';
```

In a static page:

```html
<link rel="stylesheet" href="./shared/tokens.css" />
```

A repository check keeps `tokens.css` identical to the Graphite theme in `air/src/ui/tokens.ts`.

## Version

Current version: **1.0.0**. See the [changelog](CHANGELOG.md).
