import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import pg from 'pg';
import assert from 'node:assert/strict';
import {assertRestarted} from './restart.ts';
import {testConfig} from '../../tests/db-config.ts';
const filename='.context/persistence.json';
const c=new pg.Client(testConfig('postgres'));await c.connect();
try {
  await c.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY; SET LOCAL TIME ZONE 'UTC'");
  const tables=(await c.query("SELECT tablename FROM pg_tables WHERE schemaname='start_catalog' ORDER BY tablename")).rows;
  const hashes=[];
  for(const {tablename} of tables){if(!/^[a-z_]+$/u.test(tablename))throw Error('Invalid table');const rows=(await c.query('SELECT to_jsonb(t) AS row FROM start_catalog.'+tablename+' t ORDER BY to_jsonb(t)::text')).rows;hashes.push({table:tablename,count:rows.length,sha256:crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex')});}
  const applied=(await c.query('SELECT name,checksum,applied_at FROM start_migrations.applied ORDER BY name')).rows;
  const meta=(await c.query('SELECT version() AS version,pg_postmaster_start_time() AS started')).rows[0];
  const current={database:testConfig('postgres').database,hashes,applied,meta};
  if(process.argv.includes('--before')){await fs.writeFile(filename,JSON.stringify({before:current},null,2));console.log('Persistence before checkpoint: '+hashes.length+' tables');}
  else if(process.argv.includes('--restored')){const record=JSON.parse(await fs.readFile(filename,'utf8'));assert.notEqual(current.database,record.before.database);assert.deepEqual(current.hashes,record.before.hashes);assert.deepEqual(JSON.parse(JSON.stringify(current.applied)),record.before.applied);await fs.writeFile('.context/database-restore.json',JSON.stringify({originalDatabase:record.before.database,restoredDatabase:current.database,hashes:current.hashes,applied:current.applied,allMatch:true},null,2));console.log('Dump restoration: all logical table hashes and migration records match');}
  else {const record=JSON.parse(await fs.readFile(filename,'utf8'));assert.equal(record.before.database,current.database);assert.deepEqual(current.hashes,record.before.hashes);assert.deepEqual(JSON.parse(JSON.stringify(current.applied)),record.before.applied);assertRestarted(record.before.meta.started,current.meta.started);record.after=current;record.pass=true;await fs.writeFile(filename,JSON.stringify(record,null,2));console.log('Restart persistence: '+hashes.length+' tables and '+applied.length+' migration records unchanged');}
  await c.query('COMMIT');
}finally{await c.end();}
