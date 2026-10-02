import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const outer = 'D:/Downloads/fan-route-codex-handoff';
const roots = { main: `${outer}/fan-route-codex-handoff`, map: `${outer}/.worktrees/fan-route-v0.2`, character: `${outer}/.worktrees/character-asset-baseline` };
const backup = `${outer}/integration-backups/2026-10-02-baseline-verified`;
const ignored = new Set(['node_modules', '.git', 'dist', 'coverage', '.vite', '.wrangler', '.pnpm-store']);
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function git(root, args) {
  const r = spawnSync('git', ['-c', `safe.directory=${root}`, '-C', root, ...args], { env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' }, maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`git ${args[0]} failed: ${r.stderr.toString()}`);
  return r.stdout;
}
const lines = b => b.toString('utf8').trimEnd().split('\n').filter(Boolean).map(s => s.replace(/\r$/, ''));
function snapshot(root) {
  const status = lines(git(root, ['status', '--porcelain=v1', '--untracked-files=all']));
  const tracked = git(root, ['ls-files', '-z']).toString('utf8').split('\0').filter(Boolean);
  const files = [...new Set([...tracked, ...status.map(s => s.slice(3))])].sort().map(p => ({ path: p, hash: fs.existsSync(path.join(root, p)) ? hash(path.join(root, p)) : null }));
  return { root, head: git(root, ['rev-parse', 'HEAD']).toString().trim(), status, files };
}
const manifest = { date: '2026-10-02', roots: {}, copies: [], excluded: [], restore: {} };
function copy(source, target, scope) {
  if (!fs.existsSync(source)) return;
  const st = fs.lstatSync(source);
  if (st.isSymbolicLink()) { manifest.excluded.push({ source, reason: 'symlink; not followed' }); return; }
  if (st.isDirectory()) {
    for (const entry of fs.readdirSync(source)) {
      if (ignored.has(entry)) { manifest.excluded.push({ source: path.join(source, entry), reason: 'regenerable dependency/build or Git metadata' }); continue; }
      if (/^\.env(?:\.|$)/.test(entry) && entry !== '.env.example') { manifest.excluded.push({ source: path.join(source, entry), reason: 'private configuration; preserved in original, no content read' }); continue; }
      copy(path.join(source, entry), path.join(target, entry), scope);
    }
  } else if (st.isFile()) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target, fs.constants.COPYFILE_EXCL);
    const sha = hash(source);
    if (hash(target) !== sha) throw new Error(`Copy verification failed: ${source}`);
    manifest.copies.push({ source, target: path.relative(backup, target).replaceAll('\\', '/'), sha256: sha, bytes: st.size, scope });
  }
}
if (fs.existsSync(backup)) throw new Error('Backup destination exists: inspect and resume manually; never overwrite.');
fs.mkdirSync(backup, { recursive: true });
for (const [name, root] of Object.entries(roots)) {
  const before = snapshot(root);
  manifest.roots[name] = before;
  const dir = path.join(backup, name);
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, 'unstaged.patch'), git(root, ['diff', '--binary', '--no-ext-diff']));
  fs.writeFileSync(path.join(dir, 'staged.patch'), git(root, ['diff', '--cached', '--binary', '--no-ext-diff']));
  for (const item of before.files) if (item.hash !== null && !before.status.some(s => s.slice(3) === item.path && s.startsWith('??'))) copy(path.join(root, item.path), path.join(dir, 'tracked', item.path), `tracked-bytes-${name}`);
  for (const item of before.status) copy(path.join(root, item.slice(3)), path.join(dir, 'files', item.slice(3)), `wip-${name}`);
  for (const protectedDir of ['.superpowers', '.context']) copy(path.join(root, protectedDir), path.join(dir, 'protected', protectedDir), `ignored-evidence-${name}`);
  const ref = `baseline/start-20261002/${name}`;
  const probe = spawnSync('git', ['-c', `safe.directory=${root}`, '-C', root, 'show-ref', '--verify', `refs/tags/${ref}`]);
  if (probe.status === 0) {
    if (git(root, ['rev-parse', ref]).toString().trim() !== before.head) throw new Error(`Existing baseline ref has different SHA: ${ref}`);
  } else git(root, ['tag', ref, before.head]);
}
for (const relative of ['.context', 'audit-2026-09-28', 'design-references', 'handoff-review-2026-10-01', 'start-v2-alignment', 'fan-route-codex-source-20260915.zip', '2026-09-15-fan-route-v0.2-codex-handoff.md', '2026-09-15-fan-route-v0.2-real-map-mvp-design.md', '2026-09-15-fan-route-v0.2-real-map-mvp.md']) copy(path.join(outer, relative), path.join(backup, 'external', relative), 'external-evidence');
for (const source of ['D:/START_CODEX_MASTER_HANDOFF_v1.zip', 'D:/Downloads/2START_PRODUCT_SPEC_V2_PACKAGE_2026-10-01.zip']) copy(source, path.join(backup, 'archives', path.basename(source)), 'source-archive');
const bundle = path.join(backup, 'start-all-refs.bundle');
fs.writeFileSync(path.join(backup, 'capture-checkpoint.json'), JSON.stringify(manifest, null, 2));
git(roots.main, ['bundle', 'create', bundle, '--all']);
fs.writeFileSync(path.join(backup, 'bundle-verify.txt'), git(roots.main, ['bundle', 'verify', bundle]));
manifest.bundle = { path: 'start-all-refs.bundle', sha256: hash(bundle), bytes: fs.statSync(bundle).size };
for (const [name, root] of Object.entries(roots)) {
  const restored = path.join(backup, 'restored', name);
  fs.mkdirSync(path.dirname(restored), { recursive: true });
  const cloned = spawnSync('git', ['clone', '--no-checkout', bundle, restored], { maxBuffer: 8 * 1024 * 1024 });
  if (cloned.status !== 0) throw new Error(cloned.stderr.toString());
  git(restored, ['config', 'core.autocrlf', 'true']);
  git(restored, ['checkout', '--detach', manifest.roots[name].head]);
  // Exact working bytes preserve historical line endings as well as WIP.
  for (const item of manifest.roots[name].files) {
    if (item.hash === null) continue;
    const wipCopy = path.join(backup, name, 'files', item.path);
    const trackedCopy = path.join(backup, name, 'tracked', item.path);
    const target = path.join(restored, item.path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(fs.existsSync(wipCopy) ? wipCopy : trackedCopy, target);
  }
  const pristine = manifest.roots[name].files.filter(f => f.hash !== null && !manifest.roots[name].status.some(s => s.slice(3) === f.path)).map(f => f.path);
  for (let i = 0; i < pristine.length; i += 50) git(restored, ['add', '--', ...pristine.slice(i, i + 50)]);
  if (git(restored, ['diff', '--cached', '--binary']).length) throw new Error('Recovery index differs from original HEAD');
  const stagedPatch = path.join(backup, name, 'staged.patch');
  if (fs.statSync(stagedPatch).size) throw new Error('Staged changes require index-aware restoration; preserve snapshot and stop.');
  const now = snapshot(restored);
  const expected = manifest.roots[name];
  if (JSON.stringify(now.status) !== JSON.stringify(expected.status) || JSON.stringify(now.files) !== JSON.stringify(expected.files)) throw new Error(`Restore state mismatch: ${name}`);
  const unchanged = snapshot(root);
  if (JSON.stringify(unchanged) !== JSON.stringify(expected)) throw new Error(`Original workspace changed: ${name}`);
  manifest.restore[name] = { directory: restored, head: now.head, dirtyFiles: now.status.length, hashesChecked: now.files.length, stateMatch: true, originalUnchanged: true };
}
// Recover ignored/external evidence into a separate tree, using only backup bytes.
for (const item of manifest.copies.filter(x => x.scope.startsWith('ignored-evidence') || x.scope === 'external-evidence' || x.scope === 'source-archive')) {
  const target = path.join(backup, 'restored-evidence', item.target);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(backup, item.target), target, fs.constants.COPYFILE_EXCL);
  if (hash(target) !== item.sha256) throw new Error(`Restored evidence mismatch: ${item.target}`);
}
fs.writeFileSync(path.join(backup, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ backup, copiedFiles: manifest.copies.length, copiedBytes: manifest.copies.reduce((n, x) => n + x.bytes, 0), bundle: manifest.bundle, restored: manifest.restore, excludedDirectories: manifest.excluded.length }, null, 2));
