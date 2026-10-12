// Test lab: which CNBC feeds carry which headlines. Only the log of the run, nothing stored.
const IDS = {
  'Top News': 100003114, 'World News': 100727362, 'US News': 15837362, 'Business': 10001147, 'Economy': 20910258,
  'Finance': 10000664, 'Investing': 15839069, 'Earnings': 15839135, 'Politics': 10000113, 'Technology': 19854910,
  'Energy': 19836768, 'Europe': 19794221, 'Asia': 19832390,
};
const UA = { 'User-Agent': 'VectorScope-lab/0.1 (github.com/michaeldobner/VectorScope)' };
const WANT = /S&(amp;)?P 500|stock market|Dow|Nasdaq/i;
for (const [name, id] of Object.entries(IDS)) {
  const url = `https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=${id}`;
  try {
    const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(20000) });
    const xml = await r.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => ({
      title: (m[1].match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) ?? [])[1]?.trim(),
      date: (m[1].match(/<pubDate>([^<]*)/) ?? [])[1],
    }));
    console.log(`\n== ${name} (${id}) HTTP ${r.status}, ${items.length} items, newest ${items[0]?.date ?? '-'}`);
    for (const i of items.slice(0, 8)) console.log(`   ${i.date?.slice(5, 22)}  ${i.title}`);
    for (const i of items.slice(8).filter((i) => WANT.test(i.title ?? ''))) console.log(`   … ${i.date?.slice(5, 22)}  ${i.title}`);
  } catch (e) {
    console.log(`\n== ${name} (${id}) failed: ${e.message}`);
  }
}
