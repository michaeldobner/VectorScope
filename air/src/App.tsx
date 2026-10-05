import { useEffect, useMemo, useRef, useState } from 'react';
import { currentRouteLabel, fetchSearch } from './data/feed';
import type { Aircraft } from './data/types';
import { MapView } from './map/MapView';
import * as f from './lib/format';
import { updateSettings, useSettings } from './state/settings';
import { dismissAlert, pinLocation, refreshNow, select, selectExternal, selectedTracked, useTraffic } from './state/traffic';
import { Inspector } from './ui/Inspector';
import { AirspaceNow, NearbyList, NotableList, OverheadList, WatchlistPanel } from './ui/Lists';
import { RADIUS_STEPS, SettingsSheet, setRadius } from './ui/SettingsSheet';
import { useLayout, useTick } from './ui/useLayout';

const PROXY_HELP = 'https://github.com/michaeldobner/VectorScope/blob/main/docs/en/deployment.md#cors-proxy-on-vercel';

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
  const [sheet, setSheet] = useState<SheetState>('peek');
  const selected = selectedTracked(st);

  // Phone: opening an aircraft raises the sheet so the inspector is readable.
  useEffect(() => {
    if (selected && layout === 'phone-portrait' && sheet === 'peek') setSheet('half');
  }, [selected?.ac.hex]);

  const padding = useMemo(() => {
    if (layout === 'phone-portrait')
      return { top: 70, right: 64, bottom: sheet === 'peek' ? 190 : sheet === 'half' ? Math.round(window.innerHeight * 0.52) + 20 : 120, left: 20 };
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
      <a className="brand" href="../" aria-label="VectorScope home">
        <span className="logo">◇</span>
        <span>VectorScope</span>
      </a>
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
    <>
      <div className="map-controls">
        <div className="seg radius">
          {RADIUS_STEPS.map((r) => (
            <button key={r} className={s.radiusKm === r ? 'on' : ''} onClick={() => setRadius(r)}>
              {r}
            </button>
          ))}
          <span className="unit">KM</span>
        </div>
      </div>
      <div className="map-buttons">
        <button className="map-btn" onClick={onRecenter} aria-label="My location" title="My location">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M21.3 2.7a1 1 0 0 0-1.1-.2L3.2 9.6a1 1 0 0 0 .1 1.9l7 2.2 2.2 7a1 1 0 0 0 1.9.1l7.1-17a1 1 0 0 0-.2-1.1z" />
          </svg>
        </button>
        <button
          className={`map-btn ${s.onlyInteresting ? 'on' : ''}`}
          onClick={() => updateSettings({ onlyInteresting: !s.onlyInteresting })}
          aria-label="Only interesting aircraft"
          title="Only interesting aircraft"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
        </button>
      </div>
    </>
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

type SheetState = 'peek' | 'half' | 'full';
const SHEET_ORDER: SheetState[] = ['peek', 'half', 'full'];

/**
 * Bottom sheet that behaves like Apple Maps: drag it anywhere, flick it, it snaps.
 * Below full height every vertical drag moves the sheet. At full height the content scrolls,
 * and pulling down from the top of the content moves the sheet again.
 */
function BottomSheet({ state, onState, children }: { state: SheetState; onState: (s: SheetState) => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const [dy, setDy] = useState(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const el = ref.current!;
    let startY = 0;
    let startT = 0;
    let lastY = 0;
    let lastT = 0;
    let mode: 'idle' | 'pending' | 'drag' | 'scroll' = 'idle';
    let fromGrabber = false;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      startY = lastY = t.clientY;
      startT = lastT = performance.now();
      fromGrabber = !!(e.target as HTMLElement).closest('.grabber');
      mode = 'pending';
    };
    const onMove = (e: TouchEvent) => {
      if (mode === 'idle' || mode === 'scroll') return;
      const y = e.touches[0].clientY;
      const d = y - startY;
      if (mode === 'pending') {
        if (Math.abs(d) < 6) return;
        const atTop = (body.current?.scrollTop ?? 0) <= 0;
        const full = stateRef.current === 'full';
        // At full height the content scrolls, unless the user pulls down from its top.
        if (!fromGrabber && full && !(d > 0 && atTop)) {
          mode = 'scroll';
          return;
        }
        mode = 'drag';
      }
      e.preventDefault();
      lastT = performance.now();
      lastY = y;
      setDy(Math.max(-window.innerHeight, d));
    };
    const onEnd = () => {
      if (mode === 'drag') {
        const d = lastY - startY;
        const v = (lastY - startY) / Math.max(1, lastT - startT); // px per ms
        const i = SHEET_ORDER.indexOf(stateRef.current);
        let next = i;
        if (d > 60 || v > 0.5) next = Math.max(0, i - (Math.abs(d) > 280 || v > 1.4 ? 2 : 1));
        else if (d < -60 || v < -0.5) next = Math.min(2, i + (Math.abs(d) > 280 || v < -1.4 ? 2 : 1));
        onState(SHEET_ORDER[next]);
      } else if (mode === 'pending' && fromGrabber) {
        onState(stateRef.current === 'peek' ? 'half' : stateRef.current === 'half' ? 'full' : 'half');
      }
      mode = 'idle';
      setDy(0);
    };
    // iOS keeps sending touchmove/touchend to the element the finger first touched, even after
    // React removed it from the page, and those events then no longer bubble. So the listeners
    // go on that element itself (plus window as a fallback).
    let target: EventTarget | null = null;
    let moveSeen = 0;
    const onMoveOnce = (e: Event) => {
      // Both listeners can see the same event while the element is attached; handle it once.
      if (e.timeStamp === moveSeen) return;
      moveSeen = e.timeStamp;
      onMove(e as TouchEvent);
    };
    const onStartWrapped = (e: TouchEvent) => {
      onStart(e);
      target = e.target;
      if (target) {
        target.addEventListener('touchmove', onMoveOnce, { passive: false });
        target.addEventListener('touchend', onEndWrapped);
        target.addEventListener('touchcancel', onEndWrapped);
      }
      window.addEventListener('touchmove', onMoveOnce, { passive: false });
      window.addEventListener('touchend', onEndWrapped);
      window.addEventListener('touchcancel', onEndWrapped);
    };
    let ended = false;
    const onEndWrapped = () => {
      if (ended) return;
      ended = true;
      for (const t of [target, window]) {
        if (!t) continue;
        t.removeEventListener('touchmove', onMoveOnce);
        t.removeEventListener('touchend', onEndWrapped);
        t.removeEventListener('touchcancel', onEndWrapped);
      }
      target = null;
      onEnd();
      queueMicrotask(() => (ended = false));
    };
    el.addEventListener('touchstart', onStartWrapped, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStartWrapped);
      onEndWrapped();
    };
  }, [onState]);

  // Mouse support for desktop browsers: click the grabber to cycle.
  const onGrabberClick = (e: React.MouseEvent) => {
    if ((e.nativeEvent as PointerEvent).pointerType === 'touch') return;
    onState(state === 'peek' ? 'half' : state === 'half' ? 'full' : 'half');
  };

  return (
    <div ref={ref} className={`bottom-sheet bs-${state} ${dy ? 'dragging' : ''}`} style={dy ? { transform: `translateY(${dy}px)` } : undefined}>
      <div className="grabber" onClick={onGrabberClick} aria-label="Resize panel">
        <i />
      </div>
      <div ref={body} className="bs-content">
        {children}
      </div>
    </div>
  );
}

function ErrorBanner({ onSettings }: { onSettings: () => void }) {
  const st = useTraffic();
  const s = useSettings();
  if (st.status !== 'error' || !st.error || s.feedMode === 'demo') return null;
  // A short rate limit while data is still fresh is handled silently by the backoff.
  if (st.error.kind === 'rate' && st.lastUpdate && Date.now() - st.lastUpdate < 90_000) return null;
  const cors = st.error.kind === 'cors';
  return (
    <div className="error-banner">
      <div>
        {cors
          ? 'adsb.lol does not allow direct access from browsers (CORS). Set up the free proxy once, or try the demo.'
          : st.error.kind === 'rate'
            ? 'adsb.lol is rate limiting requests. Retrying more slowly.'
            : `Data source unavailable (${st.error.message}).`}
        <div className="banner-meta mono">
          v{__APP_VERSION__} · {currentRouteLabel()} · {st.error.kind}
        </div>
      </div>
      <div className="btn-row">
        {cors && (
          <a className="btn" href={PROXY_HELP} target="_blank" rel="noreferrer">
            How to fix
          </a>
        )}
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
