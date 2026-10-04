// Geodesy helpers for "what is above me". All distances in metres, angles in degrees.
// For the ranges we care about (< 400 km) a local tangent plane (ENU) is accurate enough.

export const EARTH_RADIUS_M = 6_371_008.8;
const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

export interface LatLon {
  lat: number;
  lon: number;
}

/** Great-circle distance (haversine), metres. */
export function distanceM(a: LatLon, b: LatLon): number {
  const dLat = (b.lat - a.lat) * D2R;
  const dLon = (b.lon - a.lon) * D2R;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * D2R) * Math.cos(b.lat * D2R) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Initial bearing from a to b, 0..360 (0 = north). */
export function bearingDeg(a: LatLon, b: LatLon): number {
  const φ1 = a.lat * D2R;
  const φ2 = b.lat * D2R;
  const Δλ = (b.lon - a.lon) * D2R;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (Math.atan2(y, x) * R2D + 360) % 360;
}

/** Destination point from start, bearing and distance (metres). */
export function destination(start: LatLon, bearing: number, distM: number): LatLon {
  const δ = distM / EARTH_RADIUS_M;
  const θ = bearing * D2R;
  const φ1 = start.lat * D2R;
  const λ1 = start.lon * D2R;
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 =
    λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
  return { lat: φ2 * R2D, lon: ((λ2 * R2D + 540) % 360) - 180 };
}

/** Local east/north offset (metres) of p relative to origin. */
export function toEN(origin: LatLon, p: LatLon): { e: number; n: number } {
  const e = (p.lon - origin.lon) * D2R * EARTH_RADIUS_M * Math.cos(origin.lat * D2R);
  const n = (p.lat - origin.lat) * D2R * EARTH_RADIUS_M;
  return { e, n };
}

/**
 * Elevation angle of a target seen from the observer, including earth curvature.
 * heightAboveObserverM: target altitude minus observer altitude.
 */
export function elevationDeg(groundDistM: number, heightAboveObserverM: number): number {
  const drop = (groundDistM * groundDistM) / (2 * EARTH_RADIUS_M);
  return Math.atan2(heightAboveObserverM - drop, Math.max(groundDistM, 1)) * R2D;
}

export interface CpaResult {
  /** Seconds until closest approach; negative means it already passed. */
  tSec: number;
  /** Horizontal distance at closest approach, metres. */
  distM: number;
  /** Bearing from observer to the aircraft at closest approach. */
  bearing: number;
  /** Range rate in m/s, negative = approaching. */
  rangeRate: number;
}

/**
 * Closest point of approach for straight-line motion.
 * speedMps: ground speed, trackDeg: true track (0 = north).
 */
export function cpa(observer: LatLon, ac: LatLon, speedMps: number, trackDeg: number): CpaResult {
  const r = toEN(observer, ac);
  const ve = speedMps * Math.sin(trackDeg * D2R);
  const vn = speedMps * Math.cos(trackDeg * D2R);
  const v2 = ve * ve + vn * vn;
  const range = Math.hypot(r.e, r.n);
  const rDotV = r.e * ve + r.n * vn;
  if (v2 < 1e-6) {
    return { tSec: 0, distM: range, bearing: bearingDeg(observer, ac), rangeRate: 0 };
  }
  const t = -rDotV / v2;
  const ce = r.e + ve * t;
  const cn = r.n + vn * t;
  return {
    tSec: t,
    distM: Math.hypot(ce, cn),
    bearing: (Math.atan2(ce, cn) * R2D + 360) % 360,
    rangeRate: range > 0 ? rDotV / range : 0,
  };
}

/** Dead-reckon a position forward by dtSec along track (optionally turning). */
export function project(
  p: LatLon,
  speedMps: number,
  trackDeg: number,
  dtSec: number,
  turnRateDegPerSec = 0,
): LatLon {
  if (Math.abs(turnRateDegPerSec) < 0.05) return destination(p, trackDeg, speedMps * dtSec);
  // Integrate a constant-rate turn in small steps.
  const steps = Math.max(1, Math.ceil(Math.abs(dtSec) / 5));
  const h = dtSec / steps;
  let pos = p;
  let trk = trackDeg;
  for (let i = 0; i < steps; i++) {
    pos = destination(pos, trk + (turnRateDegPerSec * h) / 2, speedMps * h);
    trk += turnRateDegPerSec * h;
  }
  return pos;
}

/** Polygon ring approximating a circle, as [lon, lat] pairs (closed). */
export function circleRing(center: LatLon, radiusM: number, segments = 128): [number, number][] {
  const ring: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const p = destination(center, (i / segments) * 360, radiusM);
    ring.push([p.lon, p.lat]);
  }
  return ring;
}

const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
export function compassPoint(bearing: number): string {
  return COMPASS[Math.round((((bearing % 360) + 360) % 360) / 22.5) % 16];
}

/** Angular difference a-b normalised to -180..180. */
export function angleDiff(a: number, b: number): number {
  return ((a - b + 540) % 360) - 180;
}
