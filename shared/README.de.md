# ◇ VectorScope · Gemeinsame Hülle

[English](README.md) · [Zurück zur Sammlung](../README.de.md) · [Changelog](CHANGELOG.de.md)

Was alle Teile von VectorScope gemeinsam haben. Eine Änderung hier betrifft jedes Modul, deshalb hat die gemeinsame Hülle eine eigene Version.

## Inhalt

| Datei | Inhalt | Genutzt von |
|---|---|---|
| `tokens.css` | Farb-Tokens des Graphite-Schemas als CSS-Variablen | Startseite, AIR |
| `hub.css` | Layout der Startseite: Kopf, Modulkarten, Fußzeile | Startseite |
| `icons/` | App-Icons der Sammlung: SVG, 192 und 512 Pixel, Apple Touch Icon | Startseite |
| `fonts/` | Inter 400 und 600, lateinischer Zeichensatz | Startseite |

## Farb-Tokens

| Variable | Rolle | Wert |
|---|---|---|
| `--bg` | Haupthintergrund | `#0E0E10` |
| `--panel` | Panels | `#1C1C1E` |
| `--raised` | Erhöhte Panels | `#2C2C2E` |
| `--border` | Linien und Rahmen | `#38383A` |
| `--text` | Haupttext | `#F5F5F7` |
| `--text-2` | Sekundärtext | `#A1A1A6` |
| `--text-3` | Tertiärtext | `#6E6E73` |
| `--accent` | Ice Blue, der einzige Akzent | `#55BDEB` |
| `--active` | Ausgewählt, aktiv | `#7DD3FC` |
| `--info` | Watchlist | `#4C7DFF` |
| `--warning` | Warnung, Ereignis | `#FF9F0A` |
| `--critical` | Kritisch, Notfall | `#FF453A` |
| `--tone-*` | Flugzeugtöne: normal, interessant, Watchlist, Ereignis, Notfall | wie oben, normal `#E5E5EA` |
| `--radius`, `--radius-sm` | Eckenradien | 14 px, 8 px |

Blau dient nur der Information und Interaktion, nie der Dekoration. Amber und Rot nur für echte Abweichungen. Die Begründung steht im [Design von AIR](../air/docs/de/design.md).

## Verwendung

In einem Modul mit Vite:

```ts
import '../../shared/tokens.css';
```

In einer statischen Seite:

```html
<link rel="stylesheet" href="./shared/tokens.css" />
```

Eine Prüfung des Repositorys hält `tokens.css` identisch mit dem Graphite-Schema in `air/src/ui/tokens.ts`.

## Version

Aktuelle Version: **1.1.0**. Siehe [Changelog](CHANGELOG.de.md).
