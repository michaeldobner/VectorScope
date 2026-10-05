// German translations of headlines and excerpts, fetched through the proxy route /translate
// (Google Translate, unofficial) and kept on the device. Only texts that are on screen are requested.
import { createContext, useContext, useSyncExternalStore } from 'react';
import { PROXY } from '../data/feed';
import { sourceById } from '../data/sources';

const KEY = 'vectorscope.intel.de.v1';
const MAX_ENTRIES = 3000;
const BATCH = 60;
const RETRY_MS = 60_000;

const cache = new Map<string, string>();
try {
  for (const [k, v] of JSON.parse(localStorage.getItem(KEY) ?? '[]') as [string, string][]) cache.set(k, v);
} catch {
  // No storage: translations are fetched again next time.
}

const queue = new Set<string>();
let timer: ReturnType<typeof setTimeout> | null = null;
let busy = false;
let blockedUntil = 0;
let version = 0;
const listeners = new Set<() => void>();

function persist() {
  try {
    const entries = [...cache.entries()].slice(-MAX_ENTRIES);
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // Storage full: keep the translations in memory for this session.
  }
}

async function flush() {
  timer = null;
  if (busy || !queue.size || Date.now() < blockedUntil) return;
  busy = true;
  const texts = [...queue].slice(0, BATCH);
  texts.forEach((t) => queue.delete(t));
  try {
    const r = await fetch(`${PROXY}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, to: 'de' }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const { translations } = (await r.json()) as { translations: string[] };
    texts.forEach((t, i) => translations[i] && cache.set(t, translations[i]));
    version++;
    listeners.forEach((l) => l());
    persist();
  } catch {
    // Google or the proxy refused: try again in a minute, show the originals meanwhile.
    texts.forEach((t) => queue.add(t));
    blockedUntil = Date.now() + RETRY_MS;
    setTimeout(schedule, RETRY_MS);
  } finally {
    busy = false;
    if (queue.size) schedule();
  }
}

function schedule() {
  if (!timer) timer = setTimeout(flush, 80);
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
  if (!queue.has(text)) {
    queue.add(text);
    schedule();
  }
  return text;
}

export type Translate = (text: string, sourceId: string) => string;
export const TranslateContext = createContext<Translate>((t) => t);
export const useTr = () => useContext(TranslateContext);
