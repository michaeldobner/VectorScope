// Reports in English or German. First choice: the translations the collector made once for everybody
// (item.tr, collector/translate.ts). Only a report the collector has not translated yet, for example a post
// of the last minutes, is translated on the device: it asks Google Translate directly (every device has its own
// budget), then the proxy route /translate. Texts that come back unchanged or not at all are asked again later,
// at most three times, with growing pauses after refusals. Kept on the device.
import { createContext, useContext, useSyncExternalStore } from 'react';
import { translateAll } from '../../../proxy/lib/translate.js';
import { PROXY } from '../data/feed';
import { needsTranslation, TARGETS, type Target } from '../data/lang';
import { sourceById } from '../data/sources';
import { clip } from '../data/text';
import type { Item } from '../data/types';

const KEY = 'vectorscope.intel.tr.v2';
const MAX_ENTRIES = 3000;
/** Texts per round: small, so Google does not refuse. */
const BATCH = 20;
const MAX_TRIES = 3;
/** The collector translates excerpts clipped like its data. */
const TEXT_CLIP = 300;

/** Device translations, key: target, a tab, the original. */
const cache = new Map<string, string>();
/** Translations of the collector, key: target, a tab, the original. */
const server = new Map<string, string>();
const k = (target: Target, text: string) => `${target}\t${text}`;
try {
  for (const [key, v] of JSON.parse(localStorage.getItem(KEY) ?? '[]') as [string, string][]) cache.set(key, v);
} catch {
  // No storage: translations are fetched again next time.
}

const queues: Record<Target, Set<string>> = { en: new Set(), de: new Set() };
const tries = new Map<string, number>();
// Refusals are forgotten every 15 minutes: a text Google refused three times is asked again later, never given up.
if (typeof window !== 'undefined') setInterval(() => tries.clear(), 15 * 60_000);
let timer: ReturnType<typeof setTimeout> | null = null;
let busy = false;
let pauseMs = 0;
let version = 0;
const listeners = new Set<() => void>();
const notify = () => {
  version++;
  listeners.forEach((l) => l());
};

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify([...cache.entries()].slice(-MAX_ENTRIES)));
  } catch {
    // Storage full: keep the translations in memory for this session.
  }
}

/** Takes over the translations the collector attached to its reports. */
export function learnTranslations(items: Item[]) {
  let added = 0;
  for (const i of items) {
    for (const target of TARGETS) {
      const t = i.tr?.[target];
      if (!t) continue;
      if (t.title && !server.has(k(target, i.title))) (server.set(k(target, i.title), t.title), added++);
      if (t.text && i.text) {
        const clipped = clip(i.text, TEXT_CLIP);
        if (!server.has(k(target, clipped))) (server.set(k(target, clipped), t.text), added++);
      }
    }
  }
  if (added) notify();
}

async function viaProxy(texts: string[], to: Target): Promise<(string | null)[]> {
  const r = await fetch(`${PROXY}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts, to }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return ((await r.json()) as { translations: (string | null)[] }).translations;
}

async function flush() {
  timer = null;
  const target = TARGETS.find((t) => queues[t].size);
  if (busy || !target) return;
  busy = true;
  const queue = queues[target];
  const texts = [...queue].slice(0, BATCH);
  texts.forEach((t) => queue.delete(t));
  let out: (string | null)[] = [];
  try {
    out = await translateAll(texts, target);
    if (out.every((x) => x == null)) throw new Error('refused');
  } catch {
    out = await viaProxy(texts, target).catch(() => texts.map(() => null));
  }
  let refused = 0;
  texts.forEach((t, i) => {
    const done = out[i];
    if (done && done !== t) cache.set(k(target, t), done);
    else {
      refused++;
      const n = (tries.get(k(target, t)) ?? 0) + 1;
      tries.set(k(target, t), n);
      if (n < MAX_TRIES) queue.add(t);
    }
  });
  // Everything refused: wait longer each time, up to five minutes. Otherwise continue at once.
  pauseMs = refused === texts.length ? Math.min(Math.max(pauseMs * 2, 5_000), 300_000) : 0;
  if (refused < texts.length) {
    notify();
    persist();
  }
  busy = false;
  if (TARGETS.some((t) => queues[t].size)) schedule(pauseMs);
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

/**
 * The text in `target` if known, otherwise the original, and the original is queued for translation.
 * A text already written in the target language stays as it is, whatever its source.
 */
export function translate(text: string, sourceId: string, target: Target): string {
  if (!needsTranslation(text, target, sourceById(sourceId)?.lang)) return text;
  const hit = server.get(k(target, text)) ?? server.get(k(target, clip(text, TEXT_CLIP))) ?? cache.get(k(target, text));
  if (hit) return hit;
  if (!queues[target].has(text) && (tries.get(k(target, text)) ?? 0) < MAX_TRIES) {
    queues[target].add(text);
    schedule(pauseMs || 80);
  }
  return text;
}

export type Translate = (text: string, sourceId: string) => string;
export const TranslateContext = createContext<Translate>((t) => t);
export const useTr = () => useContext(TranslateContext);
