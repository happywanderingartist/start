import { z } from 'zod';
export const Id = z.uuid();
export const Verification = z.enum(['unverified','partial','verified','disputed']);
export const EntityType = z.enum(['artist','route','place','event']);
export const SearchInputSchema = z.strictObject({
  q: z.string().refine(s=>[...s].length<=120).default(''), cityId: Id.optional(),
  section: EntityType.optional(), limit:z.number().int().min(1).max(30).default(10),
  offset:z.number().int().min(0).max(1000).default(0),
}).refine(x=>x.section!==undefined || x.offset===0,'offset requires section');
export const City = z.strictObject({id:Id,name:z.string(),countryCode:z.string()});
export const ArtistIdentity = z.strictObject({id:Id,canonicalName:z.string(),artistType:z.string(),verification:Verification});
export const Media = z.strictObject({id:Id,objectKey:z.string(),mime:z.string(),width:z.number().int().positive(),height:z.number().int().positive()});
export const Source = z.strictObject({id:Id,sourceType:z.string(),title:z.string(),url:z.url({protocol:/^https?$/}).nullable(),excerpt:z.string().nullable(),observedAt:z.iso.datetime(),availability:z.enum(['available','unavailable','unknown']),lastCheckedAt:z.iso.datetime().nullable()});
export const Claim = z.strictObject({id:Id,statement:z.string(),verification:Verification,verifiedAt:z.iso.datetime().nullable(),caveat:z.string().nullable(),sources:z.array(Source)});
export const Relation = z.strictObject({id:Id,artist:ArtistIdentity,placeId:Id,relationType:z.string(),explanation:z.string(),verification:Verification,caveat:z.string().nullable(),claims:z.array(Claim),sources:z.array(Source)});
export const FootprintCity = z.strictObject({city:City,context:z.literal('footprint'),placeCount:z.number().int().nonnegative(),relations:z.array(z.strictObject({id:Id,verification:Verification}))});
const ArtistItem = z.strictObject({type:z.literal('artist'),...ArtistIdentity.shape,primaryMedia:Media.nullable(),footprintCities:z.array(FootprintCity),eventCities:z.array(City),routeCount:z.number().int().nonnegative(),matchedReasons:z.array(z.string())});
export const Metrics = z.strictObject({distanceMeters:z.number().nonnegative().nullable(),transportSeconds:z.number().nonnegative().nullable(),provider:z.string().nullable(),computedAt:z.iso.datetime().nullable(),coordinateSystem:z.enum(['gcj02','wgs84','bd09']).nullable()});
export const RouteItem = z.strictObject({type:z.literal('route'),id:Id,slug:z.string(),revisionId:Id,revisionNumber:z.number().int().positive(),title:z.string(),hero:Media.nullable(),artist:ArtistIdentity.nullable(),city:City,relationSummary:z.string(),whyWorthReplicating:z.string(),verificationSummary:Verification,stopCount:z.number().int().positive(),metrics:Metrics,matchedReasons:z.array(z.string())});
const PlaceItem = z.strictObject({type:z.literal('place'),id:Id,name:z.string(),city:City,verification:Verification,relatedArtists:z.array(ArtistIdentity),topVerifiedRelation:Relation.extend({verification:z.literal("verified")}).nullable(),relations:z.array(Relation),relatedRouteCount:z.number().int().nonnegative(),matchedReasons:z.array(z.string())});
const EventItem = z.strictObject({type:z.literal('event'),id:Id,title:z.string(),artists:z.array(ArtistIdentity),startsAt:z.iso.datetime(),endsAt:z.iso.datetime().nullable(),venue:z.strictObject({id:Id,name:z.string()}),city:City,state:z.enum(['upcoming','ongoing','ended','cancelled']),publication:z.literal('published'),verification:Verification,hero:Media.nullable(),matchedReasons:z.array(z.string())});
export const Items = {artist:ArtistItem,route:RouteItem,place:PlaceItem,event:EventItem};
const page=z.strictObject({limit:z.number().int().min(1).max(30),offset:z.number().int().min(0).max(1000),hasMore:z.boolean()});
const sectionFields={status:z.enum(['searched','not_requested','not_enabled']),page};
export const Section = z.discriminatedUnion('type',[
  z.strictObject({type:z.literal('artist'),items:z.array(ArtistItem),...sectionFields}),
  z.strictObject({type:z.literal('route'),items:z.array(RouteItem),...sectionFields}),
  z.strictObject({type:z.literal('place'),items:z.array(PlaceItem),...sectionFields}),
  z.strictObject({type:z.literal('event'),items:z.array(EventItem),...sectionFields}),
]);
export const Intent = z.strictObject({kind:z.enum(['artist','city','place','event','mixed','unknown']),resolvedIds:z.strictObject({artist:z.array(Id),city:z.array(Id),place:z.array(Id),event:z.array(Id)}),ambiguity:z.boolean(),primaryTarget:z.literal('artist_hub').nullable()});
export const SearchResponseSchema=z.strictObject({query:z.string(),mode:z.enum(['search','default']),intent:Intent,sections:z.array(Section).length(4),requestId:z.string()}).superRefine((x,ctx)=>{
  if(x.sections.map(s=>s.type).join(',')!=='artist,route,place,event')ctx.addIssue({code:'custom',message:'four ordered entity sections required'});
  if(x.sections.some(s=>s.items.length>s.page.limit))ctx.addIssue({code:'custom',message:'items exceed page limit'});
  if(x.sections.some(s=>s.status!=='searched' && (s.items.length>0||s.page.hasMore)))ctx.addIssue({code:'custom',message:'unrequested sections cannot contain results'});
});
export const ArtistHubSchema=z.strictObject({identity:ArtistIdentity,primaryMedia:Media.nullable(),footprintCities:z.array(FootprintCity),eventCities:z.array(City),recommendedRoutes:z.array(RouteItem),optionalEvents:z.array(EventItem),cityContext:City.nullable(),requestId:z.string()});
export const PlaceDetailSchema=z.strictObject({identity:z.strictObject({id:Id,name:z.string(),city:City,verification:Verification}),address:z.string().nullable(),coordinates:z.strictObject({longitude:z.number(),latitude:z.number(),system:z.enum(['gcj02','wgs84','bd09'])}).nullable(),practicalInfo:z.string().nullable(),media:Media.nullable(),artistRelations:z.array(Relation),claims:z.array(Claim),sources:z.array(Source),relatedRoutes:z.array(RouteItem),relatedArtists:z.array(ArtistIdentity),requestId:z.string()});
export const RouteStopSchema=z.strictObject({id:Id,placeId:Id,sequence:z.number().int().positive(),name:z.string(),address:z.string().nullable(),coordinates:z.strictObject({longitude:z.number(),latitude:z.number(),system:z.enum(['gcj02','wgs84','bd09'])}).nullable(),note:z.string(),stayMinutes:z.number().int().nonnegative().nullable(),placeVerification:Verification,relation:Relation.nullable(),claims:z.array(Claim),sources:z.array(Source)});
export const RouteDetailSchema=z.strictObject({...RouteItem.shape,shortStory:z.string(),summary:z.string(),publishedAt:z.iso.datetime(),frozenAt:z.iso.datetime(),stops:z.array(RouteStopSchema).min(1),claims:z.array(Claim),sources:z.array(Source),requestId:z.string()});
export const EventReadSchema=z.strictObject({...EventItem.shape,claims:z.array(Claim),sources:z.array(Source),requestId:z.string()});
export const ErrorSchema=z.strictObject({error:z.strictObject({code:z.enum(['INVALID_INPUT','NOT_FOUND','UNAVAILABLE','INTERNAL']),message:z.string(),retryable:z.boolean()}),requestId:z.string()});
export type SearchInput=z.infer<typeof SearchInputSchema>;
export type SearchResponseDTO=z.infer<typeof SearchResponseSchema>;
export type SearchItem=z.infer<typeof Items[keyof typeof Items]>;
