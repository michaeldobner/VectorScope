// Matching of posts with live military aircraft from adsb.lol.
import type { Aircraft } from '../../../air/src/data/types';
import { distanceM } from '../../../air/src/geo/geo';
import type { Entities } from './entities';
import type { Match } from './types';

/** Only recent items are matched: an article from last week says nothing about who is flying now. */
export const MATCH_MAX_AGE_MS = 48 * 3600_000;
/** An aircraft counts as "there" within the area of the place plus this margin. */
const AREA_MARGIN_KM = 150;

const normCallsign = (c: string | null) => (c ?? '').replace(/\s+/g, '').toUpperCase();

export function matchLive(entities: Entities, live: Aircraft[], itemTime: number, now: number): Match[] {
  if (now - itemTime > MATCH_MAX_AGE_MS || !live.length) return [];
  const out = new Map<string, Match>();

  // 1. Callsign named in the text and in the air now.
  for (const c of entities.callsigns) {
    for (const ac of live) {
      if (normCallsign(ac.callsign) === c.callsign) out.set(ac.hex, { ac, kind: 'callsign', label: c.callsign });
    }
  }

  // 2. Type named in the text: near a named place is a strong hint, anywhere a weak one.
  for (const t of entities.types) {
    if (!t.codes.length) continue;
    for (const ac of live) {
      if (out.has(ac.hex) || !ac.typeCode || !t.codes.includes(ac.typeCode)) continue;
      let best: { name: string; distM: number } | null = null;
      for (const p of entities.places) {
        const distM = distanceM({ lat: ac.lat, lon: ac.lon }, { lat: p.lat, lon: p.lon });
        if (distM <= (p.radiusKm + AREA_MARGIN_KM) * 1000 && (!best || distM < best.distM)) best = { name: p.name, distM };
      }
      out.set(
        ac.hex,
        best ? { ac, kind: 'type-area', label: t.label, distM: best.distM, place: best.name } : { ac, kind: 'type', label: t.label },
      );
    }
  }

  const rank = { callsign: 0, 'type-area': 1, type: 2 } as const;
  return [...out.values()].sort((a, b) => rank[a.kind] - rank[b.kind] || (a.distM ?? 0) - (b.distM ?? 0));
}

/** A match worth highlighting: named callsign, or type near a named place. */
export const isStrong = (m: Match) => m.kind !== 'type';
