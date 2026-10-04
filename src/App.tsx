import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchSearch } from './data/feed';
import type { Aircraft } from './data/types';
import { MapView } from './map/MapView';
import * as f from './lib/format';
import { updateSettings, useSettings } from './state/settings';
import { dismissAlert, pinLocation, refreshNow, select, selectExternal, selectedTracked, useTraffic } from './state/traffic';
import { Inspector } from './ui/Inspector';
import { AirspaceNow, NearbyList, NotableList, OverheadList, WatchlistPanel } from './ui/Lists';
import { RADIUS_STEPS, SettingsSheet, setRadius } from './ui/SettingsSheet';
import { useLayout, useTick } from './ui/useLayout';

type Tab = 'nearby' | 'overhead' | 'notable' | 'watch';
const TABS: { id: Tab; label: string }[] = [
  { id: 'overhead', label: 'Overhead' },
  { id: 'nearby', label: 'Nearby' },
  { id: 'notable', label: 'Notable' },
  { id: 'watch', label: 'Watchlist' },
];

export function App() {
  const layout = useLayout();
  const st = useTraffic();
  const [tab, setTab] = useState<Tab>('overhead');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pickMode, setPickMode] = useState(false);
  const [recenter, setRecenter] = useState(0);
  const [sheet, setSheet] = useState<'peek' | 'half' | 'full'>('peek');
  const selected = selectedTracked(st);

  // Phone: opening an aircraft raises the sheet so the inspector is readable.
  useEffect(() => {
    if (selected && layout === 'phone-portrait' && sheet === 'peek') setSheet('half');
  }, [selected?.ac.hex]);

  const padding = useMemo(() => {
    if (layout === 'phone-portrait') return { top: 70, right: 20, bottom: sheet === 'peek' ? 190 : 120, left: 20 };
    return { top: 56, right: 24, bottom: 24, left: 24 };
  }, [layout, sheet]);

  const tabs = (
    <div className="tabs" role="tablist">
      {TABS.map((t) => (
        <button key={t.id} role="tab" className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  );
  const tabBody =
    tab === 'nearby' ? <NearbyList /> : tab === 'overhead' ? <OverheadList /> : tab === 'notable' ? <NotableList /> : <WatchlistPanel />;

  const map = (
    <div className="map-wrap">
      <MapView
        padding={padding}
        pickMode={pickMode}
        recenterSignal={recenter}
        onPick={(lat, lon) => {
          pinLocation(lat, lon, 'Pinned on map');
          setPickMode(false);
        }}
      />
      <MapControls onRecenter={() => setRecenter((n) => n + 1)} />
      {pickMode && (
        <div className="pick-hint">
          Tap the map to set your location <button onClick={() => setPickMode(false)}>Cancel</button>
        </div>
      )}
      <ErrorBanner onSettings={() => setSettingsOpen(true)} />
    </div>
  );

  return (
    <div className={`app layout-${layout}`}>
      <TopBar onSettings={() => setSettingsOpen(true)} />

      {layout === 'wide' && (
        <>
          <main className="wide-main">
            {map}
            <aside className="right-col">
              {selected ? (
                <Inspector t={selected} />
              ) : (
                <>
                  <AirspaceNow />
                  <div className="panel-title pad">Overhead</div>
                  <div className="scroll">
                    <OverheadList />
                  </div>
                </>
              )}
            </aside>
          </main>
          <section className="strip">
            <div className="card">
              <div className="panel-title">Notable now</div>
              <div className="scroll">
                <NotableList compact />
              </div>
            </div>
            <div className="card">
              <div className="panel-title">Interesting nearby</div>
              <div className="scroll">
                <NearbyList />
              </div>
            </div>
            <div className="card">
              <div className="panel-title">Watchlist</div>
              <div className="scroll">
                <WatchlistPanel />
              </div>
            </div>
          </section>
        </>
      )}

      {(layout === 'phone-landscape' || layout === 'tablet-portrait') && (
        <main className={layout === 'tablet-portrait' ? 'tp-main' : 'pl-main'}>
          {map}
          <div className="side">
            {layout === 'tablet-portrait' ? (
              <>
                <div className="side-col">
                  <AirspaceNow />
                  {tabs}
                  <div className="scroll">{tabBody}</div>
                </div>
                <div className="side-col">
                  {selected ? (
                    <div className="scroll">
                      <Inspector t={selected} />
                    </div>
                  ) : (
                    <>
                      <div className="panel-title pad">Notable now</div>
                      <div className="scroll">
                        <NotableList compact />
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : selected ? (
              <div className="scroll">
                <Inspector t={selected} />
              </div>
            ) : (
              <>
                <AirspaceNow />
                {tabs}
                <div className="scroll">{tabBody}</div>
              </>
            )}
          </div>
        </main>
      )}

      {layout === 'phone-portrait' && (
        <main className="pp-main">
          {map}
          <BottomSheet state={sheet} onState={setSheet}>
            {selected ? (
              <Inspector
                t={selected}
                onClose={() => {
                  select(null);
                  setSheet('peek');
                }}
              />
            ) : (
              <>
                <Peek onOpen={() => setSheet(sheet === 'peek' ? 'half' : 'peek')} />
                {tabs}
                <div className="sheet-body">{tabBody}</div>
              </>
            )}
          </BottomSheet>
        </main>
      )}

      <Toasts />
      {settingsOpen && <SettingsSheet onClose={() => setSettingsOpen(false)} onPickOnMap={() => setPickMode(true)} />}
    </div>
  );
}

function TopBar({ onSettings }: { onSettings: () => void }) {
  useTick(1000);
  const st = useTraffic();
  const s = useSettings();
  const stale = st.lastUpdate == null || Date.now() - st.lastUpdate > Math.max(20_000, s.pollSec * 4000);
  const status = s.feedMode === 'demo' ? 'DEMO' : st.status === 'error' && stale ? 'OFFLINE' : stale ? 'CONNECTING' : 'LIVE';
  return (
    <header className="topbar">
      <div className="brand">
        <span className="logo">◇</span>
        <span>VectorScope</span>
      </div>
      <Search />
      <span className={`status status-${status.toLowerCase()}`}>
        <i /> {status}
      </span>
      <button className="icon-btn gear" onClick={onSettings} aria-label="Settings">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
        </svg>
      </button>
    </header>
  );
}

function Search() {
  const st = useTraffic();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Aircraft[] | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    const v = q.trim().toUpperCase();
    if (!v) return;
    const local = [...st.aircraft.values()].filter((t) => [t.ac.callsign, t.ac.registration, t.ac.hex, t.ac.typeCode].some((x) => x?.toUpperCase().includes(v)));
    if (local.length === 1) {
      select(local[0].ac.hex);
      setResults(null);
      return;
    }
    if (local.length > 1) {
      setResults(local.map((t) => t.ac));
      return;
    }
    setBusy(true);
    try {
      const r = await fetchSearch(v);
      setResults(r.aircraft);
    } catch {
      setResults([]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="search">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
      >
        <input
          className="mono"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            if (!e.target.value) setResults(null);
          }}
          placeholder="Callsign, ICAO, registration"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
        />
      </form>
      {(results || busy) && (
        <div className="search-results">
          {busy && <div className="muted small">Searching …</div>}
          {results && !results.length && <div className="muted small">No aircraft found</div>}
          {results?.slice(0, 12).map((a) => (
            <button
              key={a.hex}
              onClick={() => {
                selectExternal(a);
                setResults(null);
                setQ('');
              }}
            >
              <span className="mono">{a.callsign ?? a.registration ?? a.hex}</span>
              <span className="muted">{a.typeCode ?? ''}</span>
              <span className="muted mono">{a.hex}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MapControls({ onRecenter }: { onRecenter: () => void }) {
  const s = useSettings();
  return (
    <div className="map-controls">
      <div className="seg radius">
        {RADIUS_STEPS.map((r) => (
          <button key={r} className={s.radiusKm === r ? 'on' : ''} onClick={() => setRadius(r)}>
            {r}
          </button>
        ))}
        <span className="unit">KM</span>
      </div>
      <button className="icon-btn round" onClick={onRecenter} aria-label="Recenter">
        ◎
      </button>
      <button
        className={`icon-btn round ${s.onlyInteresting ? 'on' : ''}`}
        onClick={() => updateSettings({ onlyInteresting: !s.onlyInteresting })}
        aria-label="Only interesting"
        title="Only interesting"
      >
        ◆
      </button>
    </div>
  );
}

function Peek({ onOpen }: { onOpen: () => void }) {
  const st = useTraffic();
  const s = useSettings();
  const inRadius = [...st.aircraft.values()].filter((t) => t.sky.distM <= s.radiusKm * 1000);
  const interesting = inRadius.filter((t) => t.assessment.tone !== 'standard').sort((a, b) => b.assessment.score - a.assessment.score);
  const top = interesting[0];
  return (
    <div className="peek" onClick={onOpen}>
      <div className="peek-line mono">
        <b>{inRadius.length}</b> AIRCRAFT · <b className="accent">{interesting.length}</b> INTERESTING
      </div>
      {top && (
        <div
          className={`peek-top tone-${top.assessment.tone}`}
          onClick={(e) => {
            e.stopPropagation();
            select(top.ac.hex);
          }}
        >
          <span className="name mono">{top.ac.callsign ?? top.ac.registration ?? top.ac.hex}</span>
          <span className="muted">{top.ac.typeCode}</span>
          <span className="mono">{f.distance(top.sky.distM)}</span>
          <span className="score-sm mono">{top.assessment.score}</span>
        </div>
      )}
    </div>
  );
}

function BottomSheet({ state, onState, children }: { state: 'peek' | 'half' | 'full'; onState: (s: 'peek' | 'half' | 'full') => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; t: number } | null>(null);
  const [dy, setDy] = useState(0);

  const onDown = (e: React.PointerEvent) => {
    drag.current = { y: e.clientY, t: Date.now() };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (drag.current) setDy(e.clientY - drag.current.y);
  };
  const onUp = () => {
    if (!drag.current) return;
    const order: ('peek' | 'half' | 'full')[] = ['peek', 'half', 'full'];
    const i = order.indexOf(state);
    if (dy < -40) onState(order[Math.min(2, i + 1)]);
    else if (dy > 40) onState(order[Math.max(0, i - 1)]);
    else if (Math.abs(dy) < 5) onState(state === 'peek' ? 'half' : state === 'half' ? 'full' : 'half');
    drag.current = null;
    setDy(0);
  };

  return (
    <div ref={ref} className={`bottom-sheet bs-${state} ${dy ? 'dragging' : ''}`} style={dy ? { transform: `translateY(${dy}px)` } : undefined}>
      <div className="grabber" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <i />
      </div>
      <div className="bs-content">{children}</div>
    </div>
  );
}

function ErrorBanner({ onSettings }: { onSettings: () => void }) {
  const st = useTraffic();
  const s = useSettings();
  if (st.status !== 'error' || !st.error || s.feedMode === 'demo') return null;
  const cors = st.error.kind === 'cors';
  return (
    <div className="error-banner">
      <div>
        {cors
          ? 'Your browser blocked direct access to adsb.lol (CORS). Add your proxy URL in Settings, or try the demo.'
          : st.error.kind === 'rate'
            ? 'adsb.lol is rate limiting requests. Retrying more slowly.'
            : `Data source unavailable (${st.error.message}).`}
      </div>
      <div className="btn-row">
        <button onClick={onSettings}>Settings</button>
        <button
          onClick={() => {
            updateSettings({ feedMode: 'demo' });
            refreshNow();
          }}
        >
          Demo
        </button>
      </div>
    </div>
  );
}

function Toasts() {
  const st = useTraffic();
  useEffect(() => {
    if (!st.alerts.length) return;
    const id = window.setTimeout(() => dismissAlert(st.alerts[st.alerts.length - 1].id), 8000);
    return () => window.clearTimeout(id);
  }, [st.alerts]);
  return (
    <div className="toasts">
      {st.alerts.map((a) => (
        <div
          key={a.id}
          className={`toast tone-${a.tone}`}
          onClick={() => {
            select(a.hex);
            dismissAlert(a.id);
          }}
        >
          <b className="mono">{a.title}</b>
          <span>{a.detail}</span>
        </div>
      ))}
    </div>
  );
}
