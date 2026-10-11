import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import registry from '../modules.json';

const news = registry.modules.find((m) => m.id === 'news')!;

// Module NEWS. Builds into dist/news/, the hub and shared files are added by scripts/build.mjs.
// Relative base so the build works on GitHub Pages regardless of the repository name.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: './',
  define: { __APP_VERSION__: JSON.stringify(news.version) },
  server: { fs: { allow: ['..'] } },
  build: {
    outDir: '../dist/news',
    emptyOutDir: true,
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
  },
});
