import {testConfig} from '../db-config.ts';
import {test,before,after} from 'node:test';import assert from 'node:assert/strict';import pg from 'pg';import fs from 'node:fs/promises';import path from 'node:path';import {randomUUID} from 'node:crypto';
import {migrate} from '../../tooling/db/migrate.ts';
const c=new pg.Client(testConfig('postgres'));
before(async()=>{await c.connect();await migrate(c);});after(async()=>{await c.end();});
test('migrations establish all canonical catalog and evidence identities instead of a Route-only database',async()=>{
  const r=await c.query("select table_name from information_schema.tables where table_schema='start_catalog' order by table_name");
  for(const table of ['artist','artist_alias','city','place','place_provider_ref','artist_place_relation','evidence_source','claim','claim_evidence','route','route_revision','route_stop','event','event_artist','media_asset'])assert.ok(r.rows.some(x=>x.table_name===table),table);
});
const id=(n:number)=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
async function tx(fn:()=>Promise<void>){await c.query('begin');try{await fn();}finally{await c.query('rollback');}}
async function reject(sql:string,values:unknown[],code:string){await c.query('savepoint rejection');await assert.rejects(c.query(sql,values),(e:unknown)=> (e as {code:string}).code===code);await c.query('rollback to savepoint rejection');}
async function fixture(){
 await c.query("insert into start_catalog.city values($1,'南京','南京','CN',null)",[id(1)]);
 await c.query("insert into start_catalog.artist(id,canonical_name,normalized_name,artist_type) values($1,'Test','test','band'),($2,'Other','other','band')",[id(2),id(3)]);
 await c.query("insert into start_catalog.place(id,city_id,name,normalized_name) values($1,$2,'TestPlace','testplace')",[id(4),id(1)]);
 await c.query("insert into start_catalog.route(id,slug,city_id,linked_artist_id) values($1,'constraint-route',$2,$3),($4,'other-route',$2,$3)",[id(5),id(1),id(2),id(6)]);
 await c.query("insert into start_catalog.route_revision(id,route_id,revision_number,title,summary,why_worth_replicating,short_story) values($1,$2,1,'Title','Summary','Why','Story'),($3,$4,1,'Other','Summary','Why','Story')",[id(7),id(5),id(8),id(6)]);
}
test('aliases allow same-name identities but reject duplicate aliases and orphan references',()=>tx(async()=>{
 await fixture();await c.query("insert into start_catalog.artist_alias values($1,'Same','same','zh'),($2,'Same','same','zh')",[id(2),id(3)]);
 await reject("insert into start_catalog.artist_alias values($1,'Same','same','zh')",[id(2)],'23505');
 await reject("insert into start_catalog.artist_alias values($1,'No','no','zh')",[id(999)],'23503');
}));
test('coordinates are paired, bounded and labelled; external provider identity stays separate',()=>tx(async()=>{
 await fixture();await reject('update start_catalog.place set longitude=118 where id=$1',[id(4)],'23514');
 await reject("update start_catalog.place set longitude=181,latitude=32,coordinate_system='gcj02' where id=$1",[id(4)],'23514');
 await reject("update start_catalog.place set longitude=118,latitude=32,coordinate_system='unknown' where id=$1",[id(4)],'23514');
 await reject("update start_catalog.place set longitude=118,latitude=32,coordinate_system=null where id=$1",[id(4)],'23514');
 await c.query("update start_catalog.place set longitude=118,latitude=32,coordinate_system='gcj02' where id=$1",[id(4)]);
 await c.query("insert into start_catalog.place_provider_ref values($1,'amap','provider-id',now(),'fixture')",[id(4)]);
 await reject("insert into start_catalog.place_provider_ref values($1,'amap','provider-id',now(),'fixture')",[id(4)],'23505');
 assert.equal((await c.query('select id from start_catalog.place where id=$1',[id(4)])).rows[0].id,id(4));
}));
test('a revision allows repeated Places but rejects duplicate sequence and a cross-route published pointer',()=>tx(async()=>{
 await fixture();await c.query("insert into start_catalog.route_stop(id,revision_id,place_id,sequence,stop_note) values($1,$2,$3,1,'one'),($4,$2,$3,2,'repeat')",[id(9),id(7),id(4),id(10)]);
 await reject("insert into start_catalog.route_stop(id,revision_id,place_id,sequence,stop_note) values($1,$2,$3,2,'duplicate')",[id(11),id(7),id(4)],'23505');
 await reject('update start_catalog.route set published_revision_id=$1 where id=$2',[id(8),id(5)],'23503');
}));
test('claims have exactly one explicit FK owner; sources reject executable URLs',()=>tx(async()=>{
 await fixture();await reject("insert into start_catalog.claim(id,statement) values($1,'No owner')",[id(12)],'23514');
 await reject("insert into start_catalog.claim(id,statement,place_id,revision_id) values($1,'Two owners',$2,$3)",[id(12),id(4),id(7)],'23514');
 await reject("insert into start_catalog.claim(id,statement,place_id) values($1,'Orphan',$2)",[id(12),id(999)],'23503');
 await reject("insert into start_catalog.evidence_source(id,source_type,url,public_title,observed_at) values($1,'media','javascript:alert(1)','No',now())",[id(13)],'23514');
}));
test('frozen revision and ordered stop bytes cannot mutate or disappear when canonical Place changes',()=>tx(async()=>{
 await fixture();await c.query("insert into start_catalog.route_stop(id,revision_id,place_id,sequence,stop_note,place_snapshot) values($1,$2,$3,1,'one','{\"name\":\"HistoricalPlace\"}')",[id(9),id(7),id(4)]);
 await c.query("update start_catalog.route_revision set frozen_at=now(),published_at=now(),snapshot='{}' where id=$1",[id(7)]);
 await reject("update start_catalog.route_revision set title='rewrite' where id=$1",[id(7)],'P0001');
 await reject('delete from start_catalog.route_revision where id=$1',[id(7)],'P0001');
 await reject("update start_catalog.route_stop set stop_note='rewrite' where id=$1",[id(9)],'P0001');
 await reject("insert into start_catalog.route_stop(id,revision_id,place_id,sequence,stop_note) values($1,$2,$3,2,'late')",[id(10),id(7),id(4)],'P0001');
 await c.query("update start_catalog.place set name='CurrentPlace' where id=$1",[id(4)]);
 assert.equal((await c.query('select place_snapshot from start_catalog.route_stop where id=$1',[id(9)])).rows[0].place_snapshot.name,'HistoricalPlace');
}));
test('Event dates and EventArtist FKs are constrained; cancellation is independent of publication',()=>tx(async()=>{
 await fixture();await reject("insert into start_catalog.event(id,title,normalized_title,starts_at,ends_at,place_id,status,source_observed_at,source_timezone) values($1,'Event','event','2026-10-02','2026-10-01',$2,'upcoming',now(),'Asia/Shanghai')",[id(14),id(4)],'23514');
 await c.query("insert into start_catalog.event(id,title,normalized_title,starts_at,place_id,status,source_observed_at,source_timezone,publication) values($1,'Event','event','2026-10-02',$2,'cancelled',now(),'Asia/Shanghai','published')",[id(14),id(4)]);
 await reject('insert into start_catalog.event_artist values($1,$2,$3)',[id(14),id(999),'performer'],'23503');
 await c.query('insert into start_catalog.event_artist values($1,$2,$3)',[id(14),id(2),'performer']);
 await reject('insert into start_catalog.event_artist values($1,$2,$3)',[id(14),id(2),'performer'],'23505');
 assert.deepEqual((await c.query('select status,publication from start_catalog.event where id=$1',[id(14)])).rows[0],{status:'cancelled',publication:'published'});
}));
test('runtime role cannot read private canonical tables or write schema',async()=>{
 const reader=new pg.Client(testConfig('start_public_reader'));await reader.connect();try{
 await assert.rejects(reader.query('select * from start_catalog.artist'),(e:unknown)=>(e as {code:string}).code==='42501');
 await assert.rejects(reader.query('create table public.attack(id int)'),(e:unknown)=>(e as {code:string}).code==='42501');
 }finally{await reader.end();}
});
test('migration replay preserves checksum/time; changed applied SQL and failed new migration are rejected atomically',async()=>{
 const before=(await c.query('select * from start_migrations.applied order by name')).rows;await migrate(c);assert.deepEqual((await c.query('select * from start_migrations.applied order by name')).rows,before);
 const scratch=await fs.mkdtemp(path.resolve('.context/migration-test-'));await fs.cp(path.resolve('db/migrations'),scratch,{recursive:true});
 await fs.appendFile(path.join(scratch,'001_catalog.sql'),'\n-- changed');await assert.rejects(migrate(c,scratch),/checksum/);
 await fs.copyFile(path.resolve('db/migrations/001_catalog.sql'),path.join(scratch,'001_catalog.sql'));
 const next=String(before.length+1).padStart(3,'0')+'_failure.sql';await fs.writeFile(path.join(scratch,next),'CREATE TABLE start_catalog.failure_probe(id int); SELECT no_such_function();');
 await assert.rejects(migrate(c,scratch));assert.equal((await c.query("select to_regclass('start_catalog.failure_probe') as table")).rows[0].table,null);
 assert.deepEqual((await c.query('select * from start_migrations.applied order by name')).rows,before);
});
test('concurrent stop writes serialize with freezing in both lock orders, so committed frozen content cannot drift',async()=>{
 const a=new pg.Client(testConfig('postgres')),b=new pg.Client(testConfig('postgres'));await a.connect();await b.connect();
 async function make(){const city=randomUUID(),place=randomUUID(),route=randomUUID(),revision=randomUUID(),stop=randomUUID();
  await c.query("insert into start_catalog.city values($1,'Concurrency','concurrency','CN',null)",[city]);
  await c.query("insert into start_catalog.place(id,city_id,name,normalized_name) values($1,$2,'Concurrency','concurrency')",[place,city]);
  await c.query('insert into start_catalog.route(id,slug,city_id) values($1,$2,$3)',[route,route,city]);
  await c.query("insert into start_catalog.route_revision(id,route_id,revision_number,title,summary,why_worth_replicating,short_story) values($1,$2,1,'Concurrency','s','w','s')",[revision,route]);
  await c.query("insert into start_catalog.route_stop(id,revision_id,place_id,sequence,stop_note) values($1,$2,$3,1,'before')",[stop,revision,place]);return{revision,stop};
 }
 async function blocked(pid:number){for(let i=0;i<100;i++){const row=(await c.query('select wait_event_type from pg_stat_activity where pid=$1',[pid])).rows[0];if(row?.wait_event_type==='Lock')return;await new Promise(r=>setTimeout(r,20));}throw Error('Expected parent lock wait');}
 try {
  const one=await make();await a.query('begin');await b.query('begin');const bpid=(await b.query('select pg_backend_pid() as pid')).rows[0].pid;
  await a.query("update start_catalog.route_revision set frozen_at=now(),published_at=now(),snapshot='{\"note\":\"before\"}' where id=$1",[one.revision]);
  const write=b.query("update start_catalog.route_stop set stop_note='after freeze' where id=$1",[one.stop]).then(()=>null,e=>e);
  await blocked(bpid);await a.query('commit');assert.equal((await write)?.code,'P0001');await b.query('rollback');
  assert.equal((await c.query('select stop_note from start_catalog.route_stop where id=$1',[one.stop])).rows[0].stop_note,'before');
  const two=await make();await a.query('begin');await b.query('begin');const apid=(await a.query('select pg_backend_pid() as pid')).rows[0].pid;
  await b.query("update start_catalog.route_stop set stop_note='before freeze edit' where id=$1",[two.stop]);
  const freeze=a.query("update start_catalog.route_revision set frozen_at=now(),published_at=now(),snapshot='{}' where id=$1",[two.revision]);
  await blocked(apid);await b.query('commit');await freeze;await a.query('commit');
  await assert.rejects(c.query("update start_catalog.route_stop set stop_note='after freeze' where id=$1",[two.stop]),(e:unknown)=>(e as {code:string}).code==='P0001');
  assert.equal((await c.query('select stop_note from start_catalog.route_stop where id=$1',[two.stop])).rows[0].stop_note,'before freeze edit');
 }finally{await a.query('rollback');await b.query('rollback');await a.end();await b.end();}
});
