import http from 'node:http';
import {randomUUID} from 'node:crypto';
import {PlatformError,fail} from './contracts.mjs';
import {validateIdentity} from '../../START_ACCOUNT_FOUNDATION_2026-10-05/src/accounts.mjs';
const json=(res,status,value)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'});res.end(JSON.stringify(value));};
async function readBody(req,limit){let size=0;const chunks=[];for await(const b of req){size+=b.length;if(size>limit)fail('TOO_LARGE',413);chunks.push(b);}return Buffer.concat(chunks);}
export function createServer({app,media,repository,verifyBearer,allowedOrigins=[],serveStatic,serveIntegrations}){
 async function actor(req){if(typeof verifyBearer!=='function')fail('AUTH_NOT_CONFIGURED',503);const a=req.headers.authorization;if(typeof a!=='string'||a.length>8192||!/^Bearer [^\s]+$/i.test(a))fail('UNAUTHENTICATED',401);let identity;try{identity=await verifyBearer(a.slice(7));}catch{fail('AUTH_UNAVAILABLE',503);}return {id:await repository.resolveIdentity(validateIdentity(identity))};}
 const server=http.createServer(async(req,res)=>{
  const requestId=randomUUID();res.setHeader('x-request-id',requestId);res.setHeader('referrer-policy','no-referrer');
  try{
   if(!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(req.headers.host||''))fail('FORBIDDEN',403);
   const url=new URL(req.url,'http://'+req.headers.host);
   const origin=req.headers.origin;
   if(origin&&origin!==url.origin&&!allowedOrigins.includes(origin))fail('FORBIDDEN',403);
   if(req.headers['sec-fetch-site']==='cross-site'&&!allowedOrigins.includes(origin))fail('FORBIDDEN',403);
   if(origin&&allowedOrigins.includes(origin)){res.setHeader('access-control-allow-origin',origin);res.setHeader('vary','Origin');}
   if(req.method==='OPTIONS'){if(!origin||!allowedOrigins.includes(origin))fail('FORBIDDEN',403);res.writeHead(204,{'access-control-allow-methods':'GET,POST','access-control-allow-headers':'authorization,content-type,idempotency-key'});res.end();return;}
   if(req.method==='GET'&&url.pathname==='/api/status'){json(res,200,{mode:'local',database:true,authConfigured:typeof verifyBearer==='function',cloudConnected:false});return;}
   if(req.method==='GET'&&url.pathname==='/api/home'){json(res,200,await app.home());return;}
   if(req.method==='GET'&&url.pathname==='/api/public'){const filters={};for(const [k,v] of url.searchParams){if(Object.hasOwn(filters,k))fail('INVALID_INPUT');filters[k]=v;}json(res,200,await app.publicQuery(filters));return;}
   const detail=/^\/api\/public\/(artist|place|route|event|listing)\/([^/]+)$/.exec(url.pathname);if(req.method==='GET'&&detail){json(res,200,await app.publicDetail(detail[1],detail[2]));return;}
   const adminPath=/^\/api\/admin\/(content|submissions|applications|requests|audit|revisions|media)$/.exec(url.pathname);if(req.method==='GET'&&adminPath){json(res,200,await app.adminQuery(await actor(req),adminPath[1],url.searchParams.get('id')));return;}
   const sharedImage=/^\/api\/share\/([^/]+)\/media\/([^/]+)$/.exec(url.pathname);if(req.method==='GET'&&sharedImage){const owner=await app.shareMediaOwner(sharedImage[1],sharedImage[2]),m=await media.read(owner,sharedImage[2]);res.writeHead(200,{'content-type':m.mime,'cache-control':'no-store','x-content-type-options':'nosniff'});res.end(m.bytes);return;}
   if(req.method==='GET'&&url.pathname.startsWith('/api/share/')){json(res,200,await app.readShare(url.pathname.slice(11)));return;}
   if(req.method==='GET'&&url.pathname.startsWith('/api/me/')){json(res,200,await app.privateQuery(await actor(req),url.pathname.slice(8)));return;}
   if(req.method==='GET'&&url.pathname==='/api/recommend'){if([...url.searchParams.keys()].some(k=>k!=='city'))fail('INVALID_INPUT');json(res,200,await app.recommend(req.headers.authorization?await actor(req):null,{city:url.searchParams.get('city')}));return;}
   if(req.method==='POST'&&url.pathname==='/api/media'){const a=await actor(req);json(res,201,await media.upload(a,await readBody(req,5*1024*1024),req.headers['content-type']));return;}
   if(req.method==='GET'&&url.pathname.startsWith('/api/media/')){const a=req.headers.authorization?await actor(req):null;const m=await media.read(a,decodeURIComponent(url.pathname.slice(11)));res.writeHead(200,{'content-type':m.mime,'cache-control':'no-store','x-content-type-options':'nosniff'});res.end(m.bytes);return;}
   if(req.method==='POST'&&url.pathname.startsWith('/api/commands/')){
    const a=await actor(req);if(req.headers['content-type']?.split(';')[0]!=='application/json')fail('UNSUPPORTED_TYPE',415);
    let value;try{value=JSON.parse((await readBody(req,64*1024)).toString('utf8'));}catch(e){if(e instanceof PlatformError)throw e;fail('INVALID_INPUT');}
    const operation=decodeURIComponent(url.pathname.slice(14));const result=await app.execute(a,operation,value,req.headers['idempotency-key']);
    if(operation==='account.delete')await media.cleanupDeletedOwners();json(res,200,result);return;
   }
   if(serveIntegrations){if(req.method==='POST'&&url.pathname.startsWith('/api/extract/'))await app.privateQuery(await actor(req),'profile');if(await serveIntegrations(req,res,url))return;}
   if(serveStatic&&await serveStatic(req,res,url))return;
   fail('NOT_FOUND',404);
  }catch(e){if(res.destroyed||res.headersSent)return;const known=Number.isInteger(e.status)&&e.status>=400&&e.status<600;json(res,known?e.status:500,{error:known?e.code:'INTERNAL',requestId});}
 });server.requestTimeout=15000;server.headersTimeout=10000;return server;
}
