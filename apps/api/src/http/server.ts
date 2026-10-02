import http from 'node:http';
import {randomUUID} from 'node:crypto';
import type {Pool} from 'pg';
import {Id,SearchInputSchema,ErrorSchema} from '../../../../packages/api-contracts/src/schemas.ts';
import {CatalogService,NotFoundError} from '../modules/catalog/service.ts';
import {DiscoveryService,InvalidCityError} from '../modules/discovery/service.ts';
import {PostgresSearchProvider} from '../providers/search/postgres.ts';
class InvalidInputError extends Error {}
type RequestLog={requestId:string,route:string,status:number};
function queryInput(url:URL,allowed:string[]) {
  const result:Record<string,string>={};
  for(const [key,value] of url.searchParams){if(!allowed.includes(key)||Object.hasOwn(result,key))throw new InvalidInputError();result[key]=value;}
  return result;
}
function uuid(value:string):string {const r=Id.safeParse(value);if(!r.success)throw new InvalidInputError();return r.data;}
function number(value:string|undefined):number|undefined {if(value===undefined)return undefined;if(!/^\d+$/u.test(value))throw new InvalidInputError();return Number(value);}
function unavailable(e:unknown):boolean {
  if(!(e instanceof Error))return false;
  const code='code' in e?String(e.code):'';
  return ['ECONNREFUSED','ECONNRESET','ETIMEDOUT','EPIPE','57P01','57P02','57P03','57014','53300','08000','08001','08003','08006'].includes(code)||/pool after calling end|connection terminated|connection timeout|timeout exceeded when trying to connect/i.test(e.message);
}
export function createPublicServer(pool:Pool,log:(entry:RequestLog)=>void=()=>{}) {
  const catalog=new CatalogService(pool),discovery=new DiscoveryService(pool,c=>new PostgresSearchProvider(c));
  const server=http.createServer(async(req,res)=>{
    const requestId=randomUUID();let route='unmatched',status=200,body:unknown;
    try {
      if(req.method!=='GET')throw new NotFoundError();
      const url=new URL(req.url??'/','http://localhost');
      if(url.pathname==='/api/v1/search') {
        route='search';const raw=queryInput(url,['q','cityId','section','limit','offset']);
        const parsed=SearchInputSchema.safeParse({...raw,...(raw.limit===undefined?{}:{limit:number(raw.limit)}),...(raw.offset===undefined?{}:{offset:number(raw.offset)})});
        if(!parsed.success)throw new InvalidInputError();body=await discovery.searchPublic(parsed.data,requestId);
      } else {
        const match=/^\/api\/v1\/(artists|routes|places|events)\/([^/]+)$/u.exec(url.pathname);
        if(!match)throw new NotFoundError();route=match[1];const id=uuid(decodeURIComponent(match[2]));
        const query=queryInput(url,route==='artists'?['cityId']:[]);const cityId=query.cityId===undefined?undefined:uuid(query.cityId);
        if(route==='artists')body=await catalog.artist(id,cityId,requestId);
        else if(route==='routes')body=await catalog.route(id,requestId);
        else if(route==='places')body=await catalog.place(id,requestId);
        else body=await catalog.event(id,requestId);
      }
    } catch(e) {
      let code:'INVALID_INPUT'|'NOT_FOUND'|'UNAVAILABLE'|'INTERNAL'='INTERNAL';let message='Internal read error',retryable=false;status=500;
      if(e instanceof InvalidInputError||e instanceof InvalidCityError||e instanceof URIError){status=400;code='INVALID_INPUT';message='Invalid public query';}
      else if(e instanceof NotFoundError){status=404;code='NOT_FOUND';message='Public content not found';}
      else if(unavailable(e)){status=503;code='UNAVAILABLE';message='Public read temporarily unavailable';retryable=true;}
      body=ErrorSchema.parse({error:{code,message,retryable},requestId});
    }
    res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','x-request-id':requestId});
    res.end(JSON.stringify(body));log({requestId,route,status});
  });
  server.requestTimeout=10000;server.headersTimeout=10000;
  return server;
}
