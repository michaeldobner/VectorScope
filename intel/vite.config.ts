import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import registry from '../modules.json';

const intel = registry.modules.find((m) => m.id === 'intel')!;

// Module INTEL. Builds into dist/intel/, the hub and shared files are added by scripts/build.mjs.
// Relative base so the build works on GitHub Pages regardless of the repository name.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: './',
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(intel.version) },
  server: { fs: { allow: ['..'] } },
  build: {
    outDir: '../dist/intel',
    emptyOutDir: true,
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
  },
});
