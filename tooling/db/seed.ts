import pg from 'pg';import type { Client } from 'pg';import fs from 'node:fs/promises';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';import {z}from'zod';
import {normalizeQuery}from'../../packages/domain/src/catalog.ts';
const columns:Record<string,string[]>={
 city:['id','name','normalized_name','country_code','administrative_code'],artist:['id','canonical_name','normalized_name','artist_type','primary_media_id','verification','review','publication','visibility'],artist_alias:['artist_id','alias','normalized_alias','locale'],place:['id','city_id','name','normalized_name','address','longitude','latitude','coordinate_system','verification','verified_at','review','publication','visibility','practical_info','media_id'],place_provider_ref:['place_id','provider_key','provider_place_id','observed_at','source_ref'],artist_place_relation:['id','artist_id','place_id','relation_type','explanation','verification','review','visibility','public_caveat','severe_dispute','credible_basis','reviewer','reviewed_at','review_reason'],route:['id','slug','city_id','linked_artist_id','publication'],route_revision:['id','route_id','revision_number','title','summary','why_worth_replicating','short_story','hero_media_id','verification','review','metrics','reviewer','reviewed_at','review_reason'],route_stop:['id','revision_id','place_id','sequence','stop_note','stay_minutes','artist_place_relation_id'],evidence_source:['id','source_type','url','public_title','public_excerpt','observed_at','review','visibility','availability','last_checked_at','reviewer','reviewed_at','review_reason'],media_asset:['id','object_key','mime','width','height','rights_state','visibility','source_evidence_id'],claim:['id','statement','verification','verified_at','review','visibility','public_caveat','severe_dispute','is_core','relation_id','revision_id','stop_id','place_id','event_id','reviewer','reviewed_at','review_reason'],claim_evidence:['claim_id','evidence_source_id','support_role'],relation_evidence:['relation_id','evidence_source_id'],revision_evidence:['revision_id','evidence_source_id'],stop_evidence:['stop_id','evidence_source_id'],place_evidence:['place_id','evidence_source_id'],event:['id','title','normalized_title','starts_at','ends_at','place_id','status','publication','review','visibility','verification','hero_media_id','source_observed_at','source_timezone'],event_artist:['event_id','artist_id','role'],event_evidence:['event_id','evidence_source_id'],review_record:['id','subject_revision_id','subject_claim_id','subject_relation_id','reviewer','reviewed_at','decision','reason','evidence_ids'],
};
const compound:Record<string,string[]>= {artist_alias:['artist_id','normalized_alias'],place_provider_ref:['provider_key','provider_place_id'],event_artist:['event_id','artist_id'],claim_evidence:['claim_id','evidence_source_id'],relation_evidence:['relation_id','evidence_source_id'],revision_evidence:['revision_id','evidence_source_id'],stop_evidence:['stop_id','evidence_source_id'],place_evidence:['place_id','evidence_source_id'],event_evidence:['event_id','evidence_source_id']};
const BatchSchema=z.strictObject({sourceKey:z.string().min(1).max(200),synthetic:z.boolean().default(false),provenance:z.record(z.string(),z.json()),tables:z.array(z.strictObject({table:z.string(),rows:z.array(z.record(z.string(),z.json()))})),publishRevisions:z.array(z.uuid()).default([])});
export type SeedBatch=z.input<typeof BatchSchema>;
export async function importBatch(c:Client,input:SeedBatch):Promise<void>{
 const batch=BatchSchema.parse(input);const sha=crypto.createHash('sha256').update(JSON.stringify(batch)).digest('hex');
 await c.query('begin');try{
  await c.query('select pg_advisory_xact_lock(724018602)');
  if(batch.synthetic && !(await c.query('select current_database() as db')).rows[0].db.startsWith('start_test_'))throw Error('Synthetic content restricted to start_test_ databases');
  const previous=(await c.query('select sha256 from start_catalog.import_record where source_key=$1',[batch.sourceKey])).rows[0];
  if(previous){if(previous.sha256!==sha)throw Error('Import source checksum conflict');await c.query('commit');return;}
  for(const {table,rows}of batch.tables){if(!Object.hasOwn(columns,table))throw Error('Import table not allowed');
   for(const row of rows){const names=Object.keys(row);if(!names.length||names.some(n=>!columns[table].includes(n)))throw Error('Import field not allowed');
    if(table==='route'&&row.publication && row.publication!=='unpublished')throw Error('Routes publish only through controlled validation');
    if(table==='evidence_source'&&row.url!==undefined&&row.url!==null&&!z.url({protocol:/^https?$/}).safeParse(row.url).success)throw Error('Evidence URL invalid');
    const pk=compound[table]??['id'];if(pk.some(k=>!names.includes(k)))throw Error('Import stable identity required');
    const update=names.filter(k=>!pk.includes(k));const tail=update.length?`DO UPDATE SET ${update.map(n=>`${n}=EXCLUDED.${n}`).join(',')} WHERE (${update.map(n=>`t.${n}`).join(',')}) IS DISTINCT FROM (${update.map(n=>`EXCLUDED.${n}`).join(',')})`:'DO NOTHING';
    await c.query(`INSERT INTO start_catalog.${table} AS t(${names.join(',')}) VALUES(${names.map((_,i)=>'$'+(i+1)).join(',')}) ON CONFLICT(${pk.join(',')}) ${tail}`,names.map(n=>row[n]));
   }
  }
  for(const id of batch.publishRevisions)await c.query('select start_catalog.publish_route($1)',[id]);
  await c.query('insert into start_catalog.import_record(source_key,sha256,provenance) values($1,$2,$3)',[batch.sourceKey,sha,{...batch.provenance,synthetic:batch.synthetic,publishRevisions:batch.publishRevisions}]);await c.query('commit');
 }catch(e){await c.query('rollback');throw e;}
}
const stableId=(s:string)=>{const h=crypto.createHash('sha256').update('START:historical:'+s).digest('hex');return `${h.slice(0,8)}-${h.slice(8,12)}-5${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`;};
export async function seedHistorical(c:Client,root=new URL('../../db/seeds/historical/',import.meta.url)):Promise<void>{
 const provenance=JSON.parse(await fs.readFile(new URL('provenance.json',root),'utf8'));
 const originals=['route-anpu-nanjing.json','route-anpu-nanjing.source.json','route-anpu-nanjing.candidates.json'];
 if(!Array.isArray(provenance.files)||provenance.files.length!==3)throw Error('Historical source hash manifest invalid');
 for(const file of originals){const expected=provenance.files.find((x:{source:string})=>x.source.replaceAll('\\','/').split('/').at(-1)===file);if(!expected)throw Error('Historical source hash missing: '+file);const bytes=await fs.readFile(new URL(file,root));if(bytes.length!==expected.bytes)throw Error('Historical source bytes mismatch: '+file);if(crypto.createHash('sha256').update(bytes).digest('hex')!==expected.sha256)throw Error('Historical source hash mismatch: '+file);}
 const content=await fs.readFile(new URL('route-anpu-nanjing.json',root),'utf8');const old=JSON.parse(content);const source=JSON.parse(await fs.readFile(new URL('route-anpu-nanjing.source.json',root),'utf8'));
 const city=stableId('city:南京'),artist=stableId('artist:安溥'),route=stableId(old.route.id),revision=stableId(old.route.id+':v1');const observedAt=old.route.legs[0].computedAt;
 const places=Object.values(old.places) as {id:string;name:string;address:string;longitude:number;latitude:number;coordinateSystem:string;provider:string;providerPoiId:string}[];
 await importBatch(c,{sourceKey:'historical:anpu-nanjing:20260917',synthetic:false,provenance:{...provenance,legacyRoute:old.route,sourceNote:source.sourceNote,providerObservedAtBasis:'historical calculation timestamp; provider POI observation time not independently established'},tables:[
 {table:'city',rows:[{id:city,name:'南京',normalized_name:'南京',country_code:'CN',administrative_code:null}]},
 {table:'artist',rows:[{id:artist,canonical_name:'安溥',normalized_name:'安溥',artist_type:'musician',verification:'unverified'}]},
 {table:'place',rows:places.map(p=>({id:stableId(p.id),city_id:city,name:p.name,normalized_name:normalizeQuery(p.name),address:p.address,longitude:p.longitude,latitude:p.latitude,coordinate_system:p.coordinateSystem,verification:'verified',verified_at:observedAt}))},
 {table:'place_provider_ref',rows:places.map(p=>({place_id:stableId(p.id),provider_key:p.provider,provider_place_id:p.providerPoiId,observed_at:observedAt,source_ref:'historical:anpu-nanjing:20260917'}))},
 {table:'route',rows:[{id:route,slug:old.route.id,city_id:city,linked_artist_id:artist,publication:'unpublished'}]},
 {table:'route_revision',rows:[{id:revision,route_id:route,revision_number:1,title:old.route.title,summary:source.sourceNote,why_worth_replicating:'历史原型线索；艺人关联尚待审核',short_story:'旧路线和地图确认成果保留，不代表艺人到访事实已核验。',metrics:{distanceMeters:1496,transportSeconds:1198,provider:'amap',computedAt:old.route.legs.at(-1).computedAt,coordinateSystem:'gcj02'}}]},
 {table:'route_stop',rows:old.route.stops.map((s:{placeId:string;order:number;story:string})=>({id:stableId(revision+':stop:'+s.order),revision_id:revision,place_id:stableId(s.placeId),sequence:s.order,stop_note:s.story,stay_minutes:null}))},
 ]});
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 if(!process.env.DATABASE_URL)throw Error('DATABASE_URL required for seed import role');const c=new pg.Client({connectionString:process.env.DATABASE_URL});await c.connect();try{
  if(process.argv[2]==='--reviewed'){if(!process.argv[3])throw Error('Reviewed batch path required');await importBatch(c,JSON.parse(await fs.readFile(process.argv[3],'utf8')));}else await seedHistorical(c);
  console.log('Seed imported/verified; no automatic historical publication');
 }finally{await c.end();}
}
