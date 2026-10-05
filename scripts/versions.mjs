// Every place in the repository that states a version. Used by scripts/release.mjs to update them
// and by tests/release.test.ts to check that they agree. Each pattern captures the version in group 1.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const V = '(\\d+\\.\\d+\\.\\d+)';
const changelog = (file) => ({ file, re: new RegExp(`^## ${V} \\(`, 'm') });

export function readRegistry(root) {
  return JSON.parse(readFileSync(join(root, 'modules.json'), 'utf8'));
}

/** Version spots per release target: 'collection', 'shared' or a module id. */
export function versionSpots(registry) {
  const targets = {
    collection: {
      version: registry.version,
      spots: [
        { file: 'package.json', re: new RegExp(`"version": "${V}"`) },
        { file: 'README.md', re: new RegExp(`Current version: \\*\\*${V}\\*\\*`) },
        { file: 'README.de.md', re: new RegExp(`Aktuelle Version: \\*\\*${V}\\*\\*`) },
        { file: 'docs/en/README.md', re: new RegExp(`\\| Version \\| ${V} \\|`) },
        { file: 'docs/de/README.md', re: new RegExp(`\\| Version \\| ${V} \\|`) },
        { file: 'index.html', re: new RegExp(`data-version="collection">VectorScope v${V}<`) },
        changelog('CHANGELOG.md'),
        changelog('CHANGELOG.de.md'),
      ],
    },
    shared: {
      version: registry.shared.version,
      spots: [
        { file: 'shared/README.md', re: new RegExp(`Current version: \\*\\*${V}\\*\\*`) },
        { file: 'shared/README.de.md', re: new RegExp(`Aktuelle Version: \\*\\*${V}\\*\\*`) },
        changelog('shared/CHANGELOG.md'),
        changelog('shared/CHANGELOG.de.md'),
      ],
    },
  };
  for (const m of registry.modules.filter((m) => m.status === 'live')) {
    const row = new RegExp(`^\\| \\[\\*\\*${m.code}\\*\\*\\][^\\n]*\\| ${V} \\|$`, 'm');
    targets[m.id] = {
      version: m.version,
      spots: [
        { file: `${m.id}/README.md`, re: new RegExp(`Current version: \\*\\*${V}\\*\\*`) },
        { file: `${m.id}/README.de.md`, re: new RegExp(`Aktuelle Version: \\*\\*${V}\\*\\*`) },
        { file: `${m.id}/docs/en/README.md`, re: new RegExp(`\\| Version \\| ${V} \\|`) },
        { file: `${m.id}/docs/de/README.md`, re: new RegExp(`\\| Version \\| ${V} \\|`) },
        { file: 'index.html', re: new RegExp(`data-version="${m.id}">v${V}<`) },
        { file: 'README.md', re: row },
        { file: 'README.de.md', re: row },
        changelog(`${m.id}/CHANGELOG.md`),
        changelog(`${m.id}/CHANGELOG.de.md`),
      ],
    };
  }
  return targets;
}
