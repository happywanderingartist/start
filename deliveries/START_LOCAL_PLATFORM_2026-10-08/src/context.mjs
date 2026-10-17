import {randomUUID} from 'node:crypto';
import {fail} from './contracts.mjs';
import {publiclyReferenced} from './public-media.mjs';
export function context(client,userId){
 const one=async(sql,values=[])=>{const r=await client.query(sql,values);if(!r.rows[0])fail('NOT_FOUND',404);return r.rows[0];};
 const content=async(id,kind,published=true)=>{const r=await one('SELECT * FROM start_app.content WHERE id=$1 AND kind=$2',[id,kind]);if(published&&!r.published)fail('NOT_FOUND',404);return r;};
 const admin=async()=>{if(!(await client.query('SELECT 1 FROM start_app.admins WHERE user_id=$1',[userId])).rowCount)fail('FORBIDDEN',403);};
 const owns=row=>{if(row.user_id!==userId)fail('FORBIDDEN',403);return row;};
 const notify=async(owner,kind,id)=>client.query('INSERT INTO start_app.notifications(id,user_id,kind,reference_id) VALUES($1,$2,$3,$4)',[randomUUID(),owner,kind,id]);
 const media=async(ids=[],owner=userId)=>{for(const id of ids){const row=await one('SELECT * FROM start_app.media WHERE id=$1',[id]);if(row.user_id!==owner&&(row.visibility!=='public'||!await publiclyReferenced(client,id)))fail('FORBIDDEN',403);}};
 return {client,userId,one,content,admin,owns,notify,media};
}
