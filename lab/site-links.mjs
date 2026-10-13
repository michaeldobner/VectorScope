// Test lab: which Telegram channels do official websites link to.
const UA = { 'User-Agent': 'Mozilla/5.0 VectorScope-lab' };
for (const url of process.argv.slice(2)) {
  try {
    const r = await fetch(url, { headers: UA, redirect: 'follow', signal: AbortSignal.timeout(20000) });
    const html = await r.text();
    const tg = [...new Set([...html.matchAll(/(?:t\.me|telegram\.me)\/(?:s\/)?([A-Za-z0-9_+]+)/g)].map((m) => m[1]))];
    const gov = [...new Set([...html.matchAll(/(Губернатор[^<]{0,80})/g)].map((m) => m[1].trim()))].slice(0, 3);
    console.log(`${url} | ${r.status} | telegram: ${tg.join(' ') || '-'} | ${gov.join(' / ')}`);
  } catch (e) {
    console.log(`${url} | failed ${e.message}`);
  }
}
