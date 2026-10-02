import type {Pool}from'pg';import{SearchInputSchema,SearchResponseSchema}from'../../../../../packages/api-contracts/src/schemas.ts';
import{normalizeQuery}from'../../../../../packages/domain/src/catalog.ts';import{withReadSnapshot}from'../../db/pool.ts';import{resolveIntent}from'./intent.ts';import type{SearchProvider}from'../../providers/search/contract.ts';import type{QueryClient}from'../../db/pool.ts';
export class DiscoveryService {
 pool:Pool;providerFactory:(db:QueryClient)=>SearchProvider;
 constructor(pool:Pool,providerFactory:(db:QueryClient)=>SearchProvider){this.pool=pool;this.providerFactory=providerFactory;}
 async searchPublic(input:unknown,requestId='test'){
  const x=SearchInputSchema.parse(input),q=normalizeQuery(x.q);
  return withReadSnapshot(this.pool,async c=>{
   if(x.cityId && !(await c.query('select id from start_public.cities where id=$1',[x.cityId])).rows.length)throw new InvalidCityError();
   const resolved=await resolveIntent(c,q);const provider=this.providerFactory(c);
   const groups=await provider.search({...x,normalizedQuery:q,resolvedIds:resolved.resolvedIds,residualTerms:resolved.residualTerms});
   return SearchResponseSchema.parse({query:x.q,mode:q?'search':'default',intent:resolved.intent,sections:[{type:'artist',...groups.artist},{type:'route',...groups.route},{type:'place',...groups.place},{type:'event',...groups.event}].map(s=>({type:s.type,status:x.section&&s.type!==x.section?'not_requested':'searched',items:s.items,page:{limit:x.limit,offset:x.offset,hasMore:s.hasMore}})),requestId});
  });
 }
}
export class InvalidCityError extends Error { constructor(){super('Unknown public city');} }
