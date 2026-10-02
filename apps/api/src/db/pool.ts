import pg from 'pg';import type {Pool,PoolClient,Client}from'pg';
export type QueryClient=Pick<Client,'query'>;
export function createReadPool(connectionString:string):Pool {
 const pool=new pg.Pool({connectionString,max:10,connectionTimeoutMillis:2000,idleTimeoutMillis:10000,application_name:'start-public-read'});
 pool.on('error',()=>console.error('Public read idle connection unavailable'));
 return pool;
}
export async function withReadSnapshot<T>(pool:Pool,fn:(c:PoolClient)=>Promise<T>):Promise<T>{
 const c=await pool.connect();try{await c.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');await c.query("SET LOCAL statement_timeout='3000ms'; SET LOCAL TIME ZONE 'UTC'");const result=await fn(c);await c.query('commit');return result;}
 catch(e){try{await c.query('rollback');}catch{/* Original connection error owns the response. */}throw e;}finally{c.release();}
}
export async function assertPublicReader(pool:Pool):Promise<void> {
 const c=await pool.connect();try{
  const r=await c.query(`SELECT current_user AS name,rolsuper,rolcreatedb,rolcreaterole,rolreplication,rolbypassrls,
    EXISTS(SELECT FROM pg_auth_members WHERE member=r.oid) AS member,
    has_schema_privilege(current_user,'start_catalog','USAGE') AS raw_usage,
    has_database_privilege(current_user,current_database(),'CREATE') AS create_schema,
    EXISTS(SELECT FROM pg_class t JOIN pg_namespace n ON n.oid=t.relnamespace WHERE n.nspname='start_catalog' AND t.relkind IN ('r','p') AND has_table_privilege(current_user,t.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')) AS raw_privilege
    FROM pg_roles r WHERE rolname=current_user`);
  const x=r.rows[0];if(!x||x.name!=='start_public_reader'||['rolsuper','rolcreatedb','rolcreaterole','rolreplication','rolbypassrls','member','raw_usage','create_schema','raw_privilege'].some(k=>x[k]))throw Error('A bounded public read role is required');
 }finally{c.release();}
}
