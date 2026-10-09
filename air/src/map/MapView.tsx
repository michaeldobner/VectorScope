import maplibregl, { type GeoJSONSource, type Map as MLMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef } from 'react';
import { circleRing, destination, distanceM, project } from '../geo/geo';
import { altitudeShort, KT_TO_MPS } from '../lib/format';
import { useSettings, getSettings } from '../state/settings';
import { displayPosition, getTraffic, select, selectedTracked, setView, useTraffic, type Tracked } from '../state/traffic';
import { C, TONE_COLOR } from '../ui/tokens';
import { heliImage, planeImage } from './icons';
import { FONT, FONT_BOLD, baseStyle } from './style';

type FC = GeoJSON.FeatureCollection;
const empty = (): FC => ({ type: 'FeatureCollection', features: [] });

interface Props {
  padding: { top: number; right: number; bottom: number; left: number };
  pickMode: boolean;
  onPick: (lat: number, lon: number) => void;
  recenterSignal: number;
}

const SHOT_MODE = new URLSearchParams(location.search).has('shot');

const TONE_RANK = { standard: 0, interesting: 1, watch: 2, event: 3, emergency: 4 } as const;

export function MapView({ padding, pickMode, onPick, recenterSignal }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const ready = useRef(false);
  const pickRef = useRef({ pickMode, onPick });
  pickRef.current = { pickMode, onPick };
  const paddingRef = useRef(padding);
  paddingRef.current = padding;

  const traffic = useTraffic();
  const settings = useSettings();

  // Create map once.
  useEffect(() => {
    const s = getSettings();
    const start = getTraffic().observer ?? s.location ?? { lat: 50.11, lon: 8.68 };
    const map = new maplibregl.Map({
      container: el.current!,
      style: baseStyle(),
      center: [start.lon, start.lat],
      zoom: 8,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      maxPitch: 0,
      fadeDuration: 0,
      // Only for automated screenshots (?shot): keep the WebGL buffer readable.
      canvasContextAttributes: { preserveDrawingBuffer: SHOT_MODE },
    });
    map.touchZoomRotate.disableRotation();
    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution: 'Traffic <a href="https://adsb.lol" target="_blank">adsb.lol</a> (ODbL)',
      }),
      'bottom-left',
    );
    mapRef.current = map;

    // Set up overlays as soon as the style JSON is parsed, without waiting for basemap tiles,
    // so aircraft still render when the tile server is slow or unreachable.
    const setup = () => {
      if (ready.current) return;
      try {
        map.addImage('plane', planeImage(), { sdf: true, pixelRatio: 2 });
      map.addImage('heli', heliImage(), { sdf: true, pixelRatio: 2 });
      for (const id of ['rings', 'ring-labels', 'trails', 'sel-trail', 'sel-trail-old', 'projection', 'aircraft', 'observer'])
        map.addSource(id, { type: 'geojson', data: empty() });

      map.addLayer({
        id: 'rings',
        type: 'line',
        source: 'rings',
        paint: { 'line-color': C.accent, 'line-opacity': ['get', 'o'], 'line-width': 1, 'line-dasharray': [1, 0] },
      });
      map.addLayer({
        id: 'ring-labels',
        type: 'symbol',
        source: 'ring-labels',
        layout: { 'text-field': ['get', 'label'], 'text-font': FONT, 'text-size': 10, 'text-letter-spacing': 0.12, 'text-offset': [0, -0.8] },
        paint: { 'text-color': C.accent, 'text-opacity': 0.7, 'text-halo-color': C.mapLand, 'text-halo-width': 1.5 },
      });
      map.addLayer({
        id: 'trails',
        type: 'line',
        source: 'trails',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': ['get', 'color'], 'line-opacity': 0.28, 'line-width': 1.2 },
      });
      map.addLayer({
        id: 'sel-trail-old',
        type: 'line',
        source: 'sel-trail-old',
        layout: { 'line-cap': 'round' },
        paint: { 'line-color': C.active, 'line-opacity': 0.55, 'line-width': 1.6, 'line-dasharray': [0.1, 2.2] },
      });
      map.addLayer({
        id: 'sel-trail',
        type: 'line',
        source: 'sel-trail',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': C.active, 'line-opacity': 0.75, 'line-width': 1.6 },
      });
      map.addLayer({
        id: 'projection',
        type: 'line',
        source: 'projection',
        paint: { 'line-color': C.active, 'line-opacity': 0.5, 'line-width': 1.2, 'line-dasharray': [3, 3] },
      });
      map.addLayer({
        id: 'ac-watch-ring',
        type: 'circle',
        source: 'aircraft',
        filter: ['==', ['get', 'watch'], true],
        paint: { 'circle-radius': 13, 'circle-color': 'transparent', 'circle-stroke-color': C.acWatch, 'circle-stroke-width': 1.2 },
      });
      map.addLayer({
        id: 'ac-selected',
        type: 'circle',
        source: 'aircraft',
        filter: ['==', ['get', 'sel'], true],
        paint: { 'circle-radius': 17, 'circle-color': C.active, 'circle-opacity': 0.08, 'circle-stroke-color': C.active, 'circle-stroke-width': 1.4 },
      });
      map.addLayer({
        id: 'ac-icon',
        type: 'symbol',
        source: 'aircraft',
        layout: {
          'icon-image': ['case', ['get', 'heli'], 'heli', 'plane'],
          'icon-size': ['get', 'size'],
          'icon-rotate': ['get', 'rot'],
          'icon-rotation-alignment': 'map',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          'symbol-sort-key': ['get', 'rank'],
        },
        paint: { 'icon-color': ['get', 'color'] },
      });
      map.addLayer({
        id: 'ac-label-std',
        type: 'symbol',
        source: 'aircraft',
        minzoom: 9.5,
        filter: ['all', ['==', ['get', 'tone'], 'standard'], ['!=', ['get', 'sel'], true]],
        layout: {
          'text-field': ['get', 'label'],
          'text-font': FONT,
          'text-size': 10,
          'text-anchor': 'left',
          'text-offset': [1.3, 0],
          'text-justify': 'left',
        },
        paint: { 'text-color': C.textSecondary, 'text-halo-color': C.bg, 'text-halo-width': 1.4 },
      });
      map.addLayer({
        id: 'ac-label-hi',
        type: 'symbol',
        source: 'aircraft',
        filter: ['any', ['!=', ['get', 'tone'], 'standard'], ['==', ['get', 'sel'], true]],
        layout: {
          'text-field': ['format', ['get', 'cs'], { 'text-font': ['literal', FONT_BOLD] }, '\n', {}, ['get', 'alt'], { 'font-scale': 0.88 }],
          'text-font': FONT,
          'text-size': 11,
          'text-anchor': 'left',
          'text-offset': [1.5, 0],
          'text-justify': 'left',
          'text-allow-overlap': false,
          'symbol-sort-key': ['-', 10, ['get', 'rank']],
        },
        paint: { 'text-color': ['case', ['==', ['get', 'tone'], 'emergency'], C.critical, C.text], 'text-halo-color': C.bg, 'text-halo-width': 1.6 },
      });
      map.addLayer({
        id: 'observer-ring',
        type: 'circle',
        source: 'observer',
        paint: { 'circle-radius': 9, 'circle-color': 'transparent', 'circle-stroke-color': C.accent, 'circle-stroke-width': 1.4 },
      });
      map.addLayer({
        id: 'observer-dot',
        type: 'circle',
        source: 'observer',
        paint: { 'circle-radius': 3, 'circle-color': C.accent },
      });

      } catch {
        return; // style not parsed yet, a later event retries
      }
      ready.current = true;
      drawStatic();
      fitToRadius(false);
    };
    map.on('style.load', setup);
    map.on('load', setup);
    map.on('styledata', setup);
    map.on('error', () => {
      // A missing basemap must not take the overlays down with it.
      if (!ready.current) setTimeout(setup, 0);
    });

    // Traffic follows the map: after panning or zooming the visible area is loaded as well.
    map.on('moveend', () => {
      const c = map.getCenter();
      const ne = map.getBounds().getNorthEast();
      setView({ lat: c.lat, lon: c.lng }, distanceM({ lat: c.lat, lon: c.lng }, { lat: ne.lat, lon: ne.lng }) / 1000);
    });

    map.on('click', (e) => {
      if (pickRef.current.pickMode) {
        pickRef.current.onPick(e.lngLat.lat, e.lngLat.lng);
        return;
      }
      const p = e.point;
      const feats = map.queryRenderedFeatures(
        [
          [p.x - 16, p.y - 16],
          [p.x + 16, p.y + 16],
        ],
        { layers: ['ac-icon'] },
      );
      if (feats.length) {
        // Prefer the most important aircraft under the finger.
        feats.sort((a, b) => (b.properties.rank as number) - (a.properties.rank as number));
        select(feats[0].properties.hex as string);
      } else select(null);
    });

    // Smooth motion: redraw interpolated positions ~10x per second.
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last < 100 || !ready.current) return;
      last = t;
      drawDynamic();
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      map.remove();
      mapRef.current = null;
      ready.current = false;
    };
  }, []);

  function src(id: string) {
    return mapRef.current?.getSource(id) as GeoJSONSource | undefined;
  }

  function drawStatic() {
    const map = mapRef.current;
    const obs = getTraffic().observer;
    if (!map || !ready.current || !obs) return;
    const r = getSettings().radiusKm;
    const rings = r >= 20 ? [r / 2, r] : [r];
    src('rings')?.setData({
      type: 'FeatureCollection',
      features: rings.map((km, i) => ({
        type: 'Feature',
        properties: { o: i === rings.length - 1 ? 0.45 : 0.22 },
        geometry: { type: 'LineString', coordinates: circleRing(obs, km * 1000) },
      })),
    });
    src('ring-labels')?.setData({
      type: 'FeatureCollection',
      features: rings.map((km) => {
        const p = destination(obs, 0, km * 1000);
        return { type: 'Feature', properties: { label: `${Number.isInteger(km) ? km : km.toFixed(1)} KM` }, geometry: { type: 'Point', coordinates: [p.lon, p.lat] } };
      }),
    });
    src('observer')?.setData({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [obs.lon, obs.lat] } });
  }

  function drawDynamic() {
    const st = getTraffic();
    const now = Date.now();
    const s = getSettings();
    const feats: GeoJSON.Feature[] = [];
    const trails: GeoJSON.Feature[] = [];
    let selected: Tracked | undefined;
    const all = [...st.aircraft.values()];
    if (st.external && st.selected === st.external.ac.hex && !st.aircraft.has(st.external.ac.hex)) all.push(st.external);
    all.forEach((t) => {
      const tone = t.assessment.tone;
      if (s.onlyInteresting && tone === 'standard' && st.selected !== t.ac.hex) return;
      const pos = displayPosition(t, now);
      const sel = st.selected === t.ac.hex;
      if (sel) selected = t;
      const rank = TONE_RANK[tone] + (sel ? 10 : 0);
      feats.push({
        type: 'Feature',
        properties: {
          hex: t.ac.hex,
          tone,
          color: sel ? C.active : TONE_COLOR[tone],
          size: sel ? 0.62 : tone === 'standard' ? 0.4 : 0.54,
          rot: t.ac.track ?? 0,
          heli: t.ac.category === 'A7',
          watch: t.watch,
          sel,
          rank,
          cs: t.ac.callsign ?? t.ac.registration ?? t.ac.hex,
          alt: altitudeShort(t.ac.altFt, s.units, t.ac.onGround),
          label: t.ac.callsign ?? t.ac.registration ?? t.ac.hex,
        },
        geometry: { type: 'Point', coordinates: [pos.lon, pos.lat] },
      });
      if (!sel && tone !== 'standard' && t.history.length > 1) {
        const recent = t.history.filter((p) => now - p.t < 5 * 60_000);
        trails.push({
          type: 'Feature',
          properties: { color: TONE_COLOR[tone] },
          geometry: { type: 'LineString', coordinates: [...recent.map((p) => [p.lon, p.lat]), [pos.lon, pos.lat]] },
        });
      }
    });
    src('aircraft')?.setData({ type: 'FeatureCollection', features: feats });
    src('trails')?.setData({ type: 'FeatureCollection', features: trails });

    // Selected aircraft: solid track for the last 5 minutes, dotted before, dashed projection ahead.
    if (selected) {
      const pos = displayPosition(selected, now);
      const h = selected.history;
      const cut = now - 5 * 60_000;
      const recent = h.filter((p) => p.t >= cut);
      const old = h.filter((p) => p.t < cut);
      src('sel-trail')?.setData(line([...recent.map((p) => [p.lon, p.lat]), [pos.lon, pos.lat]]));
      src('sel-trail-old')?.setData(line([...old.map((p) => [p.lon, p.lat]), ...(recent[0] ? [[recent[0].lon, recent[0].lat]] : [[pos.lon, pos.lat]])]));
      const { ac } = selected;
      if (ac.gsKt && ac.track != null && !ac.onGround) {
        const pts: number[][] = [];
        for (let dt = 0; dt <= 180; dt += 15) {
          const p = project(pos, ac.gsKt * KT_TO_MPS, ac.track, dt, ac.trackRate ?? 0);
          pts.push([p.lon, p.lat]);
        }
        src('projection')?.setData(line(pts));
      } else src('projection')?.setData(empty());
    } else {
      src('sel-trail')?.setData(empty());
      src('sel-trail-old')?.setData(empty());
      src('projection')?.setData(empty());
    }
  }

  function line(coords: number[][]): GeoJSON.Feature | FC {
    if (coords.length < 2) return empty();
    return { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } };
  }

  function fitToRadius(animate = true) {
    const map = mapRef.current;
    const obs = getTraffic().observer;
    if (!map || !obs) return;
    const r = getSettings().radiusKm * 1000 * 1.05;
    const sw = destination(destination(obs, 180, r), 270, r);
    const ne = destination(destination(obs, 0, r), 90, r);
    map.fitBounds(
      [
        [sw.lon, sw.lat],
        [ne.lon, ne.lat],
      ],
      { padding: paddingRef.current, animate, duration: animate ? 600 : 0 },
    );
  }

  // Observer or radius changed: redraw rings and frame the radius.
  const obsKey = traffic.observer ? `${traffic.observer.lat.toFixed(3)},${traffic.observer.lon.toFixed(3)}` : '';
  useEffect(() => {
    drawStatic();
    fitToRadius();
  }, [obsKey, settings.radiusKm, recenterSignal]);

  useEffect(() => {
    if (ready.current) drawDynamic();
  }, [traffic.version, settings.onlyInteresting, settings.units]);

  // Selecting an aircraft (map, lists, Notable, search) brings it into view above the panels.
  useEffect(() => {
    const map = mapRef.current;
    const t = selectedTracked(getTraffic());
    if (!map || !t) return;
    const pos = displayPosition(t, Date.now());
    const pt = map.project([pos.lon, pos.lat]);
    const c = map.getContainer();
    const pad = paddingRef.current;
    const visible = pt.x > pad.left && pt.x < c.clientWidth - pad.right && pt.y > pad.top && pt.y < c.clientHeight - pad.bottom;
    if (!visible) {
      map.easeTo({ center: [pos.lon, pos.lat], padding: pad, zoom: Math.max(map.getZoom(), 7), duration: 900 });
    }
  }, [traffic.selected, padding.bottom]);

  useEffect(() => {
    const canvas = mapRef.current?.getCanvas();
    if (canvas) canvas.style.cursor = pickMode ? 'crosshair' : '';
  }, [pickMode]);

  return <div ref={el} className="map" />;
}
