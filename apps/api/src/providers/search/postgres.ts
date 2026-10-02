import{z}from'zod';import{normalizeQuery}from'../../../../../packages/domain/src/catalog.ts';import{Items}from'../../../../../packages/api-contracts/src/schemas.ts';import type{QueryClient}from'../../db/pool.ts';import type{EntityType,SearchProvider,SearchReadInput,SearchReadResponse}from'./contract.ts';
const views={artist:'artists',route:'routes',place:'places',event:'events'}as const;
function projection(type:EntityType){
 const places=type==='artist'?"ARRAY(SELECT p.id FROM start_public.places p WHERE v.id=ANY(p.artist_ids))":'v.place_ids';
 const events=type==='event'?'ARRAY[v.id]::uuid[]':type==='artist'?"ARRAY(SELECT e.id FROM start_public.events e WHERE v.id=ANY(e.artist_ids))":type==='place'?"ARRAY(SELECT e.id FROM start_public.events e WHERE v.id=ANY(e.place_ids))":"ARRAY(SELECT e.id FROM start_public.events e WHERE e.artist_ids&&v.artist_ids AND e.city_ids&&v.city_ids)";
 return {places,events};
}
export function candidateQuery(type:EntityType):string{
 const p=projection(type);
 const exactAlias=type==='artist'?"OR EXISTS(SELECT FROM start_public.aliases a WHERE a.artist_id=v.id AND lower(normalize(a.alias,NFKC))=$1)":'';
 const doc=`lower(normalize(concat_ws(' ',v.name,v.data->>'whyWorthReplicating',v.data->>'relationSummary', (SELECT string_agg(c.name,' ') FROM start_public.cities c WHERE c.id=ANY(v.city_ids)),(SELECT string_agg(a.name,' ') FROM start_public.artists a WHERE a.id=ANY(v.artist_ids)),(SELECT string_agg(r.value->>'explanation',' ') FROM jsonb_array_elements(coalesce(v.data->'relations','[]')) r),(SELECT string_agg(p.name,' ') FROM start_public.places p WHERE p.id=ANY(${p.places})),(SELECT string_agg(e.name,' ') FROM start_public.events e WHERE e.id=ANY(${p.events}))),NFKC))`;
 return `SELECT v.data,v.name FROM start_public.${views[type]} v WHERE
 ($2::uuid[]='{}' OR v.artist_ids&&$2::uuid[]) AND ($3::uuid[]='{}' OR v.city_ids&&$3::uuid[]) AND
 ($4::uuid[]='{}' OR ${p.places}&&$4::uuid[]) AND ($5::uuid[]='{}' OR ${p.events}&&$5::uuid[]) AND
 ($6::uuid IS NULL OR $6::uuid=ANY(v.city_ids)) AND NOT EXISTS(SELECT FROM unnest($7::text[]) term WHERE strpos(${doc},term)=0)
 ORDER BY CASE WHEN lower(normalize(v.name,NFKC))=$1 ${exactAlias} THEN 0 WHEN cardinality($2::uuid[])+cardinality($3::uuid[])+cardinality($4::uuid[])+cardinality($5::uuid[])>0 THEN 1 WHEN starts_with(lower(normalize(v.name,NFKC)),$1) AND $1<>'' THEN 2 ELSE 3 END,v.id
 LIMIT $8 OFFSET $9`;
}
export class PostgresSearchProvider implements SearchProvider {
 db:QueryClient;constructor(db:QueryClient){this.db=db;}
 private async section<T>(type:EntityType,schema:z.ZodType<T>,x:SearchReadInput):Promise<{items:T[];hasMore:boolean}>{
  if(x.section&&x.section!==type)return{items:[],hasMore:false};
  const r=await this.db.query(candidateQuery(type),[x.normalizedQuery,x.resolvedIds.artist,x.resolvedIds.city,x.resolvedIds.place,x.resolvedIds.event,x.cityId??null,x.residualTerms,x.limit+1,x.offset]);
  const items=r.rows.slice(0,x.limit).map(row=>{
   const name=normalizeQuery(z.string().parse(row.name));const reasons:string[]=[];
   if(!x.normalizedQuery)reasons.push('catalog_default');
   else {if(name===x.normalizedQuery)reasons.push('name_exact');else if(name.startsWith(x.normalizedQuery))reasons.push('name_prefix');
    if(x.resolvedIds.artist.length)reasons.push('registered_artist_or_alias');if(x.resolvedIds.city.length||x.cityId)reasons.push('city_context');if(x.resolvedIds.place.length)reasons.push('place_context');if(x.resolvedIds.event.length)reasons.push('event_context');if(x.residualTerms.length)reasons.push('literal_terms');}
   return schema.parse({...row.data,matchedReasons:reasons});
  });
  return{items,hasMore:r.rows.length>x.limit};
 }
 async search(x:SearchReadInput):Promise<SearchReadResponse>{return{artist:await this.section('artist',Items.artist,x),route:await this.section('route',Items.route,x),place:await this.section('place',Items.place,x),event:await this.section('event',Items.event,x)};}
}
