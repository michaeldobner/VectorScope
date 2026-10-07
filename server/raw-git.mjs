// Raw archive of the own server as a copy on GitHub: after every round the new round file is pushed to the
// branch collector-raw, so there is one continuous archive and a copy off the server.
// The server keeps the complete archive on disk (a few MB a day, the disk has room), but only the latest commit:
// no history of the branch is downloaded. If GitHub is unreachable, commits wait locally and go out with the next round.
//
// RAW_PUSH_URL  https://x-access-token:<token>@github.com/michaeldobner/VectorScope.git (secret in Coolify)
// RAW_BRANCH    collector-raw
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, cpSync } from 'node:fs';
import { join } from 'node:path';

const ID = ['-c', 'user.name=vectorscope-server', '-c', 'user.email=collector@users.noreply.github.com'];
const git = (cwd, ...args) => execFileSync('git', [...ID, ...args], { cwd, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
/** The token never appears in logs. */
const quiet = (text) => String(text).replace(/x-access-token:[^@]+@/g, 'x-access-token:***@');

/**
 * Makes rawDir a checkout of the branch. Round files already in rawDir (written before the push
 * was configured) are kept and go out with the first push. Returns false if the branch could not be reached.
 */
export function prepareRawRepo(rawDir, url, branch = 'collector-raw') {
  if (existsSync(join(rawDir, '.git'))) return true;
  const tmp = `${rawDir}.clone`;
  rmSync(tmp, { recursive: true, force: true });
  try {
    execFileSync('git', ['clone', '-q', '--depth', '1', '--branch', branch, url, tmp], { stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    console.log(`Raw push: branch ${branch} not reachable, the archive stays on the server for now (${quiet(e.stderr ?? e.message)})`);
    rmSync(tmp, { recursive: true, force: true });
    return false;
  }
  if (existsSync(join(rawDir, 'raw'))) cpSync(join(rawDir, 'raw'), join(tmp, 'raw'), { recursive: true, force: false, errorOnExist: false });
  mkdirSync(rawDir, { recursive: true });
  for (const name of readdirSync(rawDir)) rmSync(join(rawDir, name), { recursive: true, force: true });
  rmSync(rawDir, { recursive: true, force: true });
  renameSync(tmp, rawDir);
  git(rawDir, 'update-ref', 'refs/vectorscope/pushed', 'HEAD');
  console.log(`Raw push: ${branch} ready in ${rawDir}`);
  return true;
}

/**
 * Commits the new files and pushes them. If the GitHub collector pushed in between, the own commits
 * are put on top of its newest commit (only new files, so this never conflicts) and pushed again.
 */
export function pushRaw(rawDir, url, branch = 'collector-raw', label = new Date().toISOString().slice(0, 16) + 'Z') {
  git(rawDir, 'add', '-A');
  if (git(rawDir, 'status', '--porcelain')) git(rawDir, 'commit', '-q', '-m', `Raw ${label} (server)`);
  if (git(rawDir, 'rev-parse', 'HEAD') === git(rawDir, 'rev-parse', 'refs/vectorscope/pushed')) return 'nothing to push';
  try {
    git(rawDir, 'push', '-q', url, `HEAD:${branch}`);
  } catch {
    git(rawDir, 'fetch', '-q', '--depth', '1', url, branch);
    try {
      git(rawDir, 'rebase', '-q', '--onto', 'FETCH_HEAD', 'refs/vectorscope/pushed');
    } catch (e) {
      // Leave the checkout usable for the next round, the commits stay and are tried again.
      try {
        git(rawDir, 'rebase', '--abort');
      } catch {}
      throw e;
    }
    git(rawDir, 'push', '-q', url, `HEAD:${branch}`);
  }
  git(rawDir, 'update-ref', 'refs/vectorscope/pushed', 'HEAD');
  return 'pushed';
}

export { quiet };
