// Visual DNA: #0B0F14 + #EDF2F6 + #55BDEB. Colour is used exclusively to communicate meaning.
// Mirrors the CSS custom properties in styles.css (the map needs them in JS).

export const C = {
  bg: '#0B0F14',
  panel: '#111821',
  panelRaised: '#17212B',
  border: '#25313D',
  text: '#EDF2F6',
  textSecondary: '#8F9BA8',
  accent: '#55BDEB',
  active: '#7DD3FC',
  info: '#4C7DFF',
  warning: '#E9A23B',
  critical: '#E55757',

  // Aircraft
  acStandard: '#7F8A96',
  acInteresting: '#55BDEB',
  acWatch: '#4C7DFF',
  acEvent: '#E9A23B',
  acEmergency: '#E55757',

  // Basemap
  mapLand: '#0E141A',
  mapWater: '#122030',
  mapUrban: '#121A22',
  mapBorder: '#2A3744',
  mapBorderFaint: '#1C2630',
  mapRoad: '#18222C',
  mapAerodrome: '#141D26',
  mapRunway: '#3A4856',
  mapCountryLabel: '#3E4A57',
  mapCityLabel: '#6B7783',
} as const;

export const TONE_COLOR = {
  standard: C.acStandard,
  interesting: C.acInteresting,
  watch: C.acWatch,
  event: C.acEvent,
  emergency: C.acEmergency,
} as const;
