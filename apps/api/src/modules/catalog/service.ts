import type {Pool} from 'pg';
import {withReadSnapshot} from '../../db/pool.ts';
import {ArtistHubSchema,Items,PlaceDetailSchema,RouteDetailSchema,EventReadSchema,City} from '../../../../../packages/api-contracts/src/schemas.ts';
import {InvalidCityError} from '../discovery/service.ts';
export class NotFoundError extends Error {}
export class CatalogService {
  private pool:Pool;
  constructor(pool:Pool) {this.pool=pool;}
  async artist(id:string,cityId:string|undefined,requestId:string) {
    return withReadSnapshot(this.pool,async c=>{
      const row=(await c.query('SELECT data FROM start_public.artists WHERE id=$1',[id])).rows[0];
      if(!row)throw new NotFoundError();
      const a=Items.artist.parse(row.data);let cityContext=null;
      if(cityId){const city=(await c.query('SELECT data FROM start_public.cities WHERE id=$1',[cityId])).rows[0];if(!city)throw new InvalidCityError();cityContext=City.parse(city.data);}
      const routes=await c.query('SELECT data FROM start_public.routes WHERE $1=ANY(artist_ids) AND ($2::uuid IS NULL OR $2=ANY(city_ids)) ORDER BY id',[id,cityId??null]);
      const events=await c.query('SELECT data FROM start_public.events WHERE $1=ANY(artist_ids) AND ($2::uuid IS NULL OR $2=ANY(city_ids)) ORDER BY id',[id,cityId??null]);
      const {id:artistId,canonicalName,artistType,verification}=a;
      return ArtistHubSchema.parse({identity:{id:artistId,canonicalName,artistType,verification},primaryMedia:a.primaryMedia,footprintCities:a.footprintCities,eventCities:a.eventCities,recommendedRoutes:routes.rows.map(x=>Items.route.parse(x.data)),optionalEvents:events.rows.map(x=>Items.event.parse(x.data)),cityContext,requestId});
    });
  }
  async route(id:string,requestId:string) {
    return withReadSnapshot(this.pool,async c=>{
      const row=(await c.query('SELECT detail FROM start_public.routes WHERE id=$1',[id])).rows[0];if(!row)throw new NotFoundError();
      return RouteDetailSchema.parse({...row.detail,requestId});
    });
  }
  async place(id:string,requestId:string) {
    return withReadSnapshot(this.pool,async c=>{
      const row=(await c.query('SELECT data,address,coordinates,practical_info,media,claims,sources FROM start_public.places WHERE id=$1',[id])).rows[0];if(!row)throw new NotFoundError();
      const p=Items.place.parse(row.data);const routes=await c.query('SELECT data FROM start_public.routes WHERE $1=ANY(place_ids) ORDER BY id',[id]);
      return PlaceDetailSchema.parse({identity:{id:p.id,name:p.name,city:p.city,verification:p.verification},address:row.address,coordinates:row.coordinates,practicalInfo:row.practical_info,media:row.media,artistRelations:p.relations,claims:row.claims,sources:row.sources,relatedRoutes:routes.rows.map(x=>Items.route.parse(x.data)),relatedArtists:p.relatedArtists,requestId});
    });
  }
  async event(id:string,requestId:string) {
    return withReadSnapshot(this.pool,async c=>{
      const row=(await c.query('SELECT data,claims,sources FROM start_public.events WHERE id=$1',[id])).rows[0];if(!row)throw new NotFoundError();
      return EventReadSchema.parse({...row.data,claims:row.claims,sources:row.sources,requestId});
    });
  }
}
