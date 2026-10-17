export class AccountError extends Error {
  constructor(code,status,message){super(message);this.code=code;this.status=status;}
}
const invalid=()=>new AccountError('INVALID_PROFILE',400,'Invalid profile');
const object=value=>value!==null && typeof value==='object' && !Array.isArray(value);
export function validateProfilePatch(value){
  if(!object(value) || !Object.keys(value).length || Object.keys(value).some(key=>!['nickname','artists','interests','privacy'].includes(key))) throw invalid();
  const result={};
  for(const key of ['nickname','artists','interests']) if(Object.hasOwn(value,key)) {
    if(typeof value[key]!=='string') throw invalid();
    const text=value[key].trim();
    if([...text].length>(key==='nickname'?24:120) || (key==='nickname'&&!text)) throw invalid();
    result[key]=text;
  }
  if(Object.hasOwn(value,'privacy')) {
    const privacy=value.privacy;
    if(!object(privacy)||!Object.keys(privacy).length||Object.keys(privacy).some(key=>!['artists','interests','book'].includes(key)||typeof privacy[key]!=='boolean')) throw invalid();
    result.privacy={...privacy};
  }
  return result;
}
export function validateIdentity(identity){
  if(!object(identity)||typeof identity.provider!=='string'||! /^[a-z0-9][a-z0-9_-]{0,63}$/.test(identity.provider)||typeof identity.subject!=='string'||!identity.subject.trim()||identity.subject.length>255) throw new AccountError('UNAUTHENTICATED',401,'Authentication required');
  return {provider:identity.provider,subject:identity.subject};
}
// verifyBearer must be a server-owned adapter that validates an external session.
// No default test token, client owner ID or unverified JWT payload is accepted.
export function createAccountService({repository,verifyBearer}) {
  async function owner(authorization){
    if(typeof verifyBearer!=='function') throw new AccountError('AUTH_NOT_CONFIGURED',503,'Authentication not configured');
    if(typeof authorization!=='string'||authorization.length>8192||!/^Bearer [^\s]+$/i.test(authorization)) throw new AccountError('UNAUTHENTICATED',401,'Authentication required');
    let identity;
    try {identity=await verifyBearer(authorization.slice(7));}
    catch {throw new AccountError('AUTH_UNAVAILABLE',503,'Authentication unavailable');}
    return repository.resolveIdentity(validateIdentity(identity));
  }
  return {
    async read(authorization){return repository.read(await owner(authorization));},
    async update(authorization,value){const id=await owner(authorization);return repository.update(id,validateProfilePatch(value));}
  };
}
