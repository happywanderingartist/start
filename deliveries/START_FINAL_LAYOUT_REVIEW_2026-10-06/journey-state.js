(function(root){
  'use strict';
  const clone=value=>JSON.parse(JSON.stringify(value));
  const validStates=['pending','visited','skipped'];
  function createJourney(route){
    if(!route || !Array.isArray(route.stops) || !route.stops.length)throw Error('路线没有站点');
    const snapshot=clone(route);
    const stops=snapshot.stops.map(s=>({placeId:s.placeId,state:'pending',photo:null}));
    if(new Set(stops.map(s=>s.placeId)).size!==stops.length)throw Error('站点重复');
    return {version:1,id:'demo-'+Date.now()+'-'+Math.random().toString(36).slice(2,9),route:snapshot,stops,startedAt:new Date().toISOString(),endedAt:null};
  }
  function update(j,id,state){
    if(j.endedAt)throw Error('行程已经结束');
    const next=clone(j),stop=next.stops.find(s=>s.placeId===id);
    if(!stop)throw Error('站点不存在');
    stop.state=state;return next;
  }
  function arrive(j,id){return update(j,id,'visited');}
  function skip(j,id){return update(j,id,'skipped');}
  function visited(j){return j.stops.filter(s=>s.state==='visited').length;}
  function nextStop(j){const s=j.stops.find(s=>s.state==='pending');return s?j.route.stops.find(r=>r.placeId===s.placeId):null;}
  function finish(j){const next=clone(j);next.endedAt ||=new Date().toISOString();return next;}
  function restore(raw){try{const j=JSON.parse(raw);if(j.version!==1 || typeof j.id!=='string' || !j.route?.stops?.length || !Array.isArray(j.stops) || j.stops.length!==j.route.stops.length || !j.startedAt || j.stops.some((s,i)=>!validStates.includes(s.state)||s.placeId!==j.route.stops[i].placeId))return null;return j;}catch{return null;}}
  const api={createJourney,arrive,skip,visited,nextStop,finish,restore};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.JourneyState=api;
})(typeof window!=='undefined'?window:globalThis);
