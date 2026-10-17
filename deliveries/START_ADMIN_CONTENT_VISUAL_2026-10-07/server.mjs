import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {extractorEndpoint} from './place-extractor.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.md':'text/plain; charset=utf-8'};
const sdkPaths=new Set(['/v4/map/styles','/v3/geocode/regeo','/v3/place/text','/v3/place/around','/v3/ip']);
const json=(res,status,body)=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(body));};
export function createAdminPreviewServer({fetchImpl=fetch,extractorFetch=fetch}={}){const extractionState={busy:false};return http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname.startsWith('/api/extract/')){await extractorEndpoint(req,res,url,{fetchImpl:extractorFetch,state:extractionState});return;}
  if(req.method!=='GET'){json(res,405,{error:'METHOD_NOT_ALLOWED'});return;}
  if(url.pathname.startsWith('/api/map/')||url.pathname.startsWith('/_AMapService/')){
   const upstream=new URL('http://127.0.0.1:4325');upstream.pathname=url.pathname;
   if(url.pathname==='/api/map/places'){
    const city=url.searchParams.get('city')?.trim(),keyword=url.searchParams.get('keyword')?.trim();
    if(!city||!keyword||city.length>40||keyword.length>80){json(res,400,{error:'INVALID_QUERY'});return;}
    upstream.search=new URLSearchParams({city,keyword}).toString();
   }else if(url.pathname==='/api/map/config'){}else if(sdkPaths.has(url.pathname.slice('/_AMapService'.length))){
    upstream.search=url.search;upstream.searchParams.delete('key');upstream.searchParams.delete('jscode');
   }else{json(res,404,{error:'NOT_FOUND'});return;}
   try{
    const response=await fetchImpl(upstream,{signal:AbortSignal.timeout(12000),redirect:'error'});
    if(!response.ok||Number(response.headers.get('content-length'))>2*1024*1024)throw Error();
    const reader=response.body.getReader();let size=0;const chunks=[];
    try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2*1024*1024)throw Error();chunks.push(value);}}catch(e){await reader.cancel();throw e;}
    const upstreamType=response.headers.get('content-type')||'';
    const contentType=url.pathname.startsWith('/_AMapService/')&&/^(application|text)\/(javascript|json)/i.test(upstreamType)?upstreamType:'application/json; charset=utf-8';
    res.writeHead(200,{'content-type':contentType,'cache-control':'no-store','x-content-type-options':'nosniff'});res.end(Buffer.concat(chunks));
   }catch{json(res,503,{error:'MAP_UNAVAILABLE'});}return;
  }
  const pathname=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);
  const file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)||!types[path.extname(file)]){json(res,404,{error:'NOT_FOUND'});return;}
  const data=await fs.readFile(file);res.writeHead(200,{'content-type':types[path.extname(file)],'cache-control':'no-store'});res.end(data);
 }catch{json(res,404,{error:'NOT_FOUND'});}
 });}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))createAdminPreviewServer().listen(4327,'127.0.0.1',()=>console.log('START admin visual http://127.0.0.1:4327/'));
