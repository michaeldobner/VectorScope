// Colour tokens. Colour is used to communicate meaning, not to decorate.
// Default: graphite with ice blue. Alternatives for comparison: ?theme=ice|night (saved per device).
// The CSS custom properties in styles.css are set from the active theme at start.

type Theme = {
  bg: string;
  panel: string;
  panelRaised: string;
  border: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  active: string;
  info: string;
  warning: string;
  critical: string;
  acStandard: string;
  acInteresting: string;
  acWatch: string;
  acEvent: string;
  acEmergency: string;
  mapLand: string;
  mapWater: string;
  mapUrban: string;
  mapBorder: string;
  mapBorderFaint: string;
  mapRoad: string;
  mapMotorway: string;
  mapAerodrome: string;
  mapRunway: string;
  mapCountryLabel: string;
  mapCityLabel: string;
  mapTownLabel: string;
  mapVillageLabel: string;
  mapAirportLabel: string;
};

const ice: Theme = {
  bg: '#0B0F14',
  panel: '#111821',
  panelRaised: '#17212B',
  border: '#25313D',
  text: '#EDF2F6',
  textSecondary: '#8F9BA8',
  textTertiary: '#5E6A77',
  accent: '#55BDEB',
  active: '#7DD3FC',
  info: '#4C7DFF',
  warning: '#E9A23B',
  critical: '#E55757',
  acStandard: '#7F8A96',
  acInteresting: '#55BDEB',
  acWatch: '#4C7DFF',
  acEvent: '#E9A23B',
  acEmergency: '#E55757',
  mapLand: '#111921',
  mapWater: '#13222F',
  mapUrban: '#16202A',
  mapBorder: '#3A4958',
  mapBorderFaint: '#26323E',
  mapRoad: '#1E2A36',
  mapMotorway: '#2A3846',
  mapAerodrome: '#18232E',
  mapRunway: '#4A5A6A',
  mapCountryLabel: '#6F7C89',
  mapCityLabel: '#C9D3DC',
  mapTownLabel: '#9AA7B3',
  mapVillageLabel: '#6F7C89',
  mapAirportLabel: '#8FB8D0',
};

/** Neutral dark grey like Apple Maps, white text and aircraft, ice blue as the only accent. */
const graphite: Theme = {
  bg: '#0E0E10',
  panel: '#1C1C1E',
  panelRaised: '#2C2C2E',
  border: '#38383A',
  text: '#F5F5F7',
  textSecondary: '#A1A1A6',
  textTertiary: '#6E6E73',
  accent: '#55BDEB',
  active: '#7DD3FC',
  info: '#4C7DFF',
  warning: '#FF9F0A',
  critical: '#FF453A',
  acStandard: '#E5E5EA',
  acInteresting: '#55BDEB',
  acWatch: '#4C7DFF',
  acEvent: '#FF9F0A',
  acEmergency: '#FF453A',
  mapLand: '#1D1D20',
  mapWater: '#13202C',
  mapUrban: '#252528',
  mapBorder: '#55555A',
  mapBorderFaint: '#3A3A3E',
  mapRoad: '#2E2E32',
  mapMotorway: '#45454A',
  mapAerodrome: '#28282C',
  mapRunway: '#5A5A60',
  mapCountryLabel: '#8E8E93',
  mapCityLabel: '#F2F2F7',
  mapTownLabel: '#C7C7CC',
  mapVillageLabel: '#8E8E93',
  mapAirportLabel: '#8CCDEB',
};

/** Deep night chart with warm aircraft, the classic look of air traffic displays. */
const night: Theme = {
  bg: '#0A0C0F',
  panel: '#14171B',
  panelRaised: '#1E2227',
  border: '#2C3137',
  text: '#F2F4F6',
  textSecondary: '#9AA1A9',
  textTertiary: '#666D75',
  accent: '#FFC53D',
  active: '#FFE08A',
  info: '#5AC8FA',
  warning: '#FF9F0A',
  critical: '#FF453A',
  acStandard: '#FFC53D',
  acInteresting: '#5AC8FA',
  acWatch: '#BF5AF2',
  acEvent: '#FF9F0A',
  acEmergency: '#FF453A',
  mapLand: '#15181C',
  mapWater: '#0C1218',
  mapUrban: '#1C2025',
  mapBorder: '#4A5058',
  mapBorderFaint: '#30353B',
  mapRoad: '#23272C',
  mapMotorway: '#363B42',
  mapAerodrome: '#1E2227',
  mapRunway: '#555C64',
  mapCountryLabel: '#80878F',
  mapCityLabel: '#E9ECEF',
  mapTownLabel: '#AEB4BA',
  mapVillageLabel: '#80878F',
  mapAirportLabel: '#FFC53D',
};

export const THEMES = { ice, graphite, night } as const;
export type ThemeName = keyof typeof THEMES;

function pickTheme(): ThemeName {
  try {
    const q = new URLSearchParams(location.search).get('theme');
    if (q && q in THEMES) {
      localStorage.setItem('vectorscope.theme.v2', q);
      return q as ThemeName;
    }
    const saved = localStorage.getItem('vectorscope.theme.v2');
    if (saved && saved in THEMES) return saved as ThemeName;
  } catch {
    /* storage unavailable */
  }
  return 'graphite';
}

export const THEME_NAME: ThemeName = pickTheme();
export const C: Theme = THEMES[THEME_NAME];

export const TONE_COLOR = {
  standard: C.acStandard,
  interesting: C.acInteresting,
  watch: C.acWatch,
  event: C.acEvent,
  emergency: C.acEmergency,
} as const;

/** Push the active theme into the CSS custom properties used by styles.css. */
export function applyThemeToCss() {
  const r = document.documentElement.style;
  const set: Record<string, string> = {
    '--bg': C.bg,
    '--panel': C.panel,
    '--raised': C.panelRaised,
    '--border': C.border,
    '--text': C.text,
    '--text-2': C.textSecondary,
    '--text-3': C.textTertiary,
    '--accent': C.accent,
    '--active': C.active,
    '--info': C.info,
    '--warning': C.warning,
    '--critical': C.critical,
    '--tone-standard': C.acStandard,
    '--tone-interesting': C.acInteresting,
    '--tone-watch': C.acWatch,
    '--tone-event': C.acEvent,
    '--tone-emergency': C.acEmergency,
  };
  for (const [k, v] of Object.entries(set)) r.setProperty(k, v);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', C.bg);
  document.documentElement.dataset.theme = THEME_NAME;
}
