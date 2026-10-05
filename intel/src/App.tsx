import { useMemo, useState } from 'react';
import type { Aircraft } from '../../air/src/data/types';
import { isStrong } from './data/match';
import { CATEGORY_LABEL, SOURCES, sourceById, type Category } from './data/sources';
import type { EnrichedItem, Match } from './data/types';
import { refreshFeed, refreshLive, setPrefs, useIntel, type Filter, type IntelState } from './state/store';
import { age, ago, altitude, count, km } from './ui/format';
import { useWide } from './ui/useWide';

type Tab = 'feed' | 'live' | 'places' | 'sources';
const DAY = 24 * 3600_000;

export function App() {
  const st = useIntel();
  const wide = useWide();
  const [tab, setTab] = useState<Tab>('feed');
  const visible = useMemo(() => filterItems(st), [st]);

  return (
    <div className={`app ${wide ? 'wide' : 'narrow'}`}>
      <TopBar st={st} />
      {!wide && (
        <nav className="tabs" aria-label="Views">
          {(['feed', 'live', 'places', 'sources'] as Tab[]).map((t) => (
            <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
              {t === 'feed' ? 'Feed' : t === 'live' ? `Live ${liveMatches(st).length || ''}` : t === 'places' ? 'Places' : 'Sources'}
            </button>
          ))}
        </nav>
      )}
      <div className="layout">
        {(wide || tab === 'feed') && (
          <main className="feed">
            <Filters st={st} />
            <FeedList items={visible} st={st} />
          </main>
        )}
        {(wide || tab !== 'feed') && (
          <aside className="side">
            {(wide || tab === 'live') && <LivePanel st={st} />}
            {(wide || tab === 'places') && <PlacesPanel st={st} onPick={() => setTab('feed')} />}
            {(wide || tab === 'sources') && <SourcesPanel st={st} />}
          </aside>
        )}
      </div>
    </div>
  );
}

function filterItems(st: IntelState): EnrichedItem[] {
  const { filter, place } = st.prefs;
  return st.items.filter((i) => {
    if (place && !i.entities.places.some((p) => p.name === place)) return false;
    if (filter === 'all') return true;
    if (filter === 'live') return i.matches.some(isStrong);
    return (sourceById(i.sourceId)?.category ?? null) === filter;
  });
}

/** Aircraft with a strong match, each once, with the newest item that names it. */
function liveMatches(st: IntelState): { match: Match; item: EnrichedItem }[] {
  const seen = new Map<string, { match: Match; item: EnrichedItem }>();
  for (const item of st.items) for (const m of item.matches) if (isStrong(m) && !seen.has(m.ac.hex)) seen.set(m.ac.hex, { match: m, item });
  return [...seen.values()];
}

function TopBar({ st }: { st: IntelState }) {
  const okSources = Object.values(st.sources).filter((s) => s.ok).length;
  const status = st.demo ? 'DEMO' : st.loading && !st.items.length ? 'LOADING' : okSources || st.items.length ? 'LIVE' : st.updated ? 'OFFLINE' : 'LOADING';
  return (
    <header className="topbar">
      <a className="brand" href="../" aria-label="VectorScope home">
        <span className="logo">◇</span>
        <span>VectorScope</span>
        <span className="code">INTEL</span>
      </a>
      <span className="spacer" />
      <span className={`status status-${status.toLowerCase()}`}>
        <i /> {status}
      </span>
      <button className={`icon-btn ${st.loading ? 'spin' : ''}`} onClick={() => refreshLive().then(refreshFeed)} aria-label="Refresh">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <path d="M20 11a8 8 0 1 0-2.3 5.7" />
          <path d="M20 4v7h-7" />
        </svg>
      </button>
    </header>
  );
}

const FILTERS: Filter[] = ['all', 'live', 'aviation', 'osint', 'naval', 'defence', 'dach', 'official'];

function Filters({ st }: { st: IntelState }) {
  const liveCount = st.items.filter((i) => i.matches.some(isStrong)).length;
  return (
    <div className="filters" role="toolbar" aria-label="Filter">
      {FILTERS.map((f) => (
        <button key={f} className={`chip ${st.prefs.filter === f ? 'on' : ''} ${f === 'live' ? 'chip-live' : ''}`} onClick={() => setPrefs({ filter: f })}>
          {f === 'all' ? 'All' : f === 'live' ? `Live match${liveCount ? ` ${liveCount}` : ''}` : CATEGORY_LABEL[f as Category]}
        </button>
      ))}
      {st.prefs.place && (
        <button className="chip on place" onClick={() => setPrefs({ place: null })} aria-label={`Remove place filter ${st.prefs.place}`}>
          ◎ {st.prefs.place} ✕
        </button>
      )}
    </div>
  );
}

function FeedList({ items, st }: { items: EnrichedItem[]; st: IntelState }) {
  if (!items.length) {
    return <div className="empty">{st.loading || !st.updated ? 'Loading sources …' : st.prefs.filter === 'live' ? 'No post matches an aircraft in the air right now.' : 'Nothing here for this filter.'}</div>;
  }
  return (
    <ol className="items">
      {items.slice(0, 150).map((i) => (
        <ItemCard key={i.id} item={i} isNew={!st.demo && st.newSince > 0 && i.time > st.newSince} />
      ))}
    </ol>
  );
}

function ItemCard({ item, isNew }: { item: EnrichedItem; isNew: boolean }) {
  const src = sourceById(item.sourceId);
  const strong = item.matches.filter(isStrong);
  const weak = item.matches.filter((m) => !isStrong(m));
  const { callsigns, types, places } = item.entities;
  return (
    <li className={`item ${strong.length ? 'has-live' : ''}`}>
      <div className="item-meta">
        {isNew && <span className="new-dot" aria-label="new" />}
        <span className="src">{src?.name ?? 'Demo'}</span>
        {src && (
          <>
            <span className="sep">·</span>
            <span>{CATEGORY_LABEL[src.category]}</span>
          </>
        )}
        <span className="sep">·</span>
        <span>{item.channel === 'bluesky' ? 'Bluesky' : 'RSS'}</span>
        <span className="age">{age(item.time)}</span>
      </div>
      <a className="item-title" href={item.url} target="_blank" rel="noopener noreferrer">
        {item.title}
      </a>
      {item.text && <p className="item-text">{item.text}</p>}
      {(callsigns.length > 0 || types.length > 0 || places.length > 0) && (
        <div className="entities">
          {callsigns.map((c) => (
            <span key={c.callsign} className="ent ent-cs" title={c.label}>
              {c.callsign}
            </span>
          ))}
          {types.map((t) => (
            <span key={t.label} className="ent ent-type">
              {t.label}
            </span>
          ))}
          {places.slice(0, 4).map((p) => (
            <button key={p.name} className="ent ent-place" onClick={() => setPrefs({ place: p.name, filter: 'all' })}>
              {p.name}
            </button>
          ))}
        </div>
      )}
      {strong.length > 0 && (
        <div className="matches">
          {strong.slice(0, 4).map((m) => (
            <LiveRow key={m.ac.hex} m={m} />
          ))}
        </div>
      )}
      {weak.length > 0 && <WeakSummary weak={weak} />}
      {item.postUrl && item.url !== item.postUrl && (
        <a className="post-link" href={item.postUrl} target="_blank" rel="noopener noreferrer">
          Post on Bluesky ›
        </a>
      )}
    </li>
  );
}

const airLink = (ac: Aircraft) => `../air/?hex=${ac.hex}`;

function LiveRow({ m }: { m: Match }) {
  return (
    <a className="live-row" href={airLink(m.ac)}>
      <span className="live-tag">LIVE</span>
      <span className="cs">{m.ac.callsign ?? m.ac.hex.toUpperCase()}</span>
      <span className="ty">{m.ac.typeCode}</span>
      <span className="alt">{altitude(m.ac.altFt)}</span>
      <span className="why">{m.kind === 'callsign' ? 'named in post' : `${km(m.distM ?? 0)} from ${m.place}`}</span>
      <span className="go">›</span>
    </a>
  );
}

function WeakSummary({ weak }: { weak: Match[] }) {
  const byType = new Map<string, Match[]>();
  for (const m of weak) byType.set(m.label, [...(byType.get(m.label) ?? []), m]);
  return (
    <div className="weak">
      Airborne now:{' '}
      {[...byType.entries()].map(([label, list], i) => (
        <span key={label}>
          {i > 0 && ', '}
          <a href={airLink(list[0].ac)}>
            {list.length} × {label}
          </a>
        </span>
      ))}
    </div>
  );
}

function LivePanel({ st }: { st: IntelState }) {
  const list = liveMatches(st);
  return (
    <section className="panel">
      <h2 className="section-title">Live now</h2>
      <div className="live-summary">
        <span className="big">{st.live.length ? count(st.live.length) : '·'}</span>
        <span>military aircraft broadcasting worldwide{st.liveUpdated ? `, ${ago(st.liveUpdated)}` : ''}</span>
      </div>
      {st.liveError && <div className="note">Live data unavailable: {st.liveError}</div>}
      {list.length ? (
        <ul className="plain">
          {list.map(({ match, item }) => (
            <li key={match.ac.hex}>
              <LiveRow m={match} />
              <div className="live-src">{item.title}</div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="note">No post of the last 48 hours names an aircraft that is in the air right now.</div>
      )}
    </section>
  );
}

function PlacesPanel({ st, onPick }: { st: IntelState; onPick: () => void }) {
  const now = Date.now();
  const counts = new Map<string, number>();
  for (const i of st.items) if (now - i.time < DAY) for (const p of i.entities.places) counts.set(p.name, (counts.get(p.name) ?? 0) + 1);
  const list = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 16);
  return (
    <section className="panel">
      <h2 className="section-title">Places, last 24 h</h2>
      {list.length ? (
        <ul className="places">
          {list.map(([name, n]) => (
            <li key={name}>
              <button
                className={st.prefs.place === name ? 'on' : ''}
                onClick={() => {
                  setPrefs({ place: st.prefs.place === name ? null : name, filter: 'all' });
                  onPick();
                }}
              >
                <span>{name}</span>
                <span className="bar" style={{ width: `${(n / list[0][1]) * 100}%` }} />
                <span className="n">{n}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="note">No places named in the last 24 hours.</div>
      )}
    </section>
  );
}

function SourcesPanel({ st }: { st: IntelState }) {
  return (
    <section className="panel">
      <h2 className="section-title">Sources</h2>
      <ul className="sources">
        {SOURCES.map((s) => {
          const status = st.sources[s.id];
          return (
            <li key={s.id}>
              <span className={`dot ${!status ? '' : status.ok ? 'ok' : 'err'}`} />
              <a href={s.site} target="_blank" rel="noopener noreferrer">
                {s.name}
              </a>
              <span className="ch">{[s.rss && 'RSS', s.bluesky && 'Bluesky'].filter(Boolean).join(' + ')}</span>
              <span className="n">{status?.newest ? age(status.newest) : status && !status.ok ? 'error' : ''}</span>
            </li>
          );
        })}
      </ul>
      <p className="note">Headlines and short excerpts link to the original publisher. Live aircraft © adsb.lol contributors, ODbL.</p>
    </section>
  );
}
