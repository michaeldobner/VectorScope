// Checks on the collected data, after every round: is a source failing, has a busy source gone silent,
// do the reports look like reports. The result is health.json on the branch collector-data,
// warnings also go into the summary of the GitHub Actions run. Details: intel/docs/en/raw-data.md
import type { Item } from '../intel/src/data/types';

const HOUR = 3600_000;

export interface RunRecord {
  at: number;
  ms: number;
  sources: Record<string, { ok: boolean; items: number; fresh: number; error?: string }>;
  /** Texts translated in this round, refused by Google, still waiting, characters sent (collector/translate.ts). */
  translation?: { translated: number; refused: number; waiting: number; chars: number };
  /** Reports embedded in this round and how many joined an existing topic (collector/embed.ts). */
  topics?: { embedded: number; joined: number };
}

export interface SourceHealth {
  id: string;
  ok: boolean;
  /** Failed rounds in a row up to now. */
  failing: number;
  /** New reports per day over the last 7 days. */
  perDay: number;
  /** Hours since the last new report, null if none in the window. */
  quietHours: number | null;
  lastError?: string;
}

export interface Health {
  at: number;
  rounds24h: number;
  /** Longest gap between two rounds in the last 24 hours, minutes. */
  maxGapMin: number;
  sources: SourceHealth[];
  /** Reports that break an assumption: no time, time in the future, no link, no headline. */
  badItems: { key: string; problem: string }[];
  warnings: string[];
}

export function itemProblem(i: Item, now: number): string | null {
  if (!Number.isFinite(i.time)) return 'no time';
  if (i.time > now + HOUR) return 'time in the future';
  if (!/^https?:\/\//.test(i.url)) return 'no link';
  if (!i.title?.trim()) return 'no headline';
  return null;
}

export function checkHealth(runs: RunRecord[], items: Item[], now: number): Health {
  const week = runs.filter((r) => now - r.at < 7 * 24 * HOUR);
  const day = runs.filter((r) => now - r.at < 24 * HOUR);
  const gaps = day.slice(1).map((r, i) => (r.at - day[i].at) / 60_000);
  const last = runs[runs.length - 1];
  const ids = Object.keys(last?.sources ?? {});
  const spanDays = week.length > 1 ? Math.max((week[week.length - 1].at - week[0].at) / (24 * HOUR), 1 / 24) : 1;
  const warnings: string[] = [];

  const sources = ids.map((id): SourceHealth => {
    let failing = 0;
    for (let i = runs.length - 1; i >= 0 && runs[i].sources[id] && !runs[i].sources[id].ok; i--) failing++;
    const fresh = week.reduce((n, r) => n + (r.sources[id]?.fresh ?? 0), 0);
    const lastFresh = [...week].reverse().find((r) => (r.sources[id]?.fresh ?? 0) > 0);
    const perDay = fresh / spanDays;
    const quietHours = lastFresh ? (now - lastFresh.at) / HOUR : null;
    const s = last.sources[id];
    if (failing >= 3) warnings.push(`${id}: failed ${failing} rounds in a row (${s.error ?? 'no error text'})`);
    // A source with at least 8 new reports a day that has been quiet for 4 typical gaps, at least 6 hours.
    if (perDay >= 8 && quietHours != null && quietHours > Math.max(6, (4 * 24) / perDay))
      warnings.push(`${id}: no new report for ${Math.round(quietHours)} h, usually ${Math.round(perDay)} a day`);
    return { id, ok: s.ok, failing, perDay: Math.round(perDay * 10) / 10, quietHours: quietHours == null ? null : Math.round(quietHours * 10) / 10, ...(s.error ? { lastError: s.error } : {}) };
  });

  const maxGapMin = gaps.length ? Math.round(Math.max(...gaps)) : 0;
  if (maxGapMin > 30) warnings.push(`gap of ${maxGapMin} min between two rounds in the last 24 h`);
  if (last && ids.length && sources.filter((s) => s.ok).length < ids.length * 0.9) warnings.push(`only ${sources.filter((s) => s.ok).length}/${ids.length} sources answered in the last round`);

  const badItems = items.flatMap((i) => {
    const problem = itemProblem(i, now);
    return problem ? [{ key: i.id, problem }] : [];
  });
  if (badItems.length) warnings.push(`${badItems.length} reports break an assumption, e.g. ${badItems[0].key}: ${badItems[0].problem}`);

  return { at: now, rounds24h: day.length, maxGapMin, sources, badItems: badItems.slice(0, 50), warnings };
}

/** Markdown for the summary of the GitHub Actions run. */
export function healthMarkdown(h: Health): string {
  const ok = h.sources.filter((s) => s.ok).length;
  const lines = [`### Collector ${new Date(h.at).toISOString().slice(0, 16)}Z`, '', `${ok}/${h.sources.length} sources ok, ${h.rounds24h} rounds in 24 h, longest gap ${h.maxGapMin} min.`];
  if (h.warnings.length) lines.push('', ...h.warnings.map((w) => `* ${w}`));
  return lines.join('\n') + '\n';
}
