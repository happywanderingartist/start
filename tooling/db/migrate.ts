import pg from 'pg';import type { Client } from 'pg';
import fs from 'node:fs/promises';import crypto from 'node:crypto';import path from 'node:path';import {fileURLToPath} from 'node:url';
export const migrationsDirectory=fileURLToPath(new URL('../../db/migrations/',import.meta.url));
export async function migrate(client:Client,directory=migrationsDirectory):Promise<void> {
  await client.query('select pg_advisory_lock(724018601)');
  try {
    await client.query('create schema if not exists start_migrations; create table if not exists start_migrations.applied(name text primary key, checksum text not null, applied_at timestamptz not null default now())');
    const applied=await client.query<{name:string;checksum:string}>('select name,checksum from start_migrations.applied order by name');
    const files=(await fs.readdir(directory)).filter(n=>/^\d{3}_[a-z_]+\.sql$/.test(n)).sort();
    if(applied.rows.some(x=>!files.includes(x.name)))throw Error('Applied migration missing from source');
    for(const name of files){
      const sql=(await fs.readFile(path.join(directory,name),'utf8')).replaceAll('\r\n','\n');
      const checksum=crypto.createHash('sha256').update(sql).digest('hex');const previous=applied.rows.find(x=>x.name===name);
      if(previous){if(previous.checksum!==checksum)throw Error('Migration checksum mismatch: '+name);continue;}
      if(applied.rows.some(x=>x.name>name))throw Error('Out-of-order migration: '+name);
      await client.query('begin');
      try {await client.query(sql);await client.query('insert into start_migrations.applied(name,checksum) values($1,$2)',[name,checksum]);await client.query('commit');}
      catch(e){await client.query('rollback');throw e;}
    }
  } finally {await client.query('select pg_advisory_unlock(724018601)');}
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  if(!process.env.DATABASE_URL)throw Error('DATABASE_URL required for migration role');
  const c=new pg.Client({connectionString:process.env.DATABASE_URL});await c.connect();try{await migrate(c);console.log('Migrations applied/verified');}finally{await c.end();}
}
