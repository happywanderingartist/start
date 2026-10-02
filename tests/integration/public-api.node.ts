import {testConfig} from '../db-config.ts';
import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import {randomUUID} from 'node:crypto';
import {migrate} from '../../tooling/db/migrate.ts';
import {importBatch} from '../../tooling/db/seed.ts';
import {catalogFixture,ids} from '../fixtures/catalog.ts';
import {assertPublicReader,createReadPool} from '../../apps/api/src/db/pool.ts';
import {createPublicServer} from '../../apps/api/src/http/server.ts';
import {ArtistHubSchema,PlaceDetailSchema,RouteDetailSchema,EventReadSchema,SearchResponseSchema,ErrorSchema} from '../../packages/api-contracts/src/schemas.ts';
const admin=new pg.Client(testConfig('postgres'));
const pool=new pg.Pool(testConfig('start_public_reader'));
const server=createPublicServer(pool);let base='';
before(async()=>{await admin.connect();await migrate(admin);await importBatch(admin,catalogFixture());await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const a=server.address();if(!a||typeof a==='string')throw Error('Missing TCP address');base=`http://127.0.0.1:${a.port}/api/v1`;});
after(async()=>{await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));await pool.end();await admin.end();});
async function get(path:string){const response=await fetch(base+path);return{response,body:await response.json()};}
test('HTTP four-entity search is real and empty residual results remain empty',async()=>{
 const r=await get('/search?q='+encodeURIComponent('台北'));assert.equal(r.response.status,200);const dto=SearchResponseSchema.parse(r.body);assert.deepEqual(dto.sections.map(s=>s.items.length),[1,1,1,1]);assert.equal(r.response.headers.get('cache-control'),'no-store');
 const unknown=await get('/search?q='+encodeURIComponent('南京火星'));assert.ok(SearchResponseSchema.parse(unknown.body).sections.every(s=>!s.items.length));
});
test('Artist Hub keeps identity and distinct footprint/event cities, including no-route identities',async()=>{
 const r=await get('/artists/'+ids.artist);assert.equal(r.response.status,200);const dto=ArtistHubSchema.parse(r.body);assert.equal(dto.identity.id,ids.artist);assert.equal(dto.footprintCities[0].relations[0].verification,'unverified');assert.equal(dto.recommendedRoutes[0].id,ids.route);assert.equal(dto.optionalEvents[0].state,'cancelled');
 const filter=await get('/artists/'+ids.artist+'?cityId='+ids.nanjing);const f=ArtistHubSchema.parse(filter.body);assert.deepEqual(f.identity,dto.identity);assert.equal(f.cityContext?.id,ids.nanjing);assert.deepEqual(f.recommendedRoutes,[]);assert.deepEqual(f.optionalEvents,[]);
 const empty=await get('/artists/'+ids.sameName);assert.equal(empty.response.status,200);assert.deepEqual(ArtistHubSchema.parse(empty.body).recommendedRoutes,[]);
 const eventOnly=ArtistHubSchema.parse((await get('/artists/'+ids.eventOnlyArtist)).body);assert.deepEqual(eventOnly.footprintCities,[]);assert.equal(eventOnly.eventCities[0].id,ids.nanjing);
});
test('Place read carries relation/evidence and truthful nullable practical fields, Event is a minimal read model',async()=>{
 const place=await get('/places/'+ids.bookstore);assert.equal(place.response.status,200);const p=PlaceDetailSchema.parse(place.body);assert.equal(p.identity.verification,'verified');assert.equal(p.artistRelations[0].verification,'unverified');assert.ok(p.artistRelations[0].caveat);assert.equal(p.practicalInfo,null);assert.equal(p.media,null);assert.equal(p.coordinates?.system,'wgs84');assert.equal(p.relatedRoutes[0].id,ids.route);
 const event=await get('/events/'+ids.event);assert.equal(event.response.status,200);const e=EventReadSchema.parse(event.body);assert.equal(e.state,'cancelled');assert.equal(e.sources[0].availability,'unavailable');assert.equal(e.artists[0].id,ids.artist);assert.equal(e.endsAt,null);
 assert.ok(!JSON.stringify([p,e]).includes('SECRET'));
});
test('Route read exposes frozen revision, why/story, ordered stops, separate trust and nullable transport',async()=>{
 const r=await get('/routes/'+ids.route);assert.equal(r.response.status,200);const d=RouteDetailSchema.parse(r.body);assert.equal(d.revisionId,ids.revision);assert.equal(d.stops[0].placeVerification,'verified');assert.equal(d.stops[0].relation?.verification,'unverified');assert.ok(d.whyWorthReplicating);assert.ok(d.shortStory);assert.equal(d.metrics.distanceMeters,null);assert.equal(d.metrics.transportSeconds,null);assert.equal(d.hero,null);assert.equal(d.sources[0].availability,'unavailable');assert.ok(!JSON.stringify(d).includes('SECRET'));
});
test('missing/private/sensitive/draft/withdrawn entities have uniform public 404 bodies',async()=>{
 for(const path of ['/artists/'+ids.privateArtist,'/artists/'+randomUUID(),'/places/'+ids.privatePlace,'/events/'+randomUUID()]){const r=await get(path);assert.equal(r.response.status,404);assert.equal(ErrorSchema.parse(r.body).error.code,'NOT_FOUND');}
 await admin.query("update start_catalog.route set publication='withdrawn' where id=$1",[ids.route]);try{const r=await get('/routes/'+ids.route);assert.equal(r.response.status,404);assert.equal(ErrorSchema.parse(r.body).error.code,'NOT_FOUND');}finally{await admin.query("update start_catalog.route set publication='published' where id=$1",[ids.route]);}
});
test('invalid UUID, query keys, duplicates, bounds, NUL and unknown city are honest 400; write endpoints do not exist',async()=>{
 for(const path of ['/artists/bad','/search?limit=x','/search?limit=31','/search?offset=1','/search?q=x&q=y','/search?q=%00','/search?secret=x','/artists/'+ids.artist+'?cityId='+randomUUID(),'/routes/'+ids.route+'?cityId='+ids.taipei]){const r=await get(path);assert.equal(r.response.status,400,path);assert.equal(ErrorSchema.parse(r.body).error.code,'INVALID_INPUT');}
 for(const path of ['/journeys','/follow','/route-submissions','/event-hub']){const r=await get(path);assert.equal(r.response.status,404);}
 const write=await fetch(base+'/routes/'+ids.route,{method:'POST',body:'{}'});assert.equal(write.status,404);
});

test('database loss returns retryable 503 without SQL, stack, credentials or misleading empty data',async()=>{
 const failedPool=new pg.Pool({...testConfig('start_public_reader'),port:55433,connectionTimeoutMillis:200});const logs:unknown[]=[];const failed=createPublicServer(failedPool,x=>logs.push(x));
 await new Promise<void>(r=>failed.listen(0,'127.0.0.1',r));try{const a=failed.address();if(!a||typeof a==='string')throw Error('Missing address');const r=await fetch('http://127.0.0.1:'+a.port+'/api/v1/search?q=SECRET');assert.equal(r.status,503);const dto=ErrorSchema.parse(await r.json());assert.equal(dto.error.retryable,true);assert.equal(dto.error.code,'UNAVAILABLE');assert.ok(!JSON.stringify([dto,logs]).includes('SECRET'));assert.ok(!JSON.stringify(dto).includes('ECONN'));assert.equal(logs.length,1);}finally{await new Promise<void>(r=>failed.close(()=>r()));await failedPool.end();}
});
test('runtime refuses an owner connection and verifies the real bounded reader role before serving',async()=>{
 await assertPublicReader(pool);const owner=new pg.Pool(testConfig('postgres'));try{await assert.rejects(assertPublicReader(owner),/read role/);}finally{await owner.end();}
 const bounded=createReadPool('postgresql://start_public_reader@'+testConfig('start_public_reader').host+':'+testConfig('start_public_reader').port+'/'+testConfig('start_public_reader').database);assert.ok(bounded.listenerCount('error')>0);await bounded.end();
});

test('unexpected internal failure returns a strict 500 envelope and never exposes diagnostic secrets',async()=>{
 // Narrow error-classification probe; successful API behavior above uses real PostgreSQL.
 const broken=new Proxy(pool,{get(target,key,receiver){if(key==='connect')return async()=>{throw Error('SECRET SQL stack credentials');};return Reflect.get(target,key,receiver);}});
 const failed=createPublicServer(broken);await new Promise<void>(r=>failed.listen(0,'127.0.0.1',r));try{const a=failed.address();if(!a||typeof a==='string')throw Error('Missing address');const r=await fetch('http://127.0.0.1:'+a.port+'/api/v1/search');assert.equal(r.status,500);const dto=ErrorSchema.parse(await r.json());assert.equal(dto.error.code,'INTERNAL');assert.equal(dto.error.retryable,false);assert.doesNotMatch(JSON.stringify(dto),/SECRET|SQL|stack|credentials/);}finally{await new Promise<void>(r=>failed.close(()=>r()));}
});
