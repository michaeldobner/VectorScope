// Adds the hub and the shared files to dist/, after the modules are built into dist/<module>/.
import { cpSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const registry = JSON.parse(readFileSync(join(root, 'modules.json'), 'utf8'));

for (const m of registry.modules.filter((m) => m.status === 'live')) {
  if (!existsSync(join(dist, m.id, 'index.html'))) {
    console.error(`Module ${m.id} is live but dist/${m.id}/index.html is missing. Build the module first.`);
    process.exit(1);
  }
}

mkdirSync(dist, { recursive: true });
for (const file of ['index.html', 'manifest.webmanifest', 'sw.js', 'modules.json']) cpSync(join(root, file), join(dist, file));
// Only what the browser needs from shared/, no README or changelog.
for (const dir of ['icons', 'fonts']) cpSync(join(root, 'shared', dir), join(dist, 'shared', dir), { recursive: true });
for (const file of ['tokens.css', 'hub.css']) cpSync(join(root, 'shared', file), join(dist, 'shared', file));
// GitHub Pages: no Jekyll processing.
cpSync(join(root, 'scripts', 'nojekyll'), join(dist, '.nojekyll'));

console.log(`Hub and shared files added to dist/ (VectorScope ${registry.version})`);
