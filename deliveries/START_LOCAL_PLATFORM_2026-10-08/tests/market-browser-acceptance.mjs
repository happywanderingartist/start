import http from 'node:http';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {serveStatic} from '../src/static.mjs';
const {chromium}=createRequire('D:/AI-Data/Cache/codex-runtimes/codex-primary-runtime/dependencies/node/entry.js')('playwright');
const artist='11111111-1111-4111-8111-111111111111',community='22222222-2222-4222-8222-222222222222',listing='33333333-3333-4333-8333-333333333333';
const catalog={artists:[{id:artist,name:'安溥'}],communities:[{id:community,artist_id:artist,name:'安溥同路人'}],places:[],routes:[],events:[],listings:[]};
let own=[],comments=[],exchanges=[],auth=true,fail=false,writes=[];
const server=http.createServer(async(req,res)=>{const u=new URL(req.url,'http://localhost');if(await serveStatic(req,res,u))return;const reply=(code,data)=>{res.writeHead(code,{'content-type':'application/json'});res.end(JSON.stringify(data));};
 if(u.pathname==='/api/public')return reply(200,catalog);
 if(u.pathname.startsWith('/api/public/listing/'))return reply(200,{...catalog.listings[0],comments});
 if(u.pathname.startsWith('/api/me/'))return auth?reply(200,({listings:own,exchanges,listingComments:comments.map(c=>({id:c.id})),memberships:[{community_id:community,status:'joined'}]})[u.pathname.split('/').pop()]||[]):reply(503,{error:'AUTH_NOT_CONFIGURED'});
 if(u.pathname.startsWith('/api/commands/')){const chunks=[];for await(const c of req)chunks.push(c);const v=JSON.parse(Buffer.concat(chunks)),op=u.pathname.split('/').pop();writes.push({op,v});if(fail)return reply(503,{error:'UNAVAILABLE'});
 if(op==='listing.create'){own=[{id:listing,data:v,status:'available'}];catalog.listings=[{id:listing,...v}];}
 if(op==='listing.edit'){Object.assign(own[0].data,v);Object.assign(catalog.listings[0],v);}
 if(op==='listing.status')own[0].status=v.status;
 if(op==='listing.comment')comments.push({id:'comment',text:v.text,author:'测试用户'});
 if(op==='listing.comment.delete')comments=[];
 if(op==='exchange.apply')exchanges=[{id:'request',listing_id:listing,status:'pending',name:'明信片'}];
 if(op==='exchange.accept')exchanges[0].status='accepted';
 if(op==='exchange.withdraw')exchanges[0].status='withdrawn';
 return reply(200,{id:listing});}reply(404,{error:'NOT_FOUND'});
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}/app/`;
const browser=await chromium.launch({executablePath:'D:/AppDataMigrated/Playwright/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe'}),page=await browser.newPage(),checks=[],errors=[];page.setDefaultTimeout(5000);page.on('pageerror',e=>errors.push(e.message));
const open=async hash=>{if(page.url()===base+hash)await page.reload();else await page.goto(base+hash);await page.locator('[data-market-workspace] h1').waitFor();};
try{
 await open('#/market');await page.getByLabel('社群',{exact:true}).selectOption(community);await page.getByLabel('物料名称').fill('明信片');await page.getByLabel('物料说明').fill('现场交换');await page.getByRole('button',{name:'发布物料',exact:true}).click();await page.getByRole('button',{name:'编辑',exact:true}).waitFor();assert.equal(writes[0].v.artistId,artist);checks.push('publish binds artist from joined community');
 await page.getByRole('button',{name:'编辑',exact:true}).click();await page.getByLabel('物料名称').fill('新版明信片');fail=true;await page.getByRole('button',{name:'保存修改'}).click();await page.getByText('操作未完成，请重试；填写内容已保留。').waitFor();assert.equal(await page.getByLabel('物料名称').inputValue(),'新版明信片');fail=false;await page.getByRole('button',{name:'保存修改'}).click();await page.getByRole('heading',{name:'新版明信片'}).waitFor();checks.push('edit preserves draft on failure and updates on success');
 await page.getByRole('button',{name:'撤下',exact:true}).click();await page.getByRole('button',{name:'重新上架'}).waitFor();await page.getByRole('button',{name:'重新上架'}).click();await page.getByRole('button',{name:'撤下',exact:true}).waitFor();checks.push('publisher controls listing status');
 await page.getByRole('link',{name:'查看评论'}).click();await page.getByLabel(/评论公开可见/).fill('<script>bad()</script>一起交换');await page.getByRole('button',{name:'发布评论'}).click();await page.getByText('<script>bad()</script>一起交换',{exact:true}).waitFor();await page.getByRole('button',{name:'删除',exact:true}).click();await page.getByText('还没有评论',{exact:true}).waitFor();checks.push('comments escape content and support deletion');
 own=[];await open('#/listing/'+listing);await page.getByRole('button',{name:'申请交换',exact:true}).click();await page.getByText('已更新。',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'申请交换',exact:true}).count(),0);checks.push('request cannot be submitted twice');
 exchanges[0].publisher=true;await open('#/market');await page.getByRole('button',{name:'接受申请'}).click();await page.getByText('收到的申请 · 已接受',{exact:true}).waitFor();await page.getByRole('button',{name:'撤回申请'}).click();await page.getByText('收到的申请 · 已撤回',{exact:true}).waitFor();checks.push('accept and withdraw state feedback');
 for(const width of [320,375,390,414,768,834]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);checks.push({width});}
 auth=false;await open('#/listing/'+listing);assert.equal(await page.getByRole('button',{name:'发布评论'}).count(),0);assert.equal(await page.getByRole('button',{name:'申请交换',exact:true}).count(),0);checks.push('unconfigured login disables writes');assert.deepEqual(errors,[]);
 await page.screenshot({path:new URL('../evidence/MARKET.png',import.meta.url).pathname.replace(/^\//,''),fullPage:true});console.log('PASS market browser',checks.length,'checks');
}finally{await fs.writeFile(new URL('../evidence/MARKET.json',import.meta.url),JSON.stringify({at:new Date().toISOString(),fixtureTransportOnly:true,realIdentity:false,checks,errors},null,2));await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
