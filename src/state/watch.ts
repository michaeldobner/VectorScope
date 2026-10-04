import type { Aircraft } from '../data/types';
import type { WatchEntry } from './settings';

export function watchMatch(ac: Aircraft, list: WatchEntry[]): WatchEntry | null {
  for (const w of list) {
    const v = w.value.toUpperCase();
    switch (w.kind) {
      case 'hex':
        if (ac.hex === v) return w;
        break;
      case 'registration':
        if (ac.registration?.toUpperCase().replace(/\s/g, '') === v.replace(/\s/g, '')) return w;
        break;
      case 'callsign':
        if (ac.callsign?.toUpperCase().startsWith(v)) return w;
        break;
      case 'type':
        if (ac.typeCode?.toUpperCase() === v) return w;
        break;
    }
  }
  return null;
}
