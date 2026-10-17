import test from 'node:test';import assert from 'node:assert/strict';
import '../deliveries/START_DOLL_IMPLEMENTATION_2026-10-05/prototype/doll-state.js';
const S=globalThis.DollState;
test('invalid restored config does not enter the UI',()=>{assert.equal(S.restore('{broken'),null);assert.equal(S.restore(JSON.stringify({version:1,character:'alien'})),null)});
test('selection preserves source and rejects unknown assets',()=>{const a=S.create();const b=S.select(a,'outfit','campus');assert.equal(a.outfit,'original');assert.equal(b.outfit,'campus');assert.throws(()=>S.select(a,'outfit','missing'))});
test('boy cannot use girl outfits',()=>{const b=S.select(S.create(),'character','boy');assert.throws(()=>S.select(b,'outfit','campus'));assert.equal(b.outfit,'original')});
test('unsupported combinations reset explicitly',()=>{let a=S.select(S.create(),'outfit','campus');a=S.select(a,'expression','curious');assert.equal(a.outfit,'original');a=S.select(a,'outfit','stage');assert.equal(a.expression,'default')});
test('only valid serializable selection persists',()=>{const a=S.select(S.create(),'accessory','camera');assert.deepEqual(S.restore(JSON.stringify(a)),a);assert.throws(()=>S.select(a,'accessory','unknown'))});
