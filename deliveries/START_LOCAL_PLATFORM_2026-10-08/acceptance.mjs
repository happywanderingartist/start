import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';import {spawn} from 'node:child_process';
const root=fileURLToPath(new URL('./',import.meta.url)),workspace=fileURLToPath(new URL('../../',import.meta.url));
const steps=[
 ['platform',['--test','--test-concurrency=1',path.join(root,'tests','*.test.mjs')]],
 ['browser',[path.join(root,'tests','browser-acceptance.mjs')]],
 ['public-browser',[path.join(root,'tests','public-browser-acceptance.mjs')]],
 ['private-browser',[path.join(root,'tests','private-browser-acceptance.mjs')]],
 ['community-browser',[path.join(root,'tests','community-browser-acceptance.mjs')]],
 ['market-browser',[path.join(root,'tests','market-browser-acceptance.mjs')]],
 ['book-browser',[path.join(root,'tests','book-browser-acceptance.mjs')]],
 ['backup',[path.join(root,'tests','backup-acceptance.mjs')]],
 ['legacy',[path.join(root,'tests','legacy-acceptance.mjs')]],
 ['existing-integrations',['--test',path.join(workspace,'deliveries','START_ADMIN_CONTENT_VISUAL_2026-10-07','map-proxy.test.mjs'),path.join(workspace,'deliveries','START_ADMIN_CONTENT_VISUAL_2026-10-07','extractor-api.test.mjs'),path.join(workspace,'deliveries','START_ADMIN_CONTENT_VISUAL_2026-10-07','batch-domain.test.cjs')]],
 ['local-smoke',[path.join(root,'tests','local-smoke.mjs')]],
 ['public-live-preview',[path.join(root,'tests','public-preview-smoke.mjs')]],
 ];const results=[];
for(const [name,args] of steps){const chunks=[];const code=await new Promise((resolve,reject)=>{const p=spawn(process.execPath,args,{cwd:workspace,windowsHide:true});p.stdout.on('data',b=>chunks.push(b));p.stderr.on('data',b=>chunks.push(b));p.on('error',reject);p.on('exit',resolve);});await fs.writeFile(path.join(root,'evidence','acceptance-'+name+'.log'),Buffer.concat(chunks));results.push({name,passed:code===0,exitCode:code});await fs.writeFile(path.join(root,'evidence','ACCEPTANCE_RUN.json'),JSON.stringify({at:new Date().toISOString(),results,realWechat:false,realGps:false,cloudConnected:false,testDatabaseOnly:true},null,2));console.log((code===0?'PASS':'FAIL'),name);if(code!==0)process.exitCode=1;}
await fs.writeFile(path.join(root,'evidence','READINESS.json'),JSON.stringify({at:new Date().toISOString(),allAcceptanceGroupsPassed:results.length===steps.length&&results.every(r=>r.passed),acceptanceGroups:results.length,passedGroups:results.filter(r=>r.passed).length,failedGroups:results.filter(r=>!r.passed).map(r=>r.name),evidence:'ACCEPTANCE_RUN.json',publicFrontendWired:true,allFrontendWired:false,deviceAcceptance:false,realWechat:false,realGps:false,cloudConnected:false,review:'Scoped local stability review; browser fixture identities are test-only, not production acceptance'},null,2));
