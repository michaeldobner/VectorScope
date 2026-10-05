// German translations of headlines and excerpts, kept on the device. Only texts that are on screen are requested.
// The device asks Google Translate directly (it allows browser access and limits per address, so every
// device has its own budget). If that fails, the proxy route /translate is tried. Texts that come back
// unchanged or not at all are asked again later, at most three times, with growing pauses after refusals.
import { createContext, useContext, useSyncExternalStore } from 'react';
import { translateAll } from '../../../proxy/lib/translate.js';
import { PROXY } from '../data/feed';
import { sourceById } from '../data/sources';

const KEY = 'vectorscope.intel.de.v1';
const MAX_ENTRIES = 3000;
/** Texts per round: small, so Google does not refuse. */
const BATCH = 20;
const MAX_TRIES = 3;

const cache = new Map<string, string>();
try {
  for (const [k, v] of JSON.parse(localStorage.getItem(KEY) ?? '[]') as [string, string][]) if (k !== v) cache.set(k, v);
} catch {
  // No storage: translations are fetched again next time.
}

const queue = new Set<string>();
const tries = new Map<string, number>();
let timer: ReturnType<typeof setTimeout> | null = null;
let busy = false;
let pauseMs = 0;
let version = 0;
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify([...cache.entries()].slice(-MAX_ENTRIES)));
  } catch {
    // Storage full: keep the translations in memory for this session.
  }
}

async function viaProxy(texts: string[]): Promise<(string | null)[]> {
  const r = await fetch(`${PROXY}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts, to: 'de' }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return ((await r.json()) as { translations: (string | null)[] }).translations;
}

async function flush() {
  timer = null;
  if (busy || !queue.size) return;
  busy = true;
  const texts = [...queue].slice(0, BATCH);
  texts.forEach((t) => queue.delete(t));
  let out: (string | null)[] = [];
  try {
    out = await translateAll(texts, 'de');
    if (out.every((x) => x == null)) throw new Error('refused');
  } catch {
    out = await viaProxy(texts).catch(() => texts.map(() => null));
  }
  let refused = 0;
  texts.forEach((t, i) => {
    const de = out[i];
    if (de && de !== t) cache.set(t, de);
    else {
      refused++;
      const n = (tries.get(t) ?? 0) + 1;
      tries.set(t, n);
      if (n < MAX_TRIES) queue.add(t);
    }
  });
  // Everything refused: wait longer each time, up to five minutes. Otherwise continue at once.
  pauseMs = refused === texts.length ? Math.min(Math.max(pauseMs * 2, 5_000), 300_000) : 0;
  if (refused < texts.length) {
    version++;
    listeners.forEach((l) => l());
    persist();
  }
  busy = false;
  if (queue.size) schedule(pauseMs);
}

function schedule(delay = 80) {
  if (!timer) timer = setTimeout(flush, delay);
}

/** Subscribes the component tree to new translations. */
export function useTranslationVersion() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => version,
  );
}

/** The German text if known, otherwise the original, and the original is queued for translation. */
export function german(text: string, sourceId: string): string {
  if (!text || sourceById(sourceId)?.lang === 'de') return text;
  const hit = cache.get(text);
  if (hit) return hit;
  if (!queue.has(text) && (tries.get(text) ?? 0) < MAX_TRIES) {
    queue.add(text);
    schedule(pauseMs || 80);
  }
  return text;
}

export type Translate = (text: string, sourceId: string) => string;
export const TranslateContext = createContext<Translate>((t) => t);
export const useTr = () => useContext(TranslateContext);
