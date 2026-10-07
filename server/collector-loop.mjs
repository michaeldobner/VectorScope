// Collector on the own server: one round of collector/collect.ts every EVERY_MIN minutes, for as long
// as the container runs. Replaces the six hour runs on GitHub Actions.
//
//   DATA_DIR/            archive.json, latest.json, stats.json, health.json, raw-state.json (as on collector-data)
//   DATA_DIR/raw/        the raw archive, one file per round (as on collector-raw)
//   DATA_DIR/heartbeat.json  end of the last round with its result, read by /api/health and the healthcheck
//
// On the very first start the data of the GitHub Actions collector is taken over (SEED_FROM), so no
// report counts as new twice and the raw archive continues where the branch collector-raw ends.
// Env: DATA_DIR (/data), EVERY_MIN (10), SEED_FROM, DATABASE_URL, VECTORSCOPE_PROXY.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = process.env.DATA_DIR ?? '/data';
const rawDir = join(dataDir, 'raw');
const everyMs = Number(process.env.EVERY_MIN ?? 10) * 60_000;
const seedFrom = process.env.SEED_FROM ?? 'https://raw.githubusercontent.com/michaeldobner/VectorScope/collector-data';

mkdirSync(rawDir, { recursive: true });

async function seed() {
  if (!seedFrom || existsSync(join(dataDir, 'archive.json'))) return;
  for (const file of ['archive.json', 'stats.json', 'raw-state.json']) {
    try {
      const r = await fetch(`${seedFrom}/${file}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      writeFileSync(join(dataDir, file), await r.text());
      console.log(`Seed: ${file} taken over from ${seedFrom}`);
    } catch (e) {
      console.log(`Seed: ${file} not taken over (${e.message}), starting without it`);
    }
  }
}

function round() {
  return new Promise((resolve) => {
    const child = spawn(join(root, 'node_modules/.bin/tsx'), [join(root, 'collector/collect.ts'), dataDir, rawDir], {
      cwd: root,
      stdio: 'inherit',
    });
    // A round normally takes one or two minutes. One that hangs must not block the next ones.
    const timer = setTimeout(() => child.kill('SIGKILL'), Math.max(everyMs - 30_000, 60_000));
    child.on('exit', (code) => {
      clearTimeout(timer);
      resolve(code ?? 1);
    });
  });
}

function writeHeartbeat(exit) {
  let ok = 0;
  let total = 0;
  let items = 0;
  try {
    const stats = JSON.parse(readFileSync(join(dataDir, 'stats.json'), 'utf8'));
    const last = stats.runs.at(-1);
    const sources = Object.values(last?.sources ?? {});
    ok = sources.filter((s) => s.ok).length;
    total = sources.length;
    items = JSON.parse(readFileSync(join(dataDir, 'latest.json'), 'utf8')).items.length;
  } catch {
    // A round that failed before writing leaves the counts at zero, the exit code tells why.
  }
  writeFileSync(join(dataDir, 'heartbeat.json'), JSON.stringify({ at: Date.now(), exit, ok, total, items }));
}

await seed();
for (;;) {
  const start = Date.now();
  const exit = await round();
  // Exit 2: round collected and written, only the database failed. The heartbeat stays fresh,
  // the status page sees the database itself.
  if (exit === 0 || exit === 2) writeHeartbeat(exit);
  else console.log(`Round failed with exit ${exit}, next round tries again`);
  const wait = start + everyMs - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
}
