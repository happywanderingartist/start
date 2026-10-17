import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {randomUUID} from 'node:crypto';
import fs from 'node:fs/promises';
import {createPlatform} from '../src/platform.mjs';
import {createProfileRepository} from '../../START_ACCOUNT_FOUNDATION_2026-10-05/src/profile-repository.mjs';
const require=createRequire(new URL('../../../.worktrees/start-slice-001/package.json',import.meta.url));
const {Pool}=require('pg');
const database='start_test_'+randomUUID().replaceAll('-','');
const pool=new Pool({host:'127.0.0.1',port:55435,user:'start_local',database,max:8});
let app,admin,a,b,c,artist,place,route,event,community,listing,exchange,checkin;
const call=(actor,op,value,key=randomUUID())=>app.execute(actor,op,value,key);
const denied=(fn,code='FORBIDDEN')=>assert.rejects(fn,e=>e.code===code);
test.before(async()=>{
 const setup=new Pool({host:'127.0.0.1',port:55435,user:'start_local',database:'postgres'});
 try{await setup.query(`CREATE DATABASE ${database}`);}finally{await setup.end();}
 await pool.query(await fs.readFile(new URL('../../START_ACCOUNT_FOUNDATION_2026-10-05/db/001_accounts.sql',import.meta.url),'utf8'));
 await pool.query(await fs.readFile(new URL('../db/001_platform.sql',import.meta.url),'utf8'));
 const repo=createProfileRepository(pool);
 [admin,a,b,c]=await Promise.all(['admin','alice','bob','charlie'].map(async s=>({id:await repo.resolveIdentity({provider:'test',subject:randomUUID()+s})})));
 await pool.query('INSERT INTO start_app.admins(user_id) VALUES($1)',[admin.id]);
 app=createPlatform(pool);
});
test.after(()=>pool.end());
test('unconfigured/forged identities never authorize writes',async()=>{
 await denied(()=>call(null,'artist.save',{name:'艺人'}),'UNAUTHENTICATED');
 await denied(()=>call({...a,role:'admin'},'artist.save',{name:'艺人'}));
 await denied(()=>call({id:randomUUID()},'artist.save',{name:'艺人'}));
});
test('admin creates versioned drafts, private until publication',async()=>{
 artist=await call(admin,'artist.save',{name:'安溥',genres:['流行']});
 assert.equal((await app.publicQuery()).artists.length,0);
 await call(admin,'content.publish',{id:artist.id,version:1});
 assert.equal((await app.publicQuery()).artists[0].id,artist.id);
});
test('single artist submission, source and map coordinates validated',async()=>{
 await denied(()=>call(a,'submission.create',{artistIds:[artist.id],name:'趵突泉'}),'INVALID_INPUT');
 await denied(()=>call(a,'submission.create',{artistId:artist.id,name:'趵突泉',city:'济南',category:'景点',source:'参考',poiId:'B001',longitude:300,latitude:36}),'INVALID_INPUT');
 const s=await call(a,'submission.create',{artistId:artist.id,name:'趵突泉',city:'济南',category:'景点',source:'用户核对参考',poiId:'B001',longitude:117,latitude:36,coordinateSystem:'gcj02'});
 assert.equal((await app.publicQuery()).places.length,0);
 await denied(()=>call(b,'submission.review',{id:s.id,decision:'approve',checked:true}));
 place=await call(admin,'submission.review',{id:s.id,decision:'approve',checked:true});
 assert.equal((await app.publicQuery({artistId:artist.id,city:'济南'})).places[0].id,place.id);
});
test('same POI retains independent artist contributions; repeated approval idempotent',async()=>{
 const s=await call(b,'submission.create',{artistId:artist.id,name:'同一趵突泉',city:'济南',category:'景点',source:'第二份原文',poiId:'B001',longitude:117,latitude:36,coordinateSystem:'gcj02'});
 const results=await Promise.all([call(admin,'submission.review',{id:s.id,decision:'approve',checked:true},'review-repeat'),call(admin,'submission.review',{id:s.id,decision:'approve',checked:true},'review-repeat')]);
 assert.equal(results[0].id,place.id);assert.equal(results[1].id,place.id);
 assert.equal((await app.publicQuery()).places.length,1);
 const q=await pool.query('SELECT count(*) FROM start_app.contributions WHERE place_id=$1',[place.id]);assert.equal(Number(q.rows[0].count),2);
});
test('reject requires reason, owner can revise and resubmit, strangers cannot',async()=>{
 const s=await call(a,'submission.create',{artistId:artist.id,name:'书店',city:'济南',category:'书店',source:'资料'});
 await denied(()=>call(admin,'submission.review',{id:s.id,decision:'reject',reason:''}),'INVALID_INPUT');
 await call(admin,'submission.review',{id:s.id,decision:'reject',reason:'请补充来源'});
 await denied(()=>call(b,'submission.resubmit',{id:s.id,source:'补充'}));
 await call(a,'submission.resubmit',{id:s.id,source:'原文新依据'});
 assert.equal((await app.privateQuery(a,'submissions')).find(x=>x.id===s.id).status,'pending');
});
test('ordered route and event reference shared places, edits require version',async()=>{
 route=await call(admin,'route.save',{name:'济南 Citywalk',city:'济南',artistId:artist.id,placeIds:[place.id],source:'用户参考顺序'});
 await call(admin,'content.publish',{id:route.id,version:1});
 event=await call(admin,'event.save',{name:'测试演出',city:'济南',artistIds:[artist.id],placeId:place.id,startsAt:'2026-10-09T12:00:00Z',timeZone:'Asia/Shanghai',status:'upcoming',source:'主办方公告'});
 await call(admin,'content.publish',{id:event.id,version:1});
 await denied(()=>call(admin,'place.save',{id:place.id,version:0,name:'改名',city:'济南',category:'景点',source:'更新'}),'INVALID_INPUT');
 const edited=await call(admin,'place.save',{id:place.id,version:1,name:'趵突泉更新',city:'济南',category:'景点',source:'更新',poiId:'B001'});
 await denied(()=>call(admin,'place.save',{id:place.id,version:1,name:'迟到修改',city:'济南',category:'景点',source:'旧版本'}),'CONFLICT');
 assert.equal((await app.publicQuery()).places[0].name,'趵突泉');
 await call(admin,'content.publish',{id:edited.id,version:2});
 const data=await app.publicQuery();assert.equal(data.routes[0].placeIds[0],place.id);assert.equal(data.events[0].placeId,place.id);assert.equal(data.places[0].name,'趵突泉更新');
});
test('route forbids duplicate and unpublished/nonexistent stops',async()=>{
 await denied(()=>call(admin,'route.save',{name:'重复',city:'济南',artistId:artist.id,placeIds:[place.id,place.id],source:'资料'}),'INVALID_INPUT');
 await denied(()=>call(admin,'route.save',{name:'不存在',city:'济南',artistId:artist.id,placeIds:[randomUUID()],source:'资料'}),'NOT_FOUND');
});
test('one artist one community with concurrent approval, no duplicate membership',async()=>{
 const v={artistId:artist.id,name:'安溥社群',description:'一起逛城市'};
 const s=await call(a,'community.apply',v);
 community=await call(admin,'community.review',{id:s.id,decision:'approve'});
 await denied(()=>call(b,'community.apply',v),'CONFLICT');
 await Promise.all([call(b,'community.join',{id:community.id},'join'),call(b,'community.join',{id:community.id},'join')]);
 assert.equal((await app.privateQuery(b,'memberships')).length,1);
});
test('community manager scope: description/notice/members only',async()=>{
 await call(a,'community.edit',{id:community.id,description:'新简介',notice:'周末见'});
 await denied(()=>call(b,'community.edit',{id:community.id,description:'越权'}));
 await denied(()=>call(a,'community.edit',{id:community.id,artistId:randomUUID()}),'INVALID_INPUT');
 await call(a,'community.member',{id:community.id,userId:b.id,status:'removed'});
 assert.equal((await app.privateQuery(b,'memberships')).length,0);
 await call(b,'community.join',{id:community.id});
});
test('listing binding validated; public output never contains meeting/contact',async()=>{
 await denied(()=>call(a,'listing.create',{communityId:community.id,artistId:randomUUID(),name:'物料',status:'available'}),'CONFLICT');
 listing=await call(a,'listing.create',{communityId:community.id,artistId:artist.id,eventId:event.id,placeId:place.id,name:'明信片',description:'线下交换',status:'available',meeting:'私有集合说明'});
 const l=(await app.publicQuery()).listings[0];assert.equal(l.id,listing.id);assert.equal(l.meeting,undefined);
});
test('exchange acceptance exposes no automatic contacts; own request forbidden',async()=>{
 await denied(()=>call(a,'exchange.apply',{listingId:listing.id}),'CONFLICT');
 exchange=await call(b,'exchange.apply',{listingId:listing.id});
 await denied(()=>call(b,'exchange.accept',{id:exchange.id}));
 await denied(()=>call(b,'contact.set',{id:exchange.id,value:'微信 bob'}),'INVALID_INPUT');
 await call(a,'exchange.accept',{id:exchange.id});
 assert.equal(typeof app.contacts,'undefined');
 assert.equal((await app.publicQuery()).listings[0].status,'available');
});
test('listing comments are public, removable by author, and replace contact endpoints',async()=>{
 const comment=await call(b,'listing.comment',{listingId:listing.id,text:'现场交换，请在这里回复'});
 const detail=await app.publicDetail('listing',listing.id);assert.equal(detail.comments[0].text,'现场交换，请在这里回复');assert.equal(detail.comments[0].user_id,undefined);
 await denied(()=>call(c,'listing.comment.delete',{id:comment.id}));await call(b,'listing.comment.delete',{id:comment.id});assert.equal((await app.publicDetail('listing',listing.id)).comments.length,0);
 await denied(()=>call(c,'listing.edit',{id:listing.id,name:'越权',description:''}));
 await call(a,'listing.edit',{id:listing.id,name:'新版明信片',description:'两张'});assert.equal((await app.publicDetail('listing',listing.id)).name,'新版明信片');
 await denied(()=>call(b,'listing.comment',{listingId:listing.id,text:' '}),'INVALID_INPUT');
});
test('event cancel does not mutate listings or notify publishers',async()=>{
 const before=(await app.privateQuery(a,'notifications')).length;
 const changed=await call(admin,'event.save',{id:event.id,version:1,name:'改期',city:'济南',artistIds:[artist.id],placeId:place.id,startsAt:'2026-10-10T12:00:00Z',timeZone:'Asia/Shanghai',status:'cancelled',source:'官方取消公告'});
 await call(admin,'content.publish',{id:changed.id,version:2});
 assert.equal((await app.privateQuery(a,'notifications')).length,before);
 assert.equal((await app.publicQuery()).listings[0].status,'available');
 await call(a,'listing.status',{id:listing.id,status:'withdrawn'});
 assert.equal((await app.publicQuery()).listings.length,0);
 await denied(()=>call(c,'listing.status',{id:listing.id,status:'available'}));
 await denied(()=>call(a,'listing.status',{id:listing.id,status:'completed'}),'INVALID_INPUT');
});
test('free private duplicate/past checkins, Book immutable snapshots',async()=>{
 checkin=await call(a,'checkin.create',{placeId:place.id,at:'2026-09-01T08:00:00Z',text:'我的记录'});
 await call(a,'checkin.create',{placeId:place.id,at:'2026-09-01T08:00:00Z'});
 assert.equal((await app.privateQuery(a,'book')).length,2);assert.equal((await app.privateQuery(b,'book')).length,0);
 const p=await call(admin,'place.save',{id:place.id,version:2,name:'再次更新',city:'济南',category:'景点',source:'资料',poiId:'B001'});await call(admin,'content.publish',{id:p.id,version:3});
 assert.equal((await app.privateQuery(a,'book'))[0].snapshot.name,'趵突泉更新');
});
test('selected share is revocable and excludes private fields',async()=>{
 const share=await call(a,'share.create',{ids:[checkin.id],fields:['snapshot','at']});
 const visible=await app.readShare(share.token);assert.equal(visible.length,1);assert.equal(visible[0].text,undefined);assert.equal(visible[0].user_id,undefined);
 await denied(()=>call(b,'share.create',{ids:[checkin.id],fields:['snapshot']}));
 await call(a,'share.revoke',{id:share.id});await denied(()=>app.readShare(share.token),'NOT_FOUND');
});
test('share management can be restored after reload without disclosing tokens',async()=>{
 const owned=await call(a,'share.create',{ids:[checkin.id],fields:['snapshot','at']});
 const list=await app.privateQuery(a,'shares');
 const row=list.find(item=>item.id===owned.id);
 assert.deepEqual(row.record_ids,[checkin.id]);assert.deepEqual(row.fields,['snapshot','at']);
 assert.equal(row.revoked,false);assert.equal(row.token_hash,undefined);assert.equal(row.token,undefined);
 assert.equal((await app.privateQuery(b,'shares')).some(item=>item.id===owned.id),false);
 await denied(()=>call(b,'share.revoke',{id:owned.id}));
 await call(a,'share.revoke',{id:owned.id});
 assert.equal((await app.privateQuery(a,'shares')).find(item=>item.id===owned.id).revoked,true);
 await denied(()=>app.readShare(owned.token),'NOT_FOUND');
});
test('first doll locks single identity; boy supports five outfits, accessories excluded',async()=>{
 await call(a,'doll.choose',{character:'boy'});
 await denied(()=>call(a,'doll.choose',{character:'girl'}),'CONFLICT');
 for(const outfit of ['original','outfit2','outfit3','outfit4','outfit5'])await call(a,'doll.style',{outfit,expression:'smile'});
 await denied(()=>call(a,'doll.style',{outfit:'outfit6'}),'INVALID_INPUT');
 await denied(()=>call(a,'doll.style',{accessory:'hat'}),'INVALID_INPUT');
 assert.equal((await app.privateQuery(a,'doll')).character,'boy');
});
test('recommendation ranks local interests and never pretends distant points are nearby',async()=>{
 const data=await app.recommend(a,{city:'济南'});assert.equal(data.places[0].id,place.id);assert.equal(data.places[0].city,'济南');
 const other=await app.recommend(a,{city:'上海'});assert.equal(other.places.length,0);assert.equal(other.city,'上海');
});
test('same idempotency key with different payload rejected',async()=>{
 await call(b,'doll.choose',{character:'girl'},'doll-choice');
 await denied(()=>call(b,'doll.choose',{character:'boy'},'doll-choice'),'CONFLICT');
});
test('route submission is independent of point contribution and preserves stop order',async()=>{
 const s=await call(c,'routeSubmission.create',{name:'用户路线',city:'济南',artistId:artist.id,placeIds:[place.id],source:'用户编排'});
 assert.equal((await app.publicQuery()).routes.length,1);
 const r=await call(admin,'submission.review',{id:s.id,decision:'approve',checked:true});
 assert.equal((await app.publicDetail('route',r.id)).placeIds[0],place.id);
 assert.equal((await app.publicQuery()).places.length,1);
});
test('route review publishes new map stops atomically and binds the selected artist',async()=>{
 const candidate={name:'路线新咖啡',city:'济南',category:'咖啡',source:'用户核对路线原帖',poiId:'ROUTE_NEW',longitude:117.1,latitude:36.6,coordinateSystem:'gcj02',sameSpot:'照片机位'};
 const before=await app.publicQuery();
 const pending=await call(c,'routeSubmission.create',{name:'混合站点路线',city:'济南',artistId:artist.id,stops:[{placeId:place.id},{place:candidate}],source:'路线来源'});
 assert.equal((await app.publicQuery()).places.length,before.places.length);
 await denied(()=>call(c,'submission.review',{id:pending.id,decision:'approve',checked:true}));
 const approved=await call(admin,'submission.review',{id:pending.id,decision:'approve',checked:true});
 const route=await app.publicDetail('route',approved.id),all=await app.publicQuery();
 assert.equal(route.placeIds[0],place.id);assert.equal(route.placeIds.length,2);
 const added=all.places.find(p=>p.id===route.placeIds[1]);assert.equal(added.poiId,'ROUTE_NEW');assert.ok(added.artistIds.includes(artist.id));
 assert.equal((await app.publicDetail('place',added.id)).contributions[0].sameSpot,'照片机位');
 await call(admin,'submission.review',{id:pending.id,decision:'approve',checked:true});assert.equal((await app.publicQuery()).places.length,all.places.length);
});
test('rejecting route creates no new public stops',async()=>{
 const before=await app.publicQuery();
 const pending=await call(c,'routeSubmission.create',{name:'待退回路线',city:'济南',artistId:artist.id,stops:[{place:{name:'不应公开',city:'济南',category:'其他',source:'未核实',poiId:'REJECTED_STOP',longitude:117,latitude:36,coordinateSystem:'gcj02'}}],source:'待核实'});
 await call(admin,'submission.review',{id:pending.id,decision:'reject',reason:'来源不完整'});
 assert.equal((await app.publicQuery()).places.length,before.places.length);
});
test('route map stop reuses an existing POI and adds independent artist evidence',async()=>{
 const before=await app.publicQuery();
 const pending=await call(c,'routeSubmission.create',{name:'复用已有地点路线',city:'济南',artistId:artist.id,stops:[{place:{name:'地图中的趵突泉',city:'济南',category:'景点',source:'新路线来源',poiId:'B001',longitude:117,latitude:36,coordinateSystem:'gcj02',sameSpot:'补充同款'}}],source:'路线来源'});
 const approved=await call(admin,'submission.review',{id:pending.id,decision:'approve',checked:true});
 assert.deepEqual((await app.publicDetail('route',approved.id)).placeIds,[place.id]);
 assert.equal((await app.publicQuery()).places.length,before.places.length);
 assert.ok((await app.publicDetail('place',place.id)).contributions.some(c=>c.sameSpot==='补充同款'));
});
test('route rejects two different stop references resolving to the same POI without leaking child records',async()=>{
 const pending=await call(c,'routeSubmission.create',{name:'别名重复路线',city:'济南',artistId:artist.id,stops:[{placeId:place.id},{place:{name:'别名',city:'济南',category:'景点',source:'测试',poiId:'B001',longitude:117,latitude:36,coordinateSystem:'gcj02'}}],source:'测试'});
 const before=Number((await pool.query('SELECT count(*) FROM start_app.submissions')).rows[0].count);
 await denied(()=>call(admin,'submission.review',{id:pending.id,decision:'approve',checked:true}),'INVALID_INPUT');
 assert.equal(Number((await pool.query('SELECT count(*) FROM start_app.submissions')).rows[0].count),before);
});
test('failed route approval rolls back newly created stops and keeps submission pending',async()=>{
 const pending=await call(c,'routeSubmission.create',{name:'事务回滚路线',city:'济南',artistId:artist.id,stops:[{place:{name:'回滚站点',city:'济南',category:'其他',source:'测试',poiId:'ROLLBACK_STOP',longitude:117,latitude:36,coordinateSystem:'gcj02'}},{placeId:place.id}],source:'测试'});
 await call(admin,'content.withdraw',{id:place.id});
 await denied(()=>call(admin,'submission.review',{id:pending.id,decision:'approve',checked:true}),'NOT_FOUND');
 assert.equal(Number((await pool.query("SELECT count(*) FROM start_app.content WHERE poi_id='ROLLBACK_STOP'")).rows[0].count),0);
 assert.equal((await pool.query('SELECT status FROM start_app.submissions WHERE id=$1',[pending.id])).rows[0].status,'pending');
 const version=(await pool.query('SELECT version FROM start_app.content WHERE id=$1',[place.id])).rows[0].version;await call(admin,'content.publish',{id:place.id,version});
});
test('user corrections require review and homepage configuration accepts only public IDs',async()=>{
 const s=await call(c,'correction.create',{id:event.id,version:2,kind:'event',data:{name:'更正演出',city:'济南',artistIds:[artist.id],placeId:place.id,startsAt:'2026-10-11T12:00:00Z',timeZone:'Asia/Shanghai',status:'upcoming',source:'官方新公告'}});
 assert.equal((await app.publicDetail('event',event.id)).name,'改期');
 await denied(()=>call(c,'correction.review',{id:s.id,decision:'approve',checked:true}));
 await call(admin,'correction.review',{id:s.id,decision:'approve',checked:true});
 assert.equal((await app.publicDetail('event',event.id)).name,'更正演出');
 await denied(()=>call(admin,'home.configure',{ids:[randomUUID()]}),'NOT_FOUND');
 await call(admin,'home.configure',{ids:[event.id,place.id]});assert.equal((await app.home()).featured[0].id,event.id);
});
test('persist across platform instance; account delete removes private records and denies writes',async()=>{
 app=createPlatform(pool);assert.equal((await app.privateQuery(a,'book')).length,2);
 const publicPlacesBeforeDeletion=(await app.publicQuery()).places.length;
 await call(a,'account.delete',{confirm:true});
 await denied(()=>call(a,'checkin.create',{placeId:place.id,at:'2026-10-01T00:00:00Z'}));
 assert.equal(Number((await pool.query('SELECT count(*) FROM start_app.checkins WHERE user_id=$1',[a.id])).rows[0].count),0);
 assert.equal((await app.publicQuery()).places.length,publicPlacesBeforeDeletion);
 assert.equal((await app.publicQuery()).communities[0].manager_id,null);
});
