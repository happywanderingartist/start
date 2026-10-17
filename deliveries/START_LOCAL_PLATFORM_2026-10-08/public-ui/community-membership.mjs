// Pending writes survive route changes, while views always re-read account state.
const pending=new Map();

export function mountCommunityMembership(root,catalog,api,communityId){
 const section=document.createElement('section');section.className='private-section membership-section';
 section.setAttribute('aria-label',communityId?'社群成员状态':'我的社群');
 root.querySelector('h1').after(section);
 if(!communityId){const heading=document.createElement('h2');heading.textContent='我的社群';section.append(heading);}
 const body=document.createElement('div');section.append(body);
 const feedback=document.createElement('p');feedback.setAttribute('role','status');feedback.className='public-badge';section.append(feedback);
 let disposed=false,revision=0,memberships=[];
 function message(text){feedback.textContent=text;}
 function button(text,action){const b=document.createElement('button');b.type='button';b.className='secondary';b.textContent=text;b.onclick=action;body.append(b);return b;}
 function showError(error,read){
  body.replaceChildren();
  const auth=error.code==='AUTH_NOT_CONFIGURED'?'身份服务尚未接入，暂时不能加入社群。':error.status===401?'登录后可以加入社群。':error.status===403?'当前账号不能操作此社群。':error.status===404?'社群已关闭或不存在。':'';
  message(auth||(read?'暂时无法读取成员状态。':'操作未成功，请重试。'));
  if(!auth)button('重试成员状态',load);
 }
 function paint(){
  body.replaceChildren();
  if(!communityId){
   const joined=memberships.filter(m=>m.status==='joined').map(m=>catalog.communities.find(c=>c.id===m.community_id)).filter(Boolean);
   for(const community of joined){const a=document.createElement('a');a.className='inline-link';a.href='#/community/'+encodeURIComponent(community.id);a.textContent=community.name+' ›';body.append(a);}
   if(!joined.length)message('还没有加入社群');else message('');
   return;
  }
  const joined=memberships.some(m=>m.community_id===communityId&&m.status==='joined');
  const b=button(joined?'退出社群':'加入社群',()=>change(joined?'removed':'joined',b));
  b.dataset.membershipAction='';b.className=joined?'secondary':'primary';
 }
 async function load(){
  const current=++revision;body.replaceChildren();message('正在读取成员状态…');
  // A navigation during a write must not display its earlier server snapshot.
  await Promise.allSettled([...pending.values()]);
  if(disposed||current!==revision)return;
  try{
   const value=await api.me('memberships');if(disposed||current!==revision)return;
   if(!Array.isArray(value))throw Error('INVALID_RESPONSE');memberships=value;message('');paint();
  }catch(error){if(!disposed&&current===revision)showError(error,true);}
 }
 async function change(status,b){
  if(b.disabled||pending.has(communityId))return;
  b.disabled=true;section.dataset.membershipBusy='true';message(status==='joined'?'正在加入…':'正在退出…');
  const operation=api.command('community.join',{id:communityId,status});pending.set(communityId,operation);
  try{
   const result=await operation;
   if(disposed)return;
   if(result.id!==communityId||result.status!==status)throw Error('INVALID_RESPONSE');
   memberships=memberships.filter(m=>m.community_id!==communityId);
   if(status==='joined')memberships.push({community_id:communityId,status});
   paint();message(status==='joined'?'已加入社群。':'已退出社群。');body.querySelector('button')?.focus({preventScroll:true});
  }catch(error){
   if(disposed)return;
   if(error.code==='AUTH_NOT_CONFIGURED'||[401,403,404].includes(error.status))showError(error,false);
   else{b.disabled=false;message('操作未成功，请重试。');}
  }finally{
   if(pending.get(communityId)===operation)pending.delete(communityId);
   delete section.dataset.membershipBusy;
  }
 }
 load();return ()=>{disposed=true;revision++;section.remove();};
}
