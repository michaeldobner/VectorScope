import { useState } from 'react';
import { currentRouteLabel } from '../data/feed';
import { updateSettings, useSettings, type FeedMode } from '../state/settings';
import { enableGps, pinLocation, refreshNow, rescore, useTraffic } from '../state/traffic';

export const RADIUS_STEPS = [5, 10, 25, 50, 100, 200];

export function SettingsSheet({ onClose, onPickOnMap }: { onClose: () => void; onPickOnMap: () => void }) {
  const s = useSettings();
  const st = useTraffic();
  const [lat, setLat] = useState(s.location?.lat.toFixed(4) ?? '');
  const [lon, setLon] = useState(s.location?.lon.toFixed(4) ?? '');

  const setFeed = (feedMode: FeedMode) => {
    updateSettings({ feedMode });
    refreshNow();
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="settings" onClick={(e) => e.stopPropagation()}>
        <header>
          <h3>Settings</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <section>
          <h4>Location</h4>
          <p className="muted small">
            Current: {st.locationSource === 'gps' ? 'device location' : st.locationSource === 'saved' ? s.location?.label : 'default (Frankfurt)'}
            {st.observer && <span className="mono"> · {st.observer.lat.toFixed(3)}, {st.observer.lon.toFixed(3)}</span>}
          </p>
          <div className="btn-row">
            <button className={s.useGps ? 'on' : ''} onClick={() => enableGps()}>
              Use device location
            </button>
            <button
              onClick={() => {
                onPickOnMap();
                onClose();
              }}
            >
              Pick on map
            </button>
          </div>
          <form
            className="coords"
            onSubmit={(e) => {
              e.preventDefault();
              const la = Number(lat.replace(',', '.'));
              const lo = Number(lon.replace(',', '.'));
              if (Number.isFinite(la) && Number.isFinite(lo) && Math.abs(la) <= 90 && Math.abs(lo) <= 180) pinLocation(la, lo, 'Saved location');
            }}
          >
            <input className="mono" inputMode="decimal" placeholder="Lat" value={lat} onChange={(e) => setLat(e.target.value)} />
            <input className="mono" inputMode="decimal" placeholder="Lon" value={lon} onChange={(e) => setLon(e.target.value)} />
            <button type="submit">Save</button>
          </form>
          <label className="inline">
            Your altitude
            <input
              className="mono small-input"
              inputMode="numeric"
              value={s.observerAltM}
              onChange={(e) => {
                updateSettings({ observerAltM: Number(e.target.value) || 0 });
                rescore();
              }}
            />
            m
          </label>
          <p className="muted tiny">Stored only on this device. Requests to the data source use coordinates rounded to about 1 km.</p>
        </section>

        <section>
          <h4>Radius</h4>
          <div className="seg">
            {RADIUS_STEPS.map((r) => (
              <button key={r} className={s.radiusKm === r ? 'on' : ''} onClick={() => setRadius(r)}>
                {r}
              </button>
            ))}
          </div>
          <input type="range" min={2} max={400} step={1} value={s.radiusKm} onChange={(e) => setRadius(Number(e.target.value))} />
          <div className="muted small mono">{s.radiusKm} km</div>
        </section>

        <section>
          <h4>Units</h4>
          <div className="seg">
            <button className={s.units === 'metric' ? 'on' : ''} onClick={() => updateSettings({ units: 'metric' })}>
              m · km/h · m/s
            </button>
            <button className={s.units === 'aviation' ? 'on' : ''} onClick={() => updateSettings({ units: 'aviation' })}>
              ft · kt · fpm
            </button>
          </div>
        </section>

        <section>
          <h4>Map</h4>
          <label className="check">
            <input type="checkbox" checked={s.onlyInteresting} onChange={(e) => updateSettings({ onlyInteresting: e.target.checked })} />
            Show only interesting aircraft
          </label>
        </section>

        <section>
          <h4>Data source</h4>
          <div className="seg">
            {(['auto', 'direct', 'proxy', 'relay', 'demo'] as FeedMode[]).map((m) => (
              <button key={m} className={s.feedMode === m ? 'on' : ''} onClick={() => setFeed(m)}>
                {m}
              </button>
            ))}
          </div>
          <p className="muted tiny">
            Auto tries your proxy, then adsb.lol directly, then free public relays. Active route: <span className="mono">{currentRouteLabel()}</span>
            {st.error && <span className="critical"> · {st.error.kind}: {st.error.message}</span>}
          </p>
          <input
            className="mono"
            placeholder="Proxy URL, e.g. https://vectorscope-proxy.vercel.app"
            value={s.proxyUrl}
            onChange={(e) => updateSettings({ proxyUrl: e.target.value })}
            autoCapitalize="off"
            autoCorrect="off"
          />
          <input
            className="mono"
            placeholder="Proxy token (optional)"
            value={s.proxyToken}
            onChange={(e) => updateSettings({ proxyToken: e.target.value })}
            autoCapitalize="off"
            autoCorrect="off"
          />
          <label className="inline">
            Refresh every
            <select value={s.pollSec} onChange={(e) => updateSettings({ pollSec: Number(e.target.value) })}>
              {[3, 5, 10, 20].map((n) => (
                <option key={n} value={n}>
                  {n} s
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="about muted tiny">
          VectorScope · personal aviation radar. Traffic data © adsb.lol contributors (ODbL 1.0). Map © OpenFreeMap, OpenMapTiles,
          OpenStreetMap contributors. Photos © planespotters.net photographers.
        </section>
      </div>
    </div>
  );
}

export function setRadius(r: number) {
  updateSettings({ radiusKm: r });
  rescore();
  refreshNow();
}
