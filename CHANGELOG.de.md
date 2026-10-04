# Changelog

Alle wesentlichen Änderungen an VectorScope. [English](CHANGELOG.md)

Das Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), die Versionen folgen [Semantic Versioning](https://semver.org/lang/de/).

## 0.1.5 (2026-10-04)

### Behoben
* **Zuverlässige Veröffentlichung:** Der Pages-Deploy wartet jetzt auf GitHubs eigenen Branch-Build und veröffentlicht immer zuletzt. Der ungebaute Quellcode kann die App nicht mehr ersetzen.

### Verbessert
* Versionsnummer im Fehlerbanner und in den Einstellungen, dazu der aktive Datenweg und die Fehlerart.

## 0.1.4 (2026-10-04)

### Verbessert
* **Eigener Proxy fest eingebaut:** `https://vectorscope-proxy.vercel.app` ist der Standard-Datenweg. In den Einstellungen muss nichts eingetragen werden.
* Der Proxy beantwortet seine Startadresse mit einer kurzen Statusmeldung und lässt sich so im Browser prüfen.

## 0.1.3 (2026-10-04)

### Verbessert
* **Live-Daten ohne Einrichtung:** Blockiert adsb.lol den Browser und ist kein eigener Proxy eingetragen, versucht VectorScope automatisch kostenlose öffentliche Vermittler (allorigins, codetabs). Kein Konto nötig. Ohne Garantie: Sind sie langsam oder nicht erreichbar, bleibt der eigene Proxy die zuverlässige Lösung.
* `BUILTIN_PROXY` in `src/data/feed.ts`: Eine eigene Proxy-Adresse kann fest in die App eingebaut werden, dann muss in den Einstellungen nichts eingetragen werden.
* Die Einstellungen zeigen den aktiven Datenweg.

## 0.1.2 (2026-10-04)

### Verbessert
* **Proxy mit einem Tipp einrichten:** Wird VectorScope mit `?proxy=https://…` (optional `&token=…`) geöffnet, speichert die App den Proxy dauerhaft und bereinigt die Adresse.
* Das CORS-Banner erklärt die Ursache in klaren Worten und verlinkt die Anleitung.
* Deploy-Button für den Vercel-Proxy in der Dokumentation.

## 0.1.1 (2026-10-04)

### Verbessert
* **Startdiagnose:** Ist VectorScope nach sechs Sekunden nicht gestartet, erscheinen der Grund und die ersten Fehlermeldungen statt eines schwarzen Bildschirms. Liefert GitHub Pages den ungebauten Quellcode aus, steht dort, wie die Pages-Einstellung zu korrigieren ist.
* Der Hintergrund ist vom ersten Moment an Graphit, noch bevor Skripte geladen sind.

## 0.1.0 (2026-10-04)

Erste öffentliche Version.

### Neu
* **Live-Radar** rund um deinen Standort mit Distanzringen, flüssiger Bewegung zwischen den Aktualisierungen und einer Grundkarte im Stil eines Air Navigation Display.
* Ansicht **Overhead**: Flugzeuge über dir und Flugzeuge, die in den nächsten zehn Minuten über dich hinwegfliegen, mit Countdown, Vorbeiflug-Abstand, Himmelsrichtung und Elevationswinkel.
* **Aircraft Inspector** mit Telemetrie, Routenabfrage, Position relativ zu dir, Interest Score mit Begründungen, Foto und Links zu ADS-B Exchange, adsb.lol und Flightradar24.
* **Interest Score** von 0 bis 100 mit einem kuratierten Katalog militärischer Rollen, seltener Typen, historischer Flugzeuge und militärischer Callsign-Gruppen.
* **Notable now**: Militär- und Notfallverkehr in ganz Europa, nach Interest Score gerankt.
* **Interesting nearby**: gerankte Liste innerhalb deines Radius.
* **Watchlist** für Callsign-Präfixe, Typcodes, Kennzeichen und ICAO-Adressen, mit Hinweis in der App, sobald ein Treffer in deinen Radius kommt.
* **Suche** nach Callsign, Kennzeichen oder ICAO-Adresse.
* **Vier Layouts**: iPhone hochkant mit Bottom Sheet, iPhone quer mit Seitenleiste, iPad hochkant mit geteilten Panels, iPad quer mit Inspector und dreiteiliger Leiste.
* **Installierbare Web-App** mit Vollbildstart, App-Icon, Unterstützung der Safe Areas und offline verfügbarer App-Hülle.
* **Metrische Einheiten mit deutschem Zahlenformat**, Fuß und Knoten als Option.
* **Demo-Modus** mit simuliertem Verkehr.

### Technisch
* React, TypeScript, Vite, MapLibre GL, Vektorkacheln von OpenFreeMap, selbst gehostete Schriften Inter und IBM Plex Mono.
* Daten von adsb.lol über drei Wege: direkt, Proxy und Demo. Koordinaten werden vor jeder Anfrage auf etwa 1 km gerundet.
* Optionaler CORS-Proxy für Vercel mit Pfad-Whitelist und optionalem Token.
* Elf Unit-Tests für Distanz, Peilung, Elevation, Closest Point of Approach und Overhead-Einstufung.
* GitHub Actions für Tests und Veröffentlichung auf GitHub Pages.

### Bekannte Einschränkungen
* adsb.lol sendet bei den Live-Endpunkten keine CORS-Header. Browser benötigen daher eventuell den Proxy.
* Auf dem iPhone kann das ausgewählte Flugzeug hinter dem Inspector verschwinden. Geplant für 0.2.0.
* Hinweise funktionieren nur bei geöffneter App.
