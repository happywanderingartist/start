import {spawn,spawnSync} from 'node:child_process';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {testConfig} from '../../tests/db-config.ts';
import {ids} from '../../tests/fixtures/catalog.ts';
import {SearchResponseSchema,ArtistHubSchema,RouteDetailSchema,PlaceDetailSchema,EventReadSchema} from '../../dist/api/packages/api-contracts/src/schemas.js';
const x=testConfig('start_public_reader'),connection=`postgresql://start_public_reader@${x.host}:${x.port}/${x.database}`;
const child=spawn(process.execPath,['dist/api/apps/api/src/server.js'],{env:{...process.env,DATABASE_URL:connection,PORT:'0'},stdio:['ignore','pipe','pipe'],windowsHide:true});
let output='',errors='';child.stderr.on('data',b=>errors+=b);child.stdout.on('data',b=>output+=b);
try {
 const address=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Compiled server startup timeout')),10000);child.on('exit',code=>{clearTimeout(timer);reject(Error('Compiled server startup exit '+code));});child.stdout.on('data',()=>{for(const line of output.split('\n')){try{const data=JSON.parse(line);if(data.event==='listening'){clearTimeout(timer);resolve(data.address);return;}}catch{}}});});
 const base=`http://127.0.0.1:${address.port}/api/v1`,results=[];
 for(const [path,schema] of [['/search?q='+encodeURIComponent('台北'),SearchResponseSchema],['/artists/'+ids.artist,ArtistHubSchema],['/routes/'+ids.route,RouteDetailSchema],['/places/'+ids.bookstore,PlaceDetailSchema],['/events/'+ids.event,EventReadSchema]]){const r=await fetch(base+path);assert.equal(r.status,200);schema.parse(await r.json());results.push({path,status:r.status,schema:true});}
 const wrong=spawnSync(process.execPath,['dist/api/apps/api/src/server.js'],{env:{...process.env,DATABASE_URL:`postgresql://postgres@${x.host}:${x.port}/${x.database}`,PORT:'0'},encoding:'utf8',timeout:10000,windowsHide:true});assert.equal(wrong.status,1);assert.doesNotMatch(wrong.stderr,/postgresql:|SELECT|stack/);
 assert.equal(errors,'');await fs.writeFile('.context/compiled-smoke.json',JSON.stringify({at:new Date().toISOString(),database:x.database,results,ownerRejected:true},null,2));console.log('Compiled API: five real PG reads/schema checks and owner startup rejection passed');
}finally{child.kill('SIGTERM');await new Promise(r=>child.exitCode!==null?r():child.once('exit',r));}
