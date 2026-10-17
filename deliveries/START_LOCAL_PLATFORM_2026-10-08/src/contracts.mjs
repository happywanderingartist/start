import {z} from './runtime.mjs';
const id=z.uuid(),text=z.string().trim().min(1).max(200),source=z.string().trim().min(1).max(3500);
const meta={id:id.optional(),version:z.number().int().positive().optional()};
const place={name:text,city:text,category:z.enum(['美食','咖啡','娱乐','景点','书店','其他']),source,poiId:z.string().trim().min(1).max(100).optional(),address:z.string().max(500).optional(),longitude:z.number().min(-180).max(180).optional(),latitude:z.number().min(-90).max(90).optional(),coordinateSystem:z.literal('gcj02').optional(),description:z.string().max(3500).optional(),mediaIds:z.array(id).max(9).optional()};
const artistEvidence=z.object({artistId:id,source,sameSpot:z.string().max(3500).default('')}).strict();
const coordinates=s=>s.refine(v=>[v.longitude,v.latitude,v.coordinateSystem].every(x=>x===undefined)||[v.longitude,v.latitude,v.coordinateSystem].every(x=>x!==undefined),'Incomplete coordinates');
const routeStop=z.union([
 z.object({placeId:id}).strict(),
 z.object({place:coordinates(z.object({...place,poiId:z.string().trim().min(1).max(100),longitude:z.number().min(-180).max(180),latitude:z.number().min(-90).max(90),coordinateSystem:z.literal('gcj02'),sameSpot:z.string().max(3500).optional()}).strict())}).strict(),
]);
const decision={id,decision:z.enum(['approve','reject']),reason:z.string().trim().min(1).max(1000).optional()};
export const schemas={
 'artist.save':z.object({...meta,name:text,genres:z.array(text).max(20).default([]),mediaIds:z.array(id).max(9).optional()}).strict(),
 'place.save':coordinates(z.object({...meta,...place,artistEvidence:artistEvidence.optional()}).strict()),
 'import.places':z.object({items:z.array(coordinates(z.object({...place,artistEvidence:artistEvidence.optional()}).strict())).min(1).max(30)}).strict(),
 'route.save':z.object({...meta,name:text,city:text,artistId:id,placeIds:z.array(id).min(1).max(100).refine(v=>new Set(v).size===v.length),source,description:z.string().max(3500).optional(),mediaIds:z.array(id).max(9).optional()}).strict(),
 'routeSubmission.create':z.object({name:text,city:text,artistId:id,placeIds:z.array(id).min(1).max(100).refine(v=>new Set(v).size===v.length).optional(),stops:z.array(routeStop).min(1).max(30).optional(),source,description:z.string().max(3500).optional(),mediaIds:z.array(id).max(9).optional()}).strict().refine(v=>Boolean(v.placeIds)!==Boolean(v.stops),'Choose one stop format').refine(v=>!v.stops||new Set(v.stops.map(s=>s.placeId?'id:'+s.placeId:'poi:'+s.place.poiId)).size===v.stops.length,'Duplicate stops'),
 'correction.create':z.object({id,version:z.number().int().positive(),kind:z.enum(['artist','place','route','event']),data:z.record(z.string(),z.unknown())}).strict(),
 'correction.review':z.object({...decision,checked:z.boolean().optional()}).strict(),
 'home.configure':z.object({ids:z.array(id).max(30).refine(v=>new Set(v).size===v.length)}).strict(),
 'event.save':z.object({...meta,name:text,city:text,artistIds:z.array(id).min(1).max(50),placeId:id,startsAt:z.iso.datetime(),timeZone:z.literal('Asia/Shanghai'),status:z.enum(['upcoming','ongoing','cancelled','ended']),source,mediaIds:z.array(id).max(9).optional()}).strict(),
 'content.publish':z.object({id,version:z.number().int().positive()}).strict(),
 'content.withdraw':z.object({id}).strict(),
 'content.restore':z.object({id,fromVersion:z.number().int().positive(),version:z.number().int().positive()}).strict(),
 'profile.update':z.object({nickname:z.string().trim().min(1).max(24).optional(),artists:z.string().max(120).optional(),interests:z.string().max(120).optional(),privacy:z.object({artists:z.boolean().optional(),interests:z.boolean().optional(),book:z.boolean().optional()}).strict().optional()}).strict(),
 'submission.create':coordinates(z.object({...place,artistId:id,sameSpot:z.string().max(3500).optional()}).strict()),
 'submission.review':z.object({...decision,checked:z.boolean().optional()}).strict(),
 'submission.resubmit':z.object({id,source}).strict(),
 'community.apply':z.object({artistId:id,name:text,description:z.string().max(2000).default('')}).strict(),
 'community.review':z.object(decision).strict(),
 'community.join':z.object({id,status:z.enum(['joined','followed','removed']).default('joined')}).strict(),
 'community.edit':z.object({id,description:z.string().max(2000).optional(),notice:z.string().max(3500).optional()}).strict(),
 'community.member':z.object({id,userId:id,status:z.enum(['joined','removed'])}).strict(),
 'community.request':z.object({id,kind:z.enum(['transfer','dissolve','change']),targetUserId:id.optional(),description:source}).strict(),
 'community.request.review':z.object(decision).strict(),
 'listing.create':z.object({communityId:id,artistId:id,eventId:id.optional(),placeId:id.optional(),name:text,description:z.string().max(3500).default(''),status:z.literal('available'),meeting:z.string().max(1000).optional(),mediaIds:z.array(id).max(9).optional()}).strict(),
 'listing.status':z.object({id,status:z.enum(['available','withdrawn'])}).strict(),
 'listing.edit':z.object({id,name:text,description:z.string().max(3500),mediaIds:z.array(id).max(9).optional()}).strict(),
 'listing.comment':z.object({listingId:id,text:z.string().trim().min(1).max(1000)}).strict(),
 'listing.comment.delete':z.object({id}).strict(),
 'exchange.apply':z.object({listingId:id}).strict(),
 'exchange.accept':z.object({id}).strict(),
 'exchange.withdraw':z.object({id}).strict(),
 'checkin.create':z.object({placeId:id,at:z.iso.datetime(),text:z.string().max(3500).default(''),mediaIds:z.array(id).max(9).default([]),ticket:z.object({title:text,note:z.string().max(1000).optional()}).strict().optional()}).strict(),
 'checkin.delete':z.object({id}).strict(),
 'share.create':z.object({ids:z.array(id).min(1).max(30).refine(v=>new Set(v).size===v.length),fields:z.array(z.enum(['snapshot','at','text','ticket','media_ids'])).min(1).max(5).refine(v=>new Set(v).size===v.length)}).strict(),
 'share.revoke':z.object({id}).strict(),
 'doll.choose':z.object({character:z.enum(['boy','girl'])}).strict(),
 'doll.style':z.object({outfit:z.enum(['original','outfit2','outfit3','outfit4','outfit5']).optional(),expression:z.enum(['neutral','smile','sad','surprised']).optional()}).strict(),
 'favorite.set':z.object({id,enabled:z.boolean()}).strict(),
 'notification.read':z.object({id}).strict(),
 'account.delete':z.object({confirm:z.literal(true)}).strict(),
};
export class PlatformError extends Error {constructor(code,status=400){super(code);this.code=code;this.status=status;}}
export function fail(code,status=400){throw new PlatformError(code,status);}
export function parse(op,value){const r=schemas[op]?.safeParse(value);if(!r?.success)fail('INVALID_INPUT');return r.data;}
export function uuid(value){if(!id.safeParse(value).success)fail('INVALID_INPUT');return value;}
