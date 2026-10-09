import { Suspense, lazy, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { Aircraft } from '../../air/src/data/types';
import { CAPITALS, DECISION, actorById, capitalsOf, type CapitalId } from './data/actors';
import { bridgesFor } from './data/bridges';
import { airSituation, earlyReports, headlines, type Headline } from './data/headlines';
import { storyInLens } from './data/lens';
import { KIND_LABEL } from './data/kinds';
import { clip } from './data/text';
import type { ReportLang } from './data/lang';
import { isStrong } from './data/match';
import { PARTIES, PARTY_ORDER, memberParty, shortName, type PartyId } from './data/parties';
import { voicesOf } from './data/voices';
import { REGION_LABEL, SOURCES, TIER_LABEL, sourceById, type Category, type Region, type Source, type Tier } from './data/sources';
import { independentCount, rankStories, type Status, type Story } from './data/stories';
import type { EnrichedItem, Lens, Match } from './data/types';
import { refreshFeed, refreshLive, setPrefs, setQuery, useIntel, type Filter, type IntelState, type Pulse } from './state/store';
import { TranslateContext, translate, useTr, useTranslationVersion } from './state/translate';
import { age, ago, altitude, clock, count, duration, km } from './ui/format';
import { useWide } from './ui/useWide';

const IntelMap = lazy(() => import('./ui/IntelMap'));

type Tab = 'main' | 'live' | 'more';
const HOUR = 3600_000;
const tierOf = (i: EnrichedItem): Tier => sourceById(i.sourceId)?.tier ?? 'early';
const TIER_ORDER: Tier[] = ['physical', 'primary', 'early', 'osint', 'specialist', 'perspective', 'confirming'];
/** Class label: the interface is English, whatever language the reports are shown in. */
const tierLabel = (t: Tier) => TIER_LABEL[t].en;
/** Languages of the reports, for the language menu. */
const LANG_LABEL: Record<ReportLang, { short: string; title: string; hint: string }> = {
  original: { short: 'ORIG', title: 'Original', hint: 'Every report as it came' },
  en: { short: 'EN', title: 'English', hint: 'All reports in English' },
  de: { short: 'DE', title: 'Deutsch', hint: 'All reports in German' },
};

/** 🌐 with the chosen language. A tap opens three choices instead of switching blindly. */
function LangMenu({ st }: { st: IntelState }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  const current = st.prefs.reports;
  return (
    <div className="lang-menu" ref={ref}>
      <button
        className={`icon-btn lang ${current !== 'original' ? 'on' : ''}`}
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Language of the reports: ${LANG_LABEL[current].title}`}
      >
        <span aria-hidden>🌐</span> {LANG_LABEL[current].short}
      </button>
      {open && (
        <div className="lang-pop" role="menu">
          {(Object.keys(LANG_LABEL) as ReportLang[]).map((l) => (
            <button
              key={l}
              role="menuitemradio"
              aria-checked={current === l}
              className={current === l ? 'on' : ''}
              onClick={() => (setPrefs({ reports: l }), setOpen(false))}
            >
              <b>{LANG_LABEL[l].title}</b>
              <span>{LANG_LABEL[l].hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
const pct = (x: number) => `${Math.round(x * 100)} %`;
const sourceName = (id: string) => sourceById(id)?.name ?? 'Demo';

export function App() {
  const st = useIntel();
  const wide = useWide();
  const [tab, setTab] = useState<Tab>('main');
  const [searching, setSearching] = useState(false);
  const collapsed = useCollapsedHeader(!wide);
  const view = st.prefs.view;
  const lens = st.prefs.lens;
  const items = useMemo(() => st.items.filter((i) => itemPasses(i, st)), [st]);
  const stories = useMemo(
    () =>
      st.stories.filter(
        (s) => inLens(s, lens) && s.items.some((i) => itemPasses(i, st)) && (lens !== 'politics' || !st.prefs.signal || isSignal(s)),
      ),
    [st, lens],
  );
  // Re-render when translations arrive. The function hands out the text in the chosen language where it is known.
  const trVersion = useTranslationVersion();
  const reports = st.prefs.reports;
  const tr = useMemo(() => (reports === 'original' ? (t: string) => t : (t: string, s: string) => translate(t, s, reports)), [reports, trVersion]);

  return (
    <TranslateContext.Provider value={tr}>
    <div className={`app ${wide ? 'wide' : 'narrow'} view-${view} ${collapsed ? 'collapsed' : ''}`}>
      <TopBar
        st={st}
        wide={wide}
        searching={searching}
        onSearch={() => {
          if (searching) setQuery('');
          else (setTab('main'), st.prefs.now && setPrefs({ now: false }));
          setSearching(!searching);
        }}
      />
      {wide && <LensSwitch st={st} />}
      {!wide && (
        <nav className="tabs" aria-label="Views">
          {st.prefs.now ? (
            <button className={tab === 'main' ? 'on' : ''} onClick={() => setTab('main')}>
              Now
            </button>
          ) : (
            <>
              <button className={tab === 'main' && view === 'stories' ? 'on' : ''} onClick={() => (setTab('main'), setPrefs({ view: 'stories' }))}>
                Stories
              </button>
              <button className={tab === 'main' && view === 'wire' ? 'on' : ''} onClick={() => (setTab('main'), setPrefs({ view: 'wire' }))}>
                Wire
              </button>
              <button className={tab === 'main' && view === 'map' ? 'on' : ''} onClick={() => (setTab('main'), setPrefs({ view: 'map' }))}>
                Map
              </button>
            </>
          )}
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
            {st.prefs.now && !searching ? (
              <NowView st={st} />
            ) : (
            <>
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
            {searching && <SearchBar st={st} onClose={() => (setQuery(''), setSearching(false))} />}
            <Filters st={st} />
            {view === 'stories' && <StoriesView stories={stories} st={st} />}
            {view === 'wire' && <WireList items={items} st={st} />}
            {view === 'map' && (
              <Suspense fallback={<div className="intel-map" />}>
                <IntelMap stories={stories} live={st.live} lens={lens} />
                <p className="note map-note">
                  {lens === 'politics'
                    ? 'Circles: capitals, size by the stories that name their actors, white when one of them is confirmed. Lines: stories that name actors of two capitals, thicker for more stories. Tap a capital for its stories.'
                    : 'Circles: stories at the place most of their reports name, size by number of independent sources, white confirmed, blue reported or emerging, grey unverified. Dots: military aircraft, blue when a story names them, red squawk 7700. Tap a circle for its stories, a dot to open the aircraft in AIR.'}
                </p>
                {/* On a phone the places belong to the map, the tab Sources shows sources only. */}
                {!wide && <PlacesPanel st={st} onPick={() => setPrefs({ view: 'stories' })} />}
              </Suspense>
            )}
            </>
            )}
          </main>
        )}
        {(wide || tab !== 'main') && (
          <aside className="side">
            {(wide || tab === 'live') && <LivePanel st={st} />}
            {wide && <PlacesPanel st={st} onPick={() => setTab('main')} />}
            {(wide || tab === 'more') && <SourcesPanel st={st} />}
          </aside>
        )}
      </div>
    </div>
    </TranslateContext.Provider>
  );
}

function itemPasses(i: EnrichedItem, st: IntelState): boolean {
  const { filter, place, lens, actor } = st.prefs;
  if (!i.lens?.[lens]) return false;
  if (st.query.trim() && !searchMatches(i, st.query)) return false;
  if (place && !i.entities.places.some((p) => p.name === place)) return false;
  if (actor && !actorMatches(i, actor)) return false;
  if (filter === 'all') return true;
  if (filter === 'live') return i.matches.some(isStrong);
  const src = sourceById(i.sourceId);
  const chip = filtersOf(lens).find((f) => f.key === filter);
  return !!src && !!chip?.test?.(src.region, src.category);
}

/** Search: every word of the query in headline, excerpt, source, translations or named places and members. */
function searchMatches(i: EnrichedItem, query: string): boolean {
  const hay = [
    i.title,
    i.text,
    sourceName(i.sourceId),
    i.tr?.en?.title,
    i.tr?.de?.title,
    ...i.entities.places.map((p) => p.name),
    ...(i.entities.members ?? []),
    ...(i.entities.actors ?? []).map((a) => actorById(a)?.name),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
}

/** On a phone the top bar slides away while scrolling down and comes back when scrolling up. */
function useCollapsedHeader(enabled: boolean): boolean {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    if (!enabled) return setCollapsed(false);
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 8) return;
      setCollapsed(y > 120 && y > last);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [enabled]);
  return collapsed;
}

function SearchBar({ st, onClose }: { st: IntelState; onClose: () => void }) {
  return (
    <div className="searchbar">
      <input
        type="search"
        autoFocus
        value={st.query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        placeholder="Search reports, places, people, sources"
        aria-label="Search reports"
      />
      <button className="icon-btn" onClick={onClose} aria-label="Close search">
        ✕
      </button>
    </div>
  );
}

/**
 * An actor filter is an actor id, cap:<capital> for every actor of that capital, party:<fraction> for the members
 * of a fraction (named, or posting themselves) or mdb:<full name> for one member.
 */
function actorMatches(i: EnrichedItem, filter: string): boolean {
  const actors = i.entities.actors ?? [];
  const members = i.entities.members ?? [];
  if (filter.startsWith('cap:')) return capitalsOf(actors).includes(filter.slice(4) as CapitalId);
  if (filter.startsWith('party:')) {
    const p = filter.slice(6);
    return sourceById(i.sourceId)?.party === p || members.some((m) => memberParty(m) === p);
  }
  if (filter.startsWith('mdb:')) return sourceById(i.sourceId)?.name === filter.slice(4) || members.includes(filter.slice(4));
  return actors.includes(filter);
}
function actorLabel(filter: string): string {
  if (filter.startsWith('cap:')) return CAPITALS[filter.slice(4) as CapitalId]?.name ?? filter;
  if (filter.startsWith('party:')) return PARTIES[filter.slice(6) as PartyId]?.label ?? filter;
  if (filter.startsWith('mdb:')) return filter.slice(4);
  return actorById(filter)?.name ?? filter;
}

/** The report in the own words of an actor: Truth Social of Trump, a release of the government. */
const voiceOf = (i: EnrichedItem) => sourceById(i.sourceId)?.voice;
/** Politics lens, Signal: an original statement or at least two independent sources. */
const isSignal = (s: Story) => independentCount(s) >= 2 || s.items.some(voiceOf);
const inLens = (s: Story, lens: Lens) => storyInLens(s.items, lens);

/** Now and the two lenses. On a phone the switch sits compact in the top bar, so the stories start higher up. */
function LensSwitch({ st, compact }: { st: IntelState; compact?: boolean }) {
  const { lens, now } = st.prefs;
  // A new lens starts unfiltered: tiles, topic chips and actor filters of the other lens do not fit.
  const pick = (l: Lens) => (now || l !== lens) && setPrefs({ now: false, lens: l, pulse: null, filter: 'all', actor: null, place: null });
  const tab = (on: boolean, icon: string, label: string, onClick: () => void) => (
    <button role="tab" aria-selected={on} aria-label={label} className={on ? 'on' : ''} onClick={onClick}>
      <span aria-hidden>{icon}</span>
      {!compact || on ? ` ${label}` : ''}
    </button>
  );
  return (
    <div className={`lens ${compact ? 'compact' : ''}`} role="tablist" aria-label="Lens">
      {tab(now, '◉', 'Now', () => setPrefs({ now: true }))}
      {tab(!now && lens === 'security', '⚔', 'Security', () => pick('security'))}
      {tab(!now && lens === 'politics', '🏛', 'Politics', () => pick('politics'))}
    </div>
  );
}

/** Aircraft with a strong match, each once, with the newest item that names it. */
function liveMatches(st: IntelState): { match: Match; item: EnrichedItem }[] {
  const seen = new Map<string, { match: Match; item: EnrichedItem }>();
  for (const item of st.items) for (const m of item.matches) if (isStrong(m) && !seen.has(m.ac.hex)) seen.set(m.ac.hex, { match: m, item });
  return [...seen.values()];
}

function TopBar({ st, wide, searching, onSearch }: { st: IntelState; wide: boolean; searching: boolean; onSearch: () => void }) {
  const okSources = Object.values(st.sources).filter((s) => s.ok).length;
  const status = st.demo ? 'DEMO' : st.loading && !st.items.length ? 'LOADING' : okSources || st.items.length ? 'LIVE' : st.updated ? 'OFFLINE' : 'LOADING';
  return (
    <header className="topbar">
      <a className="brand" href="../" aria-label="VectorScope home">
        <span className="logo">◇</span>
        {wide && <span>VectorScope</span>}
        <span className="code">INTEL</span>
      </a>
      {!wide && <LensSwitch st={st} compact />}
      <span className="spacer" />
      <span className={`status status-${status.toLowerCase()}`} title={status}>
        <i /> {wide ? status : ''}
      </span>
      <button className={`icon-btn ${searching ? 'on' : ''}`} onClick={onSearch} aria-label={searching ? 'Close search' : 'Search'} aria-pressed={searching}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M15.5 15.5 20 20" />
        </svg>
      </button>
      <LangMenu st={st} />
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

/** Politics needs no topic chips of the security lens, but Europe as a region. */
const POLITICS_FILTERS: typeof FILTERS = [
  { key: 'all', label: 'All' },
  ...(['usa', 'dach', 'europe', 'russia', 'ukraine', 'mideast'] as Region[]).map((r) => ({ key: `r:${r}`, label: REGION_LABEL[r], test: (reg: Region) => reg === r })),
];
const filtersOf = (lens: Lens) => (lens === 'politics' ? POLITICS_FILTERS : FILTERS);

function Filters({ st }: { st: IntelState }) {
  const liveCount = st.stories.filter((s) => s.items.some((i) => i.matches.some(isStrong))).length;
  const politics = st.prefs.lens === 'politics';
  return (
    <>
      <div className="filters" role="toolbar" aria-label="Filter">
        {/* First, so they are visible on a phone: tapping a place, an actor or a capital sets them. */}
        {st.prefs.actor && (
          <button className="chip on place" onClick={() => setPrefs({ actor: null })} aria-label={`Remove actor filter ${actorLabel(st.prefs.actor)}`}>
            ◉ {actorLabel(st.prefs.actor)} ✕
          </button>
        )}
        {st.prefs.place && (
          <button className="chip on place" onClick={() => setPrefs({ place: null })} aria-label={`Remove place filter ${st.prefs.place}`}>
            ◎ {st.prefs.place} ✕
          </button>
        )}
        {politics && (
          // A switch with two sides, not a chip: it decides how much the list shows, the chips after it what.
          <span className="seg-mini" role="radiogroup" aria-label="Signal or everything">
            <button
              role="radio"
              aria-checked={st.prefs.signal}
              className={st.prefs.signal ? 'on' : ''}
              onClick={() => setPrefs({ signal: true })}
              title="Only stories with an original statement or at least two independent sources"
            >
              Signal
            </button>
            <button role="radio" aria-checked={!st.prefs.signal} className={st.prefs.signal ? '' : 'on'} onClick={() => setPrefs({ signal: false })} title="Every story">
              Everything
            </button>
          </span>
        )}
        {filtersOf(st.prefs.lens).map((f) => (
          <button
            key={f.key}
            className={`chip ${st.prefs.filter === f.key && !(f.key === 'all' && (st.prefs.place || st.prefs.actor)) ? 'on' : ''} ${f.key === 'live' ? 'chip-live' : ''}`}
            // All means everything: it also removes a place or actor filter.
            onClick={() => setPrefs(f.key === 'all' ? { filter: 'all', place: null, actor: null } : { filter: f.key })}
          >
            {f.key === 'live' && liveCount ? `${f.label} ${liveCount}` : f.label}
          </button>
        ))}
      </div>
      {/* Own row: at the end of the first row a desktop without touch could not reach them. */}
      {politics && (
        <div className="filters parties" role="toolbar" aria-label="Fractions of the Bundestag">
          <span className="filters-label">Bundestag</span>
          {PARTY_ORDER.filter((p) => p !== 'fl').map((p) => (
            <button
              key={p}
              className={`chip party ${st.prefs.actor === `party:${p}` ? 'on' : ''}`}
              style={{ '--party': PARTIES[p].color } as CSSProperties}
              onClick={() => setPrefs({ actor: st.prefs.actor === `party:${p}` ? null : `party:${p}`, pulse: null })}
              aria-pressed={st.prefs.actor === `party:${p}`}
              title={`Members of ${PARTIES[p].label}: their own posts and reports naming them`}
            >
              {PARTIES[p].label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function Empty({ st }: { st: IntelState }) {
  return (
    <div className="empty">
      {st.loading || !st.updated ? 'Loading sources …' : st.query.trim() ? `No report matches "${st.query.trim()}" in this lens and filter.` : st.prefs.filter === 'live' ? 'No report matches an aircraft in the air right now.' : 'Nothing here for this filter.'}
    </div>
  );
}

/* Stories */

const HOUR_MS = HOUR;

const isDecision = (i: EnrichedItem, now: number) => now - i.time < 24 * HOUR_MS && DECISION.test(i.title);

/** Which stories a pulse tile stands for. */
export function pulsePasses(s: Story, pulse: Pulse, now: number): boolean {
  if (pulse === 'originals') return s.items.some((i) => voiceOf(i) && now - i.time < 24 * HOUR_MS);
  if (pulse === 'decisions') return s.items.some((i) => isDecision(i, now));
  if (pulse === 'hour') return s.items.some((i) => now - i.time < HOUR_MS);
  if (pulse === 'unverified') return s.status === 'signal' || s.status === 'emerging';
  if (pulse === 'developing') return independentCount(s) >= 2 && now - s.last < 12 * HOUR_MS;
  if (pulse === 'alerts') return false;
  return true;
}

function Pulse({ st }: { st: IntelState }) {
  const now = Date.now();
  const lens = st.prefs.lens;
  const items = st.items.filter((i) => i.lens?.[lens]);
  const stories = st.stories.filter((s) => inLens(s, lens));
  const lastHour = items.filter((i) => now - i.time < HOUR);
  const unverified = lastHour.filter((i) => tierOf(i) === 'early' || tierOf(i) === 'perspective').length;
  const developing = stories.filter((s) => pulsePasses(s, 'developing', now)).length;
  const alerts = st.alerts.filter((i) => now - i.time < HOUR).length;
  const tile = (key: Exclude<Pulse, null>, n: number, text: string) => (
    <button className={st.prefs.pulse === key ? 'on' : ''} onClick={() => setPrefs({ pulse: st.prefs.pulse === key ? null : key })} aria-pressed={st.prefs.pulse === key}>
      <b>{count(n)}</b>
      <span>{text}</span>
    </button>
  );
  if (lens === 'politics') {
    const originals = items.filter((i) => voiceOf(i) && now - i.time < 24 * HOUR).length;
    const decisions = items.filter((i) => isDecision(i, now)).length;
    // The loudest actor: named in the most stories of the last 6 hours.
    const named = new Map<string, number>();
    for (const s of stories) {
      if (now - s.last > 6 * HOUR) continue;
      for (const a of new Set(s.items.flatMap((i) => i.entities.actors ?? []))) named.set(a, (named.get(a) ?? 0) + 1);
    }
    const [loud, loudN] = [...named.entries()].sort((a, b) => b[1] - a[1])[0] ?? [null, 0];
    return (
      <div className="pulse" aria-label="Pulse">
        {tile('originals', originals, 'original statements, 24 h')}
        {tile('decisions', decisions, 'decisions and rulings, 24 h')}
        {tile('developing', developing, 'developing stories')}
        <button className={loud && st.prefs.actor === loud ? 'on' : ''} disabled={!loud} onClick={() => loud && setPrefs({ actor: st.prefs.actor === loud ? null : loud, pulse: null })}>
          <b className="loud">{loud ? actorById(loud)?.name : '·'}</b>
          <span>{loud ? `loudest, in ${loudN} ${loudN === 1 ? 'story' : 'stories'}, 6 h` : 'no actor named, 6 h'}</span>
        </button>
      </div>
    );
  }
  return (
    <div className="pulse" aria-label="Pulse">
      {tile('hour', lastHour.length, 'reports last hour')}
      {tile('unverified', unverified, 'of them unverified')}
      {tile('developing', developing, 'developing stories')}
      {tile('alerts', alerts, 'air alerts Ukraine, last hour')}
    </div>
  );
}

/** Now: the five main stories of both lenses, below them the early reports nobody confirmed yet. */
function NowView({ st }: { st: IntelState }) {
  const tr = useTr();
  const now = Date.now();
  const top = useMemo(() => headlines(st.stories, now), [st.stories]);
  const early = useMemo(() => earlyReports(st.stories, now, new Set(top.map((h) => h.story.id))), [st.stories, top]);
  const air = airSituation(st.items, st.alerts, now);
  if (!st.stories.length) return <Empty st={st} />;
  const fresh = st.newSince > 0 && !st.demo ? top.filter((h) => h.story.first > st.newSince).length : 0;
  return (
    <section className="now">
      <h2 className="section-title">Now · the main stories</h2>
      {fresh > 0 && <p className="since">Since your last visit: {fresh === 1 ? '1 new main story' : `${fresh} new main stories`}</p>}
      <ol className="items">
        {top.map((h) => (
          <StoryCard key={h.story.id} story={h.story} st={st} headline={h} />
        ))}
      </ol>
      {/* Tracks, warnings and all-clears are live tracking, not news: one line instead of a dozen headlines. */}
      {(air.tracks > 0 || air.warnings > 0) && (
        <button className="air-line" onClick={() => setPrefs({ now: false, lens: 'security', pulse: 'alerts', filter: 'all', actor: null, place: null })}>
          <b>✈ Air situation, last hour</b>
          <span>
            {air.tracks} {air.tracks === 1 ? 'track' : 'tracks'} of the Ukrainian Air Force · {air.warnings} {air.warnings === 1 ? 'warning or all-clear' : 'warnings or all-clears'} of regions
          </span>
          <span className="air-open">Open ›</span>
        </button>
      )}
      <h2 className="section-title early-title">⚡ Early, unconfirmed</h2>
      {early.length ? (
        <ul className="early">
          {early.map((e) => {
            const src = sourceById(e.story.lead.sourceId);
            return (
              <li key={e.story.id}>
                <span className="age">{age(e.story.first)}</span>
                <span className="early-src">
                  {sourceName(e.story.lead.sourceId)}
                  {src?.perspective ? <i> · {src.perspective}</i> : null}
                </span>
                <a href={e.story.lead.url} target="_blank" rel="noopener noreferrer">
                  {tr(e.story.lead.title, e.story.lead.sourceId)}
                </a>
                <span className="early-why">
                  {e.lens === 'security' ? '⚔' : '🏛'} {e.why}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="note">Nothing fast and unconfirmed in the last two hours.</p>
      )}
      <p className="note">
        Main stories: weighed by confirmation, original statements, weight of the actors, severity, growth in the last hour and live aircraft, halving every three hours. Early: only early or partisan
        sources, two channels within 15 minutes or a severe event with a place. Not confirmed, read with care.
      </p>
    </section>
  );
}

function StoriesView({ stories: all, st }: { stories: Story[]; st: IntelState }) {
  const stories = useMemo(() => all.filter((s) => pulsePasses(s, st.prefs.pulse, Date.now())), [all, st.prefs.pulse]);
  const { developing, latest } = useMemo(() => rankStories(stories, Date.now()), [stories]);
  const bridges = useMemo(() => bridgesFor([...developing.slice(0, 12), ...latest.slice(0, 80)], st.stories, st.prefs.lens), [developing, latest, st.stories, st.prefs.lens]);
  if (!all.length) return <Empty st={st} />;
  return (
    <>
      <Pulse st={st} />
      {st.prefs.pulse === 'alerts' && st.prefs.lens === 'security' && <AlertsList st={st} />}
      {!stories.length && st.prefs.pulse !== 'alerts' && <div className="empty">No story for this tile right now.</div>}
      {developing.length > 0 && (
        <section>
          <h2 className="section-title">Developing, several sources</h2>
          <ol className="items">
            {developing.slice(0, 12).map((s) => (
              <StoryCard key={s.id} story={s} st={st} bridges={bridges.get(s.id)} />
            ))}
          </ol>
        </section>
      )}
      {latest.length > 0 && <section>
        <h2 className="section-title">Latest</h2>
        <ol className="items">
          {latest.slice(0, 80).map((s) => (
            <StoryCard key={s.id} story={s} st={st} bridges={bridges.get(s.id)} />
          ))}
        </ol>
      </section>}
    </>
  );
}

/** Drone and missile tracks of the Ukrainian Air Force, last 6 hours, newest first. */
function AlertsList({ st }: { st: IntelState }) {
  const tr = useTr();
  const now = Date.now();
  const recent = st.alerts.filter((i) => now - i.time < 6 * HOUR).sort((a, b) => b.time - a.time);
  return (
    <section>
      <h2 className="section-title">Air alerts Ukraine, last 6 hours</h2>
      {!recent.length && <div className="empty">No air alert in the last 6 hours.</div>}
      <ol className="items alerts">
        {recent.slice(0, 150).map((i) => (
          <li key={i.id} className="alert">
            <span className="age">{clock(i.time)}</span>
            <a href={i.url} target="_blank" rel="noopener noreferrer">
              {tr(i.title, i.sourceId)}
              {i.text ? ` ${tr(i.text, i.sourceId)}` : ''}
            </a>
          </li>
        ))}
      </ol>
      <p className="hint">Live tracking by the {sourceName('kpszsu')}. Tracks are not events, they do not form stories.</p>
    </section>
  );
}

const STATUS_LABEL: Record<Status, string> = { observed: 'Observed', signal: 'Signal', emerging: 'Emerging', official: 'Official', reported: 'Reported', confirmed: 'Confirmed' };
const STATUS_HINT: Record<Status, string> = {
  observed: 'seen by the VectorScope sensor in live flight data, nobody reported it yet',
  signal: 'one early or partisan source',
  emerging: 'several early or partisan sources',
  official: 'only an authority or the actor itself says so, nobody independent confirmed it yet',
  reported: 'specialist or OSINT source',
  confirmed: 'primary source or leading news medium',
};

function StoryCard({ story, st, bridges, headline }: { story: Story; st: IntelState; bridges?: { story: Story; key: string }[]; headline?: Headline }) {
  const [open, setOpen] = useState(false);
  const [why, setWhy] = useState(false);
  const original = story.items.find(voiceOf);
  const tr = useTr();
  const { lead } = story;
  const n = independentCount(story);
  const isNew = !st.demo && st.newSince > 0 && story.last > st.newSince;
  const strong = uniqueMatches(story.items.flatMap((i) => i.matches.filter(isStrong)));
  const entities = mergeEntities(story.items);
  const tiers = TIER_ORDER.filter((t) => story.tiers[t]);
  const kinds = [...new Set(story.items.map((i) => i.kind).filter((k) => !!k))] as NonNullable<EnrichedItem['kind']>[];
  const voices = (headline?.lens ?? st.prefs.lens) === 'politics' ? voicesOf(story.items) : [];
  return (
    <li className={`item story status-${story.status} ${strong.length ? 'has-live' : ''}`}>
      <div className="item-meta">
        {isNew && <span className="new-dot" aria-label="new" />}
        <span className={`status-chip s-${story.status}`} title={STATUS_HINT[story.status]}>
          {STATUS_LABEL[story.status]}
        </span>
        {kinds.map((k) => (
          <KindBadge key={k} kind={k} />
        ))}
        <span className="src">{n > 1 ? `${n} sources` : sourceName(lead.sourceId)}</span>
        {/* Quiet, with its meaning a tap away: the status says what it is, the percentage how sure. */}
        <button className="conf" onClick={() => setWhy(!why)} aria-expanded={why} title="Event confidence: tap for what it means">
          {pct(story.confidence)}
        </button>
        <span className="age">{age(story.last)}</span>
      </div>
      {headline && (
        <p className="headline-why">
          <button
            className="headline-lens"
            onClick={() => setPrefs({ now: false, lens: headline.lens, pulse: null, filter: 'all', actor: null, place: null })}
            title={`Open the ${headline.lens} lens`}
          >
            {headline.lens === 'security' ? '⚔ Security' : '🏛 Politics'} ›
          </button>
          {/* The number of sources stands in the line above already. */}
          {headline.why.filter((w) => !w.endsWith(' sources')).length > 0 && <span>{headline.why.filter((w) => !w.endsWith(' sources')).join(' · ')}</span>}
        </p>
      )}
      {why && (
        <p className="conf-why">
          <b>{STATUS_LABEL[story.status]}:</b> {STATUS_HINT[story.status]}. <b>{pct(story.confidence)}</b> is how sure the event is, from the classes and trust of{' '}
          {n === 1 ? 'its one source' : `its ${n} independent sources`}. It says nothing about who is right.
        </p>
      )}
      <a className="item-title" href={lead.url} target={lead.channel === 'sensor' ? undefined : '_blank'} rel="noopener noreferrer">
        {tr(lead.title, lead.sourceId)}
      </a>
      {original && (
        <div className="original">
          <div className="original-head">
            In the original · {sourceName(original.sourceId)} · {clock(original.time)}
          </div>
          <a className="original-quote" href={original.url} target="_blank" rel="noopener noreferrer">
            {tr(original.title, original.sourceId)}
          </a>
          {/* Translated whole, then shortened: the translations of the collector belong to the whole excerpt. */}
          {original.text && <p>{clip(tr(original.text, original.sourceId), 260)}</p>}
        </div>
      )}
      {lead.text && story.sources.length === 1 && !original && <p className="item-text">{tr(lead.text, lead.sourceId)}</p>}
      {voices.length > 0 && <Voices voices={voices} />}
      {story.sources.length > 1 && (
        <>
          {/* The dots on an axis only when the reports are open, closed one line says the same. */}
          {open ? (
            <Timeline story={story} />
          ) : (
            <p className="span-line">
              {clock(story.first)} to {clock(story.last)} · {story.items.length} reports
            </p>
          )}
          <div className="ladder">
            {tiers.map((t) => (
              <span key={t} className={`tier t-${t}`}>
                {story.tiers[t]} {tierLabel(t).toLowerCase()}
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
      {(entities.callsigns.length > 0 || entities.types.length > 0 || entities.places.length > 0 || entities.actors.length > 0 || (!voices.length && entities.members.length > 0)) && (
        <div className="entities">
          {entities.actors.slice(0, 4).map((a) => (
            <button key={a} className="ent ent-actor" onClick={() => setPrefs({ actor: a, filter: 'all', pulse: null })}>
              {actorById(a)?.name ?? a}
            </button>
          ))}
          {/* In the politics lens the members are in "Who says what". */}
          {!voices.length && entities.members.slice(0, 3).map((m) => <MemberChip key={m} name={m} />)}
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
      {bridges?.map(({ story: b, key }) => (
        <button
          key={b.id}
          className="bridge"
          onClick={() =>
            setPrefs({
              lens: st.prefs.lens === 'security' ? 'politics' : 'security',
              pulse: null,
              filter: 'all',
              ...(key.startsWith('a:') ? { actor: key.slice(2), place: null } : { place: key.slice(2), actor: null }),
            })
          }
        >
          <span className="bridge-lens">{st.prefs.lens === 'security' ? '🏛 Politics' : '⚔ Security'}</span>{' '}
          <span className="bridge-why">via {key.startsWith('a:') ? `◉ ${actorById(key.slice(2))?.name ?? key.slice(2)}` : `◎ ${key.slice(2)}`}:</span> {tr(b.lead.title, b.lead.sourceId)}
        </button>
      ))}
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
                  {i.kind && <span title={KIND_LABEL[i.kind].en}>{KIND_LABEL[i.kind].icon}</span>}
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

function KindBadge({ kind }: { kind: NonNullable<EnrichedItem['kind']> }) {
  return (
    <span className={`kind k-${kind}`}>
      {KIND_LABEL[kind].icon} {KIND_LABEL[kind].en}
    </span>
  );
}

function PartyTag({ party }: { party: PartyId }) {
  return (
    <span className="party-tag" style={{ '--party': PARTIES[party].color } as CSSProperties}>
      {PARTIES[party].label}
    </span>
  );
}

/** A member of the Bundestag in the colour of the fraction, tapping filters for the member. */
function MemberChip({ name }: { name: string }) {
  const p = memberParty(name);
  return (
    <button
      className="ent ent-member"
      style={p ? ({ '--party': PARTIES[p].color } as CSSProperties) : undefined}
      onClick={() => setPrefs({ actor: `mdb:${name}`, filter: 'all', pulse: null })}
      title={p ? `${name}, ${PARTIES[p].label}` : name}
    >
      {shortName(name)}
    </button>
  );
}

/** Who says what: one row per fraction, members with an own post first and marked. Tapping a fraction filters for it. */
function Voices({ voices }: { voices: ReturnType<typeof voicesOf> }) {
  return (
    <div className="voices">
      <span className="voices-head" title="Filled: posted about it themselves. Outlined: named in a report">
        Who says what
      </span>
      {voices.map((v) => {
        const names = [...v.own, ...v.named];
        return (
          <span key={v.party} className="voice" style={{ '--party': PARTIES[v.party].color } as CSSProperties}>
            <button className="voice-party" onClick={() => setPrefs({ actor: `party:${v.party}`, filter: 'all', pulse: null })}>
              {PARTIES[v.party].label}
            </button>
            {names.slice(0, 3).map((n) => (
              <button
                key={n}
                className={`voice-name ${v.own.includes(n) ? 'own' : ''}`}
                onClick={() => setPrefs({ actor: `mdb:${n}`, filter: 'all', pulse: null })}
                title={v.own.includes(n) ? `${n} posted about it` : `${n} is named`}
              >
                {shortName(n)}
              </button>
            ))}
            {names.length > 3 && <span className="voice-more">+{names.length - 3}</span>}
          </span>
        );
      })}
      {voices.some((v) => v.own.length) && voices.some((v) => v.named.length) && <span className="voices-legend">filled: own post · outlined: named</span>}
    </div>
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
  const actors = new Map<string, number>();
  for (const i of items) for (const a of i.entities.actors ?? []) actors.set(a, (actors.get(a) ?? 0) + 1);
  const callsigns = new Set<string>();
  const types = new Set<string>();
  const places = new Map<string, number>();
  const members = new Set<string>();
  for (const i of items) (i.entities.members ?? []).forEach((m) => members.add(m));
  for (const i of items) {
    i.entities.callsigns.forEach((c) => callsigns.add(c.callsign));
    i.entities.types.forEach((t) => types.add(t.label));
    i.entities.places.forEach((p) => places.set(p.name, Math.min(places.get(p.name) ?? Infinity, p.radiusKm)));
  }
  return {
    callsigns: [...callsigns],
    types: [...types],
    places: [...places.entries()].sort((a, b) => a[1] - b[1]).map(([n]) => n),
    actors: [...actors.entries()].sort((a, b) => b[1] - a[1]).map(([a]) => a),
    members: [...members],
  };
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

const CHANNEL_LABEL = { bluesky: 'Bluesky', rss: 'RSS', telegram: 'Telegram', sensor: 'ADS-B', api: 'API' } as const;

function ItemCard({ item, isNew }: { item: EnrichedItem; isNew: boolean }) {
  const tr = useTr();
  const src = sourceById(item.sourceId);
  const strong = item.matches.filter(isStrong);
  const weak = item.matches.filter((m) => !isStrong(m));
  const { callsigns, types, places } = item.entities;
  const members = item.entities.members ?? [];
  return (
    <li className={`item ${strong.length ? 'has-live' : ''}`}>
      <div className="item-meta">
        {isNew && <span className="new-dot" aria-label="new" />}
        {item.kind && <KindBadge kind={item.kind} />}
        <span className="src">{src?.name ?? 'Demo'}</span>
        {src?.party && <PartyTag party={src.party} />}
        {src && <span className={`tier t-${src.tier}`}>{tierLabel(src.tier)}</span>}
        <span className="sep">·</span>
        <span>{CHANNEL_LABEL[item.channel]}</span>
        <span className="age">{age(item.time)}</span>
      </div>
      <a className="item-title" href={item.url} target={item.channel === 'sensor' ? undefined : '_blank'} rel="noopener noreferrer">
        {tr(item.title, item.sourceId)}
      </a>
      {item.text && <p className="item-text">{tr(item.text, item.sourceId)}</p>}
      {(callsigns.length > 0 || types.length > 0 || places.length > 0 || members.length > 0) && (
        <div className="entities">
          {members.slice(0, 4).map((m) => (
            <MemberChip key={m} name={m} />
          ))}
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

interface SourceGroup {
  key: string;
  title: string;
  sources: Source[];
}

/** The source list grows with every lens: groups by lens and class, members of parliament by fraction. */
function sourceGroups(): SourceGroup[] {
  const groups: SourceGroup[] = [];
  const add = (key: string, title: string, sources: Source[]) => sources.length && groups.push({ key, title, sources });
  const security = SOURCES.filter((s) => s.category !== 'politics');
  for (const t of TIER_ORDER) add(`s:${t}`, `Security · ${TIER_LABEL[t].en}`, security.filter((s) => s.tier === t));
  const politics = SOURCES.filter((s) => s.category === 'politics');
  add('p:voices', 'Politics · Own voices', politics.filter((s) => s.voice && !s.party));
  for (const p of PARTY_ORDER) add(`p:party:${p}`, `Politics · Members of the Bundestag · ${PARTIES[p].label}`, politics.filter((s) => s.party === p));
  add('p:official', 'Politics · Parliament and government', politics.filter((s) => !s.voice && !s.party && s.tier === 'primary'));
  add('p:media', 'Politics · Media', politics.filter((s) => !s.voice && !s.party && s.tier !== 'primary'));
  return groups;
}

function SourceRow({ s, st }: { s: Source; st: IntelState }) {
  const status = st.sources[s.id];
  const viaCollector = s.collectorOnly;
  return (
    <li>
      <span className={`dot ${viaCollector ? 'via' : !status ? '' : status.ok ? 'ok' : 'err'}`} />
      <span className="src-name">
        <a href={s.site} target="_blank" rel="noopener noreferrer">
          {s.name}
        </a>
        <span className={`src-meta ${status && !status.ok && !viaCollector ? 'err' : ''}`}>
          {status && !status.ok && !viaCollector
            ? `Not reachable: ${status.error ?? 'unknown error'}`
            : `${REGION_LABEL[s.region]} · trust ${s.trust}${s.perspective ? ` · ${s.perspective}` : ''}${s.party ? ` · ${PARTIES[s.party].label}` : ''}${viaCollector ? ' · through the collector' : ''}`}
        </span>
      </span>
      <span className={`tier t-${s.tier}`}>{tierLabel(s.tier)}</span>
      <span className="n">{status?.newest ? age(status.newest) : status && !status.ok && !viaCollector ? 'error' : ''}</span>
    </li>
  );
}

/** A network (Rybar and its regional channels) is one row that opens to its channels. */
function SourceList({ sources, st }: { sources: Source[]; st: IntelState }) {
  const [openNet, setOpenNet] = useState<string | null>(null);
  const rows: (Source | { net: string; members: Source[] })[] = [];
  const seen = new Set<string>();
  for (const s of sources) {
    if (!s.network) rows.push(s);
    else if (!seen.has(s.network)) {
      seen.add(s.network);
      const members = sources.filter((x) => x.network === s.network);
      rows.push(members.length > 1 ? { net: s.network, members } : s);
    }
  }
  return (
    <ul className="sources">
      {rows.map((r) =>
        'members' in r ? (
          <li key={`net:${r.net}`} className="net">
            <button className="net-head" onClick={() => setOpenNet(openNet === r.net ? null : r.net)} aria-expanded={openNet === r.net}>
              <span className={`dot ${r.members.every((m) => st.sources[m.id]?.ok) ? 'ok' : r.members.some((m) => st.sources[m.id] && !st.sources[m.id].ok) ? 'err' : ''}`} />
              <span className="src-name">
                {r.members[0].name.split(/[ (,]/)[0]} network
                <span className="src-meta">{r.members.length} channels, counted as one source</span>
              </span>
              <span className="n">{openNet === r.net ? '▴' : '▾'}</span>
            </button>
            {openNet === r.net && (
              <ul className="sources">
                {r.members.map((m) => (
                  <SourceRow key={m.id} s={m} st={st} />
                ))}
              </ul>
            )}
          </li>
        ) : (
          <SourceRow key={r.id} s={r} st={st} />
        ),
      )}
    </ul>
  );
}

function SourcesPanel({ st }: { st: IntelState }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const groups = useMemo(sourceGroups, []);
  const live = SOURCES.filter((s) => !s.collectorOnly);
  const failing = live.filter((s) => st.sources[s.id] && !st.sources[s.id].ok);
  const ok = live.filter((s) => st.sources[s.id]?.ok).length;
  const q = query.trim().toLowerCase();
  const found = q ? SOURCES.filter((s) => `${s.name} ${s.id} ${REGION_LABEL[s.region]} ${s.perspective ?? ''} ${s.party ? PARTIES[s.party].label : ''}`.toLowerCase().includes(q)) : [];
  const newest = (list: Source[]) => Math.max(0, ...list.map((s) => st.sources[s.id]?.newest ?? 0));
  return (
    <section className="panel">
      <h2 className="section-title">Sources</h2>
      <p className="src-summary">
        <b>{SOURCES.length}</b> sources · <b>{ok}</b> answering{failing.length ? <> · <b className="bad">{failing.length}</b> not reachable</> : null}
        {SOURCES.length > live.length ? ` · ${SOURCES.length - live.length} through the collector` : ''}
      </p>
      <input className="src-search" type="search" placeholder="Find a source, region or party" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Find a source" />
      {q ? (
        found.length ? <SourceList sources={found} st={st} /> : <p className="note">No source matches.</p>
      ) : (
        <>
          {failing.length > 0 && (
            <div className="src-group open">
              <h3 className="src-group-head bad">Needs attention · {failing.length}</h3>
              <SourceList sources={failing} st={st} />
            </div>
          )}
          {groups.map((g) => {
            const okN = g.sources.filter((s) => st.sources[s.id]?.ok).length;
            const errN = g.sources.filter((s) => !s.collectorOnly && st.sources[s.id] && !st.sources[s.id].ok).length;
            const isOpen = open === g.key;
            const n = newest(g.sources);
            return (
              <div key={g.key} className={`src-group ${isOpen ? 'open' : ''}`}>
                <button className="src-group-head" onClick={() => setOpen(isOpen ? null : g.key)} aria-expanded={isOpen}>
                  <span className={`dot ${errN ? 'err' : okN ? 'ok' : g.sources.every((s) => s.collectorOnly) ? 'via' : ''}`} />
                  <span className="g-title">{g.title}</span>
                  <span className="g-meta">
                    {g.sources.length}
                    {n ? ` · ${age(n)}` : ''}
                  </span>
                  <span className="n">{isOpen ? '▴' : '▾'}</span>
                </button>
                {isOpen && <SourceList sources={g.sources} st={st} />}
              </div>
            );
          })}
        </>
      )}
      <p className="note">
        {st.collectedAt ? `Collector last ran ${ago(st.collectedAt)}. ` : ''}Headlines and short excerpts link to the original publisher. Live aircraft © adsb.lol contributors, ODbL.
      </p>
      {st.prefs.reports !== 'original' && (
        <p className="note">Translations by Google Translate (unofficial), made once by the collector, recent reports on this device.</p>
      )}
      <p className="note version">VectorScope INTEL v{__APP_VERSION__}</p>
    </section>
  );
}
