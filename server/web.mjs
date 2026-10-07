// Web server of the own server: the built app, the proxy, the collector data and a small API, on one address.
//
//   /                 dist/ (start page, AIR, INTEL), as GitHub Pages would serve it
//   /proxy/...        the proxy of proxy/api/proxy.js, same paths as on Vercel
//   /data/latest.json the collector's last 72 hours, read by INTEL
//   /api/health       web, collector and database in one JSON, read by the status page
//   /api/reports      reports from the database: ?hours=24&source=id&q=text&limit=200
//   /healthz          liveness for the Docker healthcheck
//
// Env: PORT (8080), DATA_DIR (/data), DATABASE_URL, plus the proxy's ALLOWED_ORIGIN, PROXY_TOKEN, CONTACT.
import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import proxy from '../proxy/api/proxy.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const port = Number(process.env.PORT ?? 8080);
const dataDir = process.env.DATA_DIR ?? '/data';
const version = JSON.parse(readFileSync(join(root, 'modules.json'), 'utf8')).version;
const db = process.env.DATABASE_URL ? new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 4 }) : null;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

const json = (res, status, body, cache = 'no-store') => {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': cache });
  res.end(JSON.stringify(body));
};

// ---------- Proxy ----------

// Replaces the edge cache of Vercel: GET answers stay for their s-maxage, so several devices
// asking the same thing within seconds reach adsb.lol only once.
const cache = new Map();
const CACHE_MAX = 500;

async function readBody(req, limit = 256 * 1024) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error('body too large');
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}

async function handleProxy(req, res, path) {
  const key = req.method === 'GET' ? path : null;
  const hit = key && cache.get(key);
  if (hit && hit.until > Date.now()) {
    res.writeHead(hit.status, hit.headers);
    return res.end(hit.body);
  }
  let body;
  if (req.method === 'POST') {
    try {
      body = await readBody(req);
    } catch {
      return json(res, 400, { error: 'bad body' });
    }
  }
  // The handler is written for Vercel: req.query, req.body, res.status().json/send/end.
  const headers = {};
  let status = 200;
  const done = (payload) => {
    const maxAge = Number(/s-maxage=(\d+)/.exec(headers['cache-control'] ?? '')?.[1] ?? 0);
    if (key && maxAge > 0 && status === 200) {
      if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
      cache.set(key, { until: Date.now() + maxAge * 1000, status, headers: { ...headers }, body: payload });
    }
    res.writeHead(status, headers);
    res.end(payload);
  };
  const vres = {
    setHeader: (name, value) => (headers[name.toLowerCase()] = value),
    status: (code) => ((status = code), vres),
    json: (obj) => {
      headers['content-type'] ??= 'application/json';
      done(JSON.stringify(obj));
    },
    send: (text) => done(text),
    end: () => done(''),
  };
  await proxy({ method: req.method, headers: req.headers, query: { path }, body }, vres);
}

// ---------- API ----------

function heartbeat() {
  try {
    return JSON.parse(readFileSync(join(dataDir, 'heartbeat.json'), 'utf8'));
  } catch {
    return null;
  }
}

async function health(res) {
  const beat = heartbeat();
  const collector = beat
    ? {
        last_round: new Date(beat.at).toISOString(),
        age_min: Math.round(((Date.now() - beat.at) / 60_000) * 10) / 10,
        ok_sources: beat.ok,
        sources: beat.total,
        items: beat.items,
        exit: beat.exit,
        raw_push: beat.rawPush ?? 'off',
      }
    : null;
  let dbState = { ok: false };
  if (db) {
    try {
      const r = await db.query(
        `SELECT (SELECT count(*) FROM reports WHERE seen > now() - interval '24 hours')::int AS reports_24h,
                (SELECT count(*) FROM reports)::int AS reports,
                (SELECT count(*) FROM rounds)::int AS rounds`,
      );
      dbState = { ok: true, ...r.rows[0] };
      if (collector) collector.reports_24h = r.rows[0].reports_24h;
    } catch (e) {
      // Before the first round the tables do not exist yet, the database itself answers.
      const alive = await db.query('SELECT 1').then(() => true, () => false);
      dbState = { ok: alive, error: String(e.message ?? e) };
    }
  }
  json(res, 200, { ok: !!collector && dbState.ok, version, collector, db: dbState });
}

async function reports(res, params) {
  if (!db) return json(res, 503, { error: 'no database' });
  const hours = Math.min(Math.max(Number(params.get('hours')) || 24, 1), 24 * 365);
  const limit = Math.min(Math.max(Number(params.get('limit')) || 200, 1), 1000);
  const source = params.get('source');
  const q = params.get('q');
  const where = [`time > now() - make_interval(hours => $1)`];
  const args = [hours];
  if (source) where.push(`source = $${args.push(source)}`);
  if (q) where.push(`(item->>'title' ILIKE $${args.push(`%${q}%`)} OR item->>'text' ILIKE $${args.length})`);
  try {
    const r = await db.query(
      `SELECT item, seen FROM reports WHERE ${where.join(' AND ')} ORDER BY time DESC LIMIT $${args.push(limit)}`,
      args,
    );
    json(res, 200, { at: Date.now(), items: r.rows.map((row) => ({ ...row.item, seen: new Date(row.seen).getTime() })) }, 'public, max-age=30');
  } catch (e) {
    json(res, 500, { error: String(e.message ?? e) });
  }
}

// ---------- Static ----------

function serveFile(res, file, cacheControl) {
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', 'Cache-Control': cacheControl });
  createReadStream(file).pipe(res);
}

function serveStatic(req, res, path) {
  let file = join(dist, path);
  if (existsSync(file) && statSync(file).isDirectory()) {
    // Like GitHub Pages: /air redirects to /air/
    if (!path.endsWith('/')) {
      res.writeHead(301, { Location: path + '/' });
      return res.end();
    }
    file = join(file, 'index.html');
  }
  if (!file.startsWith(dist) || !existsSync(file)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Not found');
  }
  // Built files carry a content hash in their name and never change. Pages and service workers always revalidate.
  serveFile(res, file, /\/assets\//.test(path) ? 'public, max-age=31536000, immutable' : 'no-cache');
}

// ---------- Server ----------

createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  try {
    const url = new URL(req.url, 'http://x');
    const path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
    if (path === '/healthz') return json(res, 200, { ok: true });
    if (path === '/proxy' || path.startsWith('/proxy/')) return await handleProxy(req, res, path.slice('/proxy'.length) || '/');
    if (path === '/api/health') return await health(res);
    if (path === '/api/reports') return await reports(res, url.searchParams);
    if (path === '/data/latest.json') {
      const file = join(dataDir, 'latest.json');
      if (!existsSync(file)) return json(res, 404, { error: 'no collector round yet' });
      return serveFile(res, file, 'no-cache');
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'method' });
    serveStatic(req, res, path);
  } catch (e) {
    if (!res.headersSent) json(res, 500, { error: String(e?.message ?? e) });
    else res.end();
  }
}).listen(port, () => console.log(`VectorScope ${version} on :${port}, data in ${dataDir}, database ${db ? 'on' : 'off'}`));
