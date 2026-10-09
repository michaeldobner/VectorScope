# VectorScope · Dokumentation

[English version](../en/README.md) · [Zurück zum Projekt](../../README.de.md)

Diese Dokumentation beschreibt VectorScope vollständig: die Bedienung, die Berechnung von „über mir“, die Herkunft der Daten, das Design, den Aufbau sowie Entwicklung und Veröffentlichung.

| Dokument | Inhalt | Zielgruppe |
|---|---|---|
| [Bedienung](bedienung.md) | Ansichten, Steuerung, Radius, Overhead, Inspector, Watchlist, Suche, Einstellungen, Hinweise | Alle |
| [Berechnungen](berechnungen.md) | Distanz, Peilung, Elevationswinkel, Overhead-Klassen, Closest Point of Approach, Interest Score | Alle, Entwicklung |
| [Datenquellen](datenquellen.md) | Endpunkte und Felder von adsb.lol, Routenabfrage, Fotos, Grundkarte, was ADS-B liefert und was nicht | Entwicklung, Betrieb |
| [Design](design.md) | Design-Briefing, Farb-Tokens, Flugzeugfarben, Typografie, Kartenstil, Layouts, Bewegung | Design, Entwicklung |
| [Architektur](architektur.md) | Module, Datenfluss von der Anfrage bis zur Karte, Zustandsspeicher, Darstellung, Service Worker | Entwicklung |
| [Entwicklung](entwicklung.md) | Lokale Umgebung, Tests, Demo-Modus, Screenshots, Konventionen, Katalog erweitern | Entwicklung |
| [Deployment](../../../docs/de/deployment.md) | GitHub Pages, CORS-Proxy auf Vercel, Updates auf den Geräten, Fehlerbehebung | Betrieb |
| [Datenschutz und Recht](datenschutz-und-recht.md) | Umgang mit dem Standort, Speicherung, Lizenzen, Quellenangaben, rechtliche Hinweise | Alle |

## VectorScope auf einen Blick

| | |
|---|---|
| Zweck | Persönliches Live-Luftlagebild: was über dir fliegt, was als nächstes über dich hinwegzieht, was einen Blick wert ist |
| Ansichten | Radar, Overhead, Nearby, Notable now, Watchlist, Aircraft Inspector, Einstellungen |
| Plattform | Progressive Web App für iPhone und iPad, läuft in jedem modernen Browser |
| Layouts | iPhone hoch und quer, iPad hoch und quer, Split View |
| Sprache | Englische Oberfläche, deutsches Zahlenformat, metrische Einheiten (Fuß und Knoten optional) |
| Daten | adsb.lol (ODbL), OpenFreeMap, planespotters.net |
| Technik | React 18, TypeScript, Vite, MapLibre GL, Vitest |
| Hosting | GitHub Pages, optionaler Proxy auf Vercel |
| Datenschutz | Kein Konto, keine Speicherung auf Servern, Standort nur auf dem Gerät |
| Adresse | https://michaeldobner.github.io/VectorScope/air/ |
| Version | 0.4.0 |

<p>
<img src="../images/iphone-radar.jpg" width="200" alt="Radar auf dem iPhone">&nbsp;
<img src="../images/iphone-overhead.jpg" width="200" alt="Overhead-Liste">&nbsp;
<img src="../images/iphone-inspector.jpg" width="200" alt="Aircraft Inspector">
</p>
<img src="../images/ipad-landscape-inspector.jpg" width="720" alt="iPad quer mit Inspector und dreiteiliger Leiste">
