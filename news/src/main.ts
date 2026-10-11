// NEWS: the edition of the collector (collector/news.ts) as a news app. Stories instead of articles, the
// perspectives of many outlets side by side, controls only in the thumb zone. Plain TypeScript, no framework:
// the page is a list of cards, a sheet and a briefing.
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/newsreader/500.css';
import '@fontsource/newsreader/600.css';
import '../../shared/tokens.css';
import './styles.css';
import { DACH } from './data/feeds';
import type { Edition, Lead, MsgLang, Story, StorySource } from './data/types';
import { RESSORT_IDS, TEXT, type RessortId, type UiLang } from './i18n';

// The edition comes from the own server, which collects it (server/collector-loop.mjs). ?data= points elsewhere,
// for development against a copy.
const DATA_URL = new URLSearchParams(location.search).get('data') ?? new URL('../data/news.json', location.href).href;
const TOP_N = 6;
const REFRESH_MS = 5 * 60_000;
/** An edition older than this is shown with a notice. */
const STALE_MS = 45 * 60_000;

type View = 'calm' | 'pics';
type Persp = 'dach' | 'world';

const store = {
  get<T>(k: string, d: T): T {
    try {
      const v = localStorage.getItem('vectorscope.news.' + k);
      return v == null ? d : (JSON.parse(v) as T);
    } catch {
      return d;
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem('vectorscope.news.' + k, JSON.stringify(v));
    } catch {}
  },
};

// First visit: follow the device language. A friend abroad gets English and the world perspective.
const DEVICE_DE = /^de\b/i.test(navigator.language || 'de');
const state = {
  ressort: 'top' as RessortId,
  view: store.get<View>('view', 'calm'),
  ui: store.get<UiLang>('ui', DEVICE_DE ? 'de' : 'en'),
  msg: store.get<MsgLang>('msg', DEVICE_DE ? 'de' : 'en'),
  persp: store.get<Persp>('persp', DEVICE_DE ? 'dach' : 'world'),
  seen: new Set(store.get<string[]>('seen', [])),
  selected: null as string | null,
  edition: null as Edition | null,
  pending: null as Edition | null,
  offline: false,
};
/** The last visit and how many sources each story had then: what is new, what has grown. */
const LAST_VISIT = store.get<number>('visit', 0);
const COUNTS = store.get<Record<string, number>>('counts', {});

const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as T;
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const wide = () => matchMedia('(min-width: 760px)').matches;
const t = () => TEXT[state.ui];
const ed = () => state.edition!;

const fmtTime = (ms: number) => new Intl.DateTimeFormat(t().locale, { hour: '2-digit', minute: '2-digit' }).format(ms);
function ago(ms: number) {
  const m = Math.round((Date.now() - ms) / 60000);
  if (m < 60) return t().min(Math.max(m, 1));
  const h = Math.round(m / 60);
  if (h < 24) return t().hrs(h);
  return h < 48 ? t().yesterday : t().days(Math.round(h / 24));
}

// ---------- Reading the edition ----------

const lead = (s: Story): Lead => s.lead[state.msg];
const H = (s: Story) => lead(s).head;
const S = (s: Story) => lead(s).sum;
const HL = (s: Story) => lead(s).lang;
const ST = (x: StorySource) => (state.msg === 'orig' ? x.orig : x[state.msg] || x.orig);
const TR = (x: StorySource) => state.msg !== 'orig' && x.lang !== state.msg && !!x[state.msg];
const dachCount = (s: Story) => s.sources.filter((x) => DACH.includes(x.cc) && x.group !== 'intl').length;
const intlCount = (s: Story) => s.sources.length - dachCount(s);
const scoreOf = (s: Story) => (state.persp === 'dach' ? s.score : s.worldScore);
const isNew = (s: Story) => s.first > (LAST_VISIT || Date.now() - 2 * 3600_000) && !state.seen.has(s.id);
const grew = (s: Story) => (COUNTS[s.id] && !state.seen.has(s.id) ? Math.max(0, s.sources.length - COUNTS[s.id]) : 0);
const order = (list: Story[]) => [...list].sort((a, b) => Number(isNew(b)) - Number(isNew(a)) || scoreOf(b) - scoreOf(a));

function topList() {
  return [...ed().stories].sort((a, b) => scoreOf(b) - scoreOf(a)).slice(0, TOP_N);
}
/** From DACH: big in the world, no DACH source. From the world: big in DACH, no international source. */
function otherList() {
  const top = new Set(topList());
  return ed()
    .stories.filter((s) => !top.has(s) && (state.persp === 'dach' ? dachCount(s) === 0 && intlCount(s) >= 2 : intlCount(s) === 0 && dachCount(s) >= 2))
    .sort((a, b) => b.sources.length - a.sources.length || b.time - a.time)
    .slice(0, 20);
}
function inRessort(r: RessortId): Story[] {
  if (r === 'anders') return otherList();
  const top = new Set(topList());
  return order(ed().stories.filter((s) => s.ressort === r && !top.has(s))).slice(0, 30);
}
const findStory = (id: string) => ed().stories.find((s) => s.id === id);

// ---------- Pieces ----------

const ccs = (s: Story) => `<span class="cc">${s.countries.slice(0, 6).map((c) => `<span>${esc(c)}</span>`).join('')}</span>`;
function metaLine(s: Story, cc = false) {
  const n = s.sources.length;
  const parts: string[] = [];
  if (isNew(s)) parts.push(`<span class="dot" aria-label="${t().isNew}"></span>`);
  if (n > 1) parts.push(`<span>${t().sources(n)} · ${t().countries(s.countries.length)}</span>`);
  else parts.push(`<span>${esc(s.sources[0].outlet)}</span>`);
  if (grew(s)) parts.push(`<span class="grew">${t().plus(grew(s))}</span>`);
  parts.push(`<span class="sep">·</span><span>${ago(s.time)}</span>`);
  if (cc && n > 1) parts.push(ccs(s));
  return `<div class="meta">${parts.join('')}</div>`;
}
const img = (s: Story, cls: string, lazy = true) =>
  s.img ? `<img class="${cls}" src="${esc(s.img.url)}" alt="" referrerpolicy="no-referrer" ${lazy ? 'loading="lazy"' : ''} onerror="this.remove()">` : '';
const headHtml = (s: Story, tag: string) => `<${tag} class="head" lang="${HL(s)}">${esc(H(s))}</${tag}>`;
const sumHtml = (s: Story) => (S(s) ? `<p class="sum" lang="${HL(s)}">${esc(S(s))}</p>` : '');
const viaHtml = (s: Story) => `<p class="via">${esc(t().via(lead(s).outlet, lead(s).translated, state.msg === 'orig'))}</p>`;

function rowHtml(s: Story, rank?: number) {
  return `<button class="row story" data-id="${esc(s.id)}">${rank ? `<span class="rank">${rank}</span>` : ''}<div class="txt">${metaLine(s)}${headHtml(s, 'h3')}</div>${img(s, 'thumb')}</button>`;
}
function scardHtml(s: Story) {
  const outlets = [...new Set(s.sources.map((x) => x.outlet))].slice(0, 3).join(', ');
  const badge = state.persp === 'world' ? t().intl(intlCount(s)) : t().dach(dachCount(s));
  return `<button class="scard story" data-id="${esc(s.id)}">${s.img ? img(s, '') : '<div class="noimg"></div>'}<div class="sbody"><div class="meta">${isNew(s) ? '<span class="dot"></span>' : ''}<span>${esc(outlets)}</span></div>${headHtml(s, 'h3')}<div class="dach">${badge}</div></div></button>`;
}

// ---------- Stream ----------

function renderList(dir?: number) {
  const list = $('#list');
  if (!state.edition) {
    list.innerHTML = `<div class="state"><p>${t().loading}</p></div>`;
    return;
  }
  const r = state.ressort;
  const label = t().ressorts[r];
  const stamp = new Intl.DateTimeFormat(t().locale, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(ed().at);
  let html = `<div class="masthead"><b>NEWS</b><span class="when">${stamp} · ${t().sources(ed().outlets)} · ${t().countries(ed().countries)}</span></div>`;
  if (state.offline || Date.now() - ed().at > STALE_MS) html += `<p class="stale">${state.offline ? t().offline : t().edition(ago(ed().at))}</p>`;
  const items = inRessort(r);
  const sub = r === 'anders' && state.persp === 'world' ? t().subOtherWorld : (t().sub[r] ?? t().stories(items.length));
  html += `<h1 class="ressort-title">${label}</h1><p class="ressort-sub">${sub}</p>`;

  if (r === 'top') {
    const top = topList();
    const first = top[0];
    if (first) html += `<button class="story lead" data-id="${esc(first.id)}">${img(first, '', false)}${metaLine(first, true)}${headHtml(first, 'h2')}${sumHtml(first)}${viaHtml(first)}</button>`;
    top.slice(1, 3).forEach((s, i) => (html += rowHtml(s, i + 2)));
    const others = otherList();
    if (others.length)
      html += `<section class="other"><div class="section-label"><span>${t().other}</span><button data-go="anders">${t().all(others.length)}</button></div><p class="other-sub">${state.persp === 'world' ? t().otherSubWorld : t().otherSub}</p><div class="strip">${others.slice(0, 10).map(scardHtml).join('')}</div></section>`;
    top.slice(3).forEach((s, i) => (html += rowHtml(s, i + 4)));
  } else if (!items.length) {
    html += `<div class="state"><p>${t().empty}</p></div>`;
  } else {
    const firstOld = items.findIndex((s) => !isNew(s));
    items.forEach((s, i) => {
      if (i === firstOld && firstOld > 0 && LAST_VISIT) html += `<div class="read-line">${t().readLine} · ${fmtTime(LAST_VISIT)}</div>`;
      html += rowHtml(s);
    });
  }
  const idx = RESSORT_IDS.indexOf(r);
  const next = RESSORT_IDS[(idx + 1) % RESSORT_IDS.length];
  html += `<div class="end"><h3 class="head">${t().upToDate}</h3><p>${r === 'top' ? t().endTop : t().endRes(label)}</p><button class="btn primary" data-go="${next}">${t().next}: ${t().ressorts[next]}</button></div>`;
  list.innerHTML = html;
  list.classList.remove('slide-l', 'slide-r');
  if (dir) {
    void list.offsetWidth;
    list.classList.add(dir > 0 ? 'slide-l' : 'slide-r');
  }
  document.body.classList.toggle('pics', state.view === 'pics');
  markSelected();
}

function renderChips() {
  const chip = (r: RessortId) => {
    const hasNew = r !== 'top' && !!state.edition && inRessort(r).some(isNew);
    return `<button class="chip${state.ressort === r ? ' on' : ''}" role="tab" aria-selected="${state.ressort === r}" data-go="${r}">${t().ressorts[r]}${hasNew ? `<span class="n" aria-label="${t().isNew}"></span>` : ''}</button>`;
  };
  $('#chips').innerHTML = RESSORT_IDS.map(chip).join('');
  $('#navSide').innerHTML = `<div class="brand">NEWS</div>${RESSORT_IDS.map(chip).join('')}<div class="grow"></div><div class="side-btns"><button class="btn primary" data-act="brief">${t().brief}</button><button class="btn" data-act="settings">${t().settings}</button></div>`;
  document.documentElement.lang = state.ui;
  $('#briefLabel').textContent = t().briefShort;
  $('#briefBtn').setAttribute('aria-label', t().brief);
  $('#setBtn').setAttribute('aria-label', t().settings);
  document.querySelector('#chips .chip.on')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
}

function go(r: RessortId, dir?: number) {
  if (r === state.ressort || !state.edition) return;
  const a = RESSORT_IDS.indexOf(state.ressort);
  const b = RESSORT_IDS.indexOf(r);
  state.ressort = r;
  renderChips();
  renderList(dir ?? (b > a ? 1 : -1));
  (wide() ? $('#stream') : document.scrollingElement!).scrollTo({ top: 0 });
  if (wide()) openStory(firstStory(), false);
}
const firstStory = () => (document.querySelector('#list .story') as HTMLElement | null)?.dataset.id ?? null;

// ---------- Story detail: a sheet on the phone, a column on the iPad ----------

function detailHtml(s: Story) {
  const tr = (x: StorySource) => (TR(x) ? `<div class="orig"><span class="trl">${t().translated}</span> · ${esc(x.orig)}</div>` : '');
  const persp = s.sources
    .slice(0, 12)
    .map((x) => `<a class="pcard" href="${esc(x.link)}" target="_blank" rel="noopener"><div class="who"><span class="cc-badge">${esc(x.cc)}</span><strong>${esc(x.outlet)}</strong><span class="t">${fmtTime(x.time)}</span></div><div class="tt" lang="${TR(x) ? state.msg : x.lang}">${esc(ST(x))}</div>${tr(x)}<div class="go">${t().read} ↗</div></a>`)
    .join('');
  const byGroup: Record<string, StorySource[]> = {};
  s.sources.forEach((x) => (byGroup[x.group] ??= []).push(x));
  const groups = Object.keys(t().groups)
    .filter((g) => byGroup[g])
    .map((g) => `<div class="group"><h4>${t().groups[g]}</h4>${byGroup[g].map((x) => `<a href="${esc(x.link)}" target="_blank" rel="noopener"><span class="o">${esc(x.outlet)}</span><span class="x">${esc(ST(x))}${TR(x) ? ` <span class="trl">${t().translated}</span>` : ''}</span><span class="t">${fmtTime(x.time)}</span></a>`).join('')}</div>`)
    .join('');
  const where = s.countries.map((c) => t().country[c] ?? c).join(', ');
  return `<article class="detail-view">${img(s, 'hero', false)}${s.img ? `<div class="credit">${t().photo}: ${esc(s.img.credit)}</div>` : ''}${metaLine(s)}${headHtml(s, 'h2')}${sumHtml(s)}${viaHtml(s)}
    <div class="section-label"><span>${s.sources.length > 1 ? t().report : t().source}</span></div><p class="where">${esc(where)}</p>
    <div class="persp">${persp}</div>
    ${s.sources.length > 2 ? `<div class="section-label"><span>${t().allSources}</span></div><div class="groups">${groups}</div>` : ''}</article>`;
}

function openStory(id: string | null, user = true) {
  const s = id ? findStory(id) : undefined;
  if (!s) return;
  state.selected = s.id;
  if (wide()) {
    $('#detail').innerHTML = detailHtml(s);
    $('#detail').scrollTo({ top: 0 });
    markSelected();
    if (user) markSeen(s.id);
    return;
  }
  $('#sheetBody').innerHTML = detailHtml(s);
  $('#sheetBody').scrollTop = 0;
  const main = s.sources.find((x) => x.outlet === lead(s).outlet) ?? s.sources[0];
  $('#sheetBar').innerHTML = `<button class="btn" data-act="close">${t().close}</button><a class="btn primary" href="${esc(main.link)}" target="_blank" rel="noopener">${t().read} ↗</a>`;
  showSheet('half');
  markSeen(s.id);
}
function markSeen(id: string) {
  state.seen.add(id);
  store.set('seen', [...state.seen]);
  setTimeout(() => {
    renderChips();
    document.querySelectorAll<HTMLElement>(`.story[data-id="${CSS.escape(id)}"] .meta`).forEach((m) => {
      const s = findStory(id);
      if (s && !m.closest('.scard')) m.outerHTML = metaLine(s, m.closest('.lead') != null);
    });
  }, 350);
}
function markSelected() {
  document.querySelectorAll('.story.sel').forEach((e) => e.classList.remove('sel'));
  if (wide() && state.selected) document.querySelectorAll(`.story[data-id="${CSS.escape(state.selected)}"]`).forEach((e) => e.classList.add('sel'));
}

// ---------- Sheet ----------

const sheet = $('#sheet');
const scrim = $('#scrim');
function showSheet(mode: 'half' | 'full') {
  sheet.hidden = false;
  scrim.hidden = false;
  requestAnimationFrame(() => {
    sheet.className = `sheet ${mode}`;
    scrim.classList.add('on');
  });
  document.body.style.overflow = 'hidden';
}
function closeSheet() {
  sheet.className = 'sheet';
  scrim.classList.remove('on');
  document.body.style.overflow = '';
  setTimeout(() => {
    if (!sheet.classList.contains('half') && !sheet.classList.contains('full')) {
      sheet.hidden = true;
      scrim.hidden = true;
    }
  }, 330);
}
(function dragSheet() {
  let y0: number | null = null;
  let h0 = 0;
  let moved = 0;
  sheet.addEventListener('touchstart', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('.persp')) return;
    if (target.closest('#sheetBody') && $('#sheetBody').scrollTop > 0) return;
    y0 = e.touches[0].clientY;
    moved = 0;
    h0 = sheet.getBoundingClientRect().height;
  }, { passive: true });
  sheet.addEventListener('touchmove', (e) => {
    if (y0 == null) return;
    moved = e.touches[0].clientY - y0;
    // Pulling up in a full sheet scrolls its content instead.
    if (sheet.classList.contains('full') && moved < 0) {
      y0 = null;
      return;
    }
    e.preventDefault();
    sheet.classList.add('dragging');
    const max = innerHeight - 56 - $('.shield').offsetHeight;
    sheet.style.height = Math.min(max, Math.max(80, h0 - moved)) + 'px';
  }, { passive: false });
  sheet.addEventListener('touchend', () => {
    if (y0 == null) return;
    y0 = null;
    sheet.classList.remove('dragging');
    sheet.style.height = '';
    if (Math.abs(moved) < 8) return;
    if (moved > 90) {
      if (sheet.classList.contains('full') && moved < 280) showSheet('half');
      else closeSheet();
    } else if (moved < -40) showSheet('full');
  });
  $('#grip').addEventListener('click', () => showSheet(sheet.classList.contains('full') ? 'half' : 'full'));
})();
scrim.addEventListener('click', closeSheet);

// ---------- Swipe between sections ----------

(function swipe() {
  let x0: number | null = null;
  let y0 = 0;
  let t0 = 0;
  const el = $('#stream');
  el.addEventListener('touchstart', (e) => {
    x0 = e.touches[0].clientX;
    y0 = e.touches[0].clientY;
    t0 = Date.now();
  }, { passive: true });
  el.addEventListener('touchend', (e) => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0;
    const dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if ((e.target as HTMLElement).closest('.strip')) return;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6 && Date.now() - t0 < 700) {
      const i = RESSORT_IDS.indexOf(state.ressort);
      const j = dx < 0 ? Math.min(i + 1, RESSORT_IDS.length - 1) : Math.max(i - 1, 0);
      if (j !== i) go(RESSORT_IDS[j], dx < 0 ? 1 : -1);
    }
  });
})();

// ---------- Briefing: two minutes, one story per screen ----------

let bIdx = 0;
let bTimer: ReturnType<typeof setTimeout> | undefined;
let bList: Story[] = [];
function openBrief() {
  if (!state.edition) return;
  closeSheet();
  bList = [...topList(), ...(['dach', 'welt', 'wirtschaft', 'tech'] as RessortId[]).map((r) => inRessort(r)[0])].filter(Boolean).slice(0, 10);
  bIdx = 0;
  $('#brief').hidden = false;
  document.body.style.overflow = 'hidden';
  renderBrief();
}
function renderBrief() {
  clearTimeout(bTimer);
  const done = bIdx >= bList.length;
  const s = bList[bIdx];
  const slide = done
    ? `<div class="slide final"><h2 class="head">${t().upToDate}</h2><p class="sum">${t().briefDone(bList.length, new Set(bList.flatMap((x) => x.sources.map((y) => y.outlet))).size)}</p></div>`
    : `<div class="slide">${img(s, '', false)}${metaLine(s, true)}${headHtml(s, 'h2')}${sumHtml(s)}</div>`;
  const bars = bList.map((_, i) => `<i class="${i < bIdx ? 'done' : i === bIdx ? 'cur' : ''}"></i>`).join('');
  $('#brief').innerHTML = `<div class="brief-stage">${slide}${done ? '' : `<button class="tap prev" data-act="bprev" aria-label="${t().back}"></button><button class="tap next" data-act="bnext" aria-label="${t().fwd}"></button>`}</div>
    <div class="brief-foot"><div class="bars">${bars}</div><div class="brief-actions"><button class="btn" data-act="bclose">${done ? t().done : t().stop}</button>${done ? '' : `<button class="btn primary" data-act="bopen" data-id="${esc(s.id)}">${t().more}</button>`}</div></div>`;
  if (!done)
    bTimer = setTimeout(() => {
      bIdx++;
      renderBrief();
    }, 11000);
}
function closeBrief() {
  clearTimeout(bTimer);
  $('#brief').hidden = true;
  document.body.style.overflow = '';
}
(function briefSwipe() {
  let y0: number | null = null;
  $('#brief').addEventListener('touchstart', (e) => (y0 = e.touches[0].clientY), { passive: true });
  $('#brief').addEventListener('touchend', (e) => {
    if (y0 != null && e.changedTouches[0].clientY - y0 > 110) closeBrief();
    y0 = null;
  });
})();

// ---------- Settings ----------

function openSettings() {
  const seg = (k: 'ui' | 'msg' | 'persp' | 'view', opts: [string, string][]) =>
    `<div class="seg">${opts.map(([v, l]) => `<button data-set="${k}" data-v="${v}" class="${state[k] === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  const html = `<div class="set"><h2 class="head" style="font-size:24px">${t().settings}</h2>
    <div><label>${t().ui}</label>${seg('ui', [['de', 'Deutsch'], ['en', 'English']])}</div>
    <div><label>${t().msg}</label>${seg('msg', [['de', 'Deutsch'], ['en', 'English'], ['orig', t().orig]])}<p class="hint">${t().msgNote[state.msg]}</p></div>
    <div><label>${t().persp}</label>${seg('persp', [['dach', t().perspDach], ['world', t().perspWorld]])}<p class="hint">${t().perspNote[state.persp]}</p></div>
    <div><label>${t().view}</label>${seg('view', [['calm', t().calm], ['pics', t().pics]])}</div>
    <div class="note">${t().about(state.edition?.outlets ?? 0, state.edition?.countries ?? 0, __APP_VERSION__).map((p) => `<p>${p}</p>`).join('')}</div></div>`;
  if (wide()) {
    $('#detail').innerHTML = `<div class="detail-view">${html}</div>`;
    state.selected = null;
    markSelected();
    return;
  }
  $('#sheetBody').innerHTML = html;
  $('#sheetBar').innerHTML = `<button class="btn" data-act="close">${t().done}</button>`;
  showSheet('full');
}

// ---------- Data ----------

function showPill(n: number) {
  $('#pillHost').innerHTML = `<button class="pill" data-act="release">↑ ${t().newStories(n)}</button>`;
}
async function load() {
  try {
    const r = await fetch(DATA_URL, { cache: 'no-store' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const next = (await r.json()) as Edition;
    const wasOffline = state.offline;
    state.offline = false;
    if (!state.edition) {
      state.edition = next;
      store.set('edition', next);
      start();
      return;
    }
    if (next.at <= ed().at) {
      if (wasOffline) renderList();
      return;
    }
    store.set('edition', next);
    // New stories arrive without pushing the content away: a notice at the bottom, a tap brings them in.
    const known = new Set(ed().stories.map((s) => s.id));
    const fresh = next.stories.filter((s) => !known.has(s.id)).length;
    if (fresh) {
      state.pending = next;
      showPill(fresh);
    } else {
      state.edition = next;
      renderList();
    }
  } catch {
    state.offline = true;
    if (!state.edition) {
      const cached = store.get<Edition | null>('edition', null);
      if (cached) {
        state.edition = cached;
        start();
      } else $('#list').innerHTML = `<div class="state"><p class="head">${t().failed}</p><button class="btn" data-act="retry">${t().retry}</button></div>`;
    } else renderList();
  }
}
function start() {
  renderChips();
  renderList();
  if (wide()) openStory(firstStory(), false);
}
function saveVisit() {
  if (!state.edition) return;
  store.set('visit', Date.now());
  store.set('counts', Object.fromEntries(ed().stories.map((s) => [s.id, s.sources.length])));
  const ids = new Set(ed().stories.map((s) => s.id));
  store.set('seen', [...state.seen].filter((id) => ids.has(id)));
}

// ---------- Events ----------

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const st = target.closest<HTMLElement>('.story');
  if (st) return openStory(st.dataset.id!);
  const g = target.closest<HTMLElement>('[data-go]');
  if (g) return go(g.dataset.go as RessortId);
  const set = target.closest<HTMLElement>('[data-set]');
  if (set) {
    const k = set.dataset.set as 'ui' | 'msg' | 'persp' | 'view';
    (state as Record<string, unknown>)[k] = set.dataset.v;
    store.set(k, set.dataset.v);
    renderChips();
    renderList();
    openSettings();
    return;
  }
  const act = target.closest<HTMLElement>('[data-act]')?.dataset.act;
  if (act === 'close') closeSheet();
  if (act === 'brief') openBrief();
  if (act === 'settings') openSettings();
  if (act === 'bnext' || act === 'bprev') {
    bIdx = act === 'bnext' ? bIdx + 1 : Math.max(0, bIdx - 1);
    renderBrief();
  }
  if (act === 'bclose') closeBrief();
  if (act === 'bopen') {
    const id = target.closest<HTMLElement>('[data-id]')!.dataset.id!;
    closeBrief();
    openStory(id);
  }
  if (act === 'retry') load();
  if (act === 'release' && state.pending) {
    state.edition = state.pending;
    state.pending = null;
    $('#pillHost').innerHTML = '';
    renderChips();
    renderList();
    (wide() ? $('#stream') : document.scrollingElement!).scrollTo({ top: 0, behavior: 'smooth' });
  }
});
$('#briefBtn').addEventListener('click', openBrief);
$('#setBtn').addEventListener('click', openSettings);
document.addEventListener('keydown', (e) => {
  const briefOpen = !$('#brief').hidden;
  if (e.key === 'Escape') return briefOpen ? closeBrief() : closeSheet();
  if (briefOpen && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
    bIdx = e.key === 'ArrowRight' ? bIdx + 1 : Math.max(0, bIdx - 1);
    renderBrief();
  }
});
let wasWide = wide();
addEventListener('resize', () => {
  if (wide() === wasWide || !state.edition) return;
  wasWide = wide();
  closeSheet();
  renderList();
  if (wasWide) openStory(state.selected ?? firstStory(), false);
});
document.addEventListener('visibilitychange', () => (document.hidden ? saveVisit() : load()));
addEventListener('pagehide', saveVisit);
setInterval(load, REFRESH_MS);

document.getElementById('boot')?.remove();
renderChips();
renderList();
load();
// Test hook for the lab and the smoke test.
(window as unknown as { __news: unknown }).__news = { state, load };
if ('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register('./sw.js').catch(() => {});
