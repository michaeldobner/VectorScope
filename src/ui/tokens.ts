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

  // Basemap: dark aviation chart, but every place name readable
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
} as const;

export const TONE_COLOR = {
  standard: C.acStandard,
  interesting: C.acInteresting,
  watch: C.acWatch,
  event: C.acEvent,
  emergency: C.acEmergency,
} as const;
