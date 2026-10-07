// Database of the collector on the own server (server/). Keeps every report and every round for good,
// while archive.json only holds the last 7 days. Used only when DATABASE_URL is set, so the collector on
// GitHub Actions keeps working without a database.
//
//   reports  one row per report key (itemKey), earliest publication and first sight, the report as JSON
//   rounds   one row per round: duration, sources ok, new reports, per source status as JSON
import pg from 'pg';
import { itemKey } from '../intel/src/data/feed';
import type { Item } from '../intel/src/data/types';
import type { RunRecord } from './checks';

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS reports (
  key      text PRIMARY KEY,
  source   text NOT NULL,
  channel  text NOT NULL,
  time     timestamptz NOT NULL,
  seen     timestamptz NOT NULL,
  item     jsonb NOT NULL,
  updated  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reports_time ON reports (time DESC);
CREATE INDEX IF NOT EXISTS reports_seen ON reports (seen DESC);
CREATE INDEX IF NOT EXISTS reports_source ON reports (source, time DESC);
CREATE TABLE IF NOT EXISTS rounds (
  at       timestamptz PRIMARY KEY,
  ms       integer NOT NULL,
  ok       integer NOT NULL,
  total    integer NOT NULL,
  fresh    integer NOT NULL,
  sources  jsonb NOT NULL
);
`;

export interface StoredRound {
  run: RunRecord;
  items: Item[];
  /** First sight of every item key, the collector's memory. */
  seen: (item: Item) => number;
}

/** One row per report, ready for jsonb_to_recordset. Exported for the tests. */
export function reportRows({ items, seen }: Pick<StoredRound, 'items' | 'seen'>) {
  const rows = new Map<string, { key: string; source: string; channel: string; time: string; seen: string; item: Item }>();
  for (const item of items) {
    const key = itemKey(item);
    if (!key || !Number.isFinite(item.time)) continue;
    rows.set(key, {
      key,
      source: item.sourceId,
      channel: item.channel,
      time: new Date(item.time).toISOString(),
      seen: new Date(seen(item)).toISOString(),
      item,
    });
  }
  return [...rows.values()];
}

/** Writes one round and its reports. Earliest time and first sight win, the newest text replaces the old one. */
export async function storeRound(url: string, round: StoredRound): Promise<{ reports: number }> {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(SCHEMA);
    const rows = reportRows(round);
    await client.query('BEGIN');
    // Batches keep a single statement small even with thousands of reports.
    for (let i = 0; i < rows.length; i += 500) {
      await client.query(
        `INSERT INTO reports (key, source, channel, time, seen, item)
         SELECT key, source, channel, time, seen, item FROM jsonb_to_recordset($1::jsonb)
           AS r(key text, source text, channel text, time timestamptz, seen timestamptz, item jsonb)
         ON CONFLICT (key) DO UPDATE SET
           time = LEAST(reports.time, EXCLUDED.time),
           seen = LEAST(reports.seen, EXCLUDED.seen),
           item = EXCLUDED.item,
           updated = now()`,
        [JSON.stringify(rows.slice(i, i + 500))],
      );
    }
    const sources = Object.values(round.run.sources);
    await client.query(
      `INSERT INTO rounds (at, ms, ok, total, fresh, sources) VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (at) DO NOTHING`,
      [
        new Date(round.run.at).toISOString(),
        Math.round(round.run.ms),
        sources.filter((s) => s.ok).length,
        sources.length,
        sources.reduce((n, s) => n + (s.fresh ?? 0), 0),
        JSON.stringify(round.run.sources),
      ],
    );
    await client.query('COMMIT');
    return { reports: rows.length };
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    await client.end();
  }
}
