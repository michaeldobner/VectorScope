// Votes of the Bundestag from abgeordnetenwatch.de (API v2, data CC0): every recorded vote with its result.
// Loaded by the collector only, the app gets the votes through its data.
import { plainText } from './text';
import type { Item } from './types';

/** Period of the 21st Bundestag (2025 to 2029) at abgeordnetenwatch.de, found by the test lab. */
export const AW_PERIOD = 161;
export const AW_POLLS_URL = `https://www.abgeordnetenwatch.de/api/v2/polls?field_legislature=${AW_PERIOD}&sort_by=field_poll_date&sort_direction=desc&range_end=15`;

interface AwPoll {
  id: number;
  label?: string;
  abgeordnetenwatch_url?: string;
  field_accepted?: boolean | null;
  field_intro?: string | null;
  field_poll_date?: string;
}

/** One report per vote, in German like the source: "Abstimmung im Bundestag: <title>, angenommen". The day of the vote at noon in Berlin (10:00 UTC), abgeordnetenwatch gives no time. */
export function parsePolls(json: { data?: AwPoll[] }, sourceId: string): Item[] {
  const out: Item[] = [];
  for (const p of json?.data ?? []) {
    const time = Date.parse(`${p.field_poll_date}T10:00:00Z`);
    if (!p.id || !p.label || !Number.isFinite(time)) continue;
    const result = p.field_accepted === true ? 'angenommen' : p.field_accepted === false ? 'abgelehnt' : '';
    const url = p.abgeordnetenwatch_url ?? `https://www.abgeordnetenwatch.de/node/${p.id}`;
    out.push({
      id: `api:${url}`,
      sourceId,
      channel: 'api',
      title: `Abstimmung im Bundestag: ${plainText(p.label)}${result ? `, ${result}` : ''}`,
      text: plainText(p.field_intro ?? '').slice(0, 600),
      url,
      time,
    });
  }
  return out;
}
