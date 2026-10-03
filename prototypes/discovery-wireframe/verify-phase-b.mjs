// User-visible behavior added in Phase B; geometry is supporting evidence, not a UX verdict.
import {createRequire} from 'node:module';
import {createServer} from './server.mjs';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(process.env.START_BROWSER_MODULES ?? 'C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/entry.js');
const {chromium}=require('playwright');
const out=new URL(process.env.START_WIREFRAME_EVIDENCE_URL ?? '../../evidence/slice002-phase-b/after/',import.meta.url);
await mkdir(out,{recursive:true});
const server=createServer(); await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.START_CHROMIUM_PATH ?? 'C:/Users/15049/AppData/Local/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe'});
const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
const tests=[];
async function test(name,fn){try{await fn();tests.push({name,status:'passed'});}catch(e){tests.push({name,status:'failed',error:String(e)});} console.log(tests.at(-1).status.toUpperCase()+' '+name);}
async function ready(path){await page.goto(base+path);await page.locator('main').waitFor();await page.waitForTimeout(360);}
const artist='/artists/10000000-0000-4000-8000-000000000001', route='/routes/10000000-0000-4000-8000-000000000070', place='/places/10000000-0000-4000-8000-000000000020';
try{
 await test('Stop preview offers SOURCE and PLACE without a competing MAP action; nested source returns focus',async()=>{await ready(route);await page.locator('[data-stop="1"]').click();assert.equal(await page.locator('dialog [data-action="show-map"]').count(),0);assert.equal(await page.getByRole('link',{name:'PLACE ↗',exact:true}).count(),1);await page.getByRole('button',{name:'SOURCE ↗',exact:true}).click();await page.keyboard.press('Escape');assert.equal(await page.locator('[data-stop="1"]').evaluate(e=>e===document.activeElement),true);});
 await test('Optional Artist Event is deferred, expandable by keyboard and still reaches its read target',async()=>{await ready(artist);const details=page.locator('.optional-event');assert.equal(await details.count(),1);assert.equal(await details.getAttribute('open'),null);assert.equal(await details.locator('[data-action="event"]').isVisible(),false);await details.locator('summary').press('Enter');await details.locator('[data-action="event"]').click();assert((await page.getByRole('dialog').innerText()).includes('最小读目标'));await page.keyboard.press('Escape');assert.equal(await details.locator('[data-action="event"]').evaluate(e=>e===document.activeElement),true);});
 await test('Place WHY and address precede unknown photography information at 320/390/768',async()=>{for(const width of [320,390,768]){await page.setViewportSize({width,height:width<768?844:1024});await ready(place);assert.equal(await page.getByRole('heading',{name:'WHY',exact:true}).count(),1);const address=await page.locator('.address').boundingBox(),mini=await page.locator('.mini-grid').boundingBox();assert(address.y+address.height<=mini.y,'address follows mini cards');assert(address.y+address.height<844*2,'address requires more than one normal scroll');assert((await page.locator('.address').innerText()).includes('测试地址'));}});
 await test('768 Search section index jumps to Event while result order and query remain intact',async()=>{await page.setViewportSize({width:768,height:600});await ready('/search?q=台北');const index=page.getByRole('navigation',{name:'搜索结果分组'});assert.equal(await index.isVisible(),true);const nav=await index.boundingBox(),results=await page.locator('.results').boundingBox();assert(nav.x+nav.width<results.x);await index.getByRole('link',{name:'EVENT',exact:true}).click();assert((await page.evaluate(()=>scrollY))>0,'index did not scroll');const event=await page.locator('#result-event').boundingBox();assert(event.y>=0 && event.y+event.height<=600,'Event target not fully visible');assert.equal(new URL(page.url()).searchParams.get('q'),'台北');assert.deepEqual(await page.locator('.results h2').allTextContents(),['ARTIST','ROUTE','PLACE','EVENT']);});
 const failed=tests.filter(t=>t.status==='failed').length;await writeFile(new URL('ux-behavior-report.json',out),JSON.stringify({status:failed?'failed':'passed',tests,scope:'Private grayscale behavior only; does not certify UX, real API or accessibility',generatedAt:new Date().toISOString()},null,2)+'\n');process.exitCode=failed?1:0;
}finally{await browser.close();await new Promise(r=>server.close(r));}
