import pg from 'pg';import type {Pool,PoolClient,Client}from'pg';
export type QueryClient=Pick<Client,'query'>;
export function createReadPool(connectionString:string):Pool {
 return new pg.Pool({connectionString,max:10,connectionTimeoutMillis:2000,idleTimeoutMillis:10000,application_name:'start-public-read'});
}
export async function withReadSnapshot<T>(pool:Pool,fn:(c:PoolClient)=>Promise<T>):Promise<T>{
 const c=await pool.connect();try{await c.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');await c.query("SET LOCAL statement_timeout='3000ms'; SET LOCAL TIME ZONE 'UTC'");const result=await fn(c);await c.query('commit');return result;}
 catch(e){try{await c.query('rollback');}catch{/* Original connection error owns the response. */}throw e;}finally{c.release();}
}
