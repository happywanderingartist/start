import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createAccountService,validateProfilePatch} from '../src/accounts.mjs';

test('provider unavailable never grants a demo identity',async()=>{
  const service=createAccountService({repository:{}});
  await assert.rejects(service.read('Bearer fake'),{code:'AUTH_NOT_CONFIGURED',status:503});
});
test('invalid or unavailable provider cannot reach the repository',async()=>{
  let calls=0;const repository={resolveIdentity(){calls++;}};
  const rejected=createAccountService({repository,verifyBearer:async()=>null});
  await assert.rejects(rejected.read('Bearer invalid'),{status:401});
  await assert.rejects(rejected.read(''),{status:401});
  const unavailable=createAccountService({repository,verifyBearer:async()=>{throw Error('provider secret');}});
  await assert.rejects(unavailable.read('Bearer token'),{code:'AUTH_UNAVAILABLE',status:503,message:'Authentication unavailable'});
  assert.equal(calls,0);
});
test('only verified identity selects owner; client cannot supply userId',async()=>{
  const seen=[];const repository={resolveIdentity:async principal=>{seen.push(principal);return 'owner-a';},read:async id=>({id}),update:async(id,patch)=>({id,...patch})};
  const service=createAccountService({repository,verifyBearer:async token=>token==='alice'?{provider:'test',subject:'alice'}:null});
  assert.deepEqual(await service.read('Bearer alice'),{id:'owner-a'});
  await assert.rejects(service.update('Bearer alice',{nickname:'旅行者',userId:'owner-b'}),{status:400});
  assert.deepEqual(await service.update('Bearer alice',{nickname:'新昵称'}),{id:'owner-a',nickname:'新昵称'});
  assert.equal(seen[0].subject,'alice');
});
test('profile patch validates types, lengths and privacy keys',()=>{
  assert.deepEqual(validateProfilePatch({nickname:'  小夏  ',privacy:{artists:true}}),{nickname:'小夏',privacy:{artists:true}});
  for(const value of [null,[],{}, {nickname:''},{nickname:'a'.repeat(25)},{artists:9},{interests:'a'.repeat(121)},{privacy:{artists:'yes'}},{privacy:{location:true}},{userId:'other'}]) assert.throws(()=>validateProfilePatch(value),{status:400});
});
