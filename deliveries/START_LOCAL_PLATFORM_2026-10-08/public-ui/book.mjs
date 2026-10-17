// Uses the approved ticket classes and the existing private form vocabulary.
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const drafts=new Map(),listPosition={y:0};
const fields=[['snapshot','地点'],['at','打卡时间'],['text','记录文字'],['ticket','纪念票根'],['media_ids','照片']];
const date=value=>value?new Date(value).toLocaleString('zh-CN',{hour12:false}):'';
const target=id=>'#/book/'+encodeURIComponent(id);
const link=(href,text)=>`<a class="inline-link" href="${href}">${text}</a>`;
const photos=r=>(r.media_ids||[]).map((id,i)=>`<span class="book-photo-slot" data-book-photo="${esc(id)}" data-photo-name="${i+1}">正在载入照片…</span>`).join('');

function ticket(r){
 if(!r.ticket)return '';
 let teeth='';for(let x=280;x>=20;x-=10)teeth+=` L${x-3} 708 L${x-8} 703`;
 return `<div class="approved-ticket-wrap"><div class="ticket-cord" aria-hidden="true"></div><article class="memory-ticket ticket-long" aria-label="纪念票根"><svg class="ticket-outline" viewBox="0 0 300 708" preserveAspectRatio="none" aria-hidden="true"><path d="M22 0 H278 Q278 22 300 22 V132 Q289 136 300 140 V518 Q289 522 300 526 V695 Q282 695 280 703 ${teeth} L20 703 Q18 695 0 695 V526 Q11 522 0 518 V140 Q11 136 0 132 V22 Q22 22 22 0 Z"/></svg><div class="ticket-hole" aria-hidden="true"></div><header class="ticket-mast"><div><div class="ticket-logo"><img src="/app/assets/START_LOGO_APPROVED.png" alt="START"></div><span class="ticket-brandline">A LITTLE JOURNEY, KEPT.</span></div><span class="ticket-issue">TRAVEL / 01</span></header><div class="ticket-meta"><div>PLACES<br>MOMENTS<br>LITTLE DETOURS</div><div>${esc(r.at?date(r.at):'')}<br>${esc(r.snapshot?.city||'')}<span class="ticket-count">${esc(r.snapshot?.name||'')}</span></div></div><section class="ticket-poster"><div class="poster-shapes" aria-hidden="true"><span></span><span></span><span></span><span></span></div><p class="ticket-edition">START TRAVEL JOURNAL</p><h2>${esc(r.ticket.title)}</h2><p class="ticket-note">${esc(r.ticket.note||'')}</p></section><section class="ticket-summary"><div><span>EDITION</span><strong>城市漫游</strong></div><div><span>CHAPTER</span><strong>${esc(r.snapshot?.city||'记录')}</strong></div><div><span>START BOOK</span><strong>纪念票根</strong></div></section><footer class="ticket-stub"><div class="ticket-barcode"><div class="decorative-barcode" aria-hidden="true"></div><small>装饰条码 · 不可扫码</small></div><span class="ticket-stub-note">KEEP<br>THIS<br>MOMENT<b>↘</b></span></footer></article></div>`;
}
function recordMarkup(r){
 return `<article class="book-record">${r.snapshot?`<h2>${esc(r.snapshot.name)}</h2><p class="public-badge">${esc([r.snapshot.city,r.snapshot.category].filter(Boolean).join(' · '))}</p>`:''}${r.at?`<p>${esc(date(r.at))}</p>`:''}${r.text?`<p class="book-text">${esc(r.text)}</p>`:''}<div class="book-photos">${photos(r)}</div>${ticket(r)}</article>`;
}
function newForm(placeId){
 const localNow=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);
 const wrapper=document.createElement('div');
 wrapper.innerHTML=`<form data-book-form="checkin"><label for="book-at">打卡时间</label><input id="book-at" name="at" type="datetime-local" required value="${localNow}"><label for="book-text">记录文字</label><textarea id="book-text" name="text" maxlength="3500" rows="4"></textarea><label for="book-media">照片（最多 9 张）</label><input id="book-media" name="media" type="file" accept="image/png,image/jpeg,image/webp" multiple><label for="book-title">票根标题</label><input id="book-title" name="title" maxlength="200"><label for="book-note">票根短句</label><textarea id="book-note" name="note" maxlength="1000" rows="2"></textarea><button type="submit" class="primary">保存到 Book</button></form>`;
 const form=wrapper.firstElementChild;
 form.bookState={placeId,uploads:new WeakMap(),retry:new Map(),pending:false};return form;
}
export function mountBook(root,api,{path,placeId='',catalog}){
 const host=root.querySelector('[data-book-workspace]');let alive=true,busy=false,records=[],shares=[],preview=null;
 const urls=new Set();
 const status=text=>{if(alive){const el=host.querySelector('[data-book-status]');el.textContent=text;}};
 const shell=html=>{if(!alive)return;for(const url of urls)URL.revokeObjectURL(url);urls.clear();host.innerHTML=`<p data-book-status role="status" aria-live="polite"></p>${html}`;};
 async function hydrate(token){
  for(const slot of host.querySelectorAll('[data-book-photo]')){
   let url;
   try{
    url=token?'/api/share/'+encodeURIComponent(token)+'/media/'+encodeURIComponent(slot.dataset.bookPhoto):await api.imageUrl(slot.dataset.bookPhoto);
    if(!alive||!slot.isConnected){if(!token)URL.revokeObjectURL(url);continue;}
    if(!token)urls.add(url);
    const img=document.createElement('img');img.alt=(token?'分享照片 ':'打卡照片 ')+slot.dataset.photoName;
    img.onload=()=>{if(alive&&slot.isConnected)slot.replaceWith(img);};
    img.onerror=()=>{if(alive&&slot.isConnected)slot.textContent='照片暂不可用';};img.src=url;
   }catch{if(alive&&slot.isConnected)slot.textContent='照片暂不可用';}
  }
 }
 async function command(op,value,retry){
  const fingerprint=op+JSON.stringify(value);let key=retry.get(fingerprint);
  if(!key){key=crypto.randomUUID();retry.set(fingerprint,key);}
  return api.command(op,value,key);
 }
 const mutationKeys=new Map();
 async function load(){
  if(path.startsWith('/share/')){
   const token=path.slice(7);
   try{const selected=await api.share(token);shell('<h1>分享的记录</h1>'+selected.map(recordMarkup).join(''));hydrate(token);}
   catch(e){shell(`<h1>${e.status===404?'分享已失效':'暂时无法载入分享'}</h1><p>${e.status===404?'链接已撤销或记录已删除。':'请稍后重试。'}</p>`);}return;
  }
  try{
   records=(await api.me('book')).sort((a,b)=>Date.parse(b.at)-Date.parse(a.at)||b.id.localeCompare(a.id));
   if(path==='/book/shares')shares=await api.me('shares');
   if(!alive)return;
   if(path==='/book/new'){
    const place=catalog.places.find(p=>p.id===placeId);
    if(!place){shell('<h1>地点已撤回或不存在</h1>'+link('#/discover','选择地点'));return;}
    shell(`<h1>记录打卡</h1><h2>${esc(place.name)}</h2><p class="public-badge">仅自己可见</p><div data-book-form-host></div>`);
    let form=drafts.get(placeId);if(!form){form=newForm(placeId);drafts.set(placeId,form);}
    host.querySelector('[data-book-form-host]').append(form);
    if(form.bookState.pending){
     busy=true;form.querySelector('[type=submit]').disabled=true;status('正在保存，请稍候…');
     form.bookState.task.then(savedId=>{if(!alive)return;busy=false;form.querySelector('[type=submit]').disabled=false;if(savedId)location.hash=target(savedId);else status(form.bookState.error);});
    }
   }else if(path==='/book/share'){
    shell(`<h1>分享所选内容</h1><form data-book-form="share"><fieldset><legend>选择记录（最多 30 条）</legend>${records.map(r=>`<label class="book-choice"><input type="checkbox" name="ids" value="${r.id}">选择记录：${esc(r.snapshot.name)}</label>`).join('')||'<p>还没有打卡记录</p>'}</fieldset><fieldset><legend>公开内容</legend>${fields.map(([id,name])=>`<label class="book-choice"><input type="checkbox" name="fields" value="${id}" ${['snapshot','at'].includes(id)?'checked':''}>${name}</label>`).join('')}</fieldset><button type="submit" class="primary">预览分享</button></form><div data-book-preview></div>`);
   }else if(path==='/book/shares'){
    shell(`<h1>分享管理</h1><p class="public-badge">可撤销已有链接；完整链接仅在创建时显示。</p>${shares.map(s=>`<section class="private-section"><h2>${s.record_ids.length} 条记录</h2><p>${s.fields.map(f=>esc(fields.find(x=>x[0]===f)?.[1]||f)).join(' · ')}</p>${s.revoked?'<span class="status-pill">已撤销</span>':`<button type="button" data-book-action="revoke" data-id="${s.id}">撤销链接</button>`}</section>`).join('')||'<p>还没有分享链接</p>'}`);
   }else if(path==='/book'){
    shell(`<h1>START Book</h1><p class="public-badge">仅自己可见</p><div class="private-actions">${link('#/book/share','分享所选内容')}${link('#/book/shares','分享管理')}</div>${records.map(r=>`<a class="review-place-row" href="${target(r.id)}"><span class="place-image">${esc(r.snapshot.city)}</span><span><strong>${esc(r.snapshot.name)}</strong><small>${esc(date(r.at))}</small></span><span aria-hidden="true">›</span></a>`).join('')||'<p>还没有打卡记录</p>'+link('#/discover','去发现地点')}`);
    requestAnimationFrame(()=>{if(alive)scrollTo(0,listPosition.y);});
   }else{
    const r=records.find(r=>r.id===path.slice(6));
    if(!r){shell('<h1>记录不存在或已删除</h1>');return;}
    shell(`<h1>打卡记录</h1>${recordMarkup(r)}<div class="private-actions">${link('#/book/share','分享所选内容')}<button type="button" data-book-action="delete" data-id="${r.id}">删除记录</button></div><dialog class="book-confirm"><h2>删除这条记录？</h2><p>相关分享链接也会失效。</p><button type="button" data-book-action="cancel">取消</button><button type="button" data-book-action="confirm-delete" data-id="${r.id}">确认删除</button></dialog>`);hydrate();
   }
  }catch(e){
   if(['AUTH_NOT_CONFIGURED','UNAUTHENTICATED','UNAUTHORIZED'].includes(e.code))shell('<h1>START Book</h1><p>登录后可以查看私人记录。</p>');
   else shell('<h1>暂时无法载入记录</h1><button type="button" data-book-action="retry">重试</button>');
  }
 }
 async function submit(e){
  const form=e.target.closest('[data-book-form]');if(!form)return;e.preventDefault();if(busy||!alive)return;
  const data=new FormData(form);
  if(form.dataset.bookForm==='share'){
   const ids=data.getAll('ids'),selected=data.getAll('fields');
   if(!ids.length||ids.length>30||!selected.length){status('请选择 1–30 条记录和至少一种公开内容。');return;}
   preview={ids,fields:selected};
   host.querySelector('[data-book-preview]').innerHTML=`<section role="region" aria-label="分享预览"><h2>分享预览</h2>${ids.map(id=>{const r=records.find(r=>r.id===id);return recordMarkup(Object.fromEntries(selected.map(f=>[f,r[f]])));}).join('')}<button type="button" data-book-action="create-share" class="primary">创建分享链接</button></section>`;hydrate();return;
  }
  const state=form.bookState,files=data.getAll('media').filter(file=>file.size),at=new Date(data.get('at'));
  if(!Number.isFinite(at.getTime())||at.getTime()>Date.now()){status('请选择现在或过去的打卡时间。');return;}
  if(files.length>9){status('照片最多 9 张。');return;}
  if(!String(data.get('title')).trim()&&String(data.get('note')).trim()){status('请为票根填写标题。');return;}
  busy=true;state.pending=true;state.savedId=null;state.task=new Promise(resolve=>{state.finish=resolve;});const button=form.querySelector('[type=submit]');button.disabled=true;status('正在保存…');
  try{
   const mediaIds=[];for(const file of files){let id=state.uploads.get(file);if(!id){id=(await api.uploadImage(file)).id;state.uploads.set(file,id);}mediaIds.push(id);}
   const value={placeId:state.placeId,at:at.toISOString(),text:String(data.get('text')),mediaIds,...(String(data.get('title')).trim()?{ticket:{title:String(data.get('title')).trim(),note:String(data.get('note'))}}:{})};
   const saved=await command('checkin.create',value,state.retry);state.savedId=saved.id;drafts.delete(state.placeId);
   if(alive)location.hash=target(saved.id);
  }catch(e){state.error=e.code==='AUTH_NOT_CONFIGURED'?'登录服务尚未接入，暂时不能保存。':e.code==='INVALID_MEDIA'?'照片格式或大小不符合要求，请重新选择。':'保存未完成，内容已保留，请重试。';status(state.error);}
  finally{state.pending=false;busy=false;button.disabled=false;state.finish(state.savedId);}
 }
 async function click(e){
  const b=e.target.closest('[data-book-action]');if(!b||!alive||busy)return;
  const action=b.dataset.bookAction,id=b.dataset.id;
  if(action==='retry'){load();return;}
  if(action==='delete'){host.querySelector('dialog').showModal();return;}
  if(action==='cancel'){host.querySelector('dialog').close();return;}
  busy=true;b.disabled=true;
  try{
   if(action==='create-share'){
    if(!preview)return;const result=await command('share.create',preview,mutationKeys);
    if(!alive)return;
    const url=location.origin+'/app/#/share/'+encodeURIComponent(result.token);
    host.querySelector('[data-book-preview]').innerHTML=`<h2>链接已创建</h2><label for="book-link">分享链接</label><input id="book-link" value="${esc(url)}" readonly><p class="public-badge">当前为本地链接，只用于本机预览。</p>${link('#/share/'+encodeURIComponent(result.token),'打开分享页')}${link('#/book/shares','分享管理')}`;
   }else if(action==='revoke'){await command('share.revoke',{id},mutationKeys);await load();status('链接已撤销。');}
   else if(action==='confirm-delete'){await command('checkin.delete',{id},mutationKeys);if(alive)location.hash='#/book';}
  }catch{status('操作未完成，请重试。');}
  finally{busy=false;b.disabled=false;}
 }
 function change(e){if(e.target.closest('[data-book-form=share]')){preview=null;host.querySelector('[data-book-preview]').replaceChildren();}}
 const remember=()=>{if(path==='/book')listPosition.y=scrollY;};
 host.addEventListener('submit',submit);host.addEventListener('click',click);host.addEventListener('change',change);host.addEventListener('click',remember);load();
 return()=>{alive=false;host.removeEventListener('submit',submit);host.removeEventListener('click',click);host.removeEventListener('change',change);host.removeEventListener('click',remember);for(const url of urls)URL.revokeObjectURL(url);urls.clear();};
}
