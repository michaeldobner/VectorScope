// Minimal CORS proxy for adsb.lol, deployed as a Vercel serverless function.
// Only whitelisted read-only paths are forwarded, so this is not an open proxy.
// Env vars (Vercel project settings):
//   ALLOWED_ORIGIN  e.g. https://michaeldobner.github.io   (default "*")
//   PROXY_TOKEN     optional shared secret, sent by the app as X-VS-Token
//   CONTACT         contact info for the User-Agent adsb.lol asks for

const UPSTREAM = 'https://api.adsb.lol';
const ALLOWED = [
  /^\/v2\/(point|closest)\/-?\d+(\.\d+)?\/-?\d+(\.\d+)?\/\d+(\.\d+)?$/,
  /^\/v2\/lat\/-?\d+(\.\d+)?\/lon\/-?\d+(\.\d+)?\/dist\/\d+(\.\d+)?$/,
  /^\/v2\/(mil|ladd|pia)$/,
  /^\/v2\/(sqk|squawk)\/\d{4}$/,
  /^\/v2\/(hex|icao)\/[0-9a-fA-F]{6}$/,
  /^\/v2\/(callsign|reg|registration|type)\/[A-Za-z0-9-]{1,12}$/,
  /^\/api\/0\/routeset$/,
];
const PHOTOS = /^\/photos\/hex\/([0-9a-fA-F]{6})$/;
const CONTACT_UA = `VectorScope/0.1 (+https://github.com/michaeldobner/VectorScope; ${process.env.CONTACT || 'github.com/michaeldobner'})`;

export default async function handler(req, res) {
  const origin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-VS-Token, Accept');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Vary', 'Origin');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const path = '/' + String(req.query.path || '').replace(/^\/+/, '');
  // Status page: opening the proxy address in a browser shows that it is running.
  if (path === '/') {
    return res.status(200).json({ ok: true, service: 'VectorScope proxy', upstream: UPSTREAM, test: '/v2/mil' });
  }
  if (process.env.PROXY_TOKEN && req.headers['x-vs-token'] !== process.env.PROXY_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  // Aircraft photos from planespotters.net, which requires a contact URL in the User-Agent.
  const photo = path.match(PHOTOS);
  if (photo && req.method === 'GET') {
    try {
      const r = await fetch(`https://api.planespotters.net/pub/photos/hex/${photo[1].toLowerCase()}`, {
        headers: { Accept: 'application/json', 'User-Agent': CONTACT_UA },
      });
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, s-maxage=86400');
      return res.status(r.status).send(await r.text());
    } catch (e) {
      return res.status(502).json({ error: 'upstream', detail: String(e) });
    }
  }
  if (!ALLOWED.some((re) => re.test(path))) return res.status(404).json({ error: 'not allowed' });
  if (path === '/api/0/routeset' ? req.method !== 'POST' : req.method !== 'GET') {
    return res.status(405).json({ error: 'method' });
  }

  try {
    const upstream = await fetch(UPSTREAM + path, {
      method: req.method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': CONTACT_UA,
      },
      body: req.method === 'POST' ? JSON.stringify(req.body ?? {}) : undefined,
    });
    const body = await upstream.text();
    res.setHeader('Content-Type', 'application/json');
    // Short shared cache: identical requests within 2 s hit Vercel's edge, not adsb.lol.
    res.setHeader('Cache-Control', req.method === 'GET' ? 'public, s-maxage=2, stale-while-revalidate=4' : 'no-store');
    return res.status(upstream.status).send(body);
  } catch (e) {
    return res.status(502).json({ error: 'upstream', detail: String(e) });
  }
}
