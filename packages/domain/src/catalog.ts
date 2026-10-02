export type VerificationState='unverified'|'partial'|'verified'|'disputed';
export type ReviewState='draft'|'pending'|'approved'|'rejected';
export type PublicationState='unpublished'|'published'|'withdrawn';
export const searchEntityOrder=['artist','route','place','event'] as const;
export function normalizeQuery(value:string):string {
  return value.normalize('NFKC').trim().replace(/\s+/gu,' ').toLowerCase();
}
export function publicEligible(state:{publication:string;review:string;visibility:string}):boolean {
  return state.publication==='published'&&state.review==='approved'&&state.visibility==='public';
}
