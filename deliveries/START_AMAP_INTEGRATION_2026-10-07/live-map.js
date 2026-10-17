const status=document.querySelector('#map-status');
const container=document.querySelector('#live-map');
const detail=document.querySelector('#place-detail');
const results=document.querySelector('#place-results');
const form=document.createElement('form');form.className='map-query';
const input=document.createElement('input');input.type='search';input.placeholder='搜索地点';input.setAttribute('aria-label','搜索上海地点');input.maxLength=80;
const submit=document.createElement('button');submit.type='submit';submit.textContent='搜索';form.append(input,submit);container.before(form);
let map,markers=[],requestId=0,controller,disposed=false;
function select(p,index){map.setCenter([p.longitude,p.latitude]);results.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));detail.replaceChildren();const h=document.createElement('h2');h.textContent=p.name;const address=document.createElement('p');address.className='muted';address.textContent=p.district+' · '+p.address;const link=document.createElement('a');const url=new URL('https://uri.amap.com/marker');url.searchParams.set('position',`${p.longitude},${p.latitude}`);url.searchParams.set('name',p.name);url.searchParams.set('coordinate','gaode');url.searchParams.set('src','START');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';link.textContent='在高德中查看与导航 ↗';detail.append(h,address,link);}
async function search(keyword){const id=++requestId;controller?.abort();controller=new AbortController();const activeController=controller;const timer=setTimeout(()=>activeController.abort(),10000);status.textContent='正在查询地点…';try{const r=await fetch('/api/map/places?'+new URLSearchParams({city:'上海',keyword}),{signal:activeController.signal});if(!r.ok)throw new Error();const b=await r.json();if(id!==requestId||disposed)return;map.remove(markers);markers=[];results.replaceChildren();detail.replaceChildren();b.items.forEach((p,i)=>{const marker=new AMap.Marker({position:[p.longitude,p.latitude],title:p.name});marker.on('click',()=>select(p,i));markers.push(marker);const button=document.createElement('button');button.type='button';button.setAttribute('aria-pressed','false');const name=document.createElement('strong');name.textContent=p.name;const address=document.createElement('small');address.textContent=p.district+' · '+p.address;button.append(name,address);button.onclick=()=>select(p,i);results.append(button);});map.add(markers);if(markers.length){map.setFitView(markers);select(b.items[0],0);}status.textContent=markers.length?'高德地点查询结果 · 暂未关联艺人打卡':'没有找到地点，试试其他关键词';}catch{if(id===requestId&&!disposed)status.textContent='地点查询失败，请重新搜索。';}finally{clearTimeout(timer);}}
async function init(){
 const initializationController=new AbortController();
 let expired=false,deadline;
 try{
  const setup=async()=>{
   const r=await fetch('/api/map/config',{signal:initializationController.signal});
   if(!r.ok)throw new Error();
   const cfg=await r.json();
   window._AMapSecurityConfig={serviceHost:location.origin+cfg.serviceHost};
   await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://webapi.amap.com/loader.js';s.onload=resolve;s.onerror=reject;document.head.append(s);});
   const sdk=await AMapLoader.load({key:cfg.jsKey,version:'2.0',plugins:['AMap.Scale']});
   if(disposed||expired)return;
   map=new sdk.Map(container,{center:[121.4737,31.2304],zoom:12,viewMode:'2D'});
   map.addControl(new sdk.Scale());
   map.on('complete',()=>{container.dataset.loaded='true';});
  };
  await Promise.race([setup(),new Promise((_,reject)=>{deadline=setTimeout(()=>{expired=true;initializationController.abort();reject(new Error());},15000);})]);
  if(expired||disposed)return;
  clearTimeout(deadline);
  form.onsubmit=e=>{e.preventDefault();if(input.value.trim())search(input.value.trim());};
  document.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));const keyword=button.dataset.filter;input.value=keyword;search(keyword);});
  await search('景点');
 }catch{expired=true;if(!disposed)status.textContent='地图加载失败，请检查网络后刷新。';}
 finally{clearTimeout(deadline);}
}
window.addEventListener('pagehide',e=>{if(e.persisted)return;disposed=true;controller?.abort();map?.destroy();});
init();
