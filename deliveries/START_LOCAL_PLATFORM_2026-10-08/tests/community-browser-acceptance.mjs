import http from 'node:http';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {serveStatic} from '../src/static.mjs';
const {chromium}=createRequire('D:/AI-Data/Cache/codex-runtimes/codex-primary-runtime/dependencies/node/entry.js')('playwright');
const artistId='11111111-1111-4111-8111-111111111111',id='22222222-2222-4222-8222-222222222222';
const community={id,artist_id:artistId,name:'安溥同路人'};
const catalog={artists:[{id:artistId,name:'安溥'}],communities:[community],places:[],routes:[],events:[],listings:[]};
let memberships=[],writes=0,authError='',readFailure=false,writeFailure=false,release=null,hold=false;
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');if(await serveStatic(req,res,url))return;
 const reply=(status,value)=>{res.writeHead(status,{'content-type':'application/json'});res.end(JSON.stringify(value));};
 if(url.pathname==='/api/public')return reply(200,catalog);
 if(url.pathname.startsWith('/api/me/')){
  if(authError)return reply(authError==='AUTH_NOT_CONFIGURED'?503:401,{error:authError});
  if(url.pathname.endsWith('/memberships'))return reply(readFailure?503:200,readFailure?{error:'UNAVAILABLE'}:memberships);
  return reply(200,url.pathname.endsWith('/profile')?{nickname:'测试用户'}:[]);
 }
 if(url.pathname==='/api/commands/community.join'){
  const chunks=[];for await(const chunk of req)chunks.push(chunk);const v=JSON.parse(Buffer.concat(chunks));writes++;
  assert.equal(v.id,id);assert.ok(['joined','removed'].includes(v.status));assert.ok(req.headers['idempotency-key']);
  if(hold)await new Promise(resolve=>{release=resolve;});
  if(writeFailure)return reply(503,{error:'UNAVAILABLE'});
  memberships=v.status==='joined'?[{community_id:id,artist_id:artistId,status:'joined'}]:[];
  return reply(200,{id,status:v.status});
 }
 reply(404,{error:'NOT_FOUND'});
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:'D:/AppDataMigrated/Playwright/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe'});
const page=await browser.newPage(),checks=[],errors=[];page.setDefaultTimeout(5000);page.on('pageerror',e=>errors.push(e.message));
const open=async hash=>{if(page.url()===base+'/app/'+hash)await page.reload();else await page.goto(base+'/app/'+hash);await page.waitForFunction(()=>window.START_PUBLIC_READY&&window.START_PUBLIC_LOCATION===location.hash);};
const join=()=>page.getByRole('button',{name:'加入社群',exact:true});
const leave=()=>page.getByRole('button',{name:'退出社群',exact:true});
try{
 await open('#/community/'+id);await join().waitFor();
 hold=true;await join().evaluate(b=>{b.click();b.click();});
 await page.waitForFunction(()=>document.querySelector('[data-membership-action]')?.disabled);
 while(!release)await new Promise(r=>setTimeout(r,10));assert.equal(writes,1);hold=false;release();release=null;
 await leave().waitFor();checks.push('join suppresses duplicate writes and confirms server result');
 await page.reload();await leave().waitFor();checks.push('reload retains joined state');
 await open('#/community');await page.getByRole('region',{name:'我的社群'}).getByRole('link',{name:/安溥同路人/}).waitFor();checks.push('community overview reads joined communities');
 await open('#/me');await page.getByRole('link',{name:/安溥同路人/}).click();await leave().waitFor();checks.push('Me links back to joined community');
 writeFailure=true;await leave().click();await page.getByText('操作未成功，请重试。',{exact:true}).waitFor();assert.equal(await leave().isEnabled(),true);assert.equal(memberships.length,1);checks.push('failed leave preserves membership');
 writeFailure=false;await leave().click();await join().waitFor();
 await open('#/me');await page.getByText('还没有加入社群',{exact:true}).waitFor();checks.push('leave removes membership from Me');
 readFailure=true;await open('#/community/'+id);await page.getByRole('button',{name:'重试成员状态'}).waitFor();assert.equal(await join().count(),0);
 readFailure=false;await page.getByRole('button',{name:'重试成员状态'}).click();await join().waitFor();checks.push('unknown membership is not displayed as not joined');
 for(const code of ['AUTH_NOT_CONFIGURED','UNAUTHORIZED']){authError=code;await open('#/community/'+id);await page.getByText(code==='AUTH_NOT_CONFIGURED'?'身份服务尚未接入，暂时不能加入社群。':'登录后可以加入社群。',{exact:true}).waitFor();assert.equal(await join().count(),0);}
 checks.push('unconfigured identity and signed-out state do not permit writes');authError='';
 await open('#/community/'+id);await join().waitFor();hold=true;await join().click();while(!release)await new Promise(r=>setTimeout(r,10));
 await page.getByRole('link',{name:'Start',exact:true}).click();await page.waitForFunction(()=>window.START_PUBLIC_LOCATION==='#/');
 hold=false;release();release=null;await page.waitForTimeout(100);assert.equal(await page.locator('[data-membership-action]').count(),0);checks.push('late mutation response does not replace another page');
 await open('#/community/'+id);await leave().waitFor();
 for(const width of [320,375,390,414,768,834]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);checks.push({width});}
 await page.screenshot({path:new URL('../evidence/COMMUNITY_MEMBERSHIP.png',import.meta.url).pathname.replace(/^\//,''),fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS community membership browser',checks.length,'checks');
}finally{

 release?.();await fs.writeFile(new URL('../evidence/COMMUNITY_MEMBERSHIP.json',import.meta.url),JSON.stringify({at:new Date().toISOString(),fixtureTransportOnly:true,realIdentity:false,checks,errors},null,2));
 await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
}
