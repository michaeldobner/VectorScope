// Air alerts: the Ukrainian Air Force posts every drone and missile track as a short message
// ("Реактивний БпЛА на Бориспіль."), several hundred a day. They are live tracking, not events:
// they get their own pulse tile instead of flooding the stories. Takeoffs of strategic bombers
// and the morning summary of what was shot down stay ordinary reports.
import type { Item } from './types';

export const ALERT_SOURCES = new Set(['kpszsu']);

export function isAirTrack(item: Item): boolean {
  if (!ALERT_SOURCES.has(item.sourceId)) return false;
  const text = `${item.title} ${item.text}`.trim();
  return text.length < 300 && !/зліт|збито|подавлено/i.test(text);
}
