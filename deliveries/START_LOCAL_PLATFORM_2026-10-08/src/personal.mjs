import {randomUUID,randomBytes,createHash} from 'node:crypto';
import {fail} from './contracts.mjs';
import {validateProfilePatch} from '../../START_ACCOUNT_FOUNDATION_2026-10-05/src/accounts.mjs';
export const hash=s=>createHash('sha256').update(s).digest('hex');
export async function personalCommand(ctx,op,v){
 const {client,userId,one,owns,content}=ctx;
 if(op==='profile.update'){const patch=validateProfilePatch(v),current=await one('SELECT * FROM start_accounts.profiles WHERE user_id=$1',[userId]),next={...current,...patch,privacy:{...current.privacy,...patch.privacy}};await client.query('UPDATE start_accounts.profiles SET nickname=$2,artists=$3,interests=$4,privacy=$5,updated_at=now() WHERE user_id=$1',[userId,next.nickname,next.artists,next.interests,JSON.stringify(next.privacy)]);return {nickname:next.nickname,artists:next.artists,interests:next.interests,privacy:next.privacy};}
 if(op==='checkin.create'){
  if(Date.parse(v.at)>Date.now())fail('INVALID_INPUT');const p=await content(v.placeId,'place');await ctx.media(v.mediaIds);const id=randomUUID();
  const snapshot={id:p.id,name:p.published.name,city:p.published.city,category:p.published.category};
  await client.query('INSERT INTO start_app.checkins(id,user_id,place_id,at,snapshot,text,media_ids,ticket) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[id,userId,p.id,v.at,JSON.stringify(snapshot),v.text,v.mediaIds,v.ticket?JSON.stringify(v.ticket):null]);return {id};
 }
 if(op==='checkin.delete'){owns(await one('SELECT user_id FROM start_app.checkins WHERE id=$1',[v.id]));await client.query('UPDATE start_app.shares SET revoked=true WHERE $1=ANY(record_ids)',[v.id]);await client.query('DELETE FROM start_app.checkins WHERE id=$1',[v.id]);return {id:v.id};}
 if(op==='share.create'){
  for(const id of v.ids)owns(await one('SELECT user_id FROM start_app.checkins WHERE id=$1',[id]));
  const id=randomUUID(),token=randomBytes(32).toString('base64url');await client.query('INSERT INTO start_app.shares(id,user_id,token_hash,record_ids,fields) VALUES($1,$2,$3,$4,$5)',[id,userId,hash(token),v.ids,v.fields]);return {id,token};
 }
 if(op==='share.revoke'){owns(await one('SELECT user_id FROM start_app.shares WHERE id=$1',[v.id]));await client.query('UPDATE start_app.shares SET revoked=true WHERE id=$1',[v.id]);return {id:v.id};}
 if(op==='doll.choose'){const current=(await client.query('SELECT * FROM start_app.dolls WHERE user_id=$1',[userId])).rows[0];if(current){if(current.character!==v.character)fail('CONFLICT',409);return current;}await client.query('INSERT INTO start_app.dolls(user_id,character) VALUES($1,$2)',[userId,v.character]);return {character:v.character,outfit:'original',expression:'neutral'};}
 if(op==='doll.style'){await one('UPDATE start_app.dolls SET outfit=COALESCE($2,outfit),expression=COALESCE($3,expression) WHERE user_id=$1 RETURNING user_id',[userId,v.outfit??null,v.expression??null]);return {ok:true};}
 if(op==='favorite.set'){await one('SELECT id FROM start_app.content WHERE id=$1 AND published IS NOT NULL',[v.id]);if(v.enabled)await client.query('INSERT INTO start_app.favorites(user_id,content_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[userId,v.id]);else await client.query('DELETE FROM start_app.favorites WHERE user_id=$1 AND content_id=$2',[userId,v.id]);return {id:v.id,enabled:v.enabled};}
 if(op==='notification.read'){await one('UPDATE start_app.notifications SET read=true WHERE id=$1 AND user_id=$2 RETURNING id',[v.id,userId]);return {id:v.id};}
 if(op==='account.delete'){
  await client.query('DELETE FROM start_app.listing_comments WHERE user_id=$1',[userId]);
  await client.query('DELETE FROM start_app.contacts WHERE user_id=$1 OR exchange_id IN (SELECT e.id FROM start_app.exchanges e JOIN start_app.listings l ON l.id=e.listing_id WHERE e.requester_id=$1 OR l.user_id=$1)',[userId]);
  await client.query("UPDATE start_app.exchanges SET status='withdrawn' WHERE requester_id=$1 OR listing_id IN (SELECT id FROM start_app.listings WHERE user_id=$1)",[userId]);
  await client.query("UPDATE start_app.listings SET status='withdrawn',data=data-'meeting' WHERE user_id=$1",[userId]);
  for(const table of ['shares','checkins','dolls','favorites','notifications','idempotency'])await client.query(`DELETE FROM start_app.${table} WHERE user_id=$1`,[userId]);
  await client.query("UPDATE start_app.media SET visibility='private' WHERE user_id=$1 AND visibility='private'",[userId]);
  await client.query('DELETE FROM start_app.memberships WHERE user_id=$1',[userId]);
  await client.query('UPDATE start_app.communities SET manager_id=NULL WHERE manager_id=$1',[userId]);
  await client.query("UPDATE start_accounts.profiles SET nickname='已注销',artists='',interests='' WHERE user_id=$1",[userId]);
  await client.query("UPDATE start_accounts.users SET status='disabled' WHERE id=$1",[userId]);
  return {ok:true};
 }
 return null;
}
