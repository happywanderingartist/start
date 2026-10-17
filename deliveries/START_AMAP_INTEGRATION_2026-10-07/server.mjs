import http from 'node:http';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createServer as createPreviewServer} from '../START_FINAL_LAYOUT_REVIEW_2026-10-06/server.mjs';
import {searchAmapPlaces} from '../../.worktrees/fan-route-v0.2/worker/map/amap.js';
export async function readConfig(){
 const raw=await fs.readFile(new URL('../../private-config/amap.env',import.meta.url),'utf8');
 const values=Object.fromEntries(raw.split(/\r?\n/).filter(x=>/^[A-Z_]+=/.test(x)).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),x.slice(i+1).trim()];}));
 if(!values.AMAP_JS_API_KEY || !values.AMAP_JS_SECURITY_CODE)throw new Error('地图配置缺少必填项');
 return {jsKey:values.AMAP_JS_API_KEY,securityCode:values.AMAP_JS_SECURITY_CODE,serviceKey:process.env.AMAP_WEB_SERVICE_KEY};
}
const proxyPaths=new Map([['/v4/map/styles','webapi.amap.com'],['/v3/geocode/regeo','restapi.amap.com'],['/v3/place/text','restapi.amap.com'],['/v3/place/around','restapi.amap.com'],['/v3/ip','restapi.amap.com']]);
export function createIntegrationServer({config,fetchImpl=fetch}){
 const fallback=createPreviewServer().listeners('request')[0];
 const send=(res,status,body)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(body));};
 return http.createServer(async(req,res)=>{
  try{
   const u=new URL(req.url,'http://localhost');
   if(req.method!=='GET'){send(res,405,{error:'METHOD_NOT_ALLOWED'});return;}
   if(u.pathname==='/api/map/config'){send(res,200,{jsKey:config.jsKey,serviceHost:'/_AMapService'});return;}
   if(u.pathname.startsWith('/_AMapService/')){
    const p=u.pathname.slice('/_AMapService'.length);const host=proxyPaths.get(p);
    if(!host){send(res,404,{error:'NOT_AVAILABLE'});return;}
    const upstream=new URL(p,`https://${host}`);upstream.search=u.search;upstream.searchParams.set('key',config.jsKey);upstream.searchParams.set('jscode',config.securityCode);
    const r=await fetchImpl(upstream,{signal:AbortSignal.timeout(10000),redirect:'error'});
    if(!r.ok)throw new Error('provider');
    const bytes=Buffer.from(await r.arrayBuffer());if(bytes.length>2000000)throw new Error('size');
    const type=r.headers.get('content-type')||'application/json';
    res.writeHead(200,{'content-type':type,'cache-control':'no-store','x-content-type-options':'nosniff'});res.end(bytes);return;
   }
   if(u.pathname==='/api/map/places'){
    const keyword=u.searchParams.get('keyword')?.trim();const city=u.searchParams.get('city')?.trim();
    if(!keyword||keyword.length>80||!city||city.length>40){send(res,400,{error:'INVALID_INPUT'});return;}
    if(!config.serviceKey){send(res,503,{error:'MAP_NOT_CONFIGURED'});return;}
    const items=await searchAmapPlaces({keyword,city},{key:config.serviceKey,fetchImpl:(request)=>{const url=new URL(request.url);url.searchParams.set('city_limit','true');return fetchImpl(new Request(url),{signal:AbortSignal.timeout(8000),redirect:'error'});}});
    send(res,200,{items,source:'amap',publication:'candidate'});return;
   }
   if(['/map.html','/live-map.js','/live-map.css'].includes(u.pathname)){
    const ext=u.pathname.split('.').at(-1);const content=await fs.readFile(new URL('.'+u.pathname,import.meta.url));
    res.writeHead(200,{'content-type':({'html':'text/html','js':'text/javascript','css':'text/css'})[ext]+'; charset=utf-8','cache-control':'no-store'});res.end(content);return;
   }
   if(u.pathname.includes('private-config') || /\.(env|mjs)$/.test(u.pathname)){send(res,404,{error:'NOT_AVAILABLE'});return;}
   await fallback(req,res);
  }catch{send(res,502,{error:'MAP_UNAVAILABLE'});}
 });
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const config=await readConfig();const port=Number(process.env.START_PREVIEW_PORT||4325);
 if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Invalid port');
 createIntegrationServer({config}).listen(port,'127.0.0.1',()=>console.log(`START 高德联调 · http://127.0.0.1:${port}/map.html`));
}
