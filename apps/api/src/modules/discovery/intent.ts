import{z}from'zod';import{normalizeQuery}from'../../../../../packages/domain/src/catalog.ts';import type{QueryClient}from'../../db/pool.ts';
const Name=z.strictObject({type:z.enum(['artist','city','place','event']),id:z.uuid(),name:z.string()});
export async function resolveIntent(c:QueryClient,q:string){
 const result=await c.query("SELECT 'artist' AS type,id,name FROM start_public.artists UNION SELECT 'artist',artist_id,alias FROM start_public.aliases UNION SELECT 'city',id,name FROM start_public.cities UNION SELECT 'place',id,name FROM start_public.places UNION SELECT 'event',id,name FROM start_public.events");
 const names=result.rows.map(x=>{const n=Name.parse(x);return{...n,name:normalizeQuery(n.name)};}).filter(n=>n.name.length>0);
 const resolvedIds:Record<'artist'|'city'|'place'|'event',string[]>={artist:[],city:[],place:[],event:[]};
 let residual=q;const order=['artist','city','place','event'];
 const exact=names.filter(n=>n.name===q);const preferred=order.find(type=>exact.some(n=>n.type===type));
 const matches=preferred?exact.filter(n=>n.type===preferred):names.filter(n=>q.includes(n.name));
 for(const text of [...new Set(matches.map(n=>n.name))].sort((a,b)=>b.length-a.length||a.localeCompare(b))){
  if(!residual.includes(text))continue;
  for(const n of matches.filter(n=>n.name===text))resolvedIds[n.type].push(n.id);
  residual=residual.replaceAll(text,' ');
 }
 for(const type of ['artist','city','place','event']as const)resolvedIds[type]=[...new Set(resolvedIds[type])].sort();
 // Only complete intervening segments are grammar; never mutate an unknown word.
 residual=residual.split(/\s+/u).filter(t=>! /^(?:我想去|想去|我想|看看|路线|足迹|旅行|活动|的|和|与|在|去)+$/u.test(t)).join(' ');
 const residualTerms=residual.trim().split(/\s+/u).filter(Boolean);const kinds=order.filter(t=>resolvedIds[t as keyof typeof resolvedIds].length>0);
 if(q&&kinds.length===0&&residualTerms.length===0)residualTerms.push(q);
 const kind=kinds.length>1?'mixed':kinds[0]??'unknown';
 return {resolvedIds,residualTerms,intent:{kind, resolvedIds,ambiguity:Object.values(resolvedIds).some(x=>x.length>1),primaryTarget:resolvedIds.artist.length&&residualTerms.length===0?'artist_hub':null}};
}
