import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const base='http://127.0.0.1:4330',results=[];let failure=null;
async function check(label,url,validate){const r=await fetch(url,{signal:AbortSignal.timeout(20000)}),data=await r.json();validate(r,data);results.push({label,status:r.status});}
try{
await check('local database and no production identity',base+'/api/status',(r,d)=>{assert.equal(r.status,200);assert.equal(d.database,true);assert.equal(d.authConfigured,false);assert.equal(d.cloudConnected,false);});
await check('published query',base+'/api/public',(r,d)=>{assert.equal(r.status,200);assert.ok(Array.isArray(d.places));});
await check('admin blocked without verified identity',base+'/api/admin/content',(r,d)=>{assert.equal(r.status,503);assert.equal(d.error,'AUTH_NOT_CONFIGURED');});
await check('AMap JS configuration',base+'/api/map/config',(r,d)=>{assert.equal(r.status,200);assert.ok(d.jsKey);assert.equal(d.serviceHost,'/_AMapService');});
await check('real AMap Shanghai POI search',base+'/api/map/places?'+new URLSearchParams({city:'上海',keyword:'上海体育场'}),(r,d)=>{assert.equal(r.status,200);assert.equal(d.source,'amap');assert.ok(d.items.length>0);assert.ok(d.items.every(p=>Number.isFinite(p.longitude)&&Number.isFinite(p.latitude)));});
await check('local text extractor status',base+'/api/extract/status',(r,d)=>{assert.equal(r.status,200);results.push({label:'local model readiness',ready:d.ready===true});});
const previewBase=process.env.OPEN_DESIGN_BASE_URL||'http://127.0.0.1:63868';
const preview=await fetch(previewBase+'/api/projects/23d86b85-b67b-42f0-8b1b-d7c118a9d81c/raw/local-acceptance-2026-10-08/index.html',{signal:AbortSignal.timeout(5000)});assert.equal(preview.status,200);const previewHtml=await preview.text();assert.ok(previewHtml.includes('START')&&previewHtml.length>3000,'Expected actual START design, not app shell fallback');results.push({label:'Open Design independent preview',status:preview.status,base:previewBase});
console.log('PASS local integrations smoke',results.length,'checks');
}catch(error){failure={message:error.message,code:error.cause?.code||error.code,address:error.cause?.address,port:error.cause?.port};throw error;}
finally{await fs.writeFile(new URL('../evidence/LOCAL_SMOKE.json',import.meta.url),JSON.stringify({at:new Date().toISOString(),passed:failure===null,failure,results,keysPrinted:false,realGps:false,realWechat:false},null,2));}
