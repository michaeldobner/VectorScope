# Datenschutz und Recht

[English version](../en/privacy-and-legal.md) · [Übersicht](README.md)

## Was das Gerät verlässt

| Anfrage | An | Enthält |
|---|---|---|
| Bluesky-Beiträge | `public.api.bsky.app` | Den Handle der Quelle. Kein Konto, keine Anmeldung |
| RSS-Feeds, Telegram-Kanäle | `vectorscope-proxy.vercel.app` | Die ID des Feeds oder den Namen des Kanals |
| Gesammelte Meldungen | `raw.githubusercontent.com` | Nichts, die Datei ist für alle gleich |
| Live-Flugzeuge | `vectorscope-proxy.vercel.app` | Nichts Persönliches, `/v2/mil` ist für alle gleich |

INTEL nutzt deinen Standort nicht. Es lädt keine Bilder, Herausgeber sehen also nur dann eine Anfrage, wenn du selbst einen Artikel öffnest.

## Was auf dem Gerät bleibt

Filter, Ortsfilter, der Zeitpunkt des zuletzt gesehenen Eintrags und die letzten 300 Einträge, im `localStorage` von `michaeldobner.github.io`. Das Löschen der Websitedaten in Safari entfernt alles.

## Probe-Sammler

Der Sammler speichert öffentliche Meldungen der Quellen mit dem Zeitpunkt, an dem er sie zuerst gesehen hat, im Branch `collector-data` des öffentlichen Repositorys, höchstens 7 Tage lang. Über die Nutzerin oder den Nutzer speichert er nichts.

## Inhalte Dritter

INTEL zeigt Überschriften und kurze Auszüge so, wie die Herausgeber sie in ihren Feeds und Beiträgen bereitstellen, mit dem Namen der Quelle und einem Link zum Original. Der vollständige Text bleibt beim Herausgeber. Die Rechte an den Inhalten liegen bei den jeweiligen Herausgebern. Beiträge erscheinen in ihrer Originalsprache und unverändert, nur Gedankenstriche werden als Kommas dargestellt.

## Lizenzen

Live-Flugzeuge © Mitwirkende von adsb.lol, lizenziert unter ODbL 1.0. Bluesky-Beiträge über die öffentliche API des AT Protocol. VectorScope ist ein persönliches, nichtkommerzielles Projekt und steht in keiner Verbindung zu den Quellen.

## Einordnung

Ein Live-Treffer ist ein Hinweis, dass ein Beitrag und ein Flugzeug zusammengehören könnten, keine Bestätigung. Meldungen der Stufe Breaking sind ungeprüft und so gekennzeichnet, eine Story ist nur so verlässlich wie ihre Quellen. INTEL leitet keine Einsätze, Missionen oder Muster ab und zeigt nur, was Quellen veröffentlichen und Flugzeuge öffentlich senden.
