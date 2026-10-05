import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '../../shared/tokens.css';
import './styles.css';
import { App } from './App';
import { applyThemeToCss } from './ui/tokens';
import { getTraffic, select, selectExternal, startTraffic } from './state/traffic';
import { fetchHex } from './data/feed';

applyThemeToCss();
startTraffic();
// Deep link from other modules, for example INTEL: ?hex=ae5420 selects and follows this aircraft.
const deepHex = new URLSearchParams(location.search).get('hex');
if (deepHex && /^[0-9a-f]{6}$/i.test(deepHex)) {
  fetchHex(deepHex.toLowerCase())
    .then((r) => r.aircraft[0] && selectExternal(r.aircraft[0]))
    .catch(() => {});
}
// Test hook for the lab and debugging.
(window as unknown as { __vs: unknown }).__vs = { getTraffic, select, selectExternal };
document.getElementById('boot')?.remove();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
