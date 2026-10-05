/** Normalised aircraft state, independent of the upstream source. */
export interface Aircraft {
  hex: string;
  callsign: string | null;
  registration: string | null;
  /** ICAO type designator, e.g. A20N, C17, K35R. */
  typeCode: string | null;
  typeName: string | null;
  operator: string | null;
  year: number | null;
  /** readsb dbFlags: 1 military, 2 interesting, 4 PIA, 8 LADD. */
  dbFlags: number;
  /** ADS-B emitter category, e.g. A3, A5, A7 (rotorcraft). */
  category: string | null;
  lat: number;
  lon: number;
  /** Altitude in feet (barometric preferred, geometric fallback). null when unknown. */
  altFt: number | null;
  onGround: boolean;
  gsKt: number | null;
  track: number | null;
  /** Degrees per second, positive = right turn. */
  trackRate: number | null;
  vRateFpm: number | null;
  squawk: string | null;
  emergency: string | null;
  /** Source of position: adsb, mlat, tisb, other. */
  posSource: 'adsb' | 'mlat' | 'tisb' | 'other';
  /** Epoch ms at which the position was valid. */
  posTime: number;
}

export interface FeedResult {
  aircraft: Aircraft[];
  /** Epoch ms of the upstream snapshot. */
  now: number;
}

export const DB_FLAG = { military: 1, interesting: 2, pia: 4, ladd: 8 } as const;
