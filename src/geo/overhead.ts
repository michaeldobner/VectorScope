import { bearingDeg, cpa, distanceM, elevationDeg, type CpaResult, type LatLon } from './geo';

export type SkyState = 'zenith' | 'overhead' | 'approaching' | 'visible' | 'none';

export interface SkyGeometry {
  distM: number;
  bearing: number;
  /** Elevation angle now, degrees above the horizon. */
  elevation: number;
  cpa: CpaResult | null;
  /** Elevation angle expected at closest approach. */
  cpaElevation: number | null;
  state: SkyState;
}

export const SKY = {
  zenithDeg: 70,
  overheadDeg: 45,
  visibleDeg: 15,
  visibleMaxM: 30_000,
  lookaheadSec: 600,
};

export interface SkyInput {
  lat: number;
  lon: number;
  /** Altitude above mean sea level, metres. null when unknown. */
  altM: number | null;
  onGround: boolean;
  speedMps: number | null;
  track: number | null;
  /** Vertical rate in m/s. */
  vRateMps: number | null;
}

/**
 * Sky geometry relative to an observer. "Overhead" is defined by elevation angle,
 * not by a fixed radius: an airliner at 11 km altitude and 8 km distance is high in
 * the sky, a helicopter at 300 m and 8 km distance sits on the horizon.
 */
export function skyGeometry(observer: LatLon, observerAltM: number, ac: SkyInput): SkyGeometry {
  const pos = { lat: ac.lat, lon: ac.lon };
  const distM = distanceM(observer, pos);
  const bearing = bearingDeg(observer, pos);
  if (ac.onGround || ac.altM == null) {
    return { distM, bearing, elevation: 0, cpa: null, cpaElevation: null, state: 'none' };
  }
  const h = ac.altM - observerAltM;
  const elevation = elevationDeg(distM, h);

  let c: CpaResult | null = null;
  let cpaElevation: number | null = null;
  if (ac.speedMps != null && ac.track != null && ac.speedMps > 15) {
    c = cpa(observer, pos, ac.speedMps, ac.track);
    if (c.tSec > 0) {
      const hAtCpa = h + (ac.vRateMps ?? 0) * Math.min(c.tSec, SKY.lookaheadSec);
      cpaElevation = elevationDeg(c.distM, Math.max(hAtCpa, 0));
    }
  }

  let state: SkyState = 'none';
  if (elevation >= SKY.zenithDeg) state = 'zenith';
  else if (elevation >= SKY.overheadDeg) state = 'overhead';
  else if (
    c &&
    c.tSec > 0 &&
    c.tSec <= SKY.lookaheadSec &&
    cpaElevation != null &&
    cpaElevation >= SKY.overheadDeg
  )
    state = 'approaching';
  else if (elevation >= SKY.visibleDeg && distM <= SKY.visibleMaxM) state = 'visible';

  return { distM, bearing, elevation, cpa: c, cpaElevation, state };
}

/** Sort key for the OVERHEAD list: things in the sky now first, then by time to closest approach. */
export function overheadRank(g: SkyGeometry): number {
  switch (g.state) {
    case 'zenith':
      return 0 - g.elevation / 100;
    case 'overhead':
      return 1 - g.elevation / 100;
    case 'approaching':
      return 2 + (g.cpa?.tSec ?? 0) / 10_000;
    case 'visible':
      return 3 - g.elevation / 100;
    default:
      return 9;
  }
}
