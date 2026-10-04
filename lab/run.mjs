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

// Screenshots of the real app
const browser = await chromium.launch();
const shots = [
  ['iphone', 393, 852, 3, true],
  ['ipad-landscape', 1180, 820, 2, true],
];
for (const [name, w, h, dpr, mobile] of shots) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push('pageerror ' + e));
  p.on('console', (m) => m.type() === 'error' && errs.push('console ' + m.text()));
  p.on('requestfailed', (r) => errs.push('failed ' + r.url().slice(0, 120) + ' ' + r.failure()?.errorText));
  await p.goto(`http://localhost:4173/?shot&lat=${LAT}&lon=${LON}`);
  await p.waitForTimeout(12000);
  await freeze(p);
  await p.screenshot({ path: `${OUT}/${name}-map.png` });
  // Open the most interesting nearby aircraft
  const row = p.locator('.peek-top, .right-col .row, .rows .row').first();
  if (await row.count()) {
    await row.click().catch(() => {});
    await p.waitForTimeout(5000);
    await freeze(p);
    await p.screenshot({ path: `${OUT}/${name}-inspector.png` });
  }
  log.push(`${name}: status=${await p.locator('.status').innerText().catch(() => '?')} errors=${errs.length}`);
  errs.slice(0, 15).forEach((e) => log.push('  ' + e));
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
