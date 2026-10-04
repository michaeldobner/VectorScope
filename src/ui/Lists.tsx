import { useMemo, useState } from 'react';
import { bearingDeg, compassPoint } from '../geo/geo';
import { overheadRank } from '../geo/overhead';
import { typeDisplayName } from '../data/score';
import * as f from '../lib/format';
import { updateSettings, useSettings, type WatchKind } from '../state/settings';
import { rescore, select, selectExternal, useTraffic, type Tracked } from '../state/traffic';
import { useTick } from './useLayout';

function useInRadius(): Tracked[] {
  const st = useTraffic();
  const s = useSettings();
  return useMemo(() => {
    const r = s.radiusKm * 1000;
    return [...st.aircraft.values()].filter((t) => t.sky.distM <= r);
  }, [st.version, s.radiusKm]);
}

export function AirspaceNow() {
  useTick(1000);
  const st = useTraffic();
  const s = useSettings();
  const list = useInRadius();
  const interesting = list.filter((t) => t.assessment.tone !== 'standard').length;
  const military = list.filter((t) => t.assessment.military).length;
  const emergency = list.filter((t) => t.assessment.tone === 'emergency' || t.assessment.tone === 'event').length;
  return (
    <div className="airspace">
      <div className="panel-title">Airspace now</div>
      <div className="airspace-main">
        <span className="big mono">{list.length}</span>
        <span className="muted">aircraft within {s.radiusKm} km</span>
      </div>
      <div className="airspace-stats">
        <Stat n={interesting} label="Interesting" cls="accent" />
        <Stat n={military} label="Military" cls="accent" />
        <Stat n={emergency} label="Alerts" cls={emergency ? 'critical' : ''} />
      </div>
      <div className="muted tiny mono">
        {st.lastUpdate ? `Updated ${f.ago(Date.now() - st.lastUpdate)} ago` : 'Waiting for data'}
      </div>
    </div>
  );
}

function Stat({ n, label, cls }: { n: number; label: string; cls: string }) {
  return (
    <div className={`stat ${cls}`}>
      <span className="mono">{n}</span>
      <span>{label}</span>
    </div>
  );
}

function rowName(t: Tracked) {
  return t.ac.callsign ?? t.ac.registration ?? t.ac.hex;
}

export function NearbyList({ limit }: { limit?: number }) {
  const s = useSettings();
  const st = useTraffic();
  const list = useInRadius()
    .filter((t) => t.assessment.tone !== 'standard')
    .sort((a, b) => b.assessment.score - a.assessment.score)
    .slice(0, limit ?? 50);
  if (!list.length) return <Empty text="Nothing unusual within your radius right now." />;
  return (
    <ol className="rows">
      {list.map((t, i) => (
        <li key={t.ac.hex} className={`row tone-${t.assessment.tone} ${st.selected === t.ac.hex ? 'sel' : ''}`} onClick={() => select(t.ac.hex)}>
          <span className="rank mono">{i + 1}</span>
          <span className="tone-bar" />
          <span className="name mono">{rowName(t)}</span>
          <span className="meta">{t.ac.typeCode ?? ''}</span>
          <span className="num mono">{f.altitude(t.ac.altFt, s.units, t.ac.onGround)}</span>
          <span className="num mono">{f.distance(t.sky.distM)}</span>
          <span className="score-sm mono">{t.assessment.score}</span>
        </li>
      ))}
    </ol>
  );
}

export function OverheadList() {
  useTick(1000);
  const s = useSettings();
  const st = useTraffic();
  const list = [...st.aircraft.values()]
    .filter((t) => t.sky.state !== 'none')
    .sort((a, b) => overheadRank(a.sky) - overheadRank(b.sky))
    .slice(0, 30);
  if (!list.length) return <Empty text="Nothing above you or approaching in the next 10 minutes." />;
  return (
    <ol className="rows overhead">
      {list.map((t) => {
        const { sky } = t;
        const elapsed = (Date.now() - t.computedAt) / 1000;
        const inSec = sky.cpa ? sky.cpa.tSec - elapsed : 0;
        const label =
          sky.state === 'zenith' ? 'ZENITH' : sky.state === 'overhead' ? 'OVERHEAD' : sky.state === 'approaching' ? `IN ${f.duration(inSec)}` : 'VISIBLE';
        const look = sky.state === 'approaching' && sky.cpa ? sky.cpa.bearing : sky.bearing;
        const elev = sky.state === 'approaching' ? sky.cpaElevation ?? sky.elevation : sky.elevation;
        return (
          <li key={t.ac.hex} className={`row tone-${t.assessment.tone} ${st.selected === t.ac.hex ? 'sel' : ''}`} onClick={() => select(t.ac.hex)}>
            <span className={`chip state-${sky.state}`}>{label}</span>
            <span className="name mono">{rowName(t)}</span>
            <span className="meta">{t.ac.typeCode ?? ''}</span>
            <span className="num mono">{f.altitude(t.ac.altFt, s.units)}</span>
            <span className="look mono">
              <Arrow deg={look} /> {compassPoint(look)} {f.degrees(Math.max(0, elev))}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Arrow({ deg }: { deg: number }) {
  return (
    <span className="arrow-ic" style={{ transform: `rotate(${deg}deg)` }}>
      ↑
    </span>
  );
}

export function NotableList({ compact }: { compact?: boolean }) {
  const st = useTraffic();
  const s = useSettings();
  if (!st.notable.length)
    return <Empty text={st.notableUpdate ? 'No notable traffic in range.' : 'Loading military and emergency traffic …'} />;
  const obs = st.observer;
  return (
    <ol className="notable">
      {st.notable.slice(0, compact ? 6 : 25).map((n, i) => (
        <li key={n.ac.hex} className={`tone-${n.assessment.tone} ${st.selected === n.ac.hex ? 'sel' : ''}`} onClick={() => selectExternal(n.ac)}>
          <span className="idx mono">{String(i + 1).padStart(2, '0')}</span>
          <div className="nb">
            <div className="nb-top">
              <span className="name mono">{n.ac.callsign ?? n.ac.registration ?? n.ac.hex}</span>
              <span className="nb-type">{typeDisplayName(n.ac) ?? n.ac.typeCode ?? ''}</span>
              <span className="score mono">{n.assessment.score}</span>
            </div>
            <div className="nb-tags">
              {n.assessment.reasons.slice(0, 3).map((r) => (
                <span key={r.label}>{r.label}</span>
              ))}
            </div>
            <div className="nb-foot mono">
              {f.distance(n.distM)} {obs ? compassPoint(bearingDeg(obs, n.ac)) : ''}
              {n.ac.altFt != null && ` · ${f.altitude(n.ac.altFt, s.units)}`}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

const KIND_LABEL: Record<WatchKind, string> = { callsign: 'Callsign prefix', type: 'Type code', registration: 'Registration', hex: 'ICAO hex' };

export function WatchlistPanel() {
  const s = useSettings();
  const st = useTraffic();
  const [kind, setKind] = useState<WatchKind>('callsign');
  const [value, setValue] = useState('');
  const hits = [...st.aircraft.values()].filter((t) => t.watch).sort((a, b) => a.sky.distM - b.sky.distM);

  const add = () => {
    const v = value.trim().toUpperCase();
    if (!v) return;
    updateSettings({ watchlist: [...s.watchlist, { id: crypto.randomUUID(), kind, value: v }] });
    setValue('');
    rescore();
  };
  const remove = (id: string) => {
    updateSettings({ watchlist: s.watchlist.filter((w) => w.id !== id) });
    rescore();
  };

  return (
    <div className="watch">
      {hits.length > 0 && (
        <>
          <div className="panel-sub">In range now</div>
          <ol className="rows">
            {hits.map((t) => (
              <li key={t.ac.hex} className="row tone-watch" onClick={() => select(t.ac.hex)}>
                <span className="tone-bar" />
                <span className="name mono">{rowName(t)}</span>
                <span className="meta">{t.ac.typeCode ?? ''}</span>
                <span className="num mono">{f.distance(t.sky.distM)}</span>
              </li>
            ))}
          </ol>
        </>
      )}
      <div className="panel-sub">Rules</div>
      <form
        className="watch-add"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <select value={kind} onChange={(e) => setKind(e.target.value as WatchKind)}>
          {Object.entries(KIND_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
        <input
          className="mono"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={kind === 'callsign' ? 'FORTE' : kind === 'type' ? 'C17' : kind === 'hex' ? 'AE146C' : 'D-ABYA'}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
        />
        <button type="submit">Add</button>
      </form>
      <ul className="watch-list">
        {s.watchlist.map((w) => (
          <li key={w.id}>
            <span className="muted tiny">{KIND_LABEL[w.kind]}</span>
            <span className="mono">{w.value}</span>
            <button className="icon-btn" onClick={() => remove(w.id)} aria-label="Remove">
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="empty muted">{text}</div>;
}

