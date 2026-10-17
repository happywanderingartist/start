import fs from 'node:fs/promises';
import {Pool} from './src/runtime.mjs';
import {createPlatform} from './src/platform.mjs';
import {createMedia} from './src/media.mjs';
import {createServer} from './src/http.mjs';
import {serveStatic} from './src/static.mjs';
import {createIntegrations} from './src/integrations.mjs';
import {createProfileRepository} from '../START_ACCOUNT_FOUNDATION_2026-10-05/src/profile-repository.mjs';
const pool=new Pool({host:'127.0.0.1',port:55435,user:'start_local',database:'start_acceptance',max:8});
await pool.query(await fs.readFile(new URL('../START_ACCOUNT_FOUNDATION_2026-10-05/db/001_accounts.sql',import.meta.url),'utf8'));
await pool.query(await fs.readFile(new URL('./db/001_platform.sql',import.meta.url),'utf8'));
const media=createMedia(pool,new URL('./data/media/',import.meta.url));
await media.cleanupDeletedOwners();
const server=createServer({app:createPlatform(pool),media,repository:createProfileRepository(pool),serveStatic,serveIntegrations:createIntegrations()});
server.listen(4330,'127.0.0.1',()=>console.log('START local API http://127.0.0.1:4330/api/status — writes disabled until a real provider is configured'));
async function shutdown(){server.closeAllConnections();server.close(async()=>{await pool.end();process.exit(0);});}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
