// Test lab: where do CNBC reports land in a real edition. Prints the section Business and every CNBC story.
import { readFileSync } from 'node:fs';
const ed = JSON.parse(readFileSync(process.argv[2] ?? 'news-out/news.json', 'utf8'));
const stats = JSON.parse(readFileSync((process.argv[2] ?? 'news-out/news.json').replace('news.json', 'news-stats.json'), 'utf8'));
console.log('feeds cnbc:', JSON.stringify(stats.feeds.cnbc), 'cnbc-world:', JSON.stringify(stats.feeds['cnbc-world']));
const byRes = new Map();
for (const s of ed.stories) byRes.set(s.ressort, (byRes.get(s.ressort) ?? 0) + 1);
console.log('stories', ed.stories.length, Object.fromEntries(byRes));
const title = (s) => s.lead?.en?.head ?? s.lead?.orig?.head ?? s.id;
const biz = ed.stories.filter((s) => s.ressort === 'wirtschaft').sort((a, b) => b.score - a.score);
console.log('\nBusiness by score:');
biz.forEach((s, i) => console.log(` ${i + 1}. ${s.score} w${s.worldScore} ${s.sources.map((x) => x.outlet).join('/')} | ${title(s).slice(0, 90)}`));
console.log('\nStories with CNBC:');
ed.stories.filter((s) => s.sources.some((x) => x.outlet === "CNBC") || /Wall Street|S&P|Börse|Aktien/.test(title(s))).forEach((s) => console.log(` ${s.ressort} ${s.score} ${s.sources.map((x) => x.outlet).join("/")} | ${title(s).slice(0, 90)}`));
