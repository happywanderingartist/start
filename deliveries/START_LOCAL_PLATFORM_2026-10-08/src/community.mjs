import {randomUUID} from 'node:crypto';
import {fail} from './contracts.mjs';
export async function communityCommand(ctx,op,v){
 const {client,userId,one,admin,content,notify}=ctx;
 const manager=async(id)=>{const row=await one("SELECT * FROM start_app.communities WHERE id=$1 AND status='active'",[id]);if(row.manager_id!==userId)await admin();return row;};
 if(op==='community.apply'){
  await content(v.artistId,'artist');if((await client.query('SELECT 1 FROM start_app.communities WHERE artist_id=$1',[v.artistId])).rowCount)fail('CONFLICT',409);
  const pending=(await client.query("SELECT id FROM start_app.community_applications WHERE artist_id=$1 AND status='pending'",[v.artistId])).rows[0];if(pending)fail('CONFLICT',409);
  const id=randomUUID();await client.query('INSERT INTO start_app.community_applications(id,user_id,artist_id,data) VALUES($1,$2,$3,$4)',[id,userId,v.artistId,JSON.stringify(v)]);return {id};
 }
 if(op==='community.review'){
  await admin();const a=await one('SELECT * FROM start_app.community_applications WHERE id=$1',[v.id]);if(a.status==='approved'&&v.decision==='approve')return {id:a.community_id};if(a.status!=='pending')fail('CONFLICT',409);
  if(v.decision==='reject'){if(!v.reason)fail('INVALID_INPUT');await client.query("UPDATE start_app.community_applications SET status='rejected',reason=$2 WHERE id=$1",[a.id,v.reason]);await notify(a.user_id,'community.rejected',a.id);return {id:a.id};}
  await content(a.artist_id,'artist');await one("SELECT id FROM start_accounts.users WHERE id=$1 AND status='active'",[a.user_id]);const id=randomUUID();await client.query('INSERT INTO start_app.communities(id,artist_id,manager_id,name,description) VALUES($1,$2,$3,$4,$5)',[id,a.artist_id,a.user_id,a.data.name,a.data.description]);
  await client.query("INSERT INTO start_app.memberships(community_id,user_id,status) VALUES($1,$2,'joined')",[id,a.user_id]);
  await client.query("UPDATE start_app.community_applications SET status='approved',community_id=$2 WHERE id=$1",[a.id,id]);await notify(a.user_id,'community.approved',id);return {id};
 }
 if(op==='community.join'){await one("SELECT id FROM start_app.communities WHERE id=$1 AND status='active'",[v.id]);await client.query('INSERT INTO start_app.memberships(community_id,user_id,status) VALUES($1,$2,$3) ON CONFLICT(community_id,user_id) DO UPDATE SET status=excluded.status',[v.id,userId,v.status]);return {id:v.id,status:v.status};}
 if(op==='community.edit'){await manager(v.id);await client.query('UPDATE start_app.communities SET description=COALESCE($2,description),notice=COALESCE($3,notice) WHERE id=$1',[v.id,v.description??null,v.notice??null]);return {id:v.id};}
 if(op==='community.member'){const c=await manager(v.id);if(c.manager_id===v.userId)fail('CONFLICT',409);await one("SELECT id FROM start_accounts.users WHERE id=$1 AND status='active'",[v.userId]);await client.query('INSERT INTO start_app.memberships(community_id,user_id,status) VALUES($1,$2,$3) ON CONFLICT(community_id,user_id) DO UPDATE SET status=excluded.status',[v.id,v.userId,v.status]);return {id:v.id};}
 if(op==='community.request'){const c=await manager(v.id);if(v.kind==='transfer'){if(!v.targetUserId)fail('INVALID_INPUT');await one("SELECT id FROM start_accounts.users WHERE id=$1 AND status='active'",[v.targetUserId]);}const id=randomUUID();await client.query('INSERT INTO start_app.community_requests(id,community_id,user_id,data) VALUES($1,$2,$3,$4)',[id,v.id,userId,JSON.stringify({...v,managerId:c.manager_id})]);return {id};}
 if(op==='community.request.review'){
  await admin();const r=await one("SELECT * FROM start_app.community_requests WHERE id=$1 AND status='pending'",[v.id]);if(v.decision==='reject'&&!v.reason)fail('INVALID_INPUT');
  if(v.decision==='approve'){const c=await one('SELECT manager_id,status FROM start_app.communities WHERE id=$1',[r.community_id]);if(c.status!=='active'||c.manager_id!==r.data.managerId)fail('CONFLICT',409);await one("SELECT id FROM start_accounts.users WHERE id=$1 AND status='active'",[r.user_id]);}
  if(v.decision==='approve'&&r.data.kind==='transfer'){await one("SELECT id FROM start_accounts.users WHERE id=$1 AND status='active'",[r.data.targetUserId]);await client.query('UPDATE start_app.communities SET manager_id=$2 WHERE id=$1',[r.community_id,r.data.targetUserId]);await client.query("INSERT INTO start_app.memberships(community_id,user_id,status) VALUES($1,$2,'joined') ON CONFLICT(community_id,user_id) DO UPDATE SET status='joined'",[r.community_id,r.data.targetUserId]);}
  if(v.decision==='approve'&&r.data.kind==='dissolve')await client.query("UPDATE start_app.communities SET status='dissolved' WHERE id=$1",[r.community_id]);
  if(v.decision==='approve'&&r.data.kind==='change')fail('INVALID_INPUT'); // Content changes require explicit editor fields, not arbitrary prose.
  await client.query('UPDATE start_app.community_requests SET status=$2 WHERE id=$1',[r.id,v.decision==='approve'?'approved':'rejected']);await notify(r.user_id,'community.request.reviewed',r.id);return {id:r.id};
 }
 return null;
}
