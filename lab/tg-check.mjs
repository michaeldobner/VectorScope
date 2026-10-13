// Test lab: checks Telegram channels by their public web preview (t.me/s/…): title, verified badge, subscribers,
// description with its links, newest post. To compare with the official profile of the outlet.
const UA = { 'User-Agent': 'Mozilla/5.0 VectorScope-lab' };
const strip = (s) => s.replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#036;/g, '$').replace(/\s+/g, ' ').trim();
for (const ch of process.argv.slice(2)) {
  try {
    const r = await fetch(`https://t.me/s/${ch}`, { headers: UA, signal: AbortSignal.timeout(20000) });
    const html = await r.text();
    const head = (html.match(/<div class="tgme_channel_info_header">([\s\S]*?)<\/div>\s*<\/div>/) ?? [])[1] ?? '';
    const title = strip((html.match(/<div class="tgme_channel_info_header_title[^>]*>([\s\S]*?)<\/div>/) ?? [])[1] ?? '');
    const verified = /verified-icon/.test(head) ? 'VERIFIED' : '';
    const descHtml = (html.match(/<div class="tgme_channel_info_description[^>]*>([\s\S]*?)<\/div>/) ?? [])[1] ?? '';
    const links = [...descHtml.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/^https?:\/\//, '')).filter((l) => !l.startsWith('t.me/') || true).slice(0, 4);
    const subs = strip((html.match(/<span class="counter_value">([^<]*)<\/span>\s*<span class="counter_type">subscribers/) ?? [])[1] ?? '');
    const times = [...html.matchAll(/<time datetime="([^"]+)"/g)].map((m) => m[1]);
    console.log(`${ch} | ${r.status} | ${title} ${verified} | ${subs} | newest ${(times[times.length - 1] ?? '-').slice(0, 16)} | ${strip(descHtml).slice(0, 140)} | links: ${links.join(' ')}`);
  } catch (e) {
    console.log(`${ch} | failed ${e.message}`);
  }
}
