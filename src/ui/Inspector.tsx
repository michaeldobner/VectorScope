import { useEffect, useState } from 'react';
import { compassPoint } from '../geo/geo';
import type { RouteInfo } from '../data/adsblol';
import { fetchPhoto, fetchRoute, type Photo } from '../data/feed';
import { airlineFor, lookupAircraft, type AircraftInfo } from '../data/enrich';
import { typeDisplayName } from '../data/score';
import * as f from '../lib/format';
import { updateSettings, useSettings, type WatchEntry } from '../state/settings';
import { rescore, select, type Tracked } from '../state/traffic';
import { watchMatch } from '../state/watch';
import { useTick } from './useLayout';

const STATE_LABEL = { zenith: 'Zenith', overhead: 'Overhead', approaching: 'Approaching', visible: 'Visible', none: '' } as const;

export function Inspector({ t, onClose }: { t: Tracked; onClose?: () => void }) {
  useTick(1000);
  const s = useSettings();
  const { ac, assessment: a, sky } = t;
  const [route, setRoute] = useState<RouteInfo | null | undefined>(undefined);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [info, setInfo] = useState<AircraftInfo | null>(null);
  const [airline, setAirline] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setRoute(undefined);
    setPhoto(null);
    if (ac.callsign && !a.military) {
      fetchRoute(ac.callsign, ac.lat, ac.lon)
        .then((r) => alive && setRoute(r))
        .catch(() => alive && setRoute(null));
    } else setRoute(null);
    fetchPhoto(ac.hex).then((p) => alive && setPhoto(p));
    setInfo(null);
    setAirline(null);
    lookupAircraft(ac.hex).then((i) => alive && setInfo(i));
    airlineFor(ac.callsign).then((n) => alive && setAirline(n));
    return () => {
      alive = false;
    };
  }, [ac.hex, ac.callsign]);

  const watched = watchMatch(ac, s.watchlist);
  const toggleWatch = () => {
    let list: WatchEntry[];
    if (watched) list = s.watchlist.filter((w) => w.id !== watched.id);
    else
      list = [
        ...s.watchlist,
        ac.registration
          ? { id: crypto.randomUUID(), kind: 'registration', value: ac.registration.toUpperCase() }
          : { id: crypto.randomUUID(), kind: 'hex', value: ac.hex },
      ];
    updateSettings({ watchlist: list });
    rescore();
  };

  const age = (Date.now() - ac.posTime) / 1000;
  const live = age < 20;
  const elapsed = (Date.now() - t.computedAt) / 1000;
  const cpaIn = sky.cpa ? sky.cpa.tSec - elapsed : null;
  const name = ac.callsign ?? ac.registration ?? ac.hex;
  const sqClass = a.squawkNote ? (a.tone === 'emergency' ? 'critical' : 'warning') : '';

  return (
    <div className="inspector">
      <header className="insp-head">
        <div className="insp-title">
          <h2 className="mono">{name}</h2>
          <button className={`icon-btn star ${watched ? 'on' : ''}`} onClick={toggleWatch} aria-label="Watchlist">
            {watched ? '★' : '☆'}
          </button>
          <span className={`live ${live ? '' : 'stale'}`}>
            <i /> {live ? 'LIVE' : `${f.ago(age * 1000)} AGO`}
          </span>
          <button className="icon-btn close" onClick={onClose ?? (() => select(null))} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="insp-sub">{ac.operator ?? route?.airline ?? airline ?? info?.owner ?? a.unit ?? 'Operator unknown'}</div>
        <div className="insp-type">{typeDisplayName(ac) ?? (info?.type ? `${info.manufacturer ?? ''} ${info.type}`.trim() : 'Type unknown')}</div>
      </header>

      {a.squawkNote && (
        <div className={`banner ${sqClass}`}>
          <b className="mono">SQUAWK {ac.squawk ?? ''}</b> {a.squawkNote}
        </div>
      )}

      {photo && (
        <a className="photo" href={photo.link} target="_blank" rel="noreferrer">
          <img src={photo.src} alt="" loading="lazy" />
          <span>© {photo.photographer} · planespotters.net</span>
        </a>
      )}

      <section className="route-card">
        {a.military ? (
          <div className="muted small">Route not published · military flights do not file public routes</div>
        ) : route === undefined ? (
          <div className="muted small">Looking up route …</div>
        ) : route ? (
          <>
            {route.airline && <div className="route-airline">{route.airline}</div>}
            <div className="route-row">
              <Airport ap={route.origin} />
              <div className="route-line">
                <i />
                <svg viewBox="0 0 64 64" width="16" height="16" fill="currentColor">
                  <path d="M32 3 34.6 8 35.2 22 60 36.5 60 41 35.2 34 34.6 49.5 44 56.5 44 60 32 57.2 20 60 20 56.5 29.4 49.5 28.8 34 4 41 4 36.5 28.8 22 29.4 8Z" transform="rotate(90 32 32)" />
                </svg>
                <i />
              </div>
              <Airport ap={route.destination} right />
            </div>
          </>
        ) : (
          <div className="muted small">No route data for {ac.callsign ?? 'this flight'}</div>
        )}
      </section>

      <section className="grid4 tele">
        <Field k="Altitude" v={f.altitude(ac.altFt, s.units, ac.onGround)} sub={f.flightLevel(ac.altFt) ?? undefined} big />
        <Field k="Ground speed" v={f.speed(ac.gsKt, s.units)} big />
        <Field k="Track" v={f.heading(ac.track)} big />
        <Field k="Vert. speed" v={f.vrate(ac.vRateFpm, s.units)} big />
      </section>

      <section className="block">
        <div className="block-title">Relative to you</div>
        <div className="grid4">
          <Field k="Distance" v={f.distance(sky.distM)} mono />
          <Field k="Direction" v={`${compassPoint(sky.bearing)} ${f.heading(sky.bearing)}`} mono />
          <Field k="Elevation" v={sky.elevation > 0 ? f.degrees(sky.elevation) : 'below 0°'} mono />
          <Field k="Squawk" v={ac.squawk ?? '·'} mono cls={sqClass} />
        </div>
        {sky.cpa && cpaIn != null && cpaIn > 0 && cpaIn < 1800 ? (
          <div className="cpa">
            {STATE_LABEL[sky.state] && <span className={`chip state-${sky.state}`}>{STATE_LABEL[sky.state]}</span>}
            <span>
              Closest in <b className="mono">{f.duration(cpaIn)}</b> at <b className="mono">{f.distance(sky.cpa.distM)}</b>
            </span>
            {sky.cpaElevation != null && (
              <span className="muted">
                Look <b>{compassPoint(sky.cpa.bearing)}</b> at <b className="mono">{f.degrees(sky.cpaElevation)}</b> elevation
              </span>
            )}
          </div>
        ) : (
          <div className="cpa muted">
            {sky.cpa && sky.cpa.rangeRate > 0 ? 'Moving away from you' : 'No close approach expected'}
          </div>
        )}
      </section>

      <section className="grid4 ids">
        <Field k="ICAO" v={ac.hex} mono />
        <Field k="Reg" v={ac.registration ?? '·'} mono />
        <Field k="Callsign" v={ac.callsign ?? '·'} mono />
        <Field k="Type" v={ac.typeCode ?? '·'} mono />
      </section>

      <section className="score-card">
        <div className="score-head">
          <span className="block-title">Interest score</span>
          <div className="bar">
            <i style={{ width: `${a.score}%` }} />
          </div>
          <span className="score mono">{a.score}</span>
        </div>
        {a.reasons.length ? (
          <ul className="reasons">
            {a.reasons.map((r) => (
              <li key={r.label}>
                <span>{r.label}</span>
                <span className="mono">+{r.points}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="muted small">Regular traffic</div>
        )}
      </section>

      <section className="block details">
        <div className="block-title">Details</div>
        <dl>
          {a.roleLabel && <Row k="Role" v={a.roleLabel} />}
          {a.unit && <Row k="Callsign group" v={a.unit} />}
          {ac.typeName && <Row k="Description" v={ac.typeName} />}
          {ac.year && <Row k="Built" v={`${ac.year} (${new Date().getFullYear() - ac.year} years)`} />}
          {ac.category && <Row k="Category" v={ac.category} />}
          <Row k="Position" v={ac.posSource === 'mlat' ? 'MLAT' : ac.posSource === 'tisb' ? 'TIS-B' : 'ADS-B'} />
          <Row k="Source" v={s.feedMode === 'demo' ? 'Demo data' : 'adsb.lol (ODbL)'} />
        </dl>
        <div className="links">
          <a href={`https://globe.adsbexchange.com/?icao=${ac.hex.toLowerCase()}`} target="_blank" rel="noreferrer">
            ADSBx
          </a>
          <a href={`https://adsb.lol/?icao=${ac.hex.toLowerCase()}`} target="_blank" rel="noreferrer">
            adsb.lol
          </a>
          {ac.callsign && (
            <a href={`https://www.flightradar24.com/${encodeURIComponent(ac.callsign)}`} target="_blank" rel="noreferrer">
              FR24
            </a>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({ k, v, sub, mono, big, cls }: { k: string; v: string; sub?: string; mono?: boolean; big?: boolean; cls?: string }) {
  return (
    <div className={`field ${big ? 'big' : ''}`}>
      <div className="k">{k}</div>
      <div className={`v ${mono || big ? 'mono' : ''} ${cls ?? ''}`}>{v}</div>
      {sub && <div className="sub mono">{sub}</div>}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </>
  );
}

function Airport({ ap, right }: { ap: RouteInfo['origin']; right?: boolean }) {
  return (
    <div className={`airport ${right ? 'right' : ''}`}>
      <div className="code mono">{ap.iata ?? ap.icao ?? '···'}</div>
      <div className="city">{ap.city ?? ap.name ?? ''}</div>
      <div className="muted tiny">{ap.country ?? ''}</div>
    </div>
  );
}
