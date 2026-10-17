import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import fs from 'node:fs/promises';
import {createPlatform} from '../src/platform.mjs';
import {Pool} from '../src/runtime.mjs';
import {createRequire} from 'node:module';
import {createProfileRepository} from '../../START_ACCOUNT_FOUNDATION_2026-10-05/src/profile-repository.mjs';
import {createMedia} from '../src/media.mjs';
import {createServer} from '../src/http.mjs';
const database='start_test_http_'+randomUUID().replaceAll('-','');
const pool=new Pool({host:'127.0.0.1',port:55435,user:'start_local',database});
let server,base,app,media,owner,other;
const require=createRequire(new URL('../../../.worktrees/start-slice-001/package.json',import.meta.url));
const {PNG}=require('pngjs');
const image=PNG.sync.write({width:1,height:1,data:Buffer.from([255,255,255,255])});
const dir=new URL('../data/media-test/'+database+'/',import.meta.url);
const request=(url,options={})=>fetch(base+url,options);
test.before(async()=>{
 const root=new Pool({host:'127.0.0.1',port:55435,user:'start_local',database:'postgres'});try{await root.query(`CREATE DATABASE ${database}`);}finally{await root.end();}
 await pool.query(await fs.readFile(new URL('../../START_ACCOUNT_FOUNDATION_2026-10-05/db/001_accounts.sql',import.meta.url),'utf8'));
 await pool.query(await fs.readFile(new URL('../db/001_platform.sql',import.meta.url),'utf8'));
 const repo=createProfileRepository(pool);owner={id:await repo.resolveIdentity({provider:'fixture',subject:'owner'})};other={id:await repo.resolveIdentity({provider:'fixture',subject:'other'})};
 app=createPlatform(pool);media=createMedia(pool,dir);
 server=createServer({app,media,repository:repo,verifyBearer:token=>({provider:'fixture',subject:token})});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;
});
test.after(async()=>{server?.closeAllConnections();await new Promise(r=>server.close(r));await pool.end();});
test('HTTP no provider fails closed; forged userId rejected',async()=>{
 const isolated=createServer({app,media,repository:createProfileRepository(pool)});await new Promise(r=>isolated.listen(0,'127.0.0.1',r));
 try{const r=await fetch('http://127.0.0.1:'+isolated.address().port+'/api/me/book',{headers:{authorization:'Bearer fake'}});assert.equal(r.status,503);}finally{isolated.closeAllConnections();await new Promise(r=>isolated.close(r));}
 assert.equal((await request('/api/me/book',{headers:{'x-user-id':owner.id}})).status,401);
});
test('HTTP rejects foreign origins, oversized JSON, invalid keys, unknown fields',async()=>{
 const headers={authorization:'Bearer owner','content-type':'application/json','idempotency-key':randomUUID()};
 assert.equal((await request('/api/commands/doll.choose',{method:'POST',headers:{...headers,origin:'https://evil.example'},body:JSON.stringify({character:'boy'})})).status,403);
 assert.equal((await request('/api/commands/doll.choose',{method:'POST',headers,body:' '.repeat(70000)})).status,413);
 assert.equal((await request('/api/commands/doll.choose',{method:'POST',headers,body:JSON.stringify({character:'boy',userId:other.id})})).status,400);
 assert.equal((await request('/api/public?unknown=x')).status,400);
});
test('real HTTP writes persist on service restart and browser client preserves key on retry',async()=>{
 const headers={authorization:'Bearer owner','content-type':'application/json','idempotency-key':'choose'};
 assert.equal((await request('/api/commands/doll.choose',{method:'POST',headers,body:JSON.stringify({character:'boy'})})).status,200);
 const same=await request('/api/commands/doll.choose',{method:'POST',headers,body:JSON.stringify({character:'boy'})});assert.equal(same.status,200);
 server.closeAllConnections();await new Promise(r=>server.close(r));server=createServer({app:createPlatform(pool),media,repository:createProfileRepository(pool),verifyBearer:token=>({provider:'fixture',subject:token})});await new Promise(r=>server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+server.address().port;
 const read=await request('/api/me/doll',{headers:{authorization:'Bearer owner'}});assert.equal((await read.json()).character,'boy');
});
test('media upload private, MIME magic checked, malicious paths never stored',async()=>{
 await assert.rejects(()=>media.upload(owner,Buffer.from('<svg/>'),'image/png'),e=>e.code==='INVALID_MEDIA');
 await assert.rejects(()=>media.upload(owner,image,'image/svg+xml'),e=>e.code==='INVALID_MEDIA');
 const uploaded=await media.upload(owner,image,'image/png');
 await assert.rejects(()=>media.read(other,uploaded.id),e=>e.code==='FORBIDDEN');
 await assert.rejects(()=>media.read(null,uploaded.id),e=>e.code==='UNAUTHENTICATED');
 const r=await request('/api/media/'+uploaded.id,{headers:{authorization:'Bearer owner'}});assert.equal(r.status,200);assert.deepEqual(Buffer.from(await r.arrayBuffer()),image);
 assert.equal((await request('/api/media/..%2Fprivate')).status,400);
 assert.equal((await fs.readdir(dir)).length,1);
});
test('raw upload endpoint bounded and public serialization omits disk paths',async()=>{
 const r=await request('/api/media',{method:'POST',headers:{authorization:'Bearer owner','content-type':'image/png'},body:image});assert.equal(r.status,201);
 const data=await r.json();assert.equal(data.path,undefined);assert.equal(data.user_id,undefined);assert.ok(data.id);
 const publicData=await (await request('/api/public')).json();assert.equal(JSON.stringify(publicData).includes('media-test'),false);
});
test('withdrawal revokes anonymous media access even if its old URL is known',async()=>{
 await pool.query('INSERT INTO start_app.admins(user_id) VALUES($1)',[other.id]);const upload=await media.upload(other,image,'image/png');const p=await app.execute(other,'place.save',{name:'封面测试',city:'上海',category:'景点',source:'测试资料',mediaIds:[upload.id]},randomUUID());await app.execute(other,'content.publish',{id:p.id,version:1},randomUUID());assert.equal((await media.read(null,upload.id)).mime,'image/png');await app.execute(other,'content.withdraw',{id:p.id},randomUUID());await assert.rejects(()=>media.read(null,upload.id),e=>e.code==='UNAUTHENTICATED');assert.equal((await media.read(other,upload.id)).mime,'image/png');
});
test('admin can inspect pending submission photos but cannot inspect private Book photos',async()=>{
 const artist=await app.execute(other,'artist.save',{name:'审核照片艺人'},randomUUID());await app.execute(other,'content.publish',{id:artist.id,version:1},randomUUID());
 const privatePhoto=await media.upload(owner,image,'image/png');await assert.rejects(()=>media.read(other,privatePhoto.id),e=>e.code==='FORBIDDEN');
 const submittedPhoto=await media.upload(owner,image,'image/png');await app.execute(owner,'submission.create',{artistId:artist.id,name:'待审核地点',city:'上海',category:'景点',source:'待核验原文',mediaIds:[submittedPhoto.id]},randomUUID());assert.equal((await media.read(other,submittedPhoto.id)).mime,'image/png');const listed=await app.adminQuery(other,'media');assert.ok(listed.some(m=>m.id===submittedPhoto.id));assert.equal(listed.some(m=>m.id===privatePhoto.id),false);await assert.rejects(()=>media.read(null,submittedPhoto.id),e=>e.code==='UNAUTHENTICATED');
});
test('selected Book photo share is token scoped and revocation denies old image link',async()=>{
 const p=await app.execute(other,'place.save',{name:'分享测试',city:'上海',category:'景点',source:'验收用'},randomUUID());await app.execute(other,'content.publish',{id:p.id,version:1},randomUUID());const photo=await media.upload(owner,image,'image/png'),unselected=await media.upload(owner,image,'image/png');const record=await app.execute(owner,'checkin.create',{placeId:p.id,at:'2026-10-01T00:00:00Z',mediaIds:[photo.id]},randomUUID());const share=await app.execute(owner,'share.create',{ids:[record.id],fields:['media_ids']},randomUUID());assert.deepEqual((await app.readShare(share.token))[0].media_ids,[photo.id]);const url='/api/share/'+share.token+'/media/';assert.equal((await request(url+photo.id)).status,200);assert.equal((await request(url+unselected.id)).status,404);assert.equal((await request('/api/media/'+photo.id)).status,401);await app.execute(owner,'share.revoke',{id:share.id},randomUUID());assert.equal((await request(url+photo.id)).status,404);
});
test('delete account removes private media, stale session and writes rejected',async()=>{
 const upload=await media.upload(owner,image,'image/png');await app.execute(owner,'account.delete',{confirm:true},randomUUID());
 await media.cleanupDeletedOwners();await assert.rejects(()=>media.read(owner,upload.id),e=>['NOT_FOUND','FORBIDDEN'].includes(e.code));
 assert.equal((await pool.query('SELECT count(*) FROM start_app.media WHERE user_id=$1',[owner.id])).rows[0].count,'0');assert.equal((await fs.readdir(dir)).includes(upload.id+'.png'),false);
 assert.equal((await request('/api/me/book',{headers:{authorization:'Bearer owner'}})).status,403);
});
