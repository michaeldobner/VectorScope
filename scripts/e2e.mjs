// Smoke test on device sizes against the build served by scripts/serve.mjs.
//   npm run build && npm run preview &   then   npm run e2e
// E2E_BROWSER=webkit runs the engine of Safari, E2E_URL changes the address.
import { mkdirSync } from 'node:fs';
import { chromium, devices, webkit } from 'playwright';

const BASE = (process.env.E2E_URL ?? 'http://localhost:4173/').replace(/\/?$/, '/');
const ENGINE = process.env.E2E_BROWSER === 'webkit' ? 'webkit' : 'chromium';
const OUT = 'e2e-out';
const DEVICES = [
  ['iphone-15-portrait', devices['iPhone 15']],
  ['iphone-15-landscape', devices['iPhone 15 landscape']],
  ['iphone-se', devices['iPhone SE']],
  ['ipad-pro-11-landscape', devices['iPad Pro 11 landscape']],
];
// Demo mode with a fixed location: no network to data sources needed, no GPS prompt.
const AIR = 'air/?demo&lat=50.11&lon=8.68';
const INTEL = 'intel/?demo';

mkdirSync(OUT, { recursive: true });
const browser = await (ENGINE === 'webkit' ? webkit : chromium).launch();
const failures = [];

for (const [name, device] of DEVICES) {
  // Chromium cannot emulate the WebKit user agent features, only size, scale and touch matter here.
  const { defaultBrowserType: _ignored, ...options } = device;
  const context = await browser.newContext({ ...options, locale: 'de-DE' });
  // Only the build itself is tested here. Third-party hosts (map tiles, fonts, data) are blocked,
  // so the result never depends on the internet. Real data is the job of the test lab.
  const origin = new URL(BASE).origin;
  await context.route((url) => url.origin !== origin, (route) => route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    const text = m.text();
    // Blocked third-party requests are reported differently by each engine. WebGL may be missing headless.
    const external = (text.match(/https?:\/\/[^\s)]+/g) ?? []).some((u) => !u.startsWith(origin));
    if (m.type() === 'error' && !external && !/webgl|maplibre|Failed to load resource/i.test(text)) errors.push(`console: ${text}`);
  });
  const before = failures.length;
  const check = (ok, what) => {
    if (!ok) failures.push(`${ENGINE} ${name}: ${what}`);
  };

  // Hub
  await page.goto(BASE);
  for (const id of ['air', 'intel']) check((await page.locator(`a.module[href="./${id}/"]`).count()) === 1, `hub does not link ${id}`);
  check(await noSideScroll(page), 'hub scrolls sideways');
  await page.screenshot({ path: `${OUT}/${ENGINE}-${name}-hub.png` });

  // AIR in demo mode
  await page.goto(BASE + AIR);
  const started = await page
    .waitForFunction(() => (window.__vs?.getTraffic().aircraft.size ?? 0) > 0, null, { timeout: 15000 })
    .then(() => true)
    .catch(() => false);
  check(started, 'AIR shows no aircraft in demo mode');
  check(!(await page.locator('#boot').count()), 'AIR boot screen still visible');
  check(await noSideScroll(page), 'AIR scrolls sideways');
  check((await page.locator('a.brand').getAttribute('href')) === '../', 'AIR logo does not lead back to the hub');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/${ENGINE}-${name}-air.png` });

  // INTEL in demo mode
  await page.goto(BASE + INTEL);
  const items = await page
    .waitForFunction(() => document.querySelectorAll('.item').length > 0, null, { timeout: 15000 })
    .then(() => true)
    .catch(() => false);
  check(items, 'INTEL shows no items in demo mode');
  check((await page.locator('.live-row').count()) > 0, 'INTEL shows no live match in demo mode');
  for (const status of ['signal', 'emerging', 'reported', 'confirmed']) check((await page.locator(`.status-chip.s-${status}`).count()) > 0, `INTEL shows no story with status ${status}`);
  await page.locator('.expand').first().click();
  check((await page.locator('.reports li').count()) >= 2, 'INTEL story does not open its reports');
  check(await noSideScroll(page), 'INTEL scrolls sideways');
  check((await page.locator('a.brand').getAttribute('href')) === '../', 'INTEL logo does not lead back to the hub');
  await page.screenshot({ path: `${OUT}/${ENGINE}-${name}-intel.png` });

  for (const e of errors) failures.push(`${ENGINE} ${name}: ${e}`);
  console.log(`${failures.length > before ? '✗' : '✓'} ${ENGINE} ${name}`);
  await context.close();
}

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} problem(s):\n${failures.map((f) => `  ${f}`).join('\n')}`);
  process.exit(1);
}
console.log(`\nAll checks passed. Screenshots in ${OUT}/`);

async function noSideScroll(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
}
