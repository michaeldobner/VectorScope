// Fills the database of the own server once from the raw archive, so it holds the whole history since
// 30 September 2026 and not only the rounds of the server. Follows the principle of the raw archive:
// the database is derived and can always be rebuilt from the round files (intel/docs/en/raw-data.md).
//
//   npx tsx collector/backfill.ts <raw folder> [--force]
//
// Needs DATABASE_URL. Runs only once: the table meta remembers it (key backfill). --force runs it again,
// which is safe: reports are merged with the same rule as every round, earliest time and first sight win.
// The collector loop on the server calls it on every start (server/collector-loop.mjs).
import pg from 'pg';
import type { Item } from '../intel/src/data/types';
import { parseArchive, rawFiles, readRecords, type Report } from './parse';
import { SCHEMA, reportRows, upsertReports } from './store';

/** Raise it when a better parser should fill the database again from the archive. */
export const BACKFILL_VERSION = '1';

/** The report as the collector stores it: the item, first sight as seen, Telegram details kept. */
export function reportItem(r: Report): Item {
  const { key, kind, tier, region, lang, firstSeen, lastChanged, versions, ...item } = r;
  return { ...item, seen: firstSeen };
}

export interface RoundRow {
  at: string;
  ms: number;
  ok: number;
  total: number;
  fresh: number;
  sources: Record<string, { ok: boolean; items: number; fresh: number; error?: string }>;
}

/** One row per round file: the round record with the per source result of its fetch records. */
export function roundsFromArchive(dir: string): RoundRow[] {
  const rows: RoundRow[] = [];
  for (const file of rawFiles(dir)) {
    let row: RoundRow | null = null;
    for (const r of readRecords(file)) {
      if (r.t === 'round') row = { at: new Date(r.at).toISOString(), ms: Math.round(r.ms), ok: r.ok, total: r.sources, fresh: r.fresh, sources: {} };
      if (r.t === 'fetch' && row) {
        const s = (row.sources[r.src] ??= { ok: false, items: 0, fresh: 0 });
        // A source with several channels counts as ok if one of them answered, as in the collector.
        s.ok ||= !r.error;
        s.items += r.units;
        s.fresh += r.fresh;
        if (r.error && !s.ok) s.error = r.error;
        else delete s.error;
      }
    }
    if (row) rows.push(row);
  }
  return rows;
}

export async function backfill(url: string, dir: string, force = false): Promise<string> {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(SCHEMA);
    await client.query('CREATE TABLE IF NOT EXISTS meta (key text PRIMARY KEY, value text NOT NULL, at timestamptz NOT NULL DEFAULT now())');
    const done = await client.query(`SELECT value FROM meta WHERE key = 'backfill'`);
    if (!force && done.rows[0]?.value === BACKFILL_VERSION) return `already done (version ${BACKFILL_VERSION})`;

    const { reports } = parseArchive(dir);
    const items = reports.map(reportItem);
    const rows = reportRows({ items, seen: (i) => i.seen ?? i.time });
    const rounds = roundsFromArchive(dir);

    await client.query('BEGIN');
    await upsertReports(client, rows);
    for (let i = 0; i < rounds.length; i += 500) {
      await client.query(
        `INSERT INTO rounds (at, ms, ok, total, fresh, sources)
         SELECT at, ms, ok, total, fresh, sources FROM jsonb_to_recordset($1::jsonb)
           AS r(at timestamptz, ms integer, ok integer, total integer, fresh integer, sources jsonb)
         ON CONFLICT (at) DO NOTHING`,
        [JSON.stringify(rounds.slice(i, i + 500))],
      );
    }
    await client.query(
      `INSERT INTO meta (key, value) VALUES ('backfill', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, at = now()`,
      [BACKFILL_VERSION],
    );
    await client.query('COMMIT');
    return `${rows.length} reports and ${rounds.length} rounds from the raw archive`;
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    await client.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const dir = args.find((a) => !a.startsWith('--'));
  if (!dir || !process.env.DATABASE_URL) {
    console.error('Usage: DATABASE_URL=… npx tsx collector/backfill.ts <raw folder> [--force]');
    process.exit(1);
  }
  backfill(process.env.DATABASE_URL, dir, args.includes('--force')).then(
    (result) => console.log(`Backfill: ${result}`),
    (e) => {
      console.log(`Backfill failed, the next start tries again: ${e instanceof Error ? e.message : String(e)}`);
      process.exit(1);
    },
  );
}
