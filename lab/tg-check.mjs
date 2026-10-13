// Test lab: compares Telegram channels by their public web preview (t.me/s/…): title, description, last posts.
const UA = { 'User-Agent': 'Mozilla/5.0 VectorScope-lab' };
const strip = (s) => s.replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
for (const ch of process.argv.slice(2)) {
  try {
    const r = await fetch(`https://t.me/s/${ch}`, { headers: UA, signal: AbortSignal.timeout(20000) });
    const html = await r.text();
    const title = strip((html.match(/<div class="tgme_channel_info_header_title[^>]*>([\s\S]*?)<\/div>/) ?? [])[1] ?? '');
    const desc = strip((html.match(/<div class="tgme_channel_info_description[^>]*>([\s\S]*?)<\/div>/) ?? [])[1] ?? '');
    const subs = strip((html.match(/<span class="counter_value">([^<]*)<\/span>\s*<span class="counter_type">subscribers/) ?? [])[1] ?? '');
    const times = [...html.matchAll(/<time datetime="([^"]+)"/g)].map((m) => m[1]);
    const posts = [...html.matchAll(/<div class="tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/g)].map((m) => strip(m[1]));
    console.log(`\n== ${ch}: HTTP ${r.status}, ${posts.length} posts, subscribers ${subs || '-'}`);
    console.log(`   title: ${title}`);
    console.log(`   description: ${desc.slice(0, 300)}`);
    console.log(`   newest: ${times[times.length - 1] ?? '-'}, oldest shown: ${times[0] ?? '-'}`);
    for (const p of posts.slice(-6)) console.log(`   - ${p.slice(0, 160)}`);
  } catch (e) {
    console.log(`\n== ${ch}: failed ${e.message}`);
  }
}
