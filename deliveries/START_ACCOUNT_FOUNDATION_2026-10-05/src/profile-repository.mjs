import {randomUUID} from 'node:crypto';
import {AccountError,validateIdentity,validateProfilePatch} from './accounts.mjs';

// Backend-only repository. Never expose pool credentials or this module to browsers.
export function createProfileRepository(pool){
  async function transaction(work){
    const client=await pool.connect();
    try {await client.query('BEGIN');const value=await work(client);await client.query('COMMIT');return value;}
    catch(error){await client.query('ROLLBACK');throw error;}
    finally {client.release();}
  }
  async function active(client,id,lock=false){
    const {rows}=await client.query(`SELECT status FROM start_accounts.users WHERE id=$1${lock?' FOR UPDATE':''}`,[id]);
    if(rows[0]?.status!=='active') throw new AccountError('ACCOUNT_UNAVAILABLE',403,'Account unavailable');
  }
  async function read(client,id){
    const {rows}=await client.query('SELECT nickname,artists,interests,privacy FROM start_accounts.profiles WHERE user_id=$1',[id]);
    if(!rows[0]) throw new AccountError('PROFILE_UNAVAILABLE',404,'Profile unavailable');
    return rows[0];
  }
  return {
    async resolveIdentity(value){
      const {provider,subject}=validateIdentity(value);
      return transaction(async client=>{
        // Serialize creation for the same provider/subject; avoid orphan users on races.
        await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[JSON.stringify([provider,subject])]);
        const {rows}=await client.query('SELECT user_id FROM start_accounts.auth_identities WHERE provider=$1 AND subject=$2',[provider,subject]);
        if(rows[0]) {await active(client,rows[0].user_id);return rows[0].user_id;}
        const id=randomUUID();
        await client.query('INSERT INTO start_accounts.users(id) VALUES($1)',[id]);
        await client.query('INSERT INTO start_accounts.auth_identities(provider,subject,user_id) VALUES($1,$2,$3)',[provider,subject,id]);
        await client.query('INSERT INTO start_accounts.profiles(user_id) VALUES($1)',[id]);
        return id;
      });
    },
    async read(id){return transaction(async client=>{await active(client,id,true);return read(client,id);});},
    async update(id,value){
      const patch=validateProfilePatch(value);
      return transaction(async client=>{
        await active(client,id,true);
        const current=await read(client,id);
        const next={...current,...patch,privacy:{...current.privacy,...patch.privacy}};
        await client.query('UPDATE start_accounts.profiles SET nickname=$2,artists=$3,interests=$4,privacy=$5,updated_at=now() WHERE user_id=$1',[id,next.nickname,next.artists,next.interests,JSON.stringify(next.privacy)]);
        return next;
      });
    }
  };
}
