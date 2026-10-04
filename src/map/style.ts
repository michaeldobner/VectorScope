import type { StyleSpecification } from 'maplibre-gl';
import { C } from '../ui/tokens';

// "Air Navigation Display" basemap on OpenFreeMap vector tiles (OpenMapTiles schema).
// Land and water only, hairline borders, airports emphasised, everything else muted or off.

export const FONT = ['Noto Sans Regular'];
export const FONT_BOLD = ['Noto Sans Bold'];

export function baseStyle(): StyleSpecification {
  return {
    version: 8,
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: {
      omt: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' },
    },
    layers: [
      { id: 'land', type: 'background', paint: { 'background-color': C.mapLand } },
      {
        id: 'water',
        type: 'fill',
        source: 'omt',
        'source-layer': 'water',
        paint: { 'fill-color': C.mapWater, 'fill-antialias': true },
      },
      {
        id: 'waterway',
        type: 'line',
        source: 'omt',
        'source-layer': 'waterway',
        minzoom: 8,
        paint: { 'line-color': C.mapWater, 'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.4, 13, 1.6] },
      },
      {
        id: 'urban',
        type: 'fill',
        source: 'omt',
        'source-layer': 'landuse',
        minzoom: 8,
        filter: ['in', ['get', 'class'], ['literal', ['residential', 'commercial', 'industrial']]],
        paint: { 'fill-color': C.mapUrban, 'fill-opacity': ['interpolate', ['linear'], ['zoom'], 8, 0, 10, 0.6] },
      },
      {
        id: 'boundary-state',
        type: 'line',
        source: 'omt',
        'source-layer': 'boundary',
        minzoom: 5,
        filter: ['all', ['==', ['get', 'admin_level'], 4], ['!=', ['get', 'maritime'], 1]],
        paint: { 'line-color': C.mapBorderFaint, 'line-width': 0.6, 'line-dasharray': [3, 2] },
      },
      {
        id: 'boundary-country',
        type: 'line',
        source: 'omt',
        'source-layer': 'boundary',
        filter: ['all', ['==', ['get', 'admin_level'], 2], ['!=', ['get', 'maritime'], 1]],
        paint: { 'line-color': C.mapBorder, 'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.5, 10, 1.2] },
      },
      {
        id: 'motorway',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        minzoom: 9,
        filter: ['==', ['get', 'class'], 'motorway'],
        paint: {
          'line-color': C.mapRoad,
          'line-width': ['interpolate', ['linear'], ['zoom'], 9, 0.6, 14, 2.5],
        },
      },
      {
        id: 'aerodrome-area',
        type: 'fill',
        source: 'omt',
        'source-layer': 'aeroway',
        minzoom: 9,
        filter: ['all', ['==', ['geometry-type'], 'Polygon'], ['==', ['get', 'class'], 'aerodrome']],
        paint: { 'fill-color': C.mapAerodrome, 'fill-opacity': 0.8 },
      },
      {
        id: 'runway-area',
        type: 'fill',
        source: 'omt',
        'source-layer': 'aeroway',
        minzoom: 9,
        filter: ['all', ['==', ['geometry-type'], 'Polygon'], ['==', ['get', 'class'], 'runway']],
        paint: { 'fill-color': C.mapRunway },
      },
      {
        id: 'runway',
        type: 'line',
        source: 'omt',
        'source-layer': 'aeroway',
        minzoom: 8,
        filter: ['all', ['==', ['geometry-type'], 'LineString'], ['==', ['get', 'class'], 'runway']],
        paint: {
          'line-color': C.mapRunway,
          'line-width': ['interpolate', ['exponential', 2], ['zoom'], 8, 1, 12, 5, 15, 30],
        },
      },
      {
        id: 'country-label',
        type: 'symbol',
        source: 'omt',
        'source-layer': 'place',
        maxzoom: 6,
        filter: ['==', ['get', 'class'], 'country'],
        layout: {
          'text-field': ['upcase', ['coalesce', ['get', 'name:en'], ['get', 'name']]],
          'text-font': FONT,
          'text-size': 10,
          'text-letter-spacing': 0.3,
        },
        paint: { 'text-color': C.mapCountryLabel },
      },
      {
        id: 'city-label',
        type: 'symbol',
        source: 'omt',
        'source-layer': 'place',
        minzoom: 5,
        filter: [
          'any',
          ['==', ['get', 'class'], 'city'],
          ['all', ['==', ['get', 'class'], 'town'], ['>=', ['zoom'], 9]],
        ],
        layout: {
          'text-field': ['coalesce', ['get', 'name:de'], ['get', 'name']],
          'text-font': FONT,
          'text-size': ['interpolate', ['linear'], ['zoom'], 5, 10, 10, 12],
        },
        paint: { 'text-color': C.mapCityLabel, 'text-halo-color': C.mapLand, 'text-halo-width': 1 },
      },
      {
        id: 'aerodrome-dot',
        type: 'circle',
        source: 'omt',
        'source-layer': 'aerodrome_label',
        minzoom: 6,
        filter: ['any', ['==', ['get', 'class'], 'international'], ['>=', ['zoom'], 8.5]],
        paint: {
          'circle-radius': 3,
          'circle-color': C.bg,
          'circle-stroke-color': C.textSecondary,
          'circle-stroke-width': 1.2,
        },
      },
      {
        id: 'aerodrome-label',
        type: 'symbol',
        source: 'omt',
        'source-layer': 'aerodrome_label',
        minzoom: 6,
        filter: ['any', ['==', ['get', 'class'], 'international'], ['>=', ['zoom'], 8.5]],
        layout: {
          'text-field': ['coalesce', ['get', 'icao'], ['get', 'iata'], ''],
          'text-font': FONT_BOLD,
          'text-size': 10,
          'text-letter-spacing': 0.08,
          'text-offset': [0, 1.1],
          'text-anchor': 'top',
        },
        paint: { 'text-color': C.textSecondary, 'text-halo-color': C.mapLand, 'text-halo-width': 1 },
      },
    ],
  };
}
