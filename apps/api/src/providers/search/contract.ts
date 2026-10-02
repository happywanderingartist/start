import type { SearchInput,SearchItem } from '../../../../../packages/api-contracts/src/schemas.ts';
export type EntityType='artist'|'route'|'place'|'event';
export type SearchReadInput=SearchInput & {normalizedQuery:string;resolvedIds:Record<EntityType|'city',string[]>;residualTerms:string[]};
export type SearchReadResponse={[T in EntityType]:{items:Extract<SearchItem,{type:T}>[];hasMore:boolean}};
export interface SearchProvider { search(input:SearchReadInput):Promise<SearchReadResponse>; }
