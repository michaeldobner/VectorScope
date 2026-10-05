// Formatting in German number format, interface texts in English like AIR.
const de = new Intl.NumberFormat('de-DE');

export function age(time: number, now = Date.now()): string {
  const min = Math.max(0, Math.round((now - time) / 60_000));
  if (min < 1) return 'now';
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 48) return `${h} h`;
  return `${Math.round(h / 24)} d`;
}

export const altitude = (ft: number | null) => (ft == null ? '' : `${de.format(Math.round((ft * 0.3048) / 50) * 50)} m`);
export const km = (m: number) => `${de.format(Math.round(m / 1000))} km`;
export const count = (n: number) => de.format(n);

/** "3 min ago", or "just now". */
export const ago = (time: number, now = Date.now()) => {
  const a = age(time, now);
  return a === 'now' ? 'just now' : `${a} ago`;
};
