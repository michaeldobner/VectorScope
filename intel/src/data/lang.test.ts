import { describe, expect, it } from 'vitest';
import { detectLang, needsTranslation } from './lang';

describe('language of a report', () => {
  it('knows the script and the language', () => {
    expect(detectLang('Взрыв и пожар на НПЗ в Воронеже')).toBe('ru');
    expect(detectLang('Атака на Київ: збито 12 дронів')).toBe('uk');
    expect(detectLang('פיצוץ בנמל')).toBe('he');
    expect(detectLang('Luftwaffe verlegt Eurofighter nach Rumänien')).toBe('de');
    expect(detectLang('Hat Merz seine CDU noch im Griff?')).toBe('de');
    expect(detectLang('Drone attack causes fire at oil refinery in Voronezh')).toBe('en');
    expect(detectLang('FORTE11')).toBeNull();
  });

  it('translates per text, not per source', () => {
    // Rybar DE writes German, but quotes Russian.
    expect(needsTranslation('Die Lage bei Kupjansk ist angespannt', 'de', 'de')).toBe(false);
    expect(needsTranslation('Обстановка под Купянском', 'de', 'de')).toBe(true);
    expect(needsTranslation('Merz trifft Macron', 'de', 'de')).toBe(false);
    expect(needsTranslation('Merz trifft Macron', 'en', 'de')).toBe(true);
    expect(needsTranslation('B-52', 'de', 'en')).toBe(false);
  });
});
