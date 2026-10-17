import http from 'node:http';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {serveStatic} from '../src/static.mjs';
const {chromium}=createRequire('D:/AI-Data/Cache/codex-runtimes/codex-primary-runtime/dependencies/node/entry.js')('playwright');
const artistId='11111111-1111-4111-8111-111111111111',communityId='22222222-2222-4222-8222-222222222222';
const catalog={artists:[{id:artistId,name:'测试安溥'}],communities:[{id:communityId,artist_id:artistId,name:'安溥同路人'}],places:[],routes:[],events:[],listings:[]};
const sections={profile:{nickname:'测试用户'},memberships:[{community_id:communityId,artist_id:artistId,status:'joined'}],doll:{character:'boy',outfit:'outfit5',expression:'smile'}};
let commands=[],release,failNext=false;
const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(await serveStatic(req,res,url))return;
  let result;
  if(url.pathname==='/api/public')result=catalog;
  else if(url.pathname==='/api/extract/places')result={items:[{name:'测试咖啡',city:'上海'},{name:'原文不存在的地点',city:'上海'}]};
  else if(url.pathname.startsWith('/api/me/'))result=sections[url.pathname.split('/').pop()]??[];
  else if(url.pathname.startsWith('/api/commands/')){
    const chunks=[];for await(const chunk of req)chunks.push(chunk);
    commands.push({operation:url.pathname.split('/').pop(),value:JSON.parse(Buffer.concat(chunks))});
    await new Promise(resolve=>{release=resolve;});
    res.writeHead(failNext?503:200,{'content-type':'application/json'});
    res.end(JSON.stringify(failNext?{error:'AUTH_NOT_CONFIGURED'}:{id:'test-only'}));return;
  }else{res.writeHead(404);res.end();return;}
  res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify(result));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:'D:/AppDataMigrated/Playwright/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe'});
const page=await browser.newPage(),checks=[],errors=[];
page.setDefaultTimeout(10000);page.on('pageerror',error=>errors.push(error.message));
const open=async hash=>{await page.goto(base+'/app/'+hash);await page.waitForFunction(()=>window.START_PUBLIC_READY&&window.START_PUBLIC_LOCATION===location.hash);};
try{
  await open('#/me');await page.getByRole('link',{name:'安溥同路人 ›',exact:true}).waitFor();checks.push('membership API IDs resolve to actual community names');
  await page.getByRole('link',{name:'换装与表情 ›'}).click();await page.getByRole('heading',{name:'我的娃娃',exact:true}).waitFor();checks.push('doll link opens approved doll route');
  for(const width of [320,375,390,414,768,834]){
    await page.setViewportSize({width,height:900});
    for(const hash of ['#/me','#/submit?kind=place','#/submit?kind=route']){
      await open(hash);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,hash+' width '+width);
      checks.push({hash,width});
    }
  }
  await open('#/submit?kind=place');await page.getByRole('button',{name:'提交审核'}).click();
  await page.getByRole('alert').filter({hasText:'请先填写'}).waitFor();assert.equal(commands.length,0);checks.push('invalid form does not issue writes');
  await page.route('**/admin/map-picker.html?**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Test map transport</title><p>Map fixture</p>'}));
  await page.locator('[name=textImport]').fill('上海测试咖啡');await page.getByRole('button',{name:'识别文字',exact:true}).click();
  await page.getByText('识别到 1 个候选地点',{exact:false}).waitFor();checks.push('extraction displays only source-grounded candidates');
  await page.getByRole('button',{name:'核对地图位置'}).click();
  await page.locator('iframe').waitFor();
  const map=page.frames().find(frame=>frame.url().includes('map-picker.html'));
  await map.waitForLoadState();
  const poi={provider:'amap',providerPoiId:'TEST_POI',name:'测试咖啡',city:'上海',address:'测试地址',longitude:121.47,latitude:31.23,coordinateSystem:'gcj02'};
  await map.evaluate(poi=>parent.postMessage({type:'start-map-selection',token:'wrong-token',poi},location.origin),poi);
  await page.waitForTimeout(50);assert.equal(await page.locator('dialog').count(),1);checks.push('map messages with wrong token ignored');
  await map.evaluate(poi=>parent.postMessage({type:'start-map-selection',token:new URL(location.href).searchParams.get('token'),poi},location.origin),poi);
  await page.locator('dialog').waitFor({state:'detached'});assert.equal(await page.getByLabel('名称').inputValue(),poi.name);
  assert.equal(await page.locator('form').evaluate(form=>form.selectedPoi.longitude),121.47);checks.push('map selection fills name and real coordinate binding');
  await page.getByLabel('名称').fill('改名');assert.equal(await page.locator('form').evaluate(form=>form.selectedPoi),undefined);checks.push('manual location edit invalidates old coordinates');
  await page.getByLabel('名称').fill('测试咖啡');await page.getByLabel('城市').fill('上海');await page.getByLabel('来源',{exact:false}).fill('仅用于本地测试');
  await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
  await page.waitForTimeout(150);
  assert.equal(await page.getByLabel('名称').inputValue(),'测试咖啡','returning to tab must preserve the draft');checks.push('tab visibility change preserves unsent form');
  await page.locator('form').evaluate(form=>{form.requestSubmit();form.requestSubmit();});
  await page.waitForFunction(()=>document.querySelector('[type=submit]').disabled);await page.waitForTimeout(100);
  assert.equal(commands.length,1,'double submit must create exactly one request');release();
  await page.getByText('已提交审核，结果会在通知里显示。',{exact:true}).waitFor();assert.equal(commands[0].operation,'submission.create');checks.push('duplicate submissions suppressed while pending');
  await open('#/submit?kind=route');await page.getByLabel('名称').fill('上海路线');await page.getByLabel('城市').fill('上海');await page.getByLabel('来源',{exact:false}).fill('测试来源');
  async function addRoutePoi(poi){
    await page.getByRole('button',{name:'地图搜索',exact:true}).click();await page.locator('iframe').waitFor();
    const frame=page.frames().find(frame=>frame.url().includes('map-picker.html'));await frame.waitForLoadState();
    await frame.evaluate(poi=>parent.postMessage({type:'start-map-selection',token:new URL(location.href).searchParams.get('token'),poi},location.origin),poi);
    await page.locator('dialog').waitFor({state:'detached'});
  }
  await addRoutePoi(poi);await page.getByRole('list',{name:'路线站点'}).getByText('测试咖啡',{exact:true}).waitFor();
  await addRoutePoi(poi);assert.equal(await page.locator('[data-route-stop]').count(),1);checks.push('duplicate map stop is not appended');
  await addRoutePoi({...poi,providerPoiId:'TEST_POI_2',name:'第二站'});
  assert.equal(await page.getByRole('button',{name:/上移|下移/}).count(),0);
  await page.getByLabel('第 2 站打卡同款').fill('保留机位说明');
  await page.setViewportSize({width:834,height:2200});
  const handles=page.locator('.route-stop-handle');
  await handles.first().scrollIntoViewIfNeeded();
  const first=await handles.first().boundingBox(),second=await handles.nth(1).boundingBox();
  await page.mouse.move(second.x+20,second.y+20);await page.mouse.down();
  await page.mouse.move(second.x+20,second.y+10,{steps:4});await page.waitForTimeout(100);
  await page.mouse.move(first.x+20,first.y+10,{steps:20});await page.waitForTimeout(250);await page.mouse.up();
  await page.waitForTimeout(200);
  assert.equal(await page.getByLabel('第 1 站打卡同款').inputValue(),'保留机位说明');checks.push('pointer drag preserves station fields');
  await handles.first().focus();await page.keyboard.press('Space');await page.keyboard.press('ArrowDown');await page.keyboard.press('Escape');
  assert.equal(await page.locator('[data-route-stop] strong').first().textContent(),'第二站');checks.push('keyboard sorting cancellation restores original order');
  await handles.first().focus();await page.keyboard.press('Space');await page.keyboard.press('ArrowDown');await page.keyboard.press('Space');
  assert.equal(await page.locator('[data-route-stop] strong').first().textContent(),'测试咖啡');checks.push('keyboard sorting commits');
  await page.emulateMedia({reducedMotion:'reduce'});
  await handles.first().scrollIntoViewIfNeeded();
  const touchFrom=await handles.nth(1).boundingBox(),touchTo=await handles.first().boundingBox();
  const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});
  const x=touchFrom.x+20,y=touchFrom.y+20,targetY=touchTo.y+10;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(let i=1;i<=20;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+(targetY-y)*i/20}]});await page.waitForTimeout(20);}
  await page.waitForTimeout(150);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.waitForTimeout(100);await cdp.detach();
  assert.equal(await page.locator('[data-route-stop] strong').first().textContent(),'第二站');checks.push('emulated touch sorts cards with reduced motion');
  assert.equal(await page.locator('[data-route-stop] strong').first().textContent(),'第二站');checks.push('route stop order can be changed without changing route name');
  await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});
  await page.screenshot({path:new URL('../evidence/ROUTE_STOPS_390.png',import.meta.url).pathname.replace(/^\//,''),fullPage:true});
  failNext=true;release=undefined;await page.getByRole('button',{name:'提交审核'}).click();
  while(!release)await new Promise(resolve=>setTimeout(resolve,10));release();
  await page.getByText('身份服务尚未接入，暂时不能提交。',{exact:true}).waitFor();
  assert.equal(commands[1].value.stops[0].place.name,'第二站');assert.equal(commands[1].value.stops[0].place.source,'测试来源');
  assert.equal(commands[1].value.stops[1].place.poiId,'TEST_POI');assert.equal('placeIds' in commands[1].value,false);checks.push('new route places submit reviewed coordinates and inherit route source');
  assert.equal(await page.getByLabel('名称').inputValue(),'上海路线');assert.equal(await page.getByRole('button',{name:'提交审核'}).isEnabled(),true);checks.push('failed route submission keeps entered data and allows retry');
  assert.deepEqual(errors,[]);console.log('PASS private browser acceptance',checks.length,'checks');
}finally{
  release?.();await fs.writeFile(new URL('../evidence/PRIVATE_BROWSER_ACCEPTANCE.json',import.meta.url),JSON.stringify({at:new Date().toISOString(),fixtureTransportOnly:true,realIdentity:false,checks,errors},null,2));
  await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
}
