// Repository checks: versions, module structure, hub, bilingual docs, links, writing style, tokens.
import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
// @ts-expect-error plain JavaScript module without types
import { readRegistry, versionSpots } from '../scripts/versions.mjs';

type Module = { id: string; code: string; status: string; version: string | null; path: string };
type Registry = { version: string; shared: { version: string }; modules: Module[] };
type Spot = { file: string; re: RegExp };

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f: string) => readFileSync(join(root, f), 'utf8');
const registry: Registry = readRegistry(root);
const live = registry.modules.filter((m) => m.status === 'live');
const SKIP = new Set(['node_modules', 'dist', '.git', 'lab-out', 'e2e-out', '.vercel']);

function files(dir: string, ext: RegExp): string[] {
  const out: string[] = [];
  for (const name of readdirSync(join(root, dir))) {
    if (SKIP.has(name)) continue;
    const rel = dir ? `${dir}/${name}` : name;
    if (statSync(join(root, rel)).isDirectory()) out.push(...files(rel, ext));
    else if (ext.test(name)) out.push(rel);
  }
  return out;
}

describe('versions', () => {
  const targets = versionSpots(registry) as Record<string, { version: string; spots: Spot[] }>;
  for (const [target, { version, spots }] of Object.entries(targets)) {
    for (const { file, re } of spots) {
      it(`${target} ${version} in ${file}`, () => {
        const m = re.exec(read(file));
        expect(m, `version spot ${re} missing in ${file}`).not.toBeNull();
        expect(m![1]).toBe(version);
      });
    }
  }

  it('English and German changelogs list the same versions', () => {
    for (const dir of ['', 'shared/', ...live.map((m) => `${m.id}/`)]) {
      const heads = (f: string) => [...read(f).matchAll(/^## (\d+\.\d+\.\d+)/gm)].map((m) => m[1]);
      expect(heads(`${dir}CHANGELOG.de.md`), dir || 'root').toEqual(heads(`${dir}CHANGELOG.md`));
    }
  });
});

describe('modules', () => {
  it('every module has a unique id and code', () => {
    expect(new Set(registry.modules.map((m) => m.id)).size).toBe(registry.modules.length);
    expect(new Set(registry.modules.map((m) => m.code)).size).toBe(registry.modules.length);
  });

  for (const m of live) {
    it(`${m.id} has the full module structure`, () => {
      for (const f of ['index.html', 'vite.config.ts', 'public/manifest.webmanifest', 'public/sw.js', 'README.md', 'README.de.md', 'CHANGELOG.md', 'CHANGELOG.de.md', 'docs/en/README.md', 'docs/de/README.md']) {
        expect(existsSync(join(root, m.id, f)), `${m.id}/${f}`).toBe(true);
      }
    });

    it(`${m.id} service worker cache is namespaced`, () => {
      expect(read(`${m.id}/public/sw.js`)).toMatch(new RegExp(`'vectorscope-${m.id}-v\\d+'`));
    });
  }

  it('the hub links every live module and no planned one', () => {
    const hub = read('index.html');
    for (const m of registry.modules) {
      expect(hub.includes(`href="./${m.path}"`), m.id).toBe(m.status === 'live');
      expect(hub).toContain(`data-module="${m.id}"`);
    }
  });
});

describe('documentation', () => {
  const docDirs = ['docs', 'shared', ...live.map((m) => `${m.id}/docs`)].filter((d) => existsSync(join(root, d, 'en')));

  it('English and German documentation have the same number of pages', () => {
    for (const d of docDirs) {
      expect(readdirSync(join(root, d, 'de')).length, d).toBe(readdirSync(join(root, d, 'en')).length);
    }
  });

  it('every README has a German counterpart', () => {
    for (const f of files('', /^README\.md$/)) {
      if (f.includes('/docs/') || f.startsWith('docs/') || f.startsWith('proxy/')) continue;
      expect(existsSync(join(root, f.replace(/README\.md$/, 'README.de.md'))), f).toBe(true);
    }
  });

  it('relative links in Markdown point to existing files', () => {
    const broken: string[] = [];
    for (const f of files('', /\.md$/)) {
      const text = read(f).replace(/```[\s\S]*?```/g, '');
      const links = [...text.matchAll(/\]\(([^)\s]+)\)/g), ...text.matchAll(/<img src="([^"]+)"/g)].map((m) => m[1]);
      for (const link of links) {
        if (/^(https?:|mailto:|#)/.test(link)) continue;
        const target = join(root, dirname(f), decodeURI(link.split('#')[0]));
        if (!existsSync(target)) broken.push(`${f} -> ${link}`);
      }
    }
    expect(broken).toEqual([]);
  });

  it('texts contain no dashes as punctuation', () => {
    const offenders = [...files('', /\.(md|html)$/), 'modules.json'].filter((f) => /[–—]/.test(read(f)));
    expect(offenders.map((f) => relative(root, join(root, f)))).toEqual([]);
  });
});

describe('design tokens', () => {
  it('shared/tokens.css matches the graphite theme of the air module', () => {
    const css = read('shared/tokens.css');
    const ts = read('air/src/ui/tokens.ts');
    const graphite = ts.slice(ts.indexOf('const graphite'), ts.indexOf('};', ts.indexOf('const graphite')));
    const pairs: [string, string][] = [
      ['--bg', 'bg'],
      ['--panel', 'panel'],
      ['--raised', 'panelRaised'],
      ['--border', 'border'],
      ['--text', 'text'],
      ['--text-2', 'textSecondary'],
      ['--text-3', 'textTertiary'],
      ['--accent', 'accent'],
      ['--active', 'active'],
      ['--info', 'info'],
      ['--warning', 'warning'],
      ['--critical', 'critical'],
    ];
    for (const [cssVar, key] of pairs) {
      const c = new RegExp(`${cssVar}: (#[0-9a-fA-F]{6});`).exec(css)?.[1];
      const t = new RegExp(`\\b${key}: '(#[0-9a-fA-F]{6})'`).exec(graphite)?.[1];
      expect(c?.toLowerCase(), cssVar).toBe(t?.toLowerCase());
    }
  });
});
