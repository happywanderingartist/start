import {randomUUID} from 'node:crypto';
import {parse,uuid,fail} from './contracts.mjs';
import {context} from './context.mjs';
import {contentCommand} from './content.mjs';
import {communityCommand} from './community.mjs';
import {marketCommand} from './market.mjs';
import {personalCommand,hash} from './personal.mjs';
import {publiclyReferenced,reviewableMedia} from './public-media.mjs';
export function createPlatform(pool){
 async function transaction(fn){const c=await pool.connect();try{await c.query('BEGIN');await c.query("SET LOCAL statement_timeout='8s'");const result=await fn(c);await c.query('COMMIT');return result;}catch(e){await c.query('ROLLBACK');if(e.code==='23505')fail('CONFLICT',409);throw e;}finally{c.release();}}
 async function active(c,actor){if(!actor)fail('UNAUTHENTICATED',401);uuid(actor.id);const r=await c.query("SELECT id FROM start_accounts.users WHERE id=$1 AND status='active' FOR UPDATE",[actor.id]);if(!r.rowCount)fail('FORBIDDEN',403);return context(c,actor.id);}
 async function publicQuery(filters={}){
  const allowed=['artistId','city','category'];if(Object.keys(filters).some(k=>!allowed.includes(k)))fail('INVALID_INPUT');if(filters.artistId)uuid(filters.artistId);for(const k of ['city','category'])if(filters[k]&&(typeof filters[k]!=='string'||filters[k].length>200))fail('INVALID_INPUT');
  return transaction(async c=>{
   await c.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
   const rows=(await c.query('SELECT id,kind,published FROM start_app.content WHERE published IS NOT NULL ORDER BY id')).rows;
   const result={artists:[],places:[],routes:[],events:[],communities:[],listings:[]};
   const relations=(await c.query('SELECT place_id,artist_id,data FROM start_app.contributions')).rows;
   for(const r of rows){const data={id:r.id,...r.published};if(r.kind==='place')data.artistIds=[...new Set([...relations.filter(x=>x.place_id===r.id).map(x=>x.artist_id),...(data.artistEvidence?[data.artistEvidence.artistId]:[])])];
    const artists=r.kind==='artist'?[r.id]:r.kind==='place'?data.artistIds:r.kind==='route'?[data.artistId]:data.artistIds;
    if(filters.artistId&&!artists.includes(filters.artistId))continue;
    if(filters.city&&r.kind!=='artist'&&data.city!==filters.city)continue;
    if(filters.category&&r.kind==='place'&&data.category!==filters.category)continue;
    result[{artist:'artists',place:'places',route:'routes',event:'events'}[r.kind]].push(data);
   }
   result.communities=(await c.query("SELECT id,artist_id,manager_id,name,description,notice FROM start_app.communities WHERE status='active' ORDER BY id")).rows.filter(r=>!filters.artistId||r.artist_id===filters.artistId);
   result.listings=(await c.query("SELECT l.* FROM start_app.listings l JOIN start_app.communities c ON c.id=l.community_id JOIN start_accounts.users u ON u.id=l.user_id WHERE l.status='available' AND c.status='active' AND u.status='active' ORDER BY l.id")).rows.filter(r=>(!filters.artistId||r.artist_id===filters.artistId)&&(!filters.city||rows.some(p=>p.id===r.place_id&&p.published.city===filters.city))).map(r=>({id:r.id,communityId:r.community_id,artistId:r.artist_id,eventId:r.event_id,placeId:r.place_id,name:r.data.name,description:r.data.description,status:r.status,mediaIds:r.data.mediaIds||[]}));
   return result;
  });
 }
 return {
  pool,
  async execute(actor,op,input,key){const v=parse(op,input);if(typeof key!=='string'||!key||key.length>100)fail('INVALID_INPUT');return transaction(async c=>{
   // Local acceptance deliberately serializes mutations. A production adapter can narrow locks after measuring load.
   await c.query('SELECT pg_advisory_xact_lock(710082026)');const ctx=await active(c,actor),fingerprint=hash(JSON.stringify(v));
   const old=(await c.query('SELECT fingerprint,result FROM start_app.idempotency WHERE user_id=$1 AND operation=$2 AND key=$3',[ctx.userId,op,key])).rows[0];if(old){if(old.fingerprint!==fingerprint)fail('CONFLICT',409);return old.result;}
   let result=null;for(const fn of [contentCommand,communityCommand,marketCommand,personalCommand]){result=await fn(ctx,op,v);if(result!==null)break;}if(result===null)fail('INVALID_INPUT');
   await c.query('INSERT INTO start_app.idempotency(user_id,operation,key,fingerprint,result) VALUES($1,$2,$3,$4,$5)',[ctx.userId,op,key,fingerprint,JSON.stringify(result)]);
   await c.query('INSERT INTO start_app.audit(id,user_id,operation,reference_id) VALUES($1,$2,$3,$4)',[randomUUID(),ctx.userId,op,result.id||null]);return result;
  });},
  publicQuery,
  async home(){const all=await publicQuery(),ids=(await pool.query("SELECT data FROM start_app.settings WHERE key='home'")).rows[0]?.data.ids||[],records=[...all.places,...all.routes,...all.events];return {featured:ids.map(id=>records.find(r=>r.id===id)).filter(Boolean)};},
  async publicDetail(kind,id){uuid(id);if(kind==='listing'){const all=await publicQuery();const l=all.listings.find(r=>r.id===id);if(!l)fail('NOT_FOUND',404);const comments=(await pool.query("SELECT c.id,c.text,c.created_at,COALESCE(p.nickname,'START 用户') AS author FROM start_app.listing_comments c JOIN start_accounts.users u ON u.id=c.user_id LEFT JOIN start_accounts.profiles p ON p.user_id=c.user_id WHERE c.listing_id=$1 AND u.status='active' ORDER BY c.created_at,c.id",[id])).rows;return {...l,comments};}if(!['artist','place','route','event'].includes(kind))fail('INVALID_INPUT');const all=await publicQuery();const section={artist:'artists',place:'places',route:'routes',event:'events'}[kind],record=all[section].find(r=>r.id===id);if(!record)fail('NOT_FOUND',404);
   if(kind==='place'){record.contributions=(await pool.query('SELECT artist_id,data FROM start_app.contributions WHERE place_id=$1 ORDER BY id',[id])).rows.map(r=>({artistId:r.artist_id,source:r.data.source,sameSpot:r.data.sameSpot,mediaIds:r.data.mediaIds}));if(record.artistEvidence)record.contributions.push(record.artistEvidence);record.routes=all.routes.filter(r=>r.placeIds.includes(id));}
   if(kind==='artist'){record.places=all.places.filter(r=>r.artistIds.includes(id));record.routes=all.routes.filter(r=>r.artistId===id);record.events=all.events.filter(r=>r.artistIds.includes(id));}return record;
  },
  async adminQuery(actor,section,id){return transaction(async c=>{const ctx=await active(c,actor);await ctx.admin();if(section==='media'){const rows=(await c.query('SELECT id,user_id,visibility FROM start_app.media ORDER BY id')).rows,result=[];for(const r of rows)if(r.user_id===ctx.userId||(r.visibility==='public'&&await publiclyReferenced(c,r.id))||await reviewableMedia(c,r.id))result.push({id:r.id,visibility:r.visibility});return result;}const queries={content:'SELECT id,kind,version,draft,published FROM start_app.content ORDER BY updated_at DESC',submissions:'SELECT * FROM start_app.submissions ORDER BY id',applications:'SELECT * FROM start_app.community_applications ORDER BY id',requests:'SELECT * FROM start_app.community_requests ORDER BY id',audit:'SELECT * FROM start_app.audit ORDER BY created_at DESC LIMIT 200',revisions:'SELECT version,data FROM start_app.revisions WHERE content_id=$1 ORDER BY version'};if(!queries[section])fail('INVALID_INPUT');if(section==='revisions')uuid(id);return (await c.query(queries[section],section==='revisions'?[id]:[])).rows;});},
  async privateQuery(actor,section){return transaction(async c=>{
   const ctx=await active(c,actor);
   const queries={book:'SELECT id,place_id,at,snapshot,text,media_ids,ticket FROM start_app.checkins WHERE user_id=$1 ORDER BY at,id',submissions:'SELECT id,artist_id,data,status,reason,place_id FROM start_app.submissions WHERE user_id=$1 ORDER BY id',memberships:"SELECT m.community_id,m.status,c.artist_id FROM start_app.memberships m JOIN start_app.communities c ON c.id=m.community_id WHERE m.user_id=$1 AND m.status!='removed' AND c.status='active'",notifications:'SELECT id,kind,reference_id,read,created_at FROM start_app.notifications WHERE user_id=$1 ORDER BY created_at,id',doll:'SELECT character,outfit,expression FROM start_app.dolls WHERE user_id=$1',favorites:'SELECT content_id FROM start_app.favorites WHERE user_id=$1',listingComments:'SELECT id,listing_id FROM start_app.listing_comments WHERE user_id=$1',exchanges:"SELECT e.id,e.listing_id,e.status,l.data->>'name' AS name,(l.user_id=$1) AS publisher FROM start_app.exchanges e JOIN start_app.listings l ON l.id=e.listing_id WHERE e.requester_id=$1 OR l.user_id=$1",listings:'SELECT id,data,status FROM start_app.listings WHERE user_id=$1',profile:'SELECT nickname,artists,interests,privacy FROM start_accounts.profiles WHERE user_id=$1'};
   queries.shares='SELECT id,record_ids,fields,revoked FROM start_app.shares WHERE user_id=$1 ORDER BY id';
   if(!queries[section])fail('INVALID_INPUT');const data=(await c.query(queries[section],[ctx.userId])).rows;return ['doll','profile'].includes(section)?data[0]||null:data;
  });},

  async shareMediaOwner(token,id){uuid(id);if(typeof token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(token))fail('NOT_FOUND',404);return transaction(async c=>{const s=(await c.query("SELECT s.* FROM start_app.shares s JOIN start_accounts.users u ON u.id=s.user_id WHERE s.token_hash=$1 AND NOT s.revoked AND u.status='active'",[hash(token)])).rows[0];if(!s||!s.fields.includes('media_ids'))fail('NOT_FOUND',404);const found=await c.query('SELECT 1 FROM start_app.checkins WHERE id=ANY($1::uuid[]) AND user_id=$2 AND $3=ANY(media_ids)',[s.record_ids,s.user_id,id]);if(!found.rowCount)fail('NOT_FOUND',404);return {id:s.user_id};});},
  async readShare(token){if(typeof token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(token))fail('NOT_FOUND',404);return transaction(async c=>{
   const s=(await c.query("SELECT s.* FROM start_app.shares s JOIN start_accounts.users u ON u.id=s.user_id WHERE s.token_hash=$1 AND NOT s.revoked AND u.status='active'",[hash(token)])).rows[0];if(!s)fail('NOT_FOUND',404);
   const data=(await c.query('SELECT * FROM start_app.checkins WHERE id=ANY($1::uuid[]) AND user_id=$2',[s.record_ids,s.user_id])).rows;return s.record_ids.map(id=>{const row=data.find(r=>r.id===id);if(!row)fail('NOT_FOUND',404);return Object.fromEntries(s.fields.map(f=>[f,row[f]]));});
  });},
  async recommend(actor,{city}={}){if(typeof city!=='string'||!city.trim()||city.length>200)fail('INVALID_INPUT');const joined=actor?await this.privateQuery(actor,'memberships'):[],profile=actor?await this.privateQuery(actor,'profile'):null,preferred=new Set(joined.map(r=>r.artist_id));
   const data=await publicQuery({city});const rank=r=>(r.artistIds||[r.artistId]).some(id=>preferred.has(id))?2:0;
   const interests=profile?.interests?.split(/[、,，\s]+/).filter(Boolean)||[];const genres=profile?.artists?.split(/[、,，\s]+/).filter(Boolean)||[];
   for(const section of ['places','routes','events'])data[section].sort((a,b)=>(rank(b)+interests.filter(x=>[b.category,b.name].some(s=>s?.includes(x))).length+genres.filter(x=>b.name?.includes(x)).length)-(rank(a)+interests.filter(x=>[a.category,a.name].some(s=>s?.includes(x))).length+genres.filter(x=>a.name?.includes(x)).length)||a.id.localeCompare(b.id));
   data.events=data.events.filter(e=>['upcoming','ongoing'].includes(e.status)&&Date.parse(e.startsAt)>=Date.now()-86400000);return {city,...data};
  },
 };
}
