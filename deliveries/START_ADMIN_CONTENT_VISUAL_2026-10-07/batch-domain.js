/* Shared batch rules: no writes until the entire selected batch validates. */
(function(root){
 'use strict';
 const text=(v,max)=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
 function validPoi(p){return !!(p&&p.provider==='amap'&&text(p.providerPoiId,100)&&text(p.name,200)&&text(p.city,40)&&Number.isFinite(p.longitude)&&Math.abs(p.longitude)<=180&&Number.isFinite(p.latitude)&&Math.abs(p.latitude)<=90&&p.coordinateSystem==='gcj02'&&(p.address===undefined||typeof p.address==='string'&&p.address.length<=600));}
 function category(raw){return /咖啡/.test(raw)?'咖啡':/餐饮|餐厅|美食/.test(raw)?'美食':/书店/.test(raw)?'书店':/娱乐|体育/.test(raw)?'娱乐':/风景|公园|景点/.test(raw)?'景点':'其他';}
 function plan(places,stops,selected,context={}){
  if(!Array.isArray(selected)||!selected.length||selected.length>30||selected.some(x=>!validPoi(x?.poi)||x.evidence!==undefined&&(typeof x.evidence!=='string'||x.evidence.length>600)))throw Error('INVALID_BATCH');
  const additions=[],stopIds=[],contributions=[],seen=new Set(stops),poiSeen=new Set();let reused=0;
  for(const entry of selected){const p=entry.poi;
   const shared=places.find(x=>x.poi===p.providerPoiId||x.providerPoiId===p.providerPoiId);
   contributions.push({placeId:shared?.id||'amap:'+p.providerPoiId,artist:context.artist||'',source:context.source||'',evidence:entry.evidence||'',extractedName:entry.name||'',verified:false,status:'草稿'});
   if(poiSeen.has(p.providerPoiId))continue;poiSeen.add(p.providerPoiId);
   const existing=places.find(x=>x.poi===p.providerPoiId||x.providerPoiId===p.providerPoiId);let place=existing;
   if(existing)reused++;else{
    place={id:'amap:'+p.providerPoiId,kind:'地点',provider:'amap',poi:p.providerPoiId,providerPoiId:p.providerPoiId,name:p.name,city:p.city,address:p.address||'',district:p.district||'',longitude:p.longitude,latitude:p.latitude,coordinateSystem:'gcj02',category:category(p.category||''),artist:'',verified:false,status:'草稿',cover:'',photoAlt:'',same:'',description:'',source:'高德 POI；艺人到访来源待核对',importContext:{artist:context.artist||'',source:context.source||'',evidence:entry.evidence||'',extractedName:entry.name||''}};additions.push(place);
   }
   if(!seen.has(place.id)){stopIds.push(place.id);seen.add(place.id);}
  }
  return {additions,stopIds,reused,contributions,snapshots:additions.map(p=>({id:p.id,value:JSON.stringify(p)}))};
 }
 function undo(places,batch,referenced){const refs=new Set(referenced);return {removeIds:batch.snapshots.filter(s=>!refs.has(s.id)&&places.some(p=>p.id===s.id&&JSON.stringify(p)===s.value)).map(s=>s.id)};}
 root.StartBatch={validPoi,plan,undo};
})(typeof globalThis!=='undefined'?globalThis:this);
