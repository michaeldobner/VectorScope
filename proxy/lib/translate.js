// Translation through the public Google Translate endpoint used by browser extensions (client=gtx).
// Unofficial: no key, no guarantee. Texts are joined line by line into few requests and split again.

const ENDPOINT = 'https://translate.googleapis.com/translate_a/single';
// Encoded URLs stay well below the length Google accepts.
const MAX_CHUNK = 1500;

/** Groups texts into chunks of at most MAX_CHUNK characters, one text per line. */
export function chunk(texts) {
  const chunks = [];
  let current = [];
  let size = 0;
  for (const t of texts) {
    if (current.length && size + t.length + 1 > MAX_CHUNK) {
      chunks.push(current);
      current = [];
      size = 0;
    }
    current.push(t);
    size += t.length + 1;
  }
  if (current.length) chunks.push(current);
  return chunks;
}

/** Google answers [[["translated", "original", ...], ...], ...]. The segments joined give the full text. */
export function parseGoogle(json) {
  return Array.isArray(json?.[0]) ? json[0].map((seg) => (Array.isArray(seg) && typeof seg[0] === 'string' ? seg[0] : '')).join('') : '';
}

async function google(text, to, fetchImpl) {
  const url = `${ENDPOINT}?client=gtx&sl=auto&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
  const r = await fetchImpl(url, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(`google ${r.status}`);
  return parseGoogle(await r.json());
}

/**
 * Translates every text into `to`. Line breaks inside a text become spaces, so one line is one text.
 * If Google merges or splits lines, the chunk is translated text by text instead.
 */
/**
 * Translates every text into `to`. Line breaks inside a text become spaces, so one line is one text.
 * At most two requests run at a time, Google limits the rate per address. A chunk that still fails
 * yields null for its texts, so the caller can try them again later instead of losing the whole batch.
 */
export async function translateAll(texts, to = 'de', fetchImpl = fetch) {
  const clean = texts.map((t) => String(t).replace(/\s*\n\s*/g, ' ').trim());
  const chunks = chunk(clean);
  const results = new Array(chunks.length);
  let next = 0;
  const worker = async () => {
    while (next < chunks.length) {
      const k = next++;
      const part = chunks[k];
      try {
        const lines = (await google(part.join('\n'), to, fetchImpl)).split('\n').map((l) => l.trim());
        if (lines.length !== part.length) {
          results[k] = [];
          for (const t of part) results[k].push(await google(t, to, fetchImpl).catch(() => null));
        } else {
          // Google sometimes leaves single lines of a batch untouched. Those are asked again on their own.
          results[k] = [];
          for (let i = 0; i < part.length; i++) {
            results[k].push(lines[i] === part[i] && /\p{L}{3}/u.test(part[i]) ? await google(part[i], to, fetchImpl).catch(() => null) : lines[i]);
          }
        }
      } catch {
        results[k] = part.map(() => null);
      }
    }
  };
  await Promise.all([worker(), worker()]);
  return results.flat();
}
