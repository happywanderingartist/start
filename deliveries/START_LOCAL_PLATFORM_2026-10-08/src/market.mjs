import {randomUUID} from 'node:crypto';
import {fail} from './contracts.mjs';
export async function exchangeContext(ctx,id){
 const r=await ctx.one('SELECT e.*,l.user_id AS publisher_id FROM start_app.exchanges e JOIN start_app.listings l ON l.id=e.listing_id WHERE e.id=$1',[id]);
 if(![r.publisher_id,r.requester_id].includes(ctx.userId))fail('FORBIDDEN',403);return r;
}
export async function marketCommand(ctx,op,v){
 const {client,userId,one,content,owns,notify}=ctx;
 if(op==='listing.create'){
  const c=await one("SELECT * FROM start_app.communities WHERE id=$1 AND status='active'",[v.communityId]);if(c.artist_id!==v.artistId)fail('CONFLICT',409);await content(v.artistId,'artist');
  await one("SELECT 1 FROM start_app.memberships WHERE community_id=$1 AND user_id=$2 AND status='joined'",[c.id,userId]);
  let placeId=v.placeId;if(v.eventId){const e=await content(v.eventId,'event');if(!e.published.artistIds.includes(v.artistId)||(placeId&&placeId!==e.published.placeId))fail('CONFLICT',409);placeId=e.published.placeId;}if(placeId)await content(placeId,'place');await ctx.media(v.mediaIds);
  const id=randomUUID();await client.query('INSERT INTO start_app.listings(id,user_id,community_id,artist_id,event_id,place_id,data,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[id,userId,c.id,v.artistId,v.eventId??null,placeId??null,JSON.stringify({...v,...(placeId?{placeId}:{})}),v.status]);
  if(v.mediaIds?.length)await client.query("UPDATE start_app.media SET visibility='public' WHERE id=ANY($1::uuid[])",[v.mediaIds]);return {id};
 }
 if(op==='listing.status'){owns(await one('SELECT * FROM start_app.listings WHERE id=$1',[v.id]));await client.query('UPDATE start_app.listings SET status=$2 WHERE id=$1',[v.id,v.status]);return {id:v.id,status:v.status};}
 if(op==='listing.edit'){
  const l=await one('SELECT * FROM start_app.listings WHERE id=$1',[v.id]);owns(l);await ctx.media(v.mediaIds);
  const data={...l.data,name:v.name,description:v.description,...(v.mediaIds?{mediaIds:v.mediaIds}:{})};
  await client.query('UPDATE start_app.listings SET data=$2 WHERE id=$1',[v.id,JSON.stringify(data)]);
  if(v.mediaIds?.length)await client.query("UPDATE start_app.media SET visibility='public' WHERE id=ANY($1::uuid[])",[v.mediaIds]);return {id:v.id};
 }
 if(op==='listing.comment'){
  const l=await one("SELECT l.* FROM start_app.listings l JOIN start_app.communities c ON c.id=l.community_id JOIN start_accounts.users u ON u.id=l.user_id WHERE l.id=$1 AND l.status='available' AND c.status='active' AND u.status='active'",[v.listingId]);
  const id=randomUUID();await client.query('INSERT INTO start_app.listing_comments(id,listing_id,user_id,text) VALUES($1,$2,$3,$4)',[id,l.id,userId,v.text]);return {id};
 }
 if(op==='listing.comment.delete'){
  const comment=await one('SELECT * FROM start_app.listing_comments WHERE id=$1',[v.id]);
  if(comment.user_id!==userId)await ctx.admin();await client.query('DELETE FROM start_app.listing_comments WHERE id=$1',[v.id]);return {id:v.id};
 }
 if(op==='exchange.apply'){
  const l=await one("SELECT * FROM start_app.listings WHERE id=$1 AND status='available'",[v.listingId]);if(l.user_id===userId)fail('CONFLICT',409);
  const old=(await client.query('SELECT * FROM start_app.exchanges WHERE listing_id=$1 AND requester_id=$2',[l.id,userId])).rows[0];if(old){if(old.status==='withdrawn')fail('CONFLICT',409);return {id:old.id};}
  const id=randomUUID();await client.query("INSERT INTO start_app.exchanges(id,listing_id,requester_id,status) VALUES($1,$2,$3,'pending')",[id,l.id,userId]);await notify(l.user_id,'exchange.requested',id);return {id};
 }
 if(op==='exchange.accept'){const e=await exchangeContext(ctx,v.id);if(e.publisher_id!==userId)fail('FORBIDDEN',403);if(e.status==='withdrawn')fail('CONFLICT',409);if(e.status==='pending'){await client.query("UPDATE start_app.exchanges SET status='accepted' WHERE id=$1",[e.id]);await notify(e.requester_id,'exchange.accepted',e.id);}return {id:e.id,status:'accepted'};}
 if(op==='exchange.withdraw'){const e=await exchangeContext(ctx,v.id);await client.query("UPDATE start_app.exchanges SET status='withdrawn' WHERE id=$1",[e.id]);await client.query('DELETE FROM start_app.contacts WHERE exchange_id=$1',[e.id]);return {id:e.id};}
 return null;
}
