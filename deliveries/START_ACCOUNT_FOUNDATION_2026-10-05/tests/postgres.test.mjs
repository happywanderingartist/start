import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {createProfileRepository} from '../src/profile-repository.mjs';
import {createAccountService} from '../src/accounts.mjs';
const require=createRequire('D:/Downloads/fan-route-codex-handoff/.worktrees/start-slice-001/package.json');
const {Pool}=require('pg');
// Fixed isolated local database. No production URL and no old catalog migrations.
const config={host:'127.0.0.1',port:55432,user:'postgres',database:'start_test_accounts_20261005',connectionTimeoutMillis:3000};
test('PostgreSQL identity races, durable profiles, two-user isolation and disabled accounts',async()=>{
  const admin=new Pool({...config,database:'postgres'});
  try {
    const exists=await admin.query('SELECT 1 FROM pg_database WHERE datname=$1',[config.database]);
    if(!exists.rowCount) await admin.query('CREATE DATABASE start_test_accounts_20261005');
  } finally {await admin.end();}
  const pool=new Pool(config);
  try {
    await pool.query(await readFile(new URL('../db/001_accounts.sql',import.meta.url),'utf8'));
    const repo=createProfileRepository(pool),subject=randomUUID();
    const ids=await Promise.all(Array.from({length:8},()=>repo.resolveIdentity({provider:'fixture',subject})));
    assert.equal(new Set(ids).size,1);
    const bob=await repo.resolveIdentity({provider:'fixture',subject:randomUUID()});
    const service=createAccountService({repository:repo,verifyBearer:async token=>token==='alice'?{provider:'fixture',subject}:null});
    await service.update('Bearer alice',{nickname:'小夏',artists:'苏打绿',privacy:{book:true}});
    await Promise.all([repo.update(ids[0],{privacy:{artists:true}}),repo.update(ids[0],{privacy:{interests:true}})]);
    assert.equal((await repo.read(bob)).nickname,'旅行者');
    await assert.rejects(service.update('Bearer alice',{userId:bob,nickname:'冒名'}),{status:400});
    const freshPool=new Pool(config);
    try {assert.deepEqual(await createProfileRepository(freshPool).read(ids[0]),{nickname:'小夏',artists:'苏打绿',interests:'',privacy:{artists:true,interests:true,book:true}});}
    finally {await freshPool.end();}
    const count=await pool.query('SELECT count(*)::int AS n FROM start_accounts.auth_identities WHERE provider=$1 AND subject=$2',['fixture',subject]);
    assert.equal(count.rows[0].n,1);
    await pool.query("UPDATE start_accounts.users SET status='disabled' WHERE id=$1",[ids[0]]);
    await assert.rejects(service.read('Bearer alice'),{status:403});
    await assert.rejects(repo.update(ids[0],{nickname:'绕过'}),{status:403});
    const permissions=await pool.query("SELECT has_schema_privilege('start_public_reader','start_accounts','USAGE') AS allowed");
    assert.equal(permissions.rows[0].allowed,false);
  } finally {await pool.end();}
});
