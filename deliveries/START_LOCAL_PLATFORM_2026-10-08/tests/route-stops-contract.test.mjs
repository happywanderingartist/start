import test from 'node:test';
import assert from 'node:assert/strict';
import {parse} from '../src/contracts.mjs';
const artistId='11111111-1111-4111-8111-111111111111',placeId='22222222-2222-4222-8222-222222222222';
const base={name:'上海路线',city:'上海',artistId,source:'用户核对来源'};
const place={name:'新咖啡店',city:'上海',category:'咖啡',source:'原帖',poiId:'B_NEW',longitude:121.4,latitude:31.2,coordinateSystem:'gcj02',sameSpot:'MV机位'};
test('route submission accepts ordered existing and map-selected new stops',()=>{
 assert.deepEqual(parse('routeSubmission.create',{...base,stops:[{placeId},{place}]}).stops,[{placeId},{place}]);
});
test('route rejects ambiguous stop sources, duplicate POIs and incomplete coordinates',()=>{
 for(const value of [
  {...base,stops:[]},
  {...base,placeIds:[placeId],stops:[{placeId}]},
  {...base,stops:[{placeId,place}]},
  {...base,stops:[{place},{place}]},
  {...base,stops:[{place:{...place,latitude:undefined}}]},
 ])assert.throws(()=>parse('routeSubmission.create',value),e=>e.code==='INVALID_INPUT');
});
