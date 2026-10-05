import { Suspense, lazy, useMemo, useState } from 'react';
import type { Aircraft } from '../../air/src/data/types';
import { isStrong } from './data/match';
import { REGION_LABEL, SOURCES, TIER_LABEL, sourceById, type Category, type Region, type Tier } from './data/sources';
import { independentCount, rankStories, type Status, type Story } from './data/stories';
import type { EnrichedItem, Match } from './data/types';
import { refreshFeed, refreshLive, setPrefs, useIntel, type Filter, type IntelState, type Pulse } from './state/store';
import { TranslateContext, german, useTr, useTranslationVersion } from './state/translate';
import { age, ago, altitude, clock, count, duration, km } from './ui/format';
import { useWide } from './ui/useWide';

const IntelMap = lazy(() => import('./ui/IntelMap'));

type Tab = 'main' | 'live' | 'more';
const HOUR = 3600_000;
const tierOf = (i: EnrichedItem): Tier => sourceById(i.sourceId)?.tier ?? 'early';
const TIER_ORDER: Tier[] = ['physical', 'primary', 'early', 'osint', 'specialist', 'perspective', 'confirming'];
/** Class label in the language of the interface: English, or German when DE is on. */
const tierLabel = (t: Tier, german: boolean) => TIER_LABEL[t][german ? 'de' : 'en'];
const pct = (x: number) => `${Math.round(x * 100)} %`;
const sourceName = (id: string) => sourceById(id)?.name ?? 'Demo';

export function App() {
  const st = useIntel();
  const wide = useWide();
  const [tab, setTab] = useState<Tab>('main');
  const view = st.prefs.view;
  const items = useMemo(() => st.items.filter((i) => itemPasses(i, st)), [st]);
  const stories = useMemo(() => st.stories.filter((s) => s.items.some((i) => itemPasses(i, st))), [st]);
  // Re-render when translations arrive. The function hands out German text where it is known.
  const trVersion = useTranslationVersion();
  const tr = useMemo(() => (st.prefs.german ? german : (t: string) => t), [st.prefs.german, trVersion]);

  return (
    <TranslateContext.Provider value={tr}>
    <div className={`app ${wide ? 'wide' : 'narrow'} view-${view}`}>
      <TopBar st={st} />
      {!wide && (
        <nav className="tabs" aria-label="Views">
          <button className={tab === 'main' && view === 'stories' ? 'on' : ''} onClick={() => (setTab('main'), setPrefs({ view: 'stories' }))}>
            Stories
          </button>
          <button className={tab === 'main' && view === 'wire' ? 'on' : ''} onClick={() => (setTab('main'), setPrefs({ view: 'wire' }))}>
            Wire
          </button>
          <button className={tab === 'main' && view === 'map' ? 'on' : ''} onClick={() => (setTab('main'), setPrefs({ view: 'map' }))}>
            Map
          </button>
          <button className={tab === 'live' ? 'on' : ''} onClick={() => setTab('live')}>
            Live {liveMatches(st).length || ''}
          </button>
          <button className={tab === 'more' ? 'on' : ''} onClick={() => setTab('more')}>
            Sources
          </button>
        </nav>
      )}
      <div className="layout">
        {(wide || tab === 'main') && (
          <main className="feed">
            {wide && (
              <div className="seg" role="tablist">
                <button className={view === 'stories' ? 'on' : ''} onClick={() => setPrefs({ view: 'stories' })}>
                  Stories
                </button>
                <button className={view === 'wire' ? 'on' : ''} onClick={() => setPrefs({ view: 'wire' })}>
                  Wire
                </button>
                <button className={view === 'map' ? 'on' : ''} onClick={() => setPrefs({ view: 'map' })}>
                  Map
                </button>
              </div>
            )}
            <Filters st={st} />
            {view === 'stories' && <StoriesView stories={stories} st={st} />}
            {view === 'wire' && <WireList items={items} st={st} />}
            {view === 'map' && (
              <Suspense fallback={<div className="intel-map" />}>
                <IntelMap stories={stories} live={st.live} />
                <p className="note map-note">Circles: stories at the place most of their reports name, size by number of independent sources, white confirmed, blue reported or emerging, grey unverified. Dots: military aircraft, blue when a story names them, red squawk 7700. Tap a circle for its stories, a dot to open the aircraft in AIR.</p>
              </Suspense>
            )}
          </main>
        )}
        {(wide || tab !== 'main') && (
          <aside className="side">
            {(wide || tab === 'live') && <LivePanel st={st} />}
            {(wide || tab === 'more') && <PlacesPanel st={st} onPick={() => setTab('main')} />}
            {(wide || tab === 'more') && <SourcesPanel st={st} />}
          </aside>
        )}
      </div>
    </div>
    </TranslateContext.Provider>
  );
}

function itemPasses(i: EnrichedItem, st: IntelState): boolean {
  const { filter, place } = st.prefs;
  if (place && !i.entities.places.some((p) => p.name === place)) return false;
  if (filter === 'all') return true;
  if (filter === 'live') return i.matches.some(isStrong);
  const src = sourceById(i.sourceId);
  const chip = FILTERS.find((f) => f.key === filter);
  return !!src && !!chip?.test?.(src.region, src.category);
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
      <button className={`icon-btn lang ${st.prefs.german ? 'on' : ''}`} onClick={() => setPrefs({ german: !st.prefs.german })} aria-pressed={st.prefs.german} aria-label="Translate to German" title="Translate to German">
        DE
      </button>
      <button className={`icon-btn ${st.loading ? 'spin' : ''}`} onClick={() => refreshLive().then(refreshFeed)} aria-label="Refresh">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <path d="M20 11a8 8 0 1 0-2.3 5.7" />
          <path d="M20 4v7h-7" />
        </svg>
      </button>
    </header>
  );
}

/** Filter chips: regions first, then topics. */
const FILTERS: { key: Filter; label: string; test?: (r: Region, c: Category) => boolean }[] = [
  { key: 'all', label: 'All' },
  { key: 'live', label: 'Live match' },
  ...(['russia', 'ukraine', 'mideast', 'dach', 'usa'] as Region[]).map((r) => ({ key: `r:${r}`, label: REGION_LABEL[r], test: (reg: Region) => reg === r })),
  { key: 'c:aviation', label: 'Aviation', test: (_r: Region, c: Category) => c === 'aviation' },
  { key: 'c:military', label: 'Military', test: (_r: Region, c: Category) => c === 'military' || c === 'defence' || c === 'naval' },
  { key: 'c:disaster', label: 'Disaster', test: (_r: Region, c: Category) => c === 'disaster' || c === 'infrastructure' },
  { key: 'c:osint', label: 'OSINT', test: (_r: Region, c: Category) => c === 'osint' },
  { key: 'c:news', label: 'News', test: (_r: Region, c: Category) => c === 'news' || c === 'politics' },
];

function Filters({ st }: { st: IntelState }) {
  const liveCount = st.stories.filter((s) => s.items.some((i) => i.matches.some(isStrong))).length;
  return (
    <div className="filters" role="toolbar" aria-label="Filter">
      {FILTERS.map((f) => (
        <button key={f.key} className={`chip ${st.prefs.filter === f.key ? 'on' : ''} ${f.key === 'live' ? 'chip-live' : ''}`} onClick={() => setPrefs({ filter: f.key })}>
          {f.key === 'live' && liveCount ? `${f.label} ${liveCount}` : f.label}
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

function Empty({ st }: { st: IntelState }) {
  return (
    <div className="empty">
      {st.loading || !st.updated ? 'Loading sources …' : st.prefs.filter === 'live' ? 'No report matches an aircraft in the air right now.' : 'Nothing here for this filter.'}
    </div>
  );
}

/* Stories */

const HOUR_MS = HOUR;

/** Which stories a pulse tile stands for. */
export function pulsePasses(s: Story, pulse: Pulse, now: number): boolean {
  if (pulse === 'hour') return s.items.some((i) => now - i.time < HOUR_MS);
  if (pulse === 'unverified') return s.status === 'signal' || s.status === 'emerging';
  if (pulse === 'developing') return independentCount(s) >= 2 && now - s.last < 12 * HOUR_MS;
  return true;
}

function Pulse({ st }: { st: IntelState }) {
  const now = Date.now();
  const lastHour = st.items.filter((i) => now - i.time < HOUR);
  const unverified = lastHour.filter((i) => tierOf(i) === 'early' || tierOf(i) === 'perspective').length;
  const developing = st.stories.filter((s) => pulsePasses(s, 'developing', now)).length;
  const tile = (key: Exclude<Pulse, null>, n: number, text: string) => (
    <button className={st.prefs.pulse === key ? 'on' : ''} onClick={() => setPrefs({ pulse: st.prefs.pulse === key ? null : key })} aria-pressed={st.prefs.pulse === key}>
      <b>{count(n)}</b>
      <span>{text}</span>
    </button>
  );
  return (
    <div className="pulse" aria-label="Pulse">
      {tile('hour', lastHour.length, 'reports last hour')}
      {tile('unverified', unverified, 'of them unverified')}
      {tile('developing', developing, 'developing stories')}
    </div>
  );
}

function StoriesView({ stories: all, st }: { stories: Story[]; st: IntelState }) {
  const stories = useMemo(() => all.filter((s) => pulsePasses(s, st.prefs.pulse, Date.now())), [all, st.prefs.pulse]);
  const { developing, latest } = useMemo(() => rankStories(stories, Date.now()), [stories]);
  if (!all.length) return <Empty st={st} />;
  return (
    <>
      <Pulse st={st} />
      {!stories.length && <div className="empty">No story for this tile right now.</div>}
      {developing.length > 0 && (
        <section>
          <h2 className="section-title">Developing, several sources</h2>
          <ol className="items">
            {developing.slice(0, 12).map((s) => (
              <StoryCard key={s.id} story={s} st={st} />
            ))}
          </ol>
        </section>
      )}
      {latest.length > 0 && <section>
        <h2 className="section-title">Latest</h2>
        <ol className="items">
          {latest.slice(0, 80).map((s) => (
            <StoryCard key={s.id} story={s} st={st} />
          ))}
        </ol>
      </section>}
    </>
  );
}

const STATUS_LABEL: Record<Status, string> = { observed: 'Observed', signal: 'Signal', emerging: 'Emerging', reported: 'Reported', confirmed: 'Confirmed' };
const STATUS_HINT: Record<Status, string> = {
  observed: 'seen by the VectorScope sensor in live flight data, nobody reported it yet',
  signal: 'one early or partisan source',
  emerging: 'several early or partisan sources',
  reported: 'specialist or OSINT source',
  confirmed: 'primary source or leading news medium',
};

function StoryCard({ story, st }: { story: Story; st: IntelState }) {
  const [open, setOpen] = useState(false);
  const tr = useTr();
  const { lead } = story;
  const n = independentCount(story);
  const isNew = !st.demo && st.newSince > 0 && story.last > st.newSince;
  const strong = uniqueMatches(story.items.flatMap((i) => i.matches.filter(isStrong)));
  const entities = mergeEntities(story.items);
  const tiers = TIER_ORDER.filter((t) => story.tiers[t]);
  const german = st.prefs.german;
  return (
    <li className={`item story status-${story.status} ${strong.length ? 'has-live' : ''}`}>
      <div className="item-meta">
        {isNew && <span className="new-dot" aria-label="new" />}
        <span className={`status-chip s-${story.status}`} title={STATUS_HINT[story.status]}>
          {STATUS_LABEL[story.status]}
        </span>
        <span className="src">{n > 1 ? `${n} sources` : sourceName(lead.sourceId)}</span>
        <span className="conf" title="Event confidence from the classes and trust of the independent sources">
          {pct(story.confidence)}
        </span>
        <span className="age">{age(story.last)}</span>
      </div>
      <a className="item-title" href={lead.url} target={lead.channel === 'sensor' ? undefined : '_blank'} rel="noopener noreferrer">
        {tr(lead.title, lead.sourceId)}
      </a>
      {lead.text && story.sources.length === 1 && <p className="item-text">{tr(lead.text, lead.sourceId)}</p>}
      {story.sources.length > 1 && (
        <>
          <Timeline story={story} />
          <div className="ladder">
            {tiers.map((t) => (
              <span key={t} className={`tier t-${t}`}>
                {story.tiers[t]} {tierLabel(t, german).toLowerCase()}
              </span>
            ))}
            {story.echoes.length > 0 && (
              <span className="tier echo" title="Copies an earlier report, or another channel of the same network reported first. Not counted as a source">
                {story.echoes.length} echo{story.echoes.length > 1 ? 'es' : ''}
              </span>
            )}
            {story.leadMs && (
              <span className="leadtime">
                {sourceName(story.leadFrom!)} {duration(story.leadMs)} ahead of {sourceName(story.leadTo!)}
              </span>
            )}
          </div>
        </>
      )}
      {(entities.callsigns.length > 0 || entities.types.length > 0 || entities.places.length > 0) && (
        <div className="entities">
          {entities.callsigns.map((c) => (
            <span key={c} className="ent ent-cs">
              {c}
            </span>
          ))}
          {entities.types.map((t) => (
            <span key={t} className="ent ent-type">
              {t}
            </span>
          ))}
          {entities.places.slice(0, 4).map((p) => (
            <button key={p} className="ent ent-place" onClick={() => setPrefs({ place: p, filter: 'all' })}>
              {p}
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
      {story.items.length > 1 && (
        <>
          <button className="expand" onClick={() => setOpen(!open)} aria-expanded={open}>
            {open ? 'Hide reports' : `Show ${story.items.length} reports in order`} {open ? '▴' : '▾'}
          </button>
          {open && (
            <ol className="reports">
              {story.items.map((i) => (
                <li key={i.id}>
                  <span className="t">{clock(i.time)}</span>
                  <span className={`dot-tier t-${tierOf(i)}`} />
                  <span className="who">
                    {sourceName(i.sourceId)}
                    {story.echoItems.includes(i.id) && <span className="echo-mark"> echo</span>}
                  </span>
                  <a href={i.url} target={i.channel === 'sensor' ? undefined : '_blank'} rel="noopener noreferrer">
                    {tr(i.title, i.sourceId)}
                  </a>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </li>
  );
}

/** Each report of a story as a dot on a time axis: hollow grey unverified, blue specialist and OSINT, white confirming. */
function Timeline({ story }: { story: Story }) {
  const span = Math.max(story.last - story.first, 30 * 60_000);
  return (
    <div className="timeline" aria-label={`From ${clock(story.first)} to ${clock(story.last)}`}>
      <div className="axis">
        {story.items.map((i) => (
          <span key={i.id} className={`tl-dot t-${tierOf(i)}`} style={{ left: `${((i.time - story.first) / span) * 100}%` }} title={`${clock(i.time)} ${sourceName(i.sourceId)}`} />
        ))}
      </div>
      <div className="tl-labels">
        <span>{clock(story.first)}</span>
        <span>{clock(story.last)}</span>
      </div>
    </div>
  );
}

function uniqueMatches(list: Match[]): Match[] {
  const out = new Map<string, Match>();
  for (const m of list) if (!out.has(m.ac.hex)) out.set(m.ac.hex, m);
  return [...out.values()];
}

function mergeEntities(items: EnrichedItem[]) {
  const callsigns = new Set<string>();
  const types = new Set<string>();
  const places = new Map<string, number>();
  for (const i of items) {
    i.entities.callsigns.forEach((c) => callsigns.add(c.callsign));
    i.entities.types.forEach((t) => types.add(t.label));
    i.entities.places.forEach((p) => places.set(p.name, Math.min(places.get(p.name) ?? Infinity, p.radiusKm)));
  }
  return { callsigns: [...callsigns], types: [...types], places: [...places.entries()].sort((a, b) => a[1] - b[1]).map(([n]) => n) };
}

/* Wire: every report on its own, newest first */

function WireList({ items, st }: { items: EnrichedItem[]; st: IntelState }) {
  if (!items.length) return <Empty st={st} />;
  return (
    <ol className="items">
      {items.slice(0, 150).map((i) => (
        <ItemCard key={i.id} item={i} isNew={!st.demo && st.newSince > 0 && i.time > st.newSince} />
      ))}
    </ol>
  );
}

const CHANNEL_LABEL = { bluesky: 'Bluesky', rss: 'RSS', telegram: 'Telegram', sensor: 'ADS-B' } as const;

function ItemCard({ item, isNew }: { item: EnrichedItem; isNew: boolean }) {
  const tr = useTr();
  const german = useIntel().prefs.german;
  const src = sourceById(item.sourceId);
  const strong = item.matches.filter(isStrong);
  const weak = item.matches.filter((m) => !isStrong(m));
  const { callsigns, types, places } = item.entities;
  return (
    <li className={`item ${strong.length ? 'has-live' : ''}`}>
      <div className="item-meta">
        {isNew && <span className="new-dot" aria-label="new" />}
        <span className="src">{src?.name ?? 'Demo'}</span>
        {src && <span className={`tier t-${src.tier}`}>{tierLabel(src.tier, german)}</span>}
        <span className="sep">·</span>
        <span>{CHANNEL_LABEL[item.channel]}</span>
        <span className="age">{age(item.time)}</span>
      </div>
      <a className="item-title" href={item.url} target={item.channel === 'sensor' ? undefined : '_blank'} rel="noopener noreferrer">
        {tr(item.title, item.sourceId)}
      </a>
      {item.text && <p className="item-text">{tr(item.text, item.sourceId)}</p>}
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
      <span className="why">{m.kind === 'callsign' ? 'named in report' : `${km(m.distM ?? 0)} from ${m.place}`}</span>
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

/* Side panels */

function LivePanel({ st }: { st: IntelState }) {
  const tr = useTr();
  const list = liveMatches(st);
  const military = st.live.filter((a) => a.dbFlags & 1).length;
  const emergencies = st.live.filter((a) => a.squawk === '7700').length;
  return (
    <section className="panel">
      <h2 className="section-title">Live now</h2>
      <div className="live-summary">
        <span className="big">{st.live.length ? count(military) : '·'}</span>
        <span>
          military aircraft broadcasting worldwide{emergencies ? `, ${emergencies} squawking 7700` : ''}
          {st.liveUpdated ? `, ${ago(st.liveUpdated)}` : ''}
        </span>
      </div>
      {st.liveError && <div className="note">Live data unavailable: {st.liveError}</div>}
      {list.length ? (
        <ul className="plain">
          {list.map(({ match, item }) => (
            <li key={match.ac.hex}>
              <LiveRow m={match} />
              <div className="live-src">{tr(item.title, item.sourceId)}</div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="note">No report of the last 48 hours names an aircraft that is in the air right now.</div>
      )}
    </section>
  );
}

function PlacesPanel({ st, onPick }: { st: IntelState; onPick: () => void }) {
  const now = Date.now();
  const counts = new Map<string, number>();
  for (const i of st.items) if (now - i.time < 24 * HOUR) for (const p of i.entities.places) counts.set(p.name, (counts.get(p.name) ?? 0) + 1);
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
              <span className="src-name">
                <a href={s.site} target="_blank" rel="noopener noreferrer">
                  {s.name}
                </a>
                <span className={`src-meta ${status && !status.ok ? 'err' : ''}`}>
                  {status && !status.ok
                    ? `Not reachable: ${status.error ?? 'unknown error'}`
                    : `${REGION_LABEL[s.region]} · trust ${s.trust}${s.perspective ? ` · ${s.perspective}` : ''}${s.network ? ` · network ${s.network}` : ''}`}
                </span>
              </span>
              <span className={`tier t-${s.tier}`}>{tierLabel(s.tier, st.prefs.german)}</span>
              <span className="n">{status?.newest ? age(status.newest) : status && !status.ok ? 'error' : ''}</span>
            </li>
          );
        })}
      </ul>
      <p className="note">
        {st.collectedAt ? `Collector last ran ${ago(st.collectedAt)}. ` : ''}Headlines and short excerpts link to the original publisher. Live aircraft © adsb.lol contributors, ODbL.
      </p>
      {st.prefs.german && <p className="note">German translations by Google Translate (unofficial), cached on this device.</p>}
      <p className="note version">VectorScope INTEL v{__APP_VERSION__}</p>
    </section>
  );
}
