import {randomUUID} from 'node:crypto';
import {fail,parse} from './contracts.mjs';
export async function saveContent(ctx,kind,v){
 const {client,content,media}=ctx;
 await media(v.mediaIds);
 if(kind==='place'&&v.artistEvidence)await content(v.artistEvidence.artistId,'artist');
 if(kind==='route'){await content(v.artistId,'artist');for(const id of v.placeIds)await content(id,'place',false);}
 if(kind==='event'){for(const id of v.artistIds)await content(id,'artist');await content(v.placeId,'place',false);}
 const old=v.id?await content(v.id,kind,false):null;
 if(old&&v.version!==old.version)fail('CONFLICT',409);
 const id=old?.id||randomUUID(),version=(old?.version||0)+1;
 const {id:ignore,version:ignored,...data}=v;
 await client.query(`INSERT INTO start_app.content(id,kind,version,draft,poi_id) VALUES($1,$2,$3,$4,$5) ON CONFLICT(id) DO UPDATE SET version=excluded.version,draft=excluded.draft,poi_id=excluded.poi_id,updated_at=now()`,[id,kind,version,JSON.stringify(data),kind==='place'?(v.poiId??old?.poi_id??null):null]);
 await client.query('INSERT INTO start_app.revisions(content_id,version,data) VALUES($1,$2,$3)',[id,version,JSON.stringify(data)]);
 return {id,version,...data};
}
export async function contentCommand(ctx,op,v){
 const {client,content,admin,owns,notify,userId,one}=ctx;
 if(op==='import.places'){await admin();const ids=[];for(const item of v.items){const old=item.poiId?(await client.query('SELECT id FROM start_app.content WHERE poi_id=$1',[item.poiId])).rows[0]:null;ids.push(old?.id||(await saveContent(ctx,'place',item)).id);}return {ids};}
 if(op==='home.configure'){await admin();for(const id of v.ids)await one('SELECT id FROM start_app.content WHERE id=$1 AND published IS NOT NULL',[id]);await client.query("INSERT INTO start_app.settings(key,data) VALUES('home',$1) ON CONFLICT(key) DO UPDATE SET data=excluded.data",[JSON.stringify(v)]);return {ok:true};}
 if(op==='correction.create'){await content(v.id,v.kind);parse(v.kind+'.save',{...v.data,id:v.id,version:v.version});const id=randomUUID();await client.query('INSERT INTO start_app.corrections(id,user_id,content_id,data) VALUES($1,$2,$3,$4)',[id,userId,v.id,JSON.stringify(v)]);return {id};}
 if(op==='correction.review'){await admin();const r=await one('SELECT * FROM start_app.corrections WHERE id=$1',[v.id]);if(r.status==='approved'&&v.decision==='approve')return {id:r.content_id};if(r.status!=='pending')fail('CONFLICT',409);if(v.decision==='reject'){if(!v.reason)fail('INVALID_INPUT');await client.query("UPDATE start_app.corrections SET status='rejected',reason=$2 WHERE id=$1",[r.id,v.reason]);}else{if(!v.checked)fail('INVALID_INPUT');const p=parse(r.data.kind+'.save',{...r.data.data,id:r.content_id,version:r.data.version});await saveContent(ctx,r.data.kind,p);await contentCommand(ctx,'content.publish',{id:r.content_id,version:p.version+1});await client.query("UPDATE start_app.corrections SET status='approved' WHERE id=$1",[r.id]);}await notify(r.user_id,'correction.reviewed',r.id);return {id:r.content_id};}
 if(op.endsWith('.save')){await admin();return saveContent(ctx,op.split('.')[0],v);}
 if(op==='content.publish'){
  await admin();const r=await one('SELECT * FROM start_app.content WHERE id=$1',[v.id]);if(r.version!==v.version)fail('CONFLICT',409);
  if(r.kind==='place'&&r.draft.artistEvidence)await content(r.draft.artistEvidence.artistId,'artist');
  if(r.kind==='route'){await content(r.draft.artistId,'artist');for(const id of r.draft.placeIds)await content(id,'place');}
  if(r.kind==='event'){for(const id of r.draft.artistIds)await content(id,'artist');await content(r.draft.placeId,'place');}
  if(r.draft.mediaIds?.length)await client.query("UPDATE start_app.media SET visibility='public' WHERE id=ANY($1::uuid[])",[r.draft.mediaIds]);
  await client.query('UPDATE start_app.content SET published=draft WHERE id=$1',[r.id]);return {id:r.id,version:r.version};
 }
 if(op==='content.withdraw'){await admin();await one('UPDATE start_app.content SET published=NULL WHERE id=$1 RETURNING id',[v.id]);return {id:v.id};}
 if(op==='content.restore'){await admin();const r=await one('SELECT kind,version FROM start_app.content WHERE id=$1',[v.id]);if(r.version!==v.version)fail('CONFLICT',409);const previous=await one('SELECT data FROM start_app.revisions WHERE content_id=$1 AND version=$2',[v.id,v.fromVersion]);return saveContent(ctx,r.kind,{...previous.data,id:v.id,version:r.version});}
 if(op==='submission.create'||op==='routeSubmission.create'){
  await content(v.artistId,'artist');await ctx.media(v.mediaIds);const id=randomUUID();
  if(op==='routeSubmission.create')for(const stop of v.stops||v.placeIds.map(placeId=>({placeId}))){if(stop.placeId)await content(stop.placeId,'place');else await ctx.media(stop.place.mediaIds);}
  await client.query("INSERT INTO start_app.submissions(id,user_id,artist_id,data,status,kind) VALUES($1,$2,$3,$4,'pending',$5)",[id,userId,v.artistId,JSON.stringify(v),op==='routeSubmission.create'?'route':'place']);return {id,status:'pending'};
 }
 if(op==='submission.resubmit'){
  const s=owns(await one('SELECT * FROM start_app.submissions WHERE id=$1',[v.id]));if(s.status!=='rejected')fail('CONFLICT',409);
  await client.query("UPDATE start_app.submissions SET data=data||$2::jsonb,status='pending',reason=NULL WHERE id=$1",[s.id,JSON.stringify({source:v.source})]);return {id:s.id,status:'pending'};
 }
 if(op==='submission.review'){
  await admin();const s=await one('SELECT * FROM start_app.submissions WHERE id=$1',[v.id]);
  if(s.status==='approved'&&v.decision==='approve')return {id:s.content_id||s.place_id};if(s.status!=='pending')fail('CONFLICT',409);
  if(v.decision==='reject'){if(!v.reason)fail('INVALID_INPUT');await client.query("UPDATE start_app.submissions SET status='rejected',reason=$2 WHERE id=$1",[s.id,v.reason]);await notify(s.user_id,'submission.rejected',s.id);return {id:s.id,status:'rejected'};}
  if(v.checked!==true)fail('INVALID_INPUT');await content(s.artist_id,'artist');
  await one("SELECT id FROM start_accounts.users WHERE id=$1 AND status='active'",[s.user_id]);await ctx.media(s.data.mediaIds,s.user_id);
  if(s.kind==='route'){
   const placeIds=[];
   for(const stop of s.data.stops||s.data.placeIds.map(placeId=>({placeId}))){
    if(stop.placeId){await content(stop.placeId,'place');placeIds.push(stop.placeId);continue;}
    // A child contribution uses the same review transaction. A later failure rolls everything back.
    const childId=randomUUID(),data={...stop.place,artistId:s.artist_id};
    await client.query("INSERT INTO start_app.submissions(id,user_id,artist_id,data,status,kind) VALUES($1,$2,$3,$4,'pending','place')",[childId,s.user_id,s.artist_id,JSON.stringify(data)]);
    const added=await contentCommand(ctx,'submission.review',{id:childId,decision:'approve',checked:true});placeIds.push(added.id);
   }
   if(new Set(placeIds).size!==placeIds.length)fail('INVALID_INPUT');
   const {stops,...data}=s.data;
   const created=await saveContent({...ctx,media:ids=>ctx.media(ids,s.user_id)},'route',{...data,placeIds});
   await contentCommand(ctx,'content.publish',{id:created.id,version:created.version});await client.query("UPDATE start_app.submissions SET status='approved',content_id=$2 WHERE id=$1",[s.id,created.id]);await notify(s.user_id,'submission.approved',s.id);return {id:created.id};
  }
  const existing=s.data.poiId?(await client.query('SELECT * FROM start_app.content WHERE poi_id=$1',[s.data.poiId])).rows[0]:null;
  if(existing&&!existing.published)fail('CONFLICT',409);
  let p=existing;
  if(!p){const {artistId,sameSpot,...data}=s.data;const created=await saveContent({...ctx,media:ids=>ctx.media(ids,s.user_id)},'place',data);await client.query('UPDATE start_app.content SET published=draft WHERE id=$1',[created.id]);p={id:created.id};}
  await client.query('INSERT INTO start_app.contributions(id,submission_id,place_id,artist_id,data) VALUES($1,$2,$3,$4,$5)',[randomUUID(),s.id,p.id,s.artist_id,JSON.stringify({source:s.data.source,sameSpot:s.data.sameSpot||'',mediaIds:s.data.mediaIds||[]})]);
  if(s.data.mediaIds?.length)await client.query("UPDATE start_app.media SET visibility='public' WHERE id=ANY($1::uuid[])",[s.data.mediaIds]);
  await client.query("UPDATE start_app.submissions SET status='approved',place_id=$2,content_id=$2 WHERE id=$1",[s.id,p.id]);await notify(s.user_id,'submission.approved',s.id);return {id:p.id};
 }
 return null;
}
