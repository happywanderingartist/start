import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const root=path.resolve('.'),out=path.join(root,'evidence/slice002-phase-b');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const git=(dir,args)=>{const r=spawnSync('git',['-c',`safe.directory=${dir}`,'-C',dir,...args],{encoding:'utf8',env:{...process.env,GIT_OPTIONAL_LOCKS:'0'}});if(r.status)throw Error(r.stderr);return r.stdout.trimEnd();};
const lines=s=>s.split(/\r?\n/).filter(Boolean);
const prior=JSON.parse(fs.readFileSync('docs/start/baseline-provenance.json'));
const protection={};
for(const [name,expected] of Object.entries(prior.originalRoots)){
 assert.equal(git(expected.root,['rev-parse','HEAD']),expected.head);
 assert.deepEqual(lines(git(expected.root,['status','--porcelain=v1','--untracked-files=all'])),expected.status);
 for(const f of expected.files)assert.equal(fs.existsSync(path.join(expected.root,f.path))?hash(path.join(expected.root,f.path)):null,f.hash,`${name}/${f.path}`);
 protection[name]={head:expected.head,dirtyFiles:expected.status.length,hashesChecked:expected.files.length,unchanged:true};
}
const phaseA='74a103ec5ee7f8eab3ce471eacca8711b2a6b82f';
assert.equal(git(root,['rev-parse','feature/start-slice-002-phase-a']),phaseA);
assert.equal(git(root,['rev-parse','feature/start-slice-001']),'bb0c092b5f3a4b40c042fc5c80881752f5568ae4');
const a=JSON.parse(fs.readFileSync('evidence/slice002/provenance.json'));
for(const f of a.protectedFiles)assert.equal(hash(f.file),f.sha256,'Protected implementation '+f.file);
assert.equal(git(root,['diff',phaseA,'--name-only','--','apps','packages','db','src','tests','tooling','character-assets','evidence/slice002','docs/start/slice002/source']),'');
const reports={};
for(const phase of ['before','after']){
 const report=JSON.parse(fs.readFileSync(`${out}/${phase}/browser-report.json`));
 assert.equal(report.status,'passed');assert.equal(report.tests.length,18);assert.equal(report.shots.length,49);
 for(const s of report.shots)assert.equal(hash(`${out}/${phase}/${s.file}`),s.sha256);
 reports[phase]=report;
}
assert.deepEqual(reports.before.tests,reports.after.tests,'Original test names/status changed');
const oldShots=JSON.parse(fs.readFileSync('evidence/slice002/browser-report.json'));
for(const s of oldShots.shots)assert.equal(hash('evidence/slice002/'+s.file),s.sha256,'Phase A screenshot changed');
const behavior=JSON.parse(fs.readFileSync(out+'/after/ux-behavior-report.json'));assert.equal(behavior.status,'passed');
const require=createRequire(process.env.START_BROWSER_MODULES??'C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/entry.js'),sharp=require('sharp');
const pairs=reports.after.shots.filter(s=>reports.before.shots.some(b=>b.file===s.file));
let md='# Phase B 前后对比截图\n\nbefore为本轮冻结的Phase A；after为Phase B修复后。同一viewport、同一路径与状态、同一合成fixture。49组原始PNG：320/390/768五页、1280 Artist/Route/Place，含整页和13状态；未裁去页面内容。IAB JPEG是额外实看证据，自动化PNG用于固定尺寸验收。报告内有每张实际尺寸与SHA256。\n\n| 名称 | viewport | 修改前 | 修改后 |\n| --- | --- | --- | --- |\n';
let html='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>START Phase B 前后对比</title><style>body{font:15px/1.5 system-ui;margin:24px;max-width:1600px;color:#222}header{position:sticky;top:0;background:white;padding:12px 0}section{border-top:1px solid #ccc;margin-top:32px}.pair{display:flex;gap:16px;align-items:flex-start}.pair figure{margin:0;width:50%}img{max-width:100%;height:auto;border:1px solid #ddd}figcaption{font-weight:bold;margin:8px 0}nav a{margin-right:20px}h1{font-size:24px}</style><header><h1>Phase B：修改前 / 修改后</h1><p>五页保留，灰阶层级与响应式修复。全图对比；合成数据，非高保真或生产验收。</p><nav><a href="#390-home.png">390 首页</a><a href="#768-artist.png">768 Artist</a><a href="#390-route-stop-preview.png">Stop Preview</a></nav></header>';
for(const s of pairs){md+=`| ${s.file} | ${s.viewport.width}×${s.viewport.height}${s.fullPage?' 整页':''} | [before](./before/${s.file}) | [after](./after/${s.file}) |\n`;html+=`<section id="${s.file}"><h2>${s.file} · ${s.viewport.width}×${s.viewport.height}</h2><div class="pair"><figure><figcaption>修改前 · Phase A</figcaption><img loading="lazy" src="before/${s.file}"></figure><figure><figcaption>修改后 · Phase B</figcaption><img loading="lazy" src="after/${s.file}"></figure></div></section>`;}
html+='</html>';fs.writeFileSync(out+'/SCREENSHOT_COMPARISON_INDEX.md',md);fs.writeFileSync(out+'/COMPARISON_GALLERY.html',html);
for(const name of ['390-route','390-home','390-place','768-artist']){
 const meta=await sharp(out+'/before/'+name+'.png').metadata();const w=meta.width,h=meta.height;
 const label=Buffer.from(`<svg width="${w*2+32}" height="${h+42}"><rect width="100%" height="100%" fill="white"/><text x="8" y="26" font-size="18" font-family="Arial">BEFORE / PHASE A</text><text x="${w+24}" y="26" font-size="18" font-family="Arial">AFTER / PHASE B</text></svg>`);
 await sharp(label).composite([{input:out+'/before/'+name+'.png',left:8,top:42},{input:out+'/after/'+name+'.png',left:w+24,top:42}]).png().toFile(out+'/'+name+'-comparison.png');
}
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const files=walk(out).filter(p=>!p.endsWith('provenance.json')).map(p=>({file:path.relative(out,p).replaceAll('\\','/'),bytes:fs.statSync(p).size,sha256:hash(p)}));
const changed=lines(git(root,['diff',phaseA,'--name-only']));
const provenance={generatedAt:new Date().toISOString(),phase:'B only',phaseABaseline:phaseA,branch:git(root,['branch','--show-current']),head:git(root,['rev-parse','HEAD']),protection,protectedFilesChecked:a.protectedFiles.length,phaseA49ScreenshotHashesUnchanged:true,phaseABranchUnchanged:true,slice001BranchUnchanged:true,fixtureUnchanged:hash('prototypes/discovery-wireframe/fixture.json'),original18TestsUnchanged:true,before49:reports.before.shots.length,after49:reports.after.shots.length,newBehaviorTests:behavior.tests.length,changedTrackedFiles:changed,files};
fs.writeFileSync(out+'/provenance.json',JSON.stringify(provenance,null,2)+'\n');console.log(JSON.stringify({oldRoots:protection,protectedFiles:a.protectedFiles.length,originalTests:18,newTests:behavior.tests.length,comparisonPairs:pairs.length,filesHashed:files.length},null,2));
