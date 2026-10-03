import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const root = path.resolve('.'), out = path.join(root, 'evidence/slice002');
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const git = (r, args) => { const x = spawnSync('git', ['-c', `safe.directory=${r}`, '-C', r, ...args], { env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' }, encoding: 'utf8' }); if (x.status)
    throw Error(x.stderr); return x.stdout.trimEnd(); };
const lines = s => s.split(/\r?\n/).filter(Boolean);
const previous = JSON.parse(fs.readFileSync('docs/start/baseline-provenance.json'));
const protection = {};
for (const [name, expected] of Object.entries(previous.originalRoots)) {
    const head = git(expected.root, ['rev-parse', 'HEAD']);
    const status = lines(git(expected.root, ['status', '--porcelain=v1', '--untracked-files=all']));
    assert.equal(head, expected.head);
    assert.deepEqual(status, expected.status);
    for (const f of expected.files)
        assert.equal(fs.existsSync(path.join(expected.root, f.path)) ? hash(path.join(expected.root, f.path)) : null, f.hash, `${name}/${f.path} changed`);
    protection[name] = { root: expected.root, head, dirtyFiles: status.length, hashesChecked: expected.files.length, unchanged: true };
}
assert.equal(git(root, ['rev-parse', 'feature/start-slice-001']), 'bb0c092b5f3a4b40c042fc5c80881752f5568ae4');
assert.equal(git(root, ['diff', 'bb0c092', '--name-only', '--', 'apps', 'packages', 'db', 'src', 'tests', 'tooling', 'character-assets']), '');
const protectedFiles = lines(git(root, ['ls-files', 'apps', 'packages', 'db', 'src', 'tests', 'tooling', 'character-assets'])).map(file => ({ file, sha256: hash(path.join(root, file)) }));
const source = 'D:/Downloads/fan-route-codex-handoff/slice002-intake-2026-10-03/START_SLICE_002_DISCOVERY_HANDOFF_2026-10-02';
const zip = 'C:/Windows/Temp/codex-file-preview-EpF8fC/START_SLICE_002_DISCOVERY_HANDOFF_2026-10-02.zip';
const walk = (dir, prefix = '') => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name), prefix + e.name + '/') : [prefix + e.name]);
const packageFiles = walk(source).map(file => ({ file, bytes: fs.statSync(path.join(source, file)).size, sha256: hash(path.join(source, file)) }));
for (const line of lines(fs.readFileSync(source + '/PACKAGE_MANIFEST.tsv', 'utf8'))) {
    const [file, size] = line.split('\t');
    assert.equal(fs.statSync(path.join(source, file)).size, Number(size), 'Package size mismatch ' + file);
}
const docFiles = packageFiles.filter(f => /\.md$/.test(f.file));
for (const f of docFiles)
    assert.equal(hash('docs/start/slice002/source/' + f.file), f.sha256, 'Document copy mismatch');
const visualPaths = JSON.parse(fs.readFileSync('.context/slice002/reference-inventory.json'));
const visualRefs = visualPaths.map(file => ({ file, sha256: hash(file), bytes: fs.statSync(file).size, reviewed: 'contact sheets: 26 original + 11 latest; no image included in prototype' }));
const archive = fs.existsSync(zip) ? { file: zip, bytes: fs.statSync(zip).size, sha256: hash(zip), available: true } : { file: zip, observedIntakeBytes: 66812928, sha256: null, available: false, note: 'Temporary upload disappeared after successful extraction/read. Original ZIP bytes were not copied; no original archive hash claimed. Complete extracted package retained, size manifest checked, each extracted file hashed.' };
const provenance = { generatedAt: new Date().toISOString(), branch: git(root, ['branch', '--show-current']), baselineCommit: 'bb0c092b5f3a4b40c042fc5c80881752f5568ae4', slice001BranchPreserved: true, protection, protectedFiles, zip: archive, packageFiles, manifestSizesPassed: true, documentCopiesVerified: docFiles.length, visualRefs, readOrder: ['00_README_FIRST.md', ...docFiles.filter(f => /^0[1-9]_/.test(f.file)).map(f => f.file), 'context/SLICE_001_ACCEPTANCE.md', 'remaining context documents; all visual refs'], scope: 'Phase A only; no database operations, API changes, merge or deploy' };
fs.writeFileSync(out + '/provenance.json', JSON.stringify(provenance, null, 2) + '\n');
const report = JSON.parse(fs.readFileSync(out + '/browser-report.json'));
for (const shot of report.shots)
    assert.equal(hash(out + '/' + shot.file), shot.sha256);
const r = createRequire(process.env.START_BROWSER_MODULES ?? 'C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/entry.js');
const sharp = r('sharp');
const names = ['home', 'search', 'artist', 'route', 'place'];
const panels = await Promise.all(names.map(async (name, i) => ({ input: await sharp(out + '/390-' + name + '.png').resize(260, 563).toBuffer(), left: i * 276 + 8, top: 42 })));
const label = Buffer.from(`<svg width="1380" height="630"><rect width="1380" height="630" fill="white"/>${names.map((n, i) => `<text x="${i * 276 + 12}" y="25" font-family="Arial" font-size="16">${n.toUpperCase()} · 390</text>`).join('')}</svg>`);
await sharp(label).composite(panels).png().toFile(out + '/390-overview.png');
const md = '# Phase A 截图索引\n\n所有 PNG 为真实 Chromium 本地捕获；viewport 固定，标记 full 的文件为整页，其他文件为规定视口/状态截图。hash、实际 PNG 尺寸和完整浏览器结果见 browser-report.json；失败 JSON/log 为历史证据，最终结果以该报告为准。\n\n| 截图 | viewport | PNG | 类型 |\n| --- | --- | --- | --- |\n' + report.shots.map(s => `| [${s.file}](${root.replaceAll('\\', '/')}/evidence/slice002/${s.file}) | ${s.viewport.width}×${s.viewport.height} | ${s.width}×${s.height} | ${s.fullPage ? '整页' : '视口 / 状态'} |`).join('\n') + '\n';
fs.writeFileSync(out + '/SCREENSHOT_INDEX.md', md);
console.log(JSON.stringify({ oldRoots: protection, protectedFiles: protectedFiles.length, documents: docFiles.length, visualRefs: visualRefs.length, zipSHA: provenance.zip.sha256, screenshots: report.shots.length, hashes: 'passed' }, null, 2));
