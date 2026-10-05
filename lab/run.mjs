// Test lab, runs in GitHub Actions with real internet: records real API responses and
// takes screenshots of the built app at iPhone and iPad size with live data and the real map.
import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT = 'lab-out';
fs.mkdirSync(`${OUT}/api`, { recursive: true });
const LAT = 49.45, LON = 11.08;
const UA = { 'User-Agent': 'VectorScope-lab/0.1 (github.com/michaeldobner/VectorScope)' };
const log = [];

async function grab(name, url, init = {}) {
  const t = Date.now();
  try {
    const r = await fetch(url, { ...init, headers: { ...UA, ...(init.headers || {}) } });
    const body = await r.text();
    fs.writeFileSync(`${OUT}/api/${name}.txt`, `HTTP ${r.status}\n${[...r.headers].map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${body.slice(0, 20000)}`);
    log.push(`${name}: HTTP ${r.status} ${body.length}B ${Date.now() - t}ms`);
    return body;
  } catch (e) {
    log.push(`${name}: ERROR ${e}`);
    return null;
  }
}

const point = await grab('adsblol-point', `https://api.adsb.lol/v2/point/${LAT}/${LON}/60`);
await grab('proxy-root', 'https://vectorscope-proxy.vercel.app/');
await grab('proxy-feed-itamilradar', 'https://vectorscope-proxy.vercel.app/feed/itamilradar');
await grab('proxy-photo', 'https://vectorscope-proxy.vercel.app/photos/hex/3c6444');
await grab('proxy-point', `https://vectorscope-proxy.vercel.app/v2/point/${LAT}/${LON}/60`, { headers: { Origin: 'https://michaeldobner.github.io' } });
let callsigns = [];
try { callsigns = JSON.parse(point).ac.filter((a) => a.flight && a.lat).slice(0, 6).map((a) => ({ callsign: a.flight.trim(), lat: a.lat, lng: a.lon })); } catch {}
log.push('callsigns: ' + callsigns.map((c) => c.callsign).join(','));
if (callsigns.length) {
  await grab('adsblol-routeset', 'https://api.adsb.lol/api/0/routeset', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://michaeldobner.github.io' }, body: JSON.stringify({ planes: callsigns }) });
  await grab('adsbdb-callsign', `https://api.adsbdb.com/v0/callsign/${callsigns[0].callsign}`, { headers: { Origin: 'https://michaeldobner.github.io' } });
  const hex = JSON.parse(point).ac.find((a) => a.flight)?.hex;
  if (hex) {
    await grab('adsbdb-aircraft', `https://api.adsbdb.com/v0/aircraft/${hex}`);
    await grab('planespotters', `https://api.planespotters.net/pub/photos/hex/${hex}`, { headers: { Origin: 'https://michaeldobner.github.io' } });
  }
}
await grab('openfreemap-tilejson', 'https://tiles.openfreemap.org/planet');
// Candidate sources for routes, airlines and aircraft details
for (const cs of ['EXS95LV', ...callsigns.slice(0, 3).map((c) => c.callsign)]) {
  await grab(`hexdb-route-${cs}`, `https://hexdb.io/api/v1/route/icao/${cs}`, { headers: { Origin: 'https://michaeldobner.github.io' } });
  await grab(`adsbdb-callsign-${cs}`, `https://api.adsbdb.com/v0/callsign/${cs}`);
}
await grab('hexdb-airport-EGNM', 'https://hexdb.io/api/v1/airport/icao/EGNM', { headers: { Origin: 'https://michaeldobner.github.io' } });
await grab('adsbdb-airline-EXS', 'https://api.adsbdb.com/v0/airline/EXS');
await grab('hexdb-aircraft', 'https://hexdb.io/api/v1/aircraft/4CA7B5', { headers: { Origin: 'https://michaeldobner.github.io' } });
try {
  const hexes = JSON.parse(point).ac.slice(0, 3).map((a) => a.hex);
  for (const h of hexes) await grab(`adsbdb-aircraft-${h}`, `https://api.adsbdb.com/v0/aircraft/${h}`);
} catch {}

// Screenshots of the real app with live data
const browser = await chromium.launch();
async function newPage(w, h, dpr) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, isMobile: w < 900, hasTouch: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push('pageerror ' + e));
  p.on('requestfailed', (r) => errs.push('failed ' + r.url().slice(0, 110) + ' ' + r.failure()?.errorText));
  p.on('response', (r) => r.status() >= 400 && errs.push(`HTTP ${r.status()} ${r.url().slice(0, 110)}`));
  await p.goto(`http://localhost:4173/air/?shot&lat=${LAT}&lon=${LON}`);
  await p.waitForTimeout(10000);
  return { ctx, p, errs };
}
async function shot(p, name) {
  await freeze(p);
  await p.screenshot({ path: `${OUT}/${name}.png` });
}
const pick = (p) =>
  p.evaluate(() => {
    const st = window.__vs.getTraffic();
    const list = [...st.aircraft.values()].sort((a, b) => b.assessment.score - a.assessment.score || a.sky.distM - b.sky.distM);
    const withCall = list.find((t) => t.ac.callsign && !t.assessment.military) ?? list[0];
    if (withCall) window.__vs.select(withCall.ac.hex);
    return withCall ? `${withCall.ac.callsign} ${withCall.ac.typeCode}` : 'none';
  });

{
  const { ctx, p, errs } = await newPage(393, 852, 3);
  await shot(p, 'iphone-1-map');
  log.push('iphone selected: ' + (await pick(p)));
  await p.waitForTimeout(6000);
  await shot(p, 'iphone-2-inspector');
  await p.evaluate(() => window.__vs.select(null));
  await p.locator('.peek-line').click().catch(() => {});
  await p.locator('.tabs button', { hasText: 'Notable' }).click().catch(() => {});
  await p.waitForTimeout(1500);
  await shot(p, 'iphone-3-notable');
  await p.locator('.notable li').first().click().catch(() => {});
  await p.waitForTimeout(5000);
  await shot(p, 'iphone-4-notable-selected');
  log.push(`iphone: status=${await p.locator('.status').innerText().catch(() => '?')} errors=${errs.length}`);
  [...new Set(errs)].slice(0, 20).forEach((e) => log.push('  ' + e));
  await ctx.close();
}
{
  const { ctx, p, errs } = await newPage(1180, 820, 2);
  await shot(p, 'ipad-1-map');
  log.push('ipad selected: ' + (await pick(p)));
  await p.waitForTimeout(6000);
  await shot(p, 'ipad-2-inspector');
  log.push(`ipad: errors=${errs.length}`);
  [...new Set(errs)].slice(0, 10).forEach((e) => log.push('  ' + e));
  await ctx.close();
}
// INTEL with live data, then the deep link into AIR for the first live match
for (const [name, w, h, dpr] of [['iphone', 393, 852, 3], ['ipad', 1180, 820, 2]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, isMobile: w < 900, hasTouch: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push('pageerror ' + e));
  p.on('response', (r) => r.status() >= 400 && errs.push(`HTTP ${r.status()} ${r.url().slice(0, 110)}`));
  await p.goto('http://localhost:4173/intel/');
  await p.waitForFunction(() => window.__intel?.getState().updated, null, { timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(3000);
  await p.screenshot({ path: `${OUT}/intel-${name}-1-feed.png` });
  const info = await p.evaluate(() => {
    const st = window.__intel.getState();
    const sources = Object.entries(st.sources).map(([id, s]) => `${id}:${s.ok ? 'ok' : 'ERR ' + s.error}:${s.count}`);
    const strong = st.items.flatMap((i) => i.matches.filter((m) => m.kind !== 'type').map((m) => `${m.ac.callsign}/${m.ac.typeCode} ${m.kind} "${i.title.slice(0, 60)}"`));
    const multi = st.stories.filter((s) => s.sources.length > 1).map((s) => `${s.status} ${s.sources.length}src ${s.items.length}rep "${s.lead.title.slice(0, 70)}"`);
    return { items: st.items.length, live: st.live.length, sources, strong, multi, firstHex: st.items.flatMap((i) => i.matches)[0]?.ac.hex ?? null };
  });
  log.push(`intel ${name}: items=${info.items} live=${info.live} strong=${info.strong.length} errors=${errs.length}`);
  if (name === 'iphone') {
    // Raw reports for offline tests of grouping and relevance.
    const raw = await p.evaluate(() => window.__intel.getRaw());
    fs.writeFileSync(`${OUT}/intel-items.json`, JSON.stringify(raw));
    info.sources.forEach((x) => log.push('  source ' + x));
    info.strong.slice(0, 10).forEach((x) => log.push('  match ' + x));
    info.multi.slice(0, 40).forEach((x) => log.push('  story ' + x));
  }
  [...new Set(errs)].slice(0, 10).forEach((e) => log.push('  ' + e));
  if (name === 'ipad' && info.firstHex) {
    await p.goto(`http://localhost:4173/air/?shot&hex=${info.firstHex}&lat=${LAT}&lon=${LON}`);
    await p.waitForTimeout(10000);
    await shot(p, 'intel-ipad-2-deeplink-air');
    log.push('deep link selected: ' + (await p.evaluate(() => window.__vs.getTraffic().selected)));
  }
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${OUT}/log.txt`, log.join('\n') + '\n');
console.log(log.join('\n'));

async function freeze(p) {
  await p.evaluate(() => {
    const c = document.querySelector('.maplibregl-canvas');
    if (!c) return;
    const r = c.getBoundingClientRect();
    const img = document.createElement('img');
    img.src = c.toDataURL();
    Object.assign(img.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', zIndex: 4, pointerEvents: 'none' });
    document.querySelectorAll('.lab-shot').forEach((e) => e.remove());
    img.className = 'lab-shot';
    document.body.appendChild(img);
  }).catch(() => {});
  await p.waitForTimeout(300);
}
