import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from '../src/http.mjs';
test('extraction accepts a verified member but rejects missing identity',async()=>{
 let calls=0;
 const server=createServer({repository:{resolveIdentity:async()=> 'member'},verifyBearer:async()=>({provider:'test',subject:'local-test-member'}),app:{privateQuery:async(actor,section)=>{assert.equal(actor.id,'member');assert.equal(section,'profile');return {};},adminQuery:()=>{throw Error('must not require admin');}},serveIntegrations:async(req,res)=>{calls++;res.writeHead(200,{'content-type':'application/json'});res.end('{"items":[]}');return true;}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try {const url=`http://127.0.0.1:${server.address().port}/api/extract/places`;
 assert.equal((await fetch(url,{method:'POST'})).status,401);assert.equal(calls,0);
 assert.equal((await fetch(url,{method:'POST',headers:{authorization:'Bearer test-only'}})).status,200);assert.equal(calls,1);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
