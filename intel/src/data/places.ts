// Gazetteer of places that matter for military aviation and maritime news in and around Europe.
// Names in English and German. Coordinates are a representative point, radius the area it stands for.

export interface Place {
  name: string;
  lat: number;
  lon: number;
  /** Area the name stands for, in km. Used to decide whether an aircraft is "there". */
  radiusKm: number;
  /** Regular expressions on word boundaries, case insensitive. */
  aliases: string[];
}

const P = (name: string, lat: number, lon: number, radiusKm: number, ...aliases: string[]): Place => ({ name, lat, lon, radiusKm, aliases: [name, ...aliases] });

export const PLACES: Place[] = [
  // Seas and regions
  P('Baltic Sea', 57.5, 19.5, 450, 'Baltic', 'Ostsee'),
  P('Black Sea', 43.4, 34.0, 500, 'Schwarze[sn]? Meer'),
  P('North Sea', 56.0, 3.5, 450, 'Nordsee'),
  P('Mediterranean', 36.0, 18.0, 900, 'Mittelmeer'),
  P('Eastern Mediterranean', 34.0, 31.0, 400, 'östliche[sn]? Mittelmeer'),
  P('Red Sea', 20.0, 38.5, 700, 'Rote[sn]? Meer'),
  P('Persian Gulf', 26.5, 52.0, 450, 'Arabian Gulf', 'Persische[rn]? Golf'),
  P('Strait of Hormuz', 26.6, 56.3, 150, 'Hormuz', 'Straße von Hormus'),
  P('Gulf of Aden', 12.5, 47.0, 350, 'Golf von Aden'),
  P('Barents Sea', 73.0, 38.0, 600, 'Barentssee'),
  P('Norwegian Sea', 68.0, 4.0, 600, 'Europäisches Nordmeer'),
  P('Arctic', 78.0, 20.0, 1200, 'Arktis', 'High North', 'Hoher Norden'),
  P('GIUK Gap', 63.0, -15.0, 600),
  P('Adriatic', 43.0, 15.5, 350, 'Adria'),
  P('Aegean', 38.5, 25.0, 300, 'Ägäis'),
  P('South China Sea', 13.0, 114.0, 1200, 'Südchinesische[sn]? Meer'),
  P('Taiwan Strait', 24.5, 119.5, 250, 'Taiwanstraße'),
  P('Sea of Japan', 40.0, 135.0, 700, 'Japanische[sn]? Meer'),
  // Countries and territories
  P('Ukraine', 49.0, 32.0, 650),
  P('Crimea', 45.2, 34.3, 180, 'Krim'),
  P('Russia', 56.0, 38.0, 1500, 'Russland', 'Russian'),
  P('Kaliningrad', 54.7, 20.5, 120, 'Königsberg'),
  P('Belarus', 53.7, 28.0, 350, 'Belarus', 'Weißrussland'),
  P('Poland', 52.0, 19.5, 400, 'Polen', 'Polish'),
  P('Romania', 45.9, 24.9, 350, 'Rumänien', 'Romanian'),
  P('Moldova', 47.2, 28.5, 150, 'Moldau', 'Moldawien'),
  P('Lithuania', 55.3, 23.9, 180, 'Litauen'),
  P('Latvia', 56.9, 24.6, 180, 'Lettland'),
  P('Estonia', 58.7, 25.5, 180, 'Estland'),
  P('Finland', 64.0, 26.0, 450, 'Finnland', 'Finnish'),
  P('Sweden', 62.0, 15.0, 600, 'Schweden', 'Swedish'),
  P('Norway', 64.5, 12.0, 700, 'Norwegen', 'Norwegian'),
  P('Germany', 51.2, 10.4, 400, 'Deutschland', 'German'),
  P('Netherlands', 52.2, 5.5, 150, 'Niederlande', 'Dutch'),
  P('Belgium', 50.6, 4.6, 130, 'Belgien'),
  P('France', 46.6, 2.4, 500, 'Frankreich', 'French'),
  P('United Kingdom', 54.0, -2.5, 450, 'UK', 'Britain', 'British', 'Großbritannien'),
  P('Italy', 42.5, 12.5, 500, 'Italien', 'Italian'),
  P('Spain', 40.2, -3.7, 500, 'Spanien', 'Spanish'),
  P('Greece', 39.0, 22.5, 300, 'Griechenland', 'Greek'),
  P('Turkey', 39.0, 35.0, 700, 'Türkiye', 'Türkei', 'Turkish'),
  P('Cyprus', 35.0, 33.2, 120, 'Zypern'),
  P('Austria', 47.6, 14.1, 250, 'Österreich', 'Austrian'),
  P('Switzerland', 46.8, 8.2, 180, 'Schweiz', 'Swiss'),
  P('Czech Republic', 49.8, 15.5, 220, 'Czechia', 'Tschechien', 'Czech'),
  P('Slovakia', 48.7, 19.7, 180, 'Slowakei'),
  P('Hungary', 47.2, 19.4, 200, 'Ungarn', 'Hungarian'),
  P('Serbia', 44.0, 20.9, 200, 'Serbien'),
  P('Bulgaria', 42.7, 25.3, 220, 'Bulgarien'),
  P('Georgia', 42.3, 43.4, 220, 'Georgien'),
  P('Armenia', 40.2, 45.0, 150, 'Armenien'),
  P('Azerbaijan', 40.3, 47.7, 220, 'Aserbaidschan'),
  P('Israel', 31.4, 34.9, 150, 'Israeli'),
  P('Gaza', 31.4, 34.4, 40, 'Gaza Strip', 'Gazastreifen'),
  P('Lebanon', 33.9, 35.9, 100, 'Libanon', 'Lebanese'),
  P('Syria', 35.0, 38.5, 350, 'Syrien', 'Syrian'),
  P('Iraq', 33.0, 43.7, 450, 'Irak', 'Iraqi'),
  P('Iran', 32.5, 53.7, 900, 'Iranian'),
  P('Jordan', 31.2, 36.5, 200, 'Jordanien'),
  P('Saudi Arabia', 24.0, 45.0, 900, 'Saudi-Arabien', 'Saudi'),
  P('Yemen', 15.6, 47.6, 450, 'Jemen', 'Houthi', 'Huthi'),
  P('Qatar', 25.3, 51.2, 100, 'Katar'),
  P('Egypt', 26.8, 30.8, 600, 'Ägypten', 'Egyptian'),
  P('Libya', 27.0, 17.0, 700, 'Libyen', 'Libyan'),
  P('Taiwan', 23.7, 121.0, 220, 'Taiwanese'),
  P('China', 35.0, 104.0, 2000, 'Chinese', 'PLA'),
  P('North Korea', 40.2, 127.2, 300, 'Nordkorea', 'DPRK'),
  P('South Korea', 36.4, 127.8, 250, 'Südkorea'),
  P('Japan', 36.2, 138.3, 800, 'Japanese'),
  P('Greenland', 72.0, -40.0, 1200, 'Grönland'),
  P('Iceland', 64.9, -18.6, 300),
  // Cities and air bases
  P('Kyiv', 50.45, 30.52, 60, 'Kiev', 'Kiew'),
  P('Kharkiv', 49.99, 36.23, 60, 'Charkiw'),
  P('Odesa', 46.48, 30.72, 60, 'Odessa'),
  P('Sevastopol', 44.6, 33.52, 40, 'Sewastopol'),
  P('Moscow', 55.75, 37.62, 80, 'Moskau'),
  P('St Petersburg', 59.94, 30.31, 70, 'Saint Petersburg', 'St. Petersburg', 'Sankt Petersburg'),
  P('Murmansk', 68.97, 33.08, 80, 'Kola', 'Severomorsk'),
  P('Rzeszów', 50.11, 22.02, 50, 'Rzeszow', 'Jasionka'),
  P('Ramstein', 49.44, 7.6, 30, 'Ramstein Air Base'),
  P('Spangdahlem', 49.97, 6.69, 25),
  P('Geilenkirchen', 50.96, 6.04, 25),
  P('Büchel', 50.17, 7.06, 20, 'Buechel'),
  P('Nörvenich', 50.83, 6.66, 20, 'Noervenich'),
  P('Wunstorf', 52.46, 9.43, 20),
  P('Mildenhall', 52.36, 0.49, 25, 'RAF Mildenhall'),
  P('Lakenheath', 52.41, 0.56, 25, 'RAF Lakenheath'),
  P('Fairford', 51.68, -1.79, 25, 'RAF Fairford'),
  P('Akrotiri', 34.59, 32.99, 25, 'RAF Akrotiri'),
  P('Sigonella', 37.4, 14.92, 25, 'NAS Sigonella'),
  P('Aviano', 46.03, 12.6, 25),
  P('Souda Bay', 35.53, 24.15, 25, 'Souda'),
  P('Incirlik', 37.0, 35.43, 25),
  P('Rota', 36.64, -6.35, 25, 'Naval Station Rota'),
  P('Al Udeid', 25.12, 51.32, 25),
  P('Diego Garcia', -7.31, 72.41, 50),
  P('Guam', 13.44, 144.79, 60, 'Andersen Air Force Base'),
  P('Ämari', 59.26, 24.21, 20, 'Amari'),
  P('Šiauliai', 55.89, 23.4, 20, 'Siauliai'),
  P('Constanța', 44.17, 28.64, 40, 'Constanta', 'Mihail Kogălniceanu', 'Kogalniceanu'),
  P('Bornholm', 55.13, 14.92, 40),
  P('Gotland', 57.47, 18.49, 80),
  P('Suwałki Gap', 54.1, 23.0, 60, 'Suwalki Gap', 'Suwalki-Lücke'),
];

export interface PlaceHit {
  place: Place;
  /** The matched text. */
  text: string;
}

const COMPILED = PLACES.map((p) => ({
  place: p,
  // Unicode aware word boundaries, so "Iran" does not match "Iranian" twice and "Ostsee" stays whole.
  re: new RegExp(`(?<![\\p{L}\\p{N}])(${p.aliases.join('|')})(?![\\p{L}\\p{N}])`, 'iu'),
}));

/** Places named in a text, most specific first (smallest area). */
export function findPlaces(text: string): PlaceHit[] {
  const hits: PlaceHit[] = [];
  for (const { place, re } of COMPILED) {
    const m = text.match(re);
    if (m) hits.push({ place, text: m[1] });
  }
  return hits.sort((a, b) => a.place.radiusKm - b.place.radiusKm);
}
