# Changelog · VectorScope Air

Alle wesentlichen Änderungen am Modul AIR. [English](CHANGELOG.md) · [Changelog der Sammlung](../CHANGELOG.de.md)

Das Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), die Versionen folgen [Semantic Versioning](https://semver.org/lang/de/).

## 0.3.0 (2026-10-05)

### Geändert
* **Neue Adresse:** Das Modul liegt jetzt unter `https://michaeldobner.github.io/VectorScope/air/`. Die bisherige Adresse öffnet die VectorScope-Startseite, die zu AIR verlinkt. Einstellungen, Watchlist und Proxy bleiben erhalten.
* Das Logo in der Kopfleiste führt zurück zur Startseite.
* Die Farb-Tokens kommen jetzt aus `shared/tokens.css`, gemeinsam mit der Startseite. Schon das erste Bild zeigt die Graphite-Farben.
* Der Speicher des Service Workers heißt jetzt `vectorscope-air-v1` und ist auf den Modulordner begrenzt.
* Einzeln installiert heißt das Modul „VS Air“.

## 0.2.3 (2026-10-04)

### Design
* **Neues Standard-Farbschema Graphite:** neutrales Dunkelgrau wie Apple Maps, weiße Schrift und weiße Flugzeuge, Ice Blue `#55BDEB` als einziger Akzent, Kobalt für die Watchlist. Gewählt nach dem Vergleich dreier Farbschemata auf der Live-Karte. `?theme=ice` und `?theme=night` bleiben verfügbar.

## 0.2.2 (2026-10-04)

### Behoben
* **Routen für deutlich mehr Flüge:** Routendatenbanken veralten unterschiedlich, deshalb werden adsbdb und hexdb gefragt, und der Abschnitt, der am Flugzeug vorbeiführt, gewinnt. Beispiel: EXS95LV über Nürnberg zeigte keine Route, weil adsbdb noch Madeira nach Bristol aus der Vorsaison hatte. Jetzt erscheint Mytilene nach Birmingham von hexdb.

### Verbessert
* Airline aus dem Callsign (EXS ergibt Jet2.com), Halter und Typ aus der Flugzeugdatenbank, wenn die Live-Daten nichts liefern.
* Lesbare Typnamen für rund 120 gängige Flugzeuge, zum Beispiel Boeing 737-800 statt B738.
* Drei Farbschemata zum Vergleich: `?theme=ice` (bisher), `?theme=graphite` (neutral wie Apple Maps), `?theme=night` (warme Flugzeuge auf tiefer Nachtkarte). Die Wahl wird pro Gerät gespeichert.

## 0.2.1 (2026-10-04)

### Behoben
* **Panel blieb auf dem iPhone auf halber Höhe hängen:** Änderte sich der Inhalt unter dem Finger während des Wischens, meldete iOS das Ende der Geste nie. Das Panel hört jetzt direkt am berührten Element mit.

## 0.2.0 (2026-10-04)

Erstmals mit echten Live-Daten, der echten Karte und echten Touch-Gesten getestet, in einem Testlabor auf GitHub Actions.

### Neu
* **Routen von adsbdb:** Airline, Start und Ziel mit Flughafencode, Stadt und Land als Routenkarte. Nur wenn das Flugzeug plausibel zwischen beiden Flughäfen unterwegs ist.
* **Fotos der Flugzeuge** über den eigenen Proxy (planespotters verlangt eine Kontaktadresse, die Browser nicht senden können).
* **Flugzeug antippen, die Karte folgt:** aus der Karte, den Listen, Notable now oder der Suche. Flugzeuge außerhalb deines Gebiets werden auf der Karte gezeichnet und live verfolgt.
* **Standort-Taste** und Filter-Taste oben rechts wie in Apple Maps.

### Verbessert
* **Lesbare Karte:** Städte, Orte und Dörfer je nach Zoomstufe, Autobahnen ab Zoomstufe 6, Flughafennamen ab Zoomstufe 9.
* **Panel unten wie in Apple Maps:** überall greifen, wischen, es rastet ein. Vom oberen Rand des Inhalts nach unten ziehen verkleinert es.
* **Inspector:** feststehender Kopf, zuerst das Foto, dann Route, Telemetrie und Position relativ zu dir.
* Notable now lädt nacheinander alle zwei Minuten, um unter dem Limit von adsb.lol zu bleiben.

### Behoben
* Routen erschienen nie: Der Routendienst von adsb.lol antwortet leer und blockiert Browser.
* Fotos erschienen nie: planespotters blockiert Anfragen aus dem Browser.

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
