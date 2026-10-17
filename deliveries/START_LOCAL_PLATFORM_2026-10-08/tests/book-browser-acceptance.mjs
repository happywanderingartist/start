import http from 'node:http';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
import {Pool} from '../src/runtime.mjs';
import {createPlatform} from '../src/platform.mjs';
import {createMedia} from '../src/media.mjs';
import {createServer} from '../src/http.mjs';
import {serveStatic} from '../src/static.mjs';
import {createProfileRepository} from '../../START_ACCOUNT_FOUNDATION_2026-10-05/src/profile-repository.mjs';
const {chromium}=createRequire('D:/AI-Data/Cache/codex-runtimes/codex-primary-runtime/dependencies/node/entry.js')('playwright');
const {PNG}=createRequire(new URL('../../../.worktrees/start-slice-001/package.json',import.meta.url))('pngjs');
const database='start_test_book_'+randomUUID().replaceAll('-',''),pool=new Pool({host:'127.0.0.1',port:55435,user:'start_local',database});
const setup=new Pool({host:'127.0.0.1',port:55435,user:'start_local',database:'postgres'});
await setup.query(`CREATE DATABASE ${database}`);await setup.end();
await pool.query(await fs.readFile(new URL('../../START_ACCOUNT_FOUNDATION_2026-10-05/db/001_accounts.sql',import.meta.url),'utf8'));
await pool.query(await fs.readFile(new URL('../db/001_platform.sql',import.meta.url),'utf8'));
const repository=createProfileRepository(pool),app=createPlatform(pool),media=createMedia(pool,new URL('../data/media-test/'+database+'/',import.meta.url));
const owner={id:await repository.resolveIdentity({provider:'fixture',subject:'book-owner'})};
await pool.query('INSERT INTO start_app.admins(user_id) VALUES($1)',[owner.id]);
const place=await app.execute(owner,'place.save',{name:'趵突泉',city:'济南',category:'景点',source:'浏览器隔离测试'},randomUUID());
await app.execute(owner,'content.publish',{id:place.id,version:1},randomUUID());
const server=createServer({app,media,repository,serveStatic,verifyBearer:token=>({provider:'fixture',subject:token})});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:'D:/AppDataMigrated/Playwright/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe'});
const context=await browser.newContext({extraHTTPHeaders:{authorization:'Bearer book-owner'}}),page=await context.newPage(),checks=[],errors=[];page.setDefaultTimeout(4000);page.on('pageerror',e=>errors.push(e.message));
const open=async hash=>{if(page.url()===base+'/app/'+hash)await page.reload();else await page.goto(base+'/app/'+hash);await page.waitForFunction(()=>window.START_PUBLIC_READY&&window.START_PUBLIC_LOCATION===location.hash);};
try{
 await open('#/place/'+place.id);await page.getByRole('link',{name:'记录打卡',exact:true}).click();await page.getByLabel('打卡时间').fill('2026-09-01T16:00');await page.getByLabel('记录文字').fill('今天留下一页 <script>bad()</script>');
 await page.getByLabel('票根标题').fill('在济南，慢慢走');await page.getByLabel('票根短句').fill('记住今天的阳光。');
 const image=PNG.sync.write({width:2,height:2,data:Buffer.from(Array(4).fill([80,150,180,255]).flat())});
 await page.getByLabel('照片（最多 9 张）').setInputFiles({name:'book.png',mimeType:'image/png',buffer:image});
 let failAfterCommit=true;const keys=[];await page.route('**/api/commands/checkin.create',async route=>{keys.push(route.request().headers()['idempotency-key']);if(failAfterCommit){failAfterCommit=false;await route.fetch();await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'UNAVAILABLE'})});}else await route.continue();});
 await page.getByRole('button',{name:'保存到 Book',exact:true}).click();await page.getByText('保存未完成，内容已保留，请重试。',{exact:true}).waitFor();assert.equal(await page.getByLabel('记录文字').inputValue(),'今天留下一页 <script>bad()</script>');
 await page.getByRole('button',{name:'保存到 Book',exact:true}).click();await page.getByRole('heading',{name:'打卡记录',exact:true}).waitFor();assert.equal(keys[0],keys[1]);assert.equal((await app.privateQuery(owner,'book')).length,1);checks.push('retry after lost success reuses key and photos without duplicate record');
 await page.getByRole('img',{name:'打卡照片 1',exact:true}).waitFor();assert.equal(await page.getByRole('img',{name:'打卡照片 1'}).evaluate(img=>img.complete&&img.naturalWidth>0),true);await page.getByRole('article',{name:'纪念票根'}).waitFor();checks.push('private photo and approved ticket use stored data');
 for(const width of [320,375,390,414,768,834]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);checks.push({recordDetailWidth:width});}
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:new URL('../evidence/BOOK_DETAIL.png',import.meta.url).pathname.replace(/^\//,''),fullPage:true});
 await page.getByRole('link',{name:'分享所选内容',exact:true}).click();await page.getByLabel('选择记录：趵突泉').check();await page.getByRole('button',{name:'预览分享',exact:true}).click();await page.getByRole('region',{name:'分享预览'}).waitFor();assert.equal(await page.getByRole('region',{name:'分享预览'}).getByText('今天留下一页 <script>bad()</script>',{exact:true}).count(),0);checks.push('preview omits unselected text and photos');
 await page.getByLabel('记录文字',{exact:true}).check();await page.getByLabel('照片',{exact:true}).check();await page.getByRole('button',{name:'预览分享',exact:true}).click();await page.getByRole('button',{name:'创建分享链接',exact:true}).click();await page.getByLabel('分享链接').waitFor();const url=await page.getByLabel('分享链接').inputValue();
 const anonymous=await browser.newPage();await anonymous.goto(url);await anonymous.getByRole('heading',{name:'分享的记录',exact:true}).waitFor();await anonymous.getByText('今天留下一页 <script>bad()</script>',{exact:true}).waitFor();await anonymous.getByRole('img',{name:'分享照片 1'}).waitFor();assert.equal(await anonymous.getByRole('img',{name:'分享照片 1'}).evaluate(img=>img.complete&&img.naturalWidth>0),true);checks.push('anonymous share exposes only selected content through scoped media URL');
 await open('#/book/shares');await page.reload();await page.getByRole('button',{name:'撤销链接',exact:true}).click();await page.getByText('已撤销',{exact:true}).waitFor();await anonymous.reload();await anonymous.getByRole('heading',{name:'分享已失效',exact:true}).waitFor();checks.push('reload retains share management and revoke denies old link');
 await open('#/book');await page.getByRole('link',{name:/趵突泉/}).first().click();await page.getByRole('button',{name:'删除记录',exact:true}).click();await page.getByRole('button',{name:'取消',exact:true}).click();assert.equal((await app.privateQuery(owner,'book')).length,1);await page.getByRole('button',{name:'删除记录',exact:true}).click();await page.getByRole('button',{name:'确认删除',exact:true}).click();await page.getByText('还没有打卡记录',{exact:true}).waitFor();checks.push('delete supports cancel and removes stored record after confirmation');
 for(const width of [320,375,390,414,768,834]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);checks.push({width});}
 await page.emulateMedia({reducedMotion:'reduce'});await open('#/book/new?placeId='+place.id);await page.getByLabel('记录文字').focus();await page.keyboard.press('Tab');assert.equal(await page.getByLabel('照片（最多 9 张）').evaluate(el=>el===document.activeElement),true);checks.push('keyboard navigation and reduced motion');
 await anonymous.goto(base+'/app/#/book');await anonymous.getByText('登录后可以查看私人记录。',{exact:true}).waitFor();checks.push('anonymous private Book is blocked');assert.deepEqual(errors,[]);await anonymous.close();console.log('PASS real backend Book browser',checks.length,'checks');
}finally{await fs.writeFile(new URL('../evidence/BOOK_BROWSER.json',import.meta.url),JSON.stringify({at:new Date().toISOString(),isolatedRealDatabase:true,fixtureIdentity:true,realWechat:false,checks,errors},null,2));await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));await pool.end();}
