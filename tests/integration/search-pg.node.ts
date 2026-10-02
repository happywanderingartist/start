import{test,before,after}from'node:test';import assert from'node:assert/strict';import pg from'pg';
import{migrate}from'../../tooling/db/migrate.ts';import{importBatch}from'../../tooling/db/seed.ts';import{catalogFixture,ids}from'../fixtures/catalog.ts';import{DiscoveryService}from'../../apps/api/src/modules/discovery/service.ts';
import{PostgresSearchProvider,candidateQuery}from'../../apps/api/src/providers/search/postgres.ts';
import{randomUUID}from'node:crypto';import fs from'node:fs/promises';
const admin=new pg.Client({host:'127.0.0.1',port:55432,user:'postgres',database:'start_test_foundation'});const pool=new pg.Pool({host:'127.0.0.1',port:55432,user:'start_public_reader',database:'start_test_foundation'});const service=new DiscoveryService(pool,c=>new PostgresSearchProvider(c));
before(async()=>{await admin.connect();await migrate(admin);await importBatch(admin,catalogFixture());});after(async()=>{await admin.end();await pool.end();});
test('city search really queries all four public entity groups in product order',async()=>{
 const r=await service.searchPublic({q:'台北'});assert.deepEqual(r.sections.map(s=>s.type),['artist','route','place','event']);assert.deepEqual(r.sections.map(s=>s.items.length),[1,1,1,1]);assert.equal(r.intent.kind,'city');
});
test('Place and Event exact names resolve their own identities and related four-entity context',async()=>{
 const place=await service.searchPublic({q:'春日书店'});assert.equal(place.intent.kind,'place');assert.equal(place.sections[2].items[0].id,ids.bookstore);assert.equal(place.sections[0].items[0].id,ids.artist);
 const event=await service.searchPublic({q:'[TEST]春日现场'});assert.equal(event.intent.kind,'event');assert.equal(event.sections[3].items[0].id,ids.event);assert.equal(event.sections[3].items[0].type,'event');assert.equal(event.sections[1].items[0].id,ids.route);
});
test('ambiguous aliases preserve both identities; anonymous blank query is honest catalog mode with independent section paging',async()=>{
 const ambiguous=await service.searchPublic({q:'青'});assert.equal(ambiguous.intent.ambiguity,true);assert.deepEqual(ambiguous.sections[0].items.map(x=>x.id),[ids.artist,ids.sameName]);
 const defaultResults=await service.searchPublic({q:'  ',limit:1});assert.equal(defaultResults.mode,'default');assert.equal(defaultResults.sections[0].page.hasMore,true);assert.equal(defaultResults.sections[0].items[0].id,ids.artist);
 const second=await service.searchPublic({q:'',section:'artist',limit:1,offset:1});assert.equal(second.sections[0].items[0].id,ids.sameName);assert.deepEqual(second.sections.slice(1).map(s=>s.status),['not_requested','not_requested','not_requested']);assert.ok(second.sections.slice(1).every(s=>!s.items.length));
});
test('city filters constrain all groups; Event-only cities do not manufacture Artist footprint claims',async()=>{
 const filtered=await service.searchPublic({q:'苏打绿',cityId:ids.nanjing});assert.ok(filtered.sections.every(s=>!s.items.length));
 const mismatch=await service.searchPublic({q:'台北',cityId:ids.nanjing});assert.ok(mismatch.sections.every(s=>!s.items.length));
 const nj=await service.searchPublic({q:'南京'});assert.equal(nj.sections[0].items[0].id,ids.eventOnlyArtist);const artist=nj.sections[0];if(artist.type!=='artist')throw Error('Wrong type');assert.deepEqual(artist.items[0].footprintCities,[]);assert.equal(artist.items[0].eventCities[0].id,ids.nanjing);
 await assert.rejects(service.searchPublic({q:'苏打绿',cityId:randomUUID()}),/city/);
});
test('parameterized literal matching does not interpret percent, underscore, quotes or SQL injection as wildcard commands',async()=>{
 for(const q of ['%','_','苏打绿%','台北_','\' OR 1=1 --'])assert.ok((await service.searchPublic({q})).sections.every(s=>!s.items.length),q);
 assert.equal((await service.searchPublic({q:'苏打绿'})).sections[1].items[0].id,ids.route);
});
test('current withdrawal disappears from the very next search, while approved unverified relations remain visible with caveats',async()=>{
 await admin.query("update start_catalog.route set publication='withdrawn' where id=$1",[ids.route]);try{assert.equal((await service.searchPublic({q:'苏打绿'})).sections[1].items.length,0);}finally{await admin.query("update start_catalog.route set publication='published' where id=$1",[ids.route]);}
 const result=await service.searchPublic({q:'春日书店'});const place=result.sections[2];if(place.type!=='place')throw Error('Wrong type');assert.equal(place.items[0].topVerifiedRelation,null);assert.equal(place.items[0].relations[0].verification,'unverified');assert.ok(place.items[0].relations[0].caveat);
});
test('ranking and qualification precede pagination, aliases do not duplicate identities, and page bounds are validated',async()=>{
 const hidden=randomUUID();await admin.query("insert into start_catalog.artist(id,canonical_name,normalized_name,artist_type,review,publication,visibility) values($1,'苏打绿','苏打绿','band','approved','published','private')",[hidden]);
 const r=await service.searchPublic({q:'苏打绿',limit:1});assert.equal(r.sections[0].items[0].id,ids.artist);
 const aliases=await service.searchPublic({q:'sodagreen'});assert.equal(aliases.sections[0].items.length,1);
 for(const input of [{q:'x',offset:1},{q:'x',limit:31},{q:'x',section:'place',offset:1001}])await assert.rejects(service.searchPublic(input));
});
test('EXPLAIN and bounded response timing use real PG queries rather than a mock provider',async()=>{
 const plans=[];const c=await pool.connect();try{for(const type of ['artist','route','place','event']as const){const p=await c.query('EXPLAIN (ANALYZE,FORMAT JSON) '+candidateQuery(type),['台北',[],[ids.taipei],[],[],null,[],11,0]);plans.push({type,plan:p.rows[0]['QUERY PLAN']});}}finally{c.release();}
 const start=performance.now();await service.searchPublic({q:'台北'});const elapsed=performance.now()-start;assert.ok(elapsed<3000,`${elapsed}ms exceeded query timeout budget`);
 await fs.writeFile('.context/search-explain.json',JSON.stringify({at:new Date().toISOString(),fixture:'synthetic:catalog:v1',elapsedMilliseconds:elapsed,queryBudgetMilliseconds:3000,plans},null,2));
});
test('exact artist and registered aliases resolve Artist Hub; continuous Chinese combines artist and city',async()=>{
 for(const q of ['苏打绿','sodagreen',' ＳＯＤＡＧＲＥＥＮ ','蘇打綠','想去苏打绿台北']){const r=await service.searchPublic({q});assert.equal(r.sections[0].items[0].id,ids.artist,q);assert.equal(r.sections[1].items[0].id,ids.route,q);assert.equal(r.intent.primaryTarget,'artist_hub',q);}
});
test('unknown residual words never disappear into a fixed Nanjing route or default dataset',async()=>{
 for(const q of ['南京火星','台北火星','苏打绿不存在的路线','火星','密代']){const r=await service.searchPublic({q});assert.ok(r.sections.every(s=>s.items.length===0),q);}
});

test('unknown words containing connector characters stay intact and cannot match shortened claims',async()=>{
 for(const q of ['苏打绿和声','台北和声','苏打绿旅行者','台北活动室'])assert.ok((await service.searchPublic({q})).sections.every(s=>!s.items.length),q);
 assert.equal((await service.searchPublic({q:'想去苏打绿台北'})).sections[1].items[0].id,ids.route);
});
test('multiple qualified public candidates rank before LIMIT; exact aliases share the exact-name tier',async()=>{
 const early='00000000-0000-4000-8000-000000000001',late='ffffffff-ffff-4fff-8fff-ffffffffffff';
 await admin.query('BEGIN');try{
  for(const [id,name]of [[early,'晚风'],[late,'春日歌者']]){await admin.query("insert into start_catalog.artist(id,canonical_name,normalized_name,artist_type,review,publication,visibility) values($1,$2,$2,'band','approved','published','public')",[id,name]);await admin.query("insert into start_catalog.artist_place_relation(id,artist_id,place_id,relation_type,explanation,verification,review,visibility,credible_basis,public_caveat) values($1,$2,$3,'test','测试关系','unverified','approved','public',true,'仅测试')",[randomUUID(),id,ids.bookstore]);}
  const provider=new PostgresSearchProvider(admin);const input={q:'春日',normalizedQuery:'春日',resolvedIds:{artist:[],city:[],place:[],event:[]},residualTerms:['春日'],limit:1,offset:0};
  const first=await provider.search(input);assert.equal(first.artist.items[0].id,late);assert.equal(first.artist.hasMore,true);
  const second=await provider.search({...input,offset:1});assert.notEqual(second.artist.items[0].id,late);
  await admin.query("insert into start_catalog.artist_alias(artist_id,alias,normalized_alias,locale) values($1,'青','青','zh')",[early]);await admin.query("update start_catalog.artist set canonical_name='青',normalized_name='青' where id=$1",[late]);
  const exact=await provider.search({...input,q:'青',normalizedQuery:'青',resolvedIds:{artist:[early,late,ids.artist,ids.sameName],city:[],place:[],event:[]},residualTerms:[]});assert.equal(exact.artist.items[0].id,early);
 }finally{await admin.query('ROLLBACK');}
});
