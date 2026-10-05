// Release a module, the shared shell or the collection.
//   npm run release -- air 0.3.1
//   npm run release -- shared 1.1.0
//   npm run release -- collection 0.4.0
// Expects the changes under "## Unreleased" (CHANGELOG.md) and "## Unveröffentlicht" (CHANGELOG.de.md)
// of the target. Turns both into the new version with today's date and updates every version spot.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readRegistry, versionSpots } from './versions.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [target, version] = process.argv.slice(2);
const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};

if (!target || !/^\d+\.\d+\.\d+$/.test(version ?? '')) fail('Usage: npm run release -- <collection|shared|module id> <x.y.z>');

const registry = readRegistry(root);
const targets = versionSpots(registry);
if (!targets[target]) fail(`Unknown target "${target}". Known: ${Object.keys(targets).join(', ')}`);

const date = new Date().toISOString().slice(0, 10);
const dir = target === 'collection' ? '' : `${target}/`;
const read = (f) => readFileSync(join(root, f), 'utf8');
const write = (f, s) => writeFileSync(join(root, f), s);

// 1. Changelogs: Unreleased becomes the new version.
for (const [file, heading] of [
  [`${dir}CHANGELOG.md`, '## Unreleased'],
  [`${dir}CHANGELOG.de.md`, '## Unveröffentlicht'],
]) {
  const text = read(file);
  if (!text.includes(`${heading}\n`)) fail(`${file}: no "${heading}" section. Write the changes there first.`);
  write(file, text.replace(`${heading}\n`, `## ${version} (${date})\n`));
}

// 2. Registry.
if (target === 'collection') registry.version = version;
else if (target === 'shared') registry.shared.version = version;
else registry.modules.find((m) => m.id === target).version = version;
write('modules.json', JSON.stringify(registry, null, 2) + '\n');

// 3. Every other place that states the version.
for (const { file, re } of targets[target].spots) {
  if (file.includes('CHANGELOG')) continue;
  const text = read(file);
  const flags = re.flags.includes('d') ? re.flags : re.flags + 'd';
  const m = new RegExp(re.source, flags).exec(text);
  if (!m) fail(`${file}: version spot not found (${re})`);
  const [start, end] = m.indices[1];
  write(file, text.slice(0, start) + version + text.slice(end));
}

console.log(`${target} ${version} (${date}). Check with: npm test`);
