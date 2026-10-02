import {test} from 'node:test';
import assert from 'node:assert/strict';
import {testConfig} from '../db-config.ts';
import {normalizeQuery,searchEntityOrder} from '../../packages/domain/src/catalog.ts';
test('test writes require an explicit local start_test_ database and never reach a production name',()=>{
 for(const url of ['postgresql://postgres@example.com/start_test_x','postgresql://postgres@127.0.0.1/start','postgresql://postgres@127.0.0.1/postgres'])assert.throws(()=>testConfig('postgres',url));
 const x=testConfig('start_public_reader','postgresql://postgres@127.0.0.1:55432/start_test_fresh');assert.equal(x.database,'start_test_fresh');assert.equal(x.user,'start_public_reader');
});
test('normalization preserves unknown residual words and product order stays independent of entity scores',()=>{
 assert.equal(normalizeQuery(' ＳＯＤＡＧＲＥＥＮ\t 台北 '),'sodagreen 台北');assert.equal(normalizeQuery('和声旅行者活动室'),'和声旅行者活动室');assert.deepEqual(searchEntityOrder,['artist','route','place','event']);
});
