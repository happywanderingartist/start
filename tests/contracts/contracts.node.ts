import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SearchInputSchema, SearchResponseSchema, Source,Items } from '../../packages/api-contracts/src/schemas.ts';

test('search rejects route-only and unknown result types, rather than silently accepting a broken public contract', () => {
  assert.equal(SearchResponseSchema.safeParse({query:'南京',sections:[{type:'route',items:[]}],requestId:'request'}).success,false);
  assert.equal(SearchResponseSchema.safeParse({query:'南京',sections:[{type:'user',items:[]}],requestId:'request'}).success,false);
});
test('evidence links reject executable schemes before a client renders them',()=>{
  const s={id:'11111111-1111-4111-8111-111111111111',sourceType:'media',title:'source',url:'javascript:alert(1)',excerpt:null,observedAt:'2026-10-02T00:00:00Z',availability:'available',lastCheckedAt:null};
  assert.equal(Source.safeParse(s).success,false);
  for(const url of ['data:text/html,x','file:///C:/secret','not-a-url',''])assert.equal(Source.safeParse({...s,url}).success,false);
  assert.equal(Source.safeParse({...s,url:'https://example.com/evidence'}).success,true);
});
test('a top verified place relation cannot relabel unverified, partial or disputed evidence',()=>{
  const artist={id:'11111111-1111-4111-8111-111111111111',canonicalName:'Test',artistType:'band',verification:'verified'};
  const relation={id:'22222222-2222-4222-8222-222222222222',artist,placeId:'33333333-3333-4333-8333-333333333333',relationType:'location',explanation:'claim',verification:'verified',caveat:null,claims:[],sources:[]};
  const item={type:'place',id:relation.placeId,name:'Test',city:{id:'44444444-4444-4444-8444-444444444444',name:'Test',countryCode:'CN'},verification:'verified',relatedArtists:[artist],topVerifiedRelation:relation,relations:[relation],relatedRouteCount:0,matchedReasons:[]};
  assert.equal(Items.place.safeParse(item).success,true);
  for(const verification of ['unverified','partial','disputed'])assert.equal(Items.place.safeParse({...item,topVerifiedRelation:{...relation,verification}}).success,false);
  assert.equal(Items.place.safeParse({...item,topVerifiedRelation:null}).success,true);
});
test('search input rejects invalid pagination, UUID filters and Unicode overlength before reaching providers', () => {
  for (const value of [{q:'a'.repeat(121)},{q:'x',limit:0},{q:'x',offset:1},{q:'x',cityId:'南京'},{q:'x',section:'user'}]) {
    assert.equal(SearchInputSchema.safeParse(value).success,false,JSON.stringify(value));
  }
});
const emptyResponse={query:'台北',mode:'search',intent:{kind:'city',resolvedIds:{artist:[],city:[],place:[],event:[]},ambiguity:false,primaryTarget:null},sections:['artist','route','place','event'].map(type=>({type,status:'searched',items:[],page:{limit:10,offset:0,hasMore:false}})),requestId:'test'};
test('all four searched empty groups are legal; duplicate groups, private fields and fake unrequested results are rejected',()=>{
  assert.equal(SearchResponseSchema.safeParse(emptyResponse).success,true);
  assert.equal(SearchResponseSchema.safeParse({...emptyResponse,privateReviewer:'secret'}).success,false);
  const duplicate=structuredClone(emptyResponse);duplicate.sections[3].type='artist';assert.equal(SearchResponseSchema.safeParse(duplicate).success,false);
  const fabricated=structuredClone(emptyResponse);fabricated.sections[0].status='not_requested';fabricated.sections[0].page.hasMore=true;assert.equal(SearchResponseSchema.safeParse(fabricated).success,false);
});
test('Unicode limit counts codepoints, allows 120 emoji and rejects 121; independent section pagination stays available',()=>{
  assert.equal(SearchInputSchema.safeParse({q:'😀'.repeat(120)}).success,true);
  assert.equal(SearchInputSchema.safeParse({q:'😀'.repeat(121)}).success,false);
  assert.equal(SearchInputSchema.safeParse({q:'台北',section:'place',offset:10,limit:10}).success,true);
});
