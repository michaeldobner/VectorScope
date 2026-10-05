# Roadmap

[English version](../en/roadmap.md) · [Übersicht](README.md)

VectorScope wächst Modul für Modul. Alles läuft auf GitHub Pages und dem vorhandenen Proxy bei Vercel, ohne eigenen Server. Ideen, die einen dauerhaft laufenden Server brauchen, stehen gesondert.

## Jetzt

| Schritt | Modul | Inhalt | Status |
|---|---|---|---|
| 1 | Sammlung | Repository als Sammlung: Startseite, `shared/`, Modul AIR in `air/`, Release-Skript, Prüfungen des Repositorys, Rauchtest in Gerätegrößen | Erledigt in 0.3.0 |
| 2 | INTEL | Quellenliste erstellen und prüfen: Bluesky, Mastodon, RSS und GDELT, jede Quelle geprüft auf Existenz, Aktivität und maschinelle Lesbarkeit | Erledigt, 14 Quellen |
| 3 | INTEL | Stufe A: Feed der geprüften Quellen, Erkennung von Callsigns, Typen und Orten, Live-Abgleich mit Militärflugzeugen, direkter Sprung nach AIR | Erledigt in INTEL 0.1.0 |
| 4 | INTEL | Telegram-Eilmelder, bestätigende Medien, Stories mit Status und Vorsprung | Erledigt in INTEL 0.2.0 |
| 5 | INTEL | Probe-Sammler für eine Woche, danach Auswertung: Menge, Tempo, Vorsprung, Lärm je Quelle. Entscheidung über einen dauerhaften Sammler | Läuft bis 12. Oktober 2026 |

## Als Nächstes

| Modul | Inhalt |
|---|---|
| INTEL | Karte der in den letzten 24 Stunden genannten Orte zusammen mit den Treffer-Flugzeugen. Zweite Prüfung von GDELT. Kennzeichen und ICAO-Adressen in Beiträgen |
| AIR | Kompassmodus mit dem Bewegungssensor des Geräts, Gebietsüberwachung mit Polygonen |

## Später, braucht einen Server

| Idee | Warum ein Server |
|---|---|
| Push-Benachrichtigungen bei Watchlist-Treffern | Jemand muss aufpassen, während die App geschlossen ist. Möglich mit ntfy und einem zeitgesteuerten Worker |
| INTEL Stufen B und C: Verlauf und Korrelation | Beiträge und Positionen müssen laufend gesammelt werden, um Muster über Stunden zu erkennen |

## Zurückgestellt

| Idee | Grund |
|---|---|
| Sprachausgabe auf Deutsch | Bewusst zurückgestellt |
| Ereignisebene (USGS Erdbeben, GDACS Katastrophen, NASA FIRMS Brände) | Lohnt sich erst zusammen mit weiteren Modulen |
| Schiffe (AIS) | Keine kostenlose Quelle, die aus dem Browser funktioniert |
| Trending, meistverfolgt | Keine öffentliche Quelle. Flightradar24 und ADS-B Exchange bieten keine API dafür, Scraping ist nicht erlaubt |
