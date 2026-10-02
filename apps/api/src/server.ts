import {fileURLToPath} from 'node:url';
import {createReadPool,assertPublicReader} from './db/pool.ts';
import {createPublicServer} from './http/server.ts';
export async function start() {
  if(!process.env.DATABASE_URL)throw Error('DATABASE_URL for public reader required');
  const text=process.env.PORT??'3001';if(!/^\d+$/u.test(text)||Number(text)>65535)throw Error('PORT must be 0..65535');
  const pool=createReadPool(process.env.DATABASE_URL);
  try {
    await assertPublicReader(pool);const server=createPublicServer(pool,entry=>console.log(JSON.stringify(entry)));
    await new Promise<void>((resolve,reject)=>{server.once('error',reject);server.listen(Number(text),'127.0.0.1',resolve);});
    const address=server.address();console.log(JSON.stringify({event:'listening',address}));
    let stopping=false;const stop=()=>{if(stopping)return;stopping=true;server.close(()=>{void pool.end();});};
    process.once('SIGINT',stop);process.once('SIGTERM',stop);return {server,pool};
  }catch(e){await pool.end();throw e;}
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
  try{await start();}catch{console.error('Public read startup failed; verify database, migrations and bounded reader role');process.exitCode=1;}
}
