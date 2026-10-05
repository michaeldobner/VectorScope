# Quellen

[English version](../en/sources.md) · [Übersicht](README.md)

INTEL liest eine kurze, feste Liste von Quellen. Qualität vor Menge: Jede Quelle wurde am 05.10.2026 im Test-Labor mit echtem Internet geprüft, bevor sie aufgenommen wurde. Die Liste steht in `src/data/sources.ts`.

## Die Prüfung

Das Skript `lab/osint.mjs` läuft im Test-Labor auf GitHub Actions und prüft jeden Kandidaten:

| Frage | Wie |
|---|---|
| Gibt es den Account, und ist es der offizielle? | Accountsuche bei Bluesky, Profil mit Followern und Zahl der Beiträge |
| Ist er aktiv? | Alter des neuesten Beitrags, Anteil eigener Beiträge unter den letzten fünf (Reposts zählen nicht) |
| Kann eine Maschine ihn lesen? | RSS: HTTP-Status, Zahl der Einträge, neuestes Datum. Bluesky und Mastodon: öffentliche API |
| Kann ein Browser ihn direkt lesen? | Header `Access-Control-Allow-Origin` |

Das Ergebnis landet im Branch `lab-results` als `osint.md` und `osint.json`.

## Geprüfte Quellen

| Quelle | Kategorie | Bluesky | RSS | Neuester Beitrag bei der Prüfung |
|---|---|---|---|---|
| ItaMilRadar | Aviation | itamilradar.com, 3.000 Follower | ✓ | 1 h |
| The Aviationist | Aviation | theaviationist.com, 6.300 | ✓ | unter 1 h |
| The War Zone | Aviation | | ✓ | 11 h |
| Bellingcat | OSINT | bellingcat.com, 275.000 | ✓ | 1 h |
| ISW | OSINT | thestudyofwar.bsky.social, 102.000 | | 11 h |
| Jakub Janovsky (Oryx) | OSINT | rebel44cz.bsky.social, 30.000 | | 4 h |
| Defense News | Defence | defensenews.bsky.social, 7.500 | ✓ | 1 h |
| Breaking Defense | Defence | breakingdefense.com, 4.300 | ✓ | 3 d |
| Naval News | Naval | | ✓ | 3 h |
| USNI News | Naval | | ✓ | 2 d |
| hartpunkt | DACH | hartpunkt.bsky.social, 1.000 | ✓ | unter 1 h |
| Augen geradeaus! | DACH | wiegold.de, 16.000 | ✓ | 3 h |
| ESUT | DACH | | ✓ | 1 h |
| US DoD News | Official | | ✓ | 2 d |

Naval News hat auch einen Bluesky-Account (navalnews.com, 15.000 Follower), dessen Feed im Live-Test aber mit HTTP 400 antwortete. INTEL liest nur den RSS-Feed.

## Verworfene Kandidaten

| Kandidat | Grund |
|---|---|
| OSINTdefender | Offizieller Bluesky-Account ohne Beiträge, die aktiven Accounts sind inoffizielle Spiegel. Der Telegram-Kanal schreibt unter anderem Namen |
| GeoConfirmed | Letzter Beitrag 11 Tage alt |
| Liveuamap | Letzter Beitrag 4 Tage alt, kein RSS |
| OSINTtechnical, Intel Crab, Faytuks News, Tyler Rogoway, Michael Kofman, Aircraft Spots | Seit Monaten still |
| ELINT News | Insgesamt 20 Beiträge |
| Oryx | Blog-Feed fast zwei Jahre alt. Stattdessen ist Jakub Janovsky aufgenommen, einer der Autoren |
| Scramble, ISW-Website, NATO, Bundeswehr, Janes, Aviation Week, FlugRevue | Kein funktionierender Feed (403, 404 oder HTML) |
| Mastodon | Dort ist nur Bellingcat aktiv, schon über Bluesky und RSS enthalten |
| GDELT | Während der Prüfung gesperrt wegen zu vieler Anfragen, noch nicht entschieden |

## Kanäle

| Kanal | Zugriff | Intervall |
|---|---|---|
| Bluesky | Direkt aus dem Browser, `public.api.bsky.app` erlaubt das. Nur eigene Beiträge, keine Antworten, keine Reposts | Alle fünf Minuten |
| RSS | Über die Proxy-Route `/feed/{id}`, weil die meisten Herausgeber den Browserzugriff nicht erlauben. Fünf Minuten im Edge-Cache. Fällt der Proxy aus, versucht INTEL den Feed direkt | Alle fünf Minuten |

## Eine Quelle hinzufügen

1. Den Kandidaten in `lab/osint.mjs` aufnehmen und vom Labor prüfen lassen.
2. In `SOURCES` in `src/data/sources.ts` eintragen.
3. Für einen RSS-Feed dieselbe ID und Adresse in `FEEDS` in `proxy/api/proxy.js` eintragen. Ein Test schlägt fehl, wenn beide Listen abweichen.
4. Diese Seite in beiden Sprachen aktualisieren.
