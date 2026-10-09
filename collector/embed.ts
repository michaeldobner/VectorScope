// Topics by meaning: every headline becomes a vector of a small multilingual model, headlines whose vectors point the
// same way get the same topic id. "Execution of Fort Hood gunman to be streamed", "Hinrichtung des Fort-Hood-Attentäters
// soll live übertragen werden" and the Russian report on it meet, without a shared word.
// The collector attaches the topic to every report (item.topic), INTEL groups reports of one topic into one story
// (stories.ts). The model runs on the own server, on the CPU, no key and no fee. Off with EMBED=0.
import { isAirTrack } from '../intel/src/data/alerts';
import { itemKey } from '../intel/src/data/feed';
import type { Item } from '../intel/src/data/types';

/** Multilingual sentence model, 384 dimensions, about 120 MB quantized. Converted for transformers.js. */
export const MODEL = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';
/** Two headlines are one topic from this cosine similarity on. Set by the test lab (lab/embed.ts). */
export const THRESHOLD = 0.8;
/** A topic joins reports within this time of each other. */
const WINDOW_MS = 36 * 3600_000;
const KEEP_MS = 72 * 3600_000;

export type Embed = (texts: string[]) => Promise<Float32Array[]>;

/**
 * Per report: its vector (int8, base64), its topic and when it was published. Kept in embeddings.json, 72 hours.
 * The topic id is the key of its first report, the seed.
 */
export type EmbedState = Record<string, { v: string; topic: string; time: number }>;

/** Too short to say what happened ("Радомишль", "Auf Ukrainisch"): such texts attract each other in the model. */
const MIN_WORDS = 4;

const toB64 = (v: Float32Array) => Buffer.from(Int8Array.from(v, (x) => Math.max(-127, Math.min(127, Math.round(x * 127)))).buffer).toString('base64');
// Small Buffers share one pool in Node: copy exactly the bytes of this vector, not the pool around it.
const fromB64 = (s: string) => {
  const b = Buffer.from(s, 'base64');
  return new Int8Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length));
};
function cosine(a: Int8Array, b: Int8Array): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

/** What the model reads: the English translation if the collector has one, else the headline as it came. */
const textOf = (i: Item) => (i.tr?.en?.title ?? i.title).slice(0, 300);

/**
 * Embeds the reports that have no vector yet, oldest first, and gives each new one the topic of its nearest
 * neighbour within 36 hours, if close enough, or a topic of its own. Known reports keep their topic.
 */
export async function assignTopics(items: Item[], state: EmbedState, opt: { embed: Embed; now: number; threshold?: number; batch?: number }): Promise<{ embedded: number; joined: number }> {
  const threshold = opt.threshold ?? THRESHOLD;
  const fresh = items.filter((i) => !state[itemKey(i)] && opt.now - i.time < KEEP_MS).sort((a, b) => a.time - b.time);
  let joined = 0;
  const size = opt.batch ?? 32;
  // Seeds only, decoded once per round: a report joins a topic if it is close to the first report of that topic.
  // Joining the nearest member instead lets topics grow in chains (A like B, B like C) to hundreds of reports.
  const seeds = Object.entries(state)
    .filter(([key, e]) => e.topic === key)
    .map(([key, e]) => ({ topic: key, time: e.time, vec: fromB64(e.v) }));
  for (let s = 0; s < fresh.length; s += size) {
    const part = fresh.slice(s, s + size);
    const vectors = await opt.embed(part.map(textOf));
    part.forEach((item, k) => {
      const v = toB64(vectors[k]);
      const mine = fromB64(v);
      let best: { topic: string; sim: number } | null = null;
      // Drone tracks and one-word posts get a topic of their own: the model cannot tell them apart.
      const loner = isAirTrack(item) || textOf(item).split(/\s+/).filter((w) => /\p{L}{2}/u.test(w)).length < MIN_WORDS;
      for (const other of loner ? [] : seeds) {
        if (Math.abs(other.time - item.time) > WINDOW_MS) continue;
        const sim = cosine(mine, other.vec);
        if (sim >= threshold && (!best || sim > best.sim)) best = { topic: other.topic, sim };
      }
      if (best) joined++;
      const topic = best?.topic ?? itemKey(item);
      state[itemKey(item)] = { v, topic, time: item.time };
      if (!best && !loner) seeds.push({ topic, time: item.time, vec: mine });
    });
  }
  for (const [k, e] of Object.entries(state)) if (opt.now - e.time > KEEP_MS) delete state[k];
  return { embedded: fresh.length, joined };
}

/** The report with its topic, if it has one. */
export const withTopic = (item: Item, state: EmbedState): Item => {
  const topic = state[itemKey(item)]?.topic;
  return topic ? { ...item, topic } : item;
};

/** Loads the model once. Downloaded on first use into cacheDir (on the server the data volume, so only once). */
export async function loadEmbedder(cacheDir?: string): Promise<Embed> {
  const { pipeline, env } = await import('@huggingface/transformers');
  if (cacheDir) env.cacheDir = cacheDir;
  const extract = await pipeline('feature-extraction', MODEL, { dtype: 'q8' });
  return async (texts) => {
    const out = await extract(texts, { pooling: 'mean', normalize: true });
    const dim = out.dims[out.dims.length - 1];
    const data = out.data as Float32Array;
    return texts.map((_, i) => data.slice(i * dim, (i + 1) * dim));
  };
}
