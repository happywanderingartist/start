import Sortable from './sortable.mjs';
const categories=['美食','咖啡','娱乐','景点','书店','其他'];
export function mountRouteStops(form,catalog,status){
 const list=form.querySelector('[data-route-stops]');
 const stops=[];form.routeStops=stops;
 let keyboardSnapshot=null;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const sorter=new Sortable(list,{handle:'.route-stop-handle',draggable:'[data-route-stop]',forceFallback:true,animation:motion.matches?0:180,ghostClass:'route-stop-ghost',chosenClass:'route-stop-chosen',fallbackOnBody:true,
  onEnd({oldDraggableIndex:from,newDraggableIndex:to}){
   if(Number.isInteger(from)&&Number.isInteger(to)&&from!==to)stops.splice(to,0,stops.splice(from,1)[0]);
   render(to);status(`已放到第 ${to+1} 站。`);
  }
 });
 const updateMotion=()=>sorter.option('animation',motion.matches?0:180);
 motion.addEventListener('change',updateMotion);
 function render(focusIndex){
  list.replaceChildren();
  if(!stops.length){const p=document.createElement('p');p.className='empty';p.textContent='从地图搜索添加站点，再按出行顺序排列。';list.append(p);return;}
  stops.forEach((stop,index)=>{
   const row=document.createElement('li');row.dataset.routeStop='';
   const handle=document.createElement('button');handle.type='button';handle.className='route-stop-handle';handle.textContent='⠿ 拖动排序';handle.setAttribute('aria-label',`拖动第 ${index+1} 站排序`);handle.setAttribute('aria-pressed',String(Boolean(keyboardSnapshot)));handle.title='按空格拿起，方向键调整，空格放下，Esc 取消';
   handle.onkeydown=event=>{
    if([' ','Enter'].includes(event.key)){
     event.preventDefault();keyboardSnapshot=keyboardSnapshot?null:[...stops];sorter.option('disabled',Boolean(keyboardSnapshot));render(index);status(keyboardSnapshot?'已拿起。使用上下方向键调整，空格放下，Esc 取消。':'已确认站点顺序。');
    }else if(keyboardSnapshot&&['ArrowUp','ArrowDown'].includes(event.key)){
     event.preventDefault();const next=index+(event.key==='ArrowUp'?-1:1);if(next<0||next>=stops.length)return;
     stops.splice(next,0,stops.splice(index,1)[0]);render(next);status(`当前第 ${next+1} 站，共 ${stops.length} 站。`);
    }else if(keyboardSnapshot&&event.key==='Escape'){
     event.preventDefault();const original=keyboardSnapshot.indexOf(stops[index]);stops.splice(0,stops.length,...keyboardSnapshot);keyboardSnapshot=null;sorter.option('disabled',false);render(original);status('已取消排序。');
    }
   };
   row.append(handle);
   const place=stop.place||catalog.places.find(p=>p.id===stop.placeId);
   const heading=document.createElement('strong');heading.textContent=place?.name||'地点已撤回';
   const meta=document.createElement('small');meta.textContent=`第 ${index+1} 站 · ${place?.city||''} · ${stop.place?'新地点，随路线审核':'已收录地点'}`;
   row.append(heading,meta);
   if(stop.place){
    for(const [key,label] of [['category','类别'],['sameSpot','打卡同款'],['source','站点来源']]){
     const wrapper=document.createElement('label');wrapper.textContent=label;
     const input=document.createElement(key==='category'?'select':'input');input.setAttribute('aria-label',`第 ${index+1} 站${label}`);
     if(key==='category'){for(const category of categories){const option=document.createElement('option');option.value=category;option.textContent=category;input.append(option);}}
     else {input.maxLength=3500;input.placeholder=key==='source'?'留空沿用路线来源':'机位、作品或照片说明';}
     input.value=stop.place[key]||'';input.addEventListener('input',()=>{stop.place[key]=input.value;});wrapper.append(input);row.append(wrapper);
    }
   }
   const controls=document.createElement('div');controls.className='route-stop-controls';
   const remove=document.createElement('button');remove.type='button';remove.className='secondary';remove.textContent='移除';remove.setAttribute('aria-label',`移除第 ${index+1} 站`);
   remove.onclick=()=>{keyboardSnapshot=null;sorter.option('disabled',false);stops.splice(index,1);render(Math.min(index,stops.length-1));status('已移除站点。');};
   controls.append(remove);
   row.append(controls);list.append(row);
  });
  if(focusIndex!==undefined)list.querySelectorAll('[data-route-stop]')[focusIndex]?.querySelector('button:not(:disabled)')?.focus();
 }
 const reset=()=>{stops.length=0;keyboardSnapshot=null;sorter.option('disabled',false);render();};
 render();form.addEventListener('reset',reset);
 const add=poi=>{
  keyboardSnapshot=null;sorter.option('disabled',false);
  const existing=catalog.places.find(p=>p.poiId===poi.providerPoiId);
  if(stops.some(s=>(existing&&s.placeId===existing.id)||s.place?.poiId===poi.providerPoiId)){status('该站点已在路线中。');return;}
  if(stops.length>=30){status('一条投稿路线最多添加 30 个站点。');return;}
  stops.push(existing?{placeId:existing.id}:{place:{name:poi.name,city:poi.city,category:'其他',poiId:poi.providerPoiId,address:String(poi.address||'').slice(0,500),longitude:poi.longitude,latitude:poi.latitude,coordinateSystem:'gcj02',source:'',sameSpot:''}});
  render();status(`已加入第 ${stops.length} 站：${poi.name}`);
 };
 add.destroy=()=>{sorter.destroy();motion.removeEventListener('change',updateMotion);form.removeEventListener('reset',reset);};
 return add;
}

export function routeSubmissionStops(form,source){
 return (form.routeStops||[]).map(stop=>stop.place?{place:{...stop.place,source:stop.place.source?.trim()||source}}:{placeId:stop.placeId});
}
