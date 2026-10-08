// Situation map. Security lens: stories as circles at their places, military aircraft as dots, emergencies in red,
// and a line from every aircraft that a story names to the place of that story.
// Politics lens: capitals as circles for the stories that name their actors, and lines between two capitals
// whose actors one story names (a call between Washington and Moscow, sanctions of Brussels against Moscow).
import { useEffect, useRef } from 'react';
import maplibregl, { type GeoJSONSource, type Map as MLMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { FONT, FONT_BOLD, baseStyle } from '../../../air/src/map/style';
import { isStrong } from '../data/match';
import { independentCount, type Status, type Story } from '../data/stories';
import type { Aircraft } from '../../../air/src/data/types';
import { setPrefs } from '../state/store';
import { CAPITALS, capitalsOf, type CapitalId } from '../data/actors';
import type { Lens } from '../data/types';

const STATUS_RANK: Record<Status, number> = { observed: 0, signal: 1, emerging: 2, reported: 3, confirmed: 4 };
const STATUS_COLOR: Record<Status, string> = {
  observed: '#7DD3FC',
  signal: '#A1A1A6',
  emerging: '#55BDEB',
  reported: '#55BDEB',
  confirmed: '#F5F5F7',
};

type FC = GeoJSON.FeatureCollection;

/**
 * Where a story happens: the place most of its reports name, on a tie the more specific one.
 * A home base mentioned once (Geilenkirchen) does not pull an AWACS story away from the Baltic Sea.
 */
export function storyPlace(s: Story) {
  const count = new Map<string, { n: number; place: Story['items'][number]['entities']['places'][number] }>();
  for (const i of s.items) for (const p of i.entities.places) count.set(p.name, { n: (count.get(p.name)?.n ?? 0) + 1, place: p });
  return [...count.values()].sort((a, b) => b.n - a.n || a.place.radiusKm - b.place.radiusKm)[0]?.place ?? null;
}

/** One circle per place, for the stories that happen there. */
function placesData(stories: Story[]): FC {
  const byPlace = new Map<string, { lat: number; lon: number; stories: Story[] }>();
  for (const s of stories) {
    const p = storyPlace(s);
    if (!p) continue;
    const e = byPlace.get(p.name) ?? { lat: p.lat, lon: p.lon, stories: [] };
    e.stories.push(s);
    byPlace.set(p.name, e);
  }
  return {
    type: 'FeatureCollection',
    features: [...byPlace.entries()].map(([name, e]) => {
      const top = [...e.stories].sort((a, b) => STATUS_RANK[b.status] - STATUS_RANK[a.status])[0];
      const weight = e.stories.reduce((n, s) => n + independentCount(s), 0);
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [e.lon, e.lat] },
        properties: { name, label: `${name} ${e.stories.length}`, weight, color: STATUS_COLOR[top.status], status: top.status },
      };
    }),
  };
}

const actorsOfStory = (s: Story) => [...new Set(s.items.flatMap((i) => i.entities.actors ?? []))];

/** Politics lens: one circle per capital, for the stories that name actors of it. */
function capitalsData(stories: Story[]): FC {
  const byCap = new Map<CapitalId, Story[]>();
  for (const s of stories) for (const c of capitalsOf(actorsOfStory(s))) byCap.set(c, [...(byCap.get(c) ?? []), s]);
  return {
    type: 'FeatureCollection',
    features: [...byCap.entries()].map(([id, list]) => {
      const top = [...list].sort((a, b) => STATUS_RANK[b.status] - STATUS_RANK[a.status])[0];
      const cap = CAPITALS[id];
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [cap.lon, cap.lat] },
        properties: { name: cap.name, cap: id, label: `${cap.name} ${list.length}`, weight: list.length, color: STATUS_COLOR[top.status], status: top.status },
      };
    }),
  };
}

/** Politics lens: a line between two capitals for the stories that name actors of both, weight by their number. */
function capitalLinksData(stories: Story[]): FC {
  const pairs = new Map<string, number>();
  for (const s of stories) {
    const caps = capitalsOf(actorsOfStory(s)).sort();
    for (let i = 0; i < caps.length; i++) for (let j = i + 1; j < caps.length; j++) pairs.set(`${caps[i]}|${caps[j]}`, (pairs.get(`${caps[i]}|${caps[j]}`) ?? 0) + 1);
  }
  return {
    type: 'FeatureCollection',
    features: [...pairs.entries()].map(([key, n]) => {
      const [a, b] = key.split('|').map((id) => CAPITALS[id as CapitalId]);
      return { type: 'Feature', geometry: { type: 'LineString', coordinates: [[a.lon, a.lat], [b.lon, b.lat]] }, properties: { weight: n } };
    }),
  };
}

function aircraftData(live: Aircraft[], named: Set<string>): FC {
  return {
    type: 'FeatureCollection',
    features: live.map((ac) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [ac.lon, ac.lat] },
      properties: {
        hex: ac.hex,
        label: ac.callsign?.trim() ?? ac.hex.toUpperCase(),
        kind: ac.squawk === '7700' ? 'emergency' : named.has(ac.hex) ? 'named' : 'mil',
      },
    })),
  };
}

function linksData(stories: Story[]): FC {
  const features: GeoJSON.Feature[] = [];
  for (const s of stories) {
    const p = storyPlace(s);
    if (!p) continue;
    const seen = new Set<string>();
    for (const m of s.items.flatMap((i) => i.matches.filter(isStrong))) {
      if (seen.has(m.ac.hex)) continue;
      seen.add(m.ac.hex);
      features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[m.ac.lon, m.ac.lat], [p.lon, p.lat]] }, properties: {} });
    }
  }
  return { type: 'FeatureCollection', features };
}

export default function IntelMap({ stories, live, lens = 'security' }: { stories: Story[]; live: Aircraft[]; lens?: Lens }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<MLMap | null>(null);
  const ready = useRef(false);
  const latest = useRef({ stories, live, lens });
  latest.current = { stories, live, lens };

  const update = () => {
    const m = map.current;
    if (!m || !ready.current) return;
    const { stories: st, live: lv, lens: ln } = latest.current;
    const empty: FC = { type: 'FeatureCollection', features: [] };
    const politics = ln === 'politics';
    const named = new Set(st.flatMap((s) => s.items.flatMap((i) => i.matches.filter(isStrong).map((x) => x.ac.hex))));
    (m.getSource('places') as GeoJSONSource | undefined)?.setData(politics ? capitalsData(st) : placesData(st));
    (m.getSource('aircraft') as GeoJSONSource | undefined)?.setData(politics ? empty : aircraftData(lv, named));
    (m.getSource('links') as GeoJSONSource | undefined)?.setData(politics ? empty : linksData(st));
    (m.getSource('caplinks') as GeoJSONSource | undefined)?.setData(politics ? capitalLinksData(st) : empty);
  };

  useEffect(() => {
    if (!el.current) return;
    const m = new maplibregl.Map({
      container: el.current,
      style: baseStyle(),
      center: [24, 47],
      zoom: el.current.clientWidth < 600 ? 2.4 : 3.2,
      attributionControl: { compact: true },
      dragRotate: false,
      pitchWithRotate: false,
      canvasContextAttributes: { preserveDrawingBuffer: new URLSearchParams(location.search).has('shot') },
    });
    map.current = m;
    const setup = () => {
      if (ready.current) return;
      try {
        const empty: FC = { type: 'FeatureCollection', features: [] };
        m.addSource('places', { type: 'geojson', data: empty });
        m.addSource('aircraft', { type: 'geojson', data: empty });
        m.addSource('links', { type: 'geojson', data: empty });
        m.addSource('caplinks', { type: 'geojson', data: empty });
        m.addLayer({
          id: 'caplinks',
          type: 'line',
          source: 'caplinks',
          layout: { 'line-cap': 'round' },
          paint: { 'line-color': '#55BDEB', 'line-opacity': 0.55, 'line-width': ['interpolate', ['linear'], ['get', 'weight'], 1, 1, 10, 5] },
        });
        m.addLayer({ id: 'links', type: 'line', source: 'links', paint: { 'line-color': '#55BDEB', 'line-width': 1, 'line-opacity': 0.7, 'line-dasharray': [2, 2] } });
        m.addLayer({
          id: 'aircraft',
          type: 'circle',
          source: 'aircraft',
          paint: {
            'circle-radius': ['match', ['get', 'kind'], 'mil', 2.2, 4],
            'circle-color': ['match', ['get', 'kind'], 'emergency', '#FF453A', 'named', '#55BDEB', '#8E8E93'],
            'circle-opacity': ['match', ['get', 'kind'], 'mil', 0.65, 1],
          },
        });
        m.addLayer({
          id: 'aircraft-label',
          type: 'symbol',
          source: 'aircraft',
          filter: ['!=', ['get', 'kind'], 'mil'],
          layout: { 'text-field': ['get', 'label'], 'text-font': FONT, 'text-size': 10.5, 'text-offset': [0, 1.1], 'text-anchor': 'top' },
          paint: { 'text-color': ['match', ['get', 'kind'], 'emergency', '#FF453A', '#7DD3FC'], 'text-halo-color': '#0E0E10', 'text-halo-width': 1.2 },
        });
        m.addLayer({
          id: 'places',
          type: 'circle',
          source: 'places',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['sqrt', ['get', 'weight']], 1, 7, 6, 22],
            'circle-color': ['get', 'color'],
            'circle-opacity': 0.18,
            'circle-stroke-color': ['get', 'color'],
            'circle-stroke-width': 1.4,
          },
        });
        m.addLayer({
          id: 'places-label',
          type: 'symbol',
          source: 'places',
          layout: { 'text-field': ['get', 'label'], 'text-font': FONT_BOLD, 'text-size': 11.5, 'text-offset': [0, 1.6], 'text-anchor': 'top', 'text-allow-overlap': false },
          paint: { 'text-color': '#F5F5F7', 'text-halo-color': '#0E0E10', 'text-halo-width': 1.4 },
        });
        m.on('click', 'places', (e) => {
          const props = e.features?.[0]?.properties;
          // A capital filters by its actors, a place by its name.
          if (props?.cap) setPrefs({ actor: `cap:${props.cap}`, place: null, view: 'stories', filter: 'all', pulse: null });
          else if (props?.name) setPrefs({ place: props.name, actor: null, view: 'stories', filter: 'all', pulse: null });
        });
        m.on('click', 'aircraft', (e) => {
          const hex = e.features?.[0]?.properties?.hex;
          if (hex) location.href = `../air/?hex=${hex}`;
        });
        for (const layer of ['places', 'aircraft']) {
          m.on('mouseenter', layer, () => (m.getCanvas().style.cursor = 'pointer'));
          m.on('mouseleave', layer, () => (m.getCanvas().style.cursor = ''));
        }
        ready.current = true;
        update();
      } catch {
        // Style not ready yet, the next event tries again.
      }
    };
    m.on('load', setup);
    m.on('styledata', setup);
    m.on('error', setup);
    return () => {
      ready.current = false;
      m.remove();
      map.current = null;
    };
  }, []);

  useEffect(update, [stories, live, lens]);

  return <div ref={el} className="intel-map" />;
}
