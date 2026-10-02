import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const b=path.resolve(process.argv[2] ?? 'D:/Downloads/fan-route-codex-handoff/integration-backups/2026-10-02-baseline-verified');
const offline=process.argv.includes('--backup-only');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const m=JSON.parse(fs.readFileSync(b+'/capture-checkpoint.json')); const bundle=b+'/start-all-refs.bundle';
function git(r,a){const p=spawnSync('git',['-c',`safe.directory=${r}`,'-C',r,...a],{env:{...process.env,GIT_OPTIONAL_LOCKS:'0'},maxBuffer:64000000});if(p.status!==0)throw Error(p.stderr.toString());return p.stdout;}
const lines=x=>x.toString().trimEnd().split('\n').filter(Boolean).map(s=>s.replace(/\r$/,''));
function snap(r){const status=lines(git(r,['status','--porcelain=v1','--untracked-files=all']));const files=[...new Set([...git(r,['ls-files','-z']).toString().split('\0').filter(Boolean),...status.map(s=>s.slice(3))])].sort().map(p=>({path:p,hash:fs.existsSync(path.join(r,p))?hash(path.join(r,p)):null}));return{root:r,head:git(r,['rev-parse','HEAD']).toString().trim(),status,files};}
for(const c of m.copies)if(hash(path.join(b,c.target))!==c.sha256)throw Error('Backup corruption '+c.target);
m.bundle={path:'start-all-refs.bundle',sha256:hash(bundle),bytes:fs.statSync(bundle).size};
for(const [name,expected]of Object.entries(m.roots)){
 const r=path.join(b,'restored',name);
 if(!fs.existsSync(r)){const p=spawnSync('git',['clone','--no-checkout',bundle,r]);if(p.status!==0)throw Error(p.stderr.toString());git(r,['checkout','--detach',expected.head]);}
 git(r,['bundle','verify',bundle]);
 git(r,['config','core.autocrlf','true']);
 for(const f of expected.files){if(f.hash===null)continue;const w=path.join(b,name,'files',f.path);const t=path.join(b,name,'tracked',f.path);fs.mkdirSync(path.dirname(path.join(r,f.path)),{recursive:true});fs.copyFileSync(fs.existsSync(w)?w:t,path.join(r,f.path));}
 const pristine=expected.files.filter(f=>f.hash!==null&&!expected.status.some(s=>s.slice(3)===f.path)).map(f=>f.path);
 for(let i=0;i<pristine.length;i+=50)git(r,['add','--',...pristine.slice(i,i+50)]);
 if(git(r,['diff','--cached','--binary']).length)throw Error('Unexpected staged restoration change '+name);
 const now=snap(r);if(now.head!==expected.head||JSON.stringify(now.status)!==JSON.stringify(expected.status)||JSON.stringify(now.files)!==JSON.stringify(expected.files))throw Error('Recovery mismatch '+name+' '+JSON.stringify(now.status));
 if(!offline && JSON.stringify(snap(expected.root))!==JSON.stringify(expected))throw Error('Original changed '+name);
 m.restore[name]={directory:r,head:now.head,dirtyFiles:now.status.length,hashesChecked:now.files.length,stateMatch:true,originalUnchanged:offline ? null : true};
}
for(const c of m.copies.filter(c=>c.scope.startsWith('ignored-evidence')||['external-evidence','source-archive'].includes(c.scope))){const t=path.join(b,'restored-evidence',c.target);fs.mkdirSync(path.dirname(t),{recursive:true});if(!fs.existsSync(t))fs.copyFileSync(path.join(b,c.target),t,fs.constants.COPYFILE_EXCL);if(hash(t)!==c.sha256)throw Error('Evidence mismatch '+c.target);}
m.recoveryNotes=['First attempt preserved: LF/CRLF index refresh mismatch. Second capture resumed self-contained using only backup bytes; pristine index normalization restricted to recovery copies.','Regenerable dependencies/builds excluded; environment private configuration stays in original; no .env found in captured roots.'];
fs.writeFileSync(b+(offline ? '/backup-only-recovery.json' : '/manifest.json'),JSON.stringify(m,null,2));console.log(JSON.stringify({backup:b,copiedFiles:m.copies.length,bundle:m.bundle,restore:m.restore},null,2));
