import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID,createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {uuid,fail} from './contracts.mjs';
import {publiclyReferenced,reviewableMedia} from './public-media.mjs';
const require=createRequire(new URL('../../../.worktrees/start-slice-001/package.json',import.meta.url));
const {PNG}=require('pngjs');
const maxBytes=5*1024*1024;
export function createMedia(pool,rootUrl){
 const root=path.resolve(rootUrl instanceof URL?fileURLToPath(rootUrl):rootUrl);
 const filePath=name=>{if(!/^[0-9a-f-]{36}\.png$/.test(name))fail('INVALID_MEDIA');const p=path.resolve(root,name);if(path.dirname(p)!==root)fail('INVALID_MEDIA');return p;};
 async function active(c,actor){if(!actor)fail('UNAUTHENTICATED',401);uuid(actor.id);if(!(await c.query("SELECT 1 FROM start_accounts.users WHERE id=$1 AND status='active' FOR UPDATE",[actor.id])).rowCount)fail('FORBIDDEN',403);}
 async function transaction(work){const c=await pool.connect();try{await c.query('BEGIN');await c.query('SELECT pg_advisory_xact_lock(710082026)');const r=await work(c);await c.query('COMMIT');return r;}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}}
 return {
  async upload(actor,bytes,mime){
   if(mime!=='image/png'||!Buffer.isBuffer(bytes)||!bytes.length||bytes.length>maxBytes||bytes.length<33||!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))fail('INVALID_MEDIA');
   if(bytes.readUInt32BE(16)>4096||bytes.readUInt32BE(20)>4096||bytes.readUInt32BE(16)*bytes.readUInt32BE(20)>16_000_000)fail('INVALID_MEDIA');
   try{PNG.sync.read(bytes,{checkCRC:true});}catch{fail('INVALID_MEDIA');}
   const id=randomUUID(),name=id+'.png',sha=createHash('sha256').update(bytes).digest('hex');await fs.mkdir(root,{recursive:true});
   return transaction(async c=>{await active(c,actor);await fs.writeFile(filePath(name),bytes,{flag:'wx'});try{await c.query('INSERT INTO start_app.media(id,user_id,mime,size,sha256,path) VALUES($1,$2,$3,$4,$5,$6)',[id,actor.id,mime,bytes.length,sha,name]);}catch(e){await fs.unlink(filePath(name));throw e;}return {id,mime,size:bytes.length};});
  },
  async read(actor,id){uuid(id);return transaction(async c=>{const row=(await c.query('SELECT * FROM start_app.media WHERE id=$1',[id])).rows[0];if(!row)fail('NOT_FOUND',404);if(row.visibility!=='public'||!await publiclyReferenced(c,id)){await active(c,actor);if(actor.id!==row.user_id){const admin=(await c.query('SELECT 1 FROM start_app.admins WHERE user_id=$1',[actor.id])).rowCount;if(!admin||!await reviewableMedia(c,id))fail('FORBIDDEN',403);}}const p=filePath(row.path),s=await fs.lstat(p);if(!s.isFile()||s.isSymbolicLink())fail('NOT_FOUND',404);const bytes=await fs.readFile(p);if(createHash('sha256').update(bytes).digest('hex')!==row.sha256)fail('MEDIA_UNAVAILABLE',503);return {bytes,mime:row.mime};});},
  async cleanupDeletedOwners(){return transaction(async c=>{const rows=(await c.query("SELECT m.* FROM start_app.media m JOIN start_accounts.users u ON u.id=m.user_id WHERE u.status='disabled' AND m.visibility='private'")).rows;for(const r of rows){try{await fs.unlink(filePath(r.path));}catch(e){if(e.code!=='ENOENT')throw e;}await c.query('DELETE FROM start_app.media WHERE id=$1',[r.id]);}return {removed:rows.length};});},
 };
}
