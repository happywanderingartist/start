import type {SearchResponseDTO} from '../../packages/api-contracts/src/schemas.ts';
import type {SearchReadResponse} from '../../apps/api/src/providers/search/contract.ts';
// Compilation must narrow to artist items and reject assigning route candidates to artist.
export function contractConsumer(response:SearchResponseDTO,provider:SearchReadResponse):void {
  for(const section of response.sections)if(section.type==='artist')for(const item of section.items)void item.canonicalName;
  // @ts-expect-error route candidates must never be assignable to artist candidates
  provider.artist.items=provider.route.items;
}
