import type { Units } from '../state/settings';

// German number formatting (34.000, 12,4), metric units by default.
const nf0 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const FT_TO_M = 0.3048;
export const KT_TO_KMH = 1.852;
export const KT_TO_MPS = 0.514444;
export const FPM_TO_MPS = 0.00508;

export function int(v: number) {
  return nf0.format(v);
}

export function altitude(ft: number | null, units: Units, onGround = false): string {
  if (onGround) return 'GND';
  if (ft == null) return '·';
  if (units === 'aviation') return `${nf0.format(Math.round(ft / 100) * 100)} ft`;
  return `${nf0.format(Math.round((ft * FT_TO_M) / 10) * 10)} m`;
}

/** Short altitude for map labels. */
export function altitudeShort(ft: number | null, units: Units, onGround = false): string {
  if (onGround) return 'GND';
  if (ft == null) return '';
  if (units === 'aviation') return `FL${String(Math.round(ft / 100)).padStart(3, '0')}`;
  return `${nf0.format(Math.round((ft * FT_TO_M) / 50) * 50)} m`;
}

export function flightLevel(ft: number | null): string | null {
  if (ft == null || ft < 5000) return null;
  return `FL${String(Math.round(ft / 100)).padStart(3, '0')}`;
}

export function speed(kt: number | null, units: Units): string {
  if (kt == null) return '·';
  if (units === 'aviation') return `${nf0.format(kt)} kt`;
  return `${nf0.format(kt * KT_TO_KMH)} km/h`;
}

export function vrate(fpm: number | null, units: Units): string {
  if (fpm == null) return '·';
  const sign = fpm > 50 ? '+' : fpm < -50 ? '−' : '±';
  if (units === 'aviation') return `${sign}${nf0.format(Math.abs(Math.round(fpm / 10) * 10))} ft/min`;
  return `${sign}${nf1.format(Math.abs(fpm * FPM_TO_MPS))} m/s`;
}

export function distance(m: number): string {
  if (m < 1000) return `${nf0.format(Math.round(m / 10) * 10)} m`;
  if (m < 20_000) return `${nf1.format(m / 1000)} km`;
  return `${nf0.format(m / 1000)} km`;
}

export function heading(deg: number | null): string {
  if (deg == null) return '·';
  return `${String(Math.round(deg) % 360).padStart(3, '0')}°`;
}

export function duration(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export function ago(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s} s`;
  return `${Math.floor(s / 60)} min`;
}

export function degrees(v: number): string {
  return `${nf0.format(Math.round(v))}°`;
}
