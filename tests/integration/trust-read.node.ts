import {testConfig} from '../db-config.ts';
import {test,before,after} from 'node:test';import assert from 'node:assert/strict';import pg from 'pg';
import{migrate}from'../../tooling/db/migrate.ts';import{seedHistorical,importBatch}from'../../tooling/db/seed.ts';import{catalogFixture,ids}from'../fixtures/catalog.ts';
import{Items,RouteDetailSchema}from'../../packages/api-contracts/src/schemas.ts';import{randomUUID}from'node:crypto';
import fs from 'node:fs/promises';import path from 'node:path';
const c=new pg.Client(testConfig('postgres'));
const reader=new pg.Client(testConfig('start_public_reader'));
before(async()=>{await c.connect();await migrate(c);await importBatch(c,catalogFixture());await reader.connect();});after(async()=>{await c.end();await reader.end();});
test('historical seed establishes five canonical places and one unpublished route, preserving transport metadata',async()=>{
 await seedHistorical(c);const r=await c.query("select publication from start_catalog.route where slug='route-anpu-nanjing-old-city'");assert.equal(r.rows.length,1);assert.equal(r.rows[0].publication,'unpublished');
 const revision=await c.query("select metrics from start_catalog.route_revision where route_id=(select id from start_catalog.route where slug='route-anpu-nanjing-old-city')");assert.equal(revision.rows[0].metrics.distanceMeters,1496);assert.equal(revision.rows[0].metrics.transportSeconds,1198);
});
async function tx(fn:()=>Promise<void>){await c.query('begin');try{await fn();}finally{await c.query('rollback');}}
test('runtime reads four entity-specific DTOs while historical/draft/private content and reviewer/source secrets stay hidden',async()=>{
 for(const type of ['artist','route','place','event']as const){const table={artist:'artists',route:'routes',place:'places',event:'events'}[type];const r=await reader.query('select data from start_public.'+table);assert.ok(r.rows.length>0,type);for(const row of r.rows){assert.equal(Items[type].safeParse(row.data).success,true,type);assert.doesNotMatch(JSON.stringify(row.data),/SECRET|synthetic-fixture-reviewer|review_reason/);}}
 assert.equal((await reader.query('select * from start_public.artists where id=$1',[ids.privateArtist])).rows.length,0);
 assert.equal((await reader.query('select * from start_public.places where id=$1',[ids.privatePlace])).rows.length,0);
 const detail=(await reader.query('select detail from start_public.routes where id=$1',[ids.route])).rows[0].detail;assert.equal(RouteDetailSchema.safeParse({...detail,requestId:'test'}).success,true);assert.equal(detail.stops[0].placeVerification,'verified');assert.equal(detail.stops[0].relation.verification,'unverified');assert.equal(detail.stops[0].relation.claims[0].verification,'unverified');assert.equal(detail.hero,null);assert.equal(detail.sources[0].availability,'unavailable');
});
test('seed replay is idempotent; changed provenance, invalid references and frozen conflicts roll back the whole batch',async()=>{
 const before=(await c.query('select source_key,sha256,imported_at from start_catalog.import_record order by source_key')).rows;await seedHistorical(c);await importBatch(c,catalogFixture());assert.deepEqual((await c.query('select source_key,sha256,imported_at from start_catalog.import_record order by source_key')).rows,before);
 const changed=catalogFixture();changed.provenance={changed:true};await assert.rejects(importBatch(c,changed),/checksum/);
 const newId=randomUUID();await assert.rejects(importBatch(c,{sourceKey:'invalid:'+newId,synthetic:true,provenance:{test:true},tables:[{table:'artist',rows:[{id:newId,canonical_name:'ShouldRollback',normalized_name:'shouldrollback',artist_type:'band'}]},{table:'artist_alias',rows:[{artist_id:randomUUID(),alias:'bad',normalized_alias:'bad',locale:'en'}]}]}));assert.equal((await c.query('select id from start_catalog.artist where id=$1',[newId])).rows.length,0);
 await assert.rejects(importBatch(c,{sourceKey:'frozen:'+randomUUID(),synthetic:true,provenance:{test:true},tables:[{table:'route_revision',rows:[{id:ids.revision,route_id:ids.route,revision_number:1,title:'Mutation',summary:'x',why_worth_replicating:'x',short_story:'x'}]}]}),/frozen/);
});
test('publication is independent of verification; approved unverified/partial with caveats stays legal, private/core disputed or pending does not',()=>tx(async()=>{
 assert.equal((await c.query('select start_catalog.route_public($1) as legal',[ids.route])).rows[0].legal,true);
 await c.query("update start_catalog.artist_place_relation set verification='partial' where id=$1",[ids.relation]);assert.equal((await c.query('select start_catalog.route_public($1) as legal',[ids.route])).rows[0].legal,true);
 for(const [table,key,field,value]of [['artist_place_relation',ids.relation,'review','pending'],['artist_place_relation',ids.relation,'public_caveat',null],['claim',ids.claim,'verification','disputed'],['claim',ids.claim,'severe_dispute',true],['place',ids.bookstore,'visibility','sensitive'],['artist',ids.artist,'publication','withdrawn']]as const){await c.query('savepoint boundary');await c.query(`update start_catalog.${table} set ${field}=$1 where id=$2`,[value,key]);assert.equal((await c.query('select start_catalog.route_public($1) as legal',[ids.route])).rows[0].legal,false,table+'/'+field);await c.query('rollback to savepoint boundary');}
}));
test('current withdrawal and private evidence revoke public access, while historical snapshot facts remain frozen',()=>tx(async()=>{
 const old=(await c.query('select snapshot from start_catalog.route_revision where id=$1',[ids.revision])).rows[0].snapshot;
 await c.query("update start_catalog.place set name='Changed Current Name',address='Changed Address' where id=$1",[ids.bookstore]);
 const detail=(await c.query('select detail from start_public.routes where id=$1',[ids.route])).rows[0].detail;assert.equal(detail.stops[0].name,'春日书店');assert.equal(detail.stops[0].address,'测试地址');assert.deepEqual((await c.query('select snapshot from start_catalog.route_revision where id=$1',[ids.revision])).rows[0].snapshot,old);
 await c.query("update start_catalog.evidence_source set visibility='private' where id=$1",[ids.source]);const hidden=(await c.query('select detail from start_public.routes where id=$1',[ids.route])).rows[0].detail;assert.deepEqual(hidden.sources,[]);assert.deepEqual(hidden.stops[0].relation.sources,[]);assert.deepEqual(hidden.stops[0].relation.claims[0].sources,[]);
 await c.query("update start_catalog.route set publication='withdrawn' where id=$1",[ids.route]);assert.equal((await c.query('select id from start_public.routes where id=$1',[ids.route])).rows.length,0);
}));
test('source availability does not erase verified history; media without usable rights is null, even if old snapshot had a hero',()=>tx(async()=>{
 await c.query("update start_catalog.claim set verification='verified',verified_at='2026-09-01T00:00:00Z',public_caveat=null where id=$1",[ids.claim]);await c.query("update start_catalog.claim_evidence set support_role='supports' where claim_id=$1 and evidence_source_id=$2",[ids.claim,ids.source]);
 const claim=(await c.query('select start_catalog.claim_json($1) as data',[ids.claim])).rows[0].data;assert.equal(claim.verification,'verified');assert.equal(claim.sources[0].availability,'unavailable');assert.equal(claim.verifiedAt,'2026-09-01T00:00:00.000Z');
 await c.query("update start_catalog.media_asset set object_key='public/hero.png',rights_state='approved' where id=$1",[ids.media]);assert.equal((await c.query('select detail from start_public.routes where id=$1',[ids.route])).rows[0].detail.hero,null); // No retroactive media insertion into a historical missing-image snapshot.
 await c.query("update start_catalog.media_asset set rights_state='infringing' where id=$1",[ids.media]);assert.equal((await c.query('select detail from start_public.routes where id=$1',[ids.route])).rows[0].detail.hero,null);
}));
test('controlled publish rejects missing core association and mismatched stop relation without partially freezing',()=>tx(async()=>{
 const revision=randomUUID(),stop=randomUUID();await c.query("insert into start_catalog.route_revision(id,route_id,revision_number,title,summary,why_worth_replicating,short_story,review,reviewer,reviewed_at,review_reason) values($1,$2,2,'NotPublishable','s','w','s','approved','test',now(),'test')",[revision,ids.route]);await c.query("insert into start_catalog.route_stop(id,revision_id,place_id,sequence,stop_note) values($1,$2,$3,1,'not associated')",[stop,revision,ids.bookstore]);await c.query("insert into start_catalog.review_record(id,subject_revision_id,reviewer,reviewed_at,decision,reason,evidence_ids) values($1,$2,'test',now(),'approved','test','{}')",[randomUUID(),revision]);
 await c.query('savepoint publication');await assert.rejects(c.query('select start_catalog.publish_route($1)',[revision]),/eligible/);await c.query('rollback to savepoint publication');assert.equal((await c.query('select frozen_at from start_catalog.route_revision where id=$1',[revision])).rows[0].frozen_at,null);
 await c.query('update start_catalog.route_stop set artist_place_relation_id=$1,place_id=$2 where id=$3',[ids.relation,ids.venue,stop]);await c.query('savepoint mismatch');await assert.rejects(c.query('select start_catalog.publish_route($1)',[revision]),/eligible/);await c.query('rollback to savepoint mismatch');
}));
test('runtime cannot invoke private helper/write functions and cannot manufacture its own canonical relations',async()=>{
 for(const sql of ['select start_catalog.publish_route($1)','select start_catalog.owner_sources(\'relation\',$1)','update start_catalog.artist set review=\'approved\' where id=$1'])await assert.rejects(reader.query(sql,[ids.revision]),(e:unknown)=>(e as{code:string}).code==='42501');
});
test('frozen hero media keeps its historical object reference; later approval does not insert an image and rights withdrawal removes it',()=>tx(async()=>{
 await c.query("update start_catalog.media_asset set object_key='public/original.png',rights_state='approved' where id=$1",[ids.media]);
 const revision=randomUUID(),stop=randomUUID();await c.query("insert into start_catalog.route_revision(id,route_id,revision_number,title,summary,why_worth_replicating,short_story,hero_media_id,review,reviewer,reviewed_at,review_reason) values($1,$2,2,'HeroSnapshot','s','w','s',$3,'approved','test',now(),'test')",[revision,ids.route,ids.media]);
 await c.query("insert into start_catalog.route_stop(id,revision_id,place_id,sequence,stop_note,artist_place_relation_id) values($1,$2,$3,1,'test',$4)",[stop,revision,ids.bookstore,ids.relation]);
 await c.query("insert into start_catalog.review_record(id,subject_revision_id,reviewer,reviewed_at,decision,reason,evidence_ids) values($1,$2,'test',now(),'approved','test','{}')",[randomUUID(),revision]);await c.query('select start_catalog.publish_route($1)',[revision]);
 await c.query("update start_catalog.media_asset set object_key='public/replaced.png' where id=$1",[ids.media]);
 assert.equal((await c.query('select detail from start_public.routes where id=$1',[ids.route])).rows[0].detail.hero.objectKey,'public/original.png');
 await c.query("update start_catalog.media_asset set rights_state='revoked' where id=$1",[ids.media]);assert.equal((await c.query('select detail from start_public.routes where id=$1',[ids.route])).rows[0].detail.hero,null);
}));
test('public runtime projections exist for all four entities, not a raw private catalog table',async()=>{
 const r=await c.query("select table_name from information_schema.views where table_schema='start_public'");for(const name of ['artists','routes','places','events','aliases','cities'])assert.ok(r.rows.some(x=>x.table_name===name),name);
});
test('a reader-created temporary artist cannot override canonical public qualification and leak private identities',async()=>{
 const attacker=new pg.Client(testConfig('start_public_reader'));await attacker.connect();await attacker.query('begin');try{
 await attacker.query('create temporary table artist(id uuid,canonical_name text,artist_type text,verification text,publication text,review text,visibility text)');
 await attacker.query("insert into artist values($1,'Forged','band','verified','published','approved','public')",[ids.privateArtist]);await attacker.query('grant select on artist to start_catalog_owner');
 assert.equal((await attacker.query('select id,name from start_public.artists where id=$1',[ids.privateArtist])).rows.length,0);
 assert.equal((await attacker.query('select data from start_public.artists where id=$1',[ids.artist])).rows[0].data.canonicalName,'苏打绿');
 }finally{await attacker.query('rollback');await attacker.end();}
});
test('historical import refuses altered original bytes including candidate history even when import records already exist',async()=>{
 const scratch=await fs.mkdtemp(path.resolve('.context/seed-source-'));await fs.cp(path.resolve('db/seeds/historical'),scratch,{recursive:true});
 for(const file of ['route-anpu-nanjing.json','route-anpu-nanjing.source.json','route-anpu-nanjing.candidates.json']){
 await fs.appendFile(path.join(scratch,file),'\n');await assert.rejects(seedHistorical(c,new URL('file:///'+scratch.replaceAll('\\','/')+'/')),/source.*hash|source.*bytes/i);await fs.copyFile(path.resolve('db/seeds/historical',file),path.join(scratch,file));
 }
});

test('severe core claims remove their Place, Relation and Event owners, including Route and footprint projections',()=>tx(async()=>{
 for(const [column,key,query] of [
  ['place_id',ids.bookstore,'select id from start_public.places where id=$1'],
  ['relation_id',ids.relation,'select id from start_catalog.artist_place_relation where id=$1 and start_catalog.relation_public(id)'],
  ['event_id',ids.event,'select id from start_public.events where id=$1'],
 ]as const){await c.query('savepoint owner_claim');try{
  await c.query("insert into start_catalog.claim(id,statement,verification,review,visibility,public_caveat,severe_dispute,is_core,"+column+") values($1,'Synthetic disputed core fact','disputed','approved','public','Serious test dispute',true,true,$2)",[randomUUID(),key]);
  assert.equal((await c.query(query,[key])).rows.length,0,column);
  if(column!=='event_id'){assert.equal((await c.query('select id from start_public.routes where id=$1',[ids.route])).rows.length,0,column);const a=(await c.query('select data from start_public.artists where id=$1',[ids.artist])).rows[0].data;assert.deepEqual(a.footprintCities,[]);}
  else {const a=(await c.query('select data from start_public.artists where id=$1',[ids.artist])).rows[0].data;assert.deepEqual(a.eventCities,[]);}
 }finally{await c.query('rollback to savepoint owner_claim');}}
}));
