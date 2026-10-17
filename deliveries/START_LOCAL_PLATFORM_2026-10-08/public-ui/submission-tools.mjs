// Candidate extraction never publishes content or supplies invented coordinates.
import {createPlatformClient} from '/client.mjs';
import {mountRouteStops} from './route-stops.mjs';
export function mountSubmissionTools(form, catalog, api=createPlatformClient()) {
  const lifecycle = new AbortController();
  const signal = lifecycle.signal;
  let dialog;
  const field = name => form.elements.namedItem(name);
  const status = text => { const node=form.querySelector('[data-form-status]'); node.hidden=false; node.textContent=text; };
  const addRouteStop=form.dataset.kind==='route'?mountRouteStops(form,catalog,status):null;
  const close = () => { if(dialog){dialog.close();dialog.remove();dialog=null;} };
  const validPoi = p => p?.provider==='amap' && typeof p.providerPoiId==='string' && p.providerPoiId.length>0 && p.providerPoiId.length<=100 && typeof p.name==='string' && p.name.length<=200 && typeof p.city==='string' && p.city.length<=200 && Number.isFinite(p.longitude) && Math.abs(p.longitude)<=180 && Number.isFinite(p.latitude) && Math.abs(p.latitude)<=90 && p.coordinateSystem==='gcj02';
  function choose(p) {
    if(form.dataset.kind==='route') {
      addRouteStop(p);return;
    }
    field('name').value=p.name;field('city').value=p.city;
    form.selectedPoi={poiId:p.providerPoiId,address:String(p.address||'').slice(0,500),longitude:p.longitude,latitude:p.latitude,coordinateSystem:'gcj02'};
    status(`已选中：${p.name} · ${p.address||p.city}。请核对艺人、同款和来源后提交。`);
  }
  function openMap(keyword,city) {
    close();const token=crypto.randomUUID();
    dialog=document.createElement('dialog');dialog.className='submission-map-dialog';
    const button=document.createElement('button');button.type='button';button.textContent='关闭地图';button.className='secondary';button.onclick=close;
    const frame=document.createElement('iframe');frame.title='高德地图选点';
    frame.src='/admin/map-picker.html?'+new URLSearchParams({city:city||field('city').value,keyword:keyword||field('mapQuery').value,parent:location.origin,token});
    const currentDialog=dialog;
    const receive = event => {
      if(event.origin!==location.origin||event.source!==frame.contentWindow||event.data?.token!==token)return;
      if(event.data.type==='start-map-close')close();
      if(event.data.type==='start-map-selection'&&validPoi(event.data.poi)){choose(event.data.poi);close();}
    };
    window.addEventListener('message',receive,{signal});
    currentDialog.addEventListener('close',()=>{window.removeEventListener('message',receive);currentDialog.remove();if(dialog===currentDialog)dialog=null;},{once:true});
    dialog.append(button,frame);document.body.append(dialog);dialog.showModal();button.focus();
  }
  form.querySelector('[data-map-search]').addEventListener('click',()=>openMap(),{signal});
  // Editing the location invalidates the previous map binding, preventing stale coordinates.
  for(const name of ['name','city'])field(name).addEventListener('input',()=>{delete form.selectedPoi;},{signal});
  form.addEventListener('reset',()=>{delete form.selectedPoi;form.querySelector('[data-extract-results]')?.remove();},{signal});
  form.querySelector('[data-text-import]').addEventListener('click',async event=>{
    const text=field('textImport').value.trim(),button=event.currentTarget;
    if(!text){status('请先粘贴需要识别的文字。');return;}
    if(text.length>3500){status('每次最多识别 3500 字，请分段粘贴。');return;}
    button.disabled=true;status('正在本机识别地点，请稍候…');form.querySelector('[data-extract-results]')?.remove();
    try {
      const data=await api.extract({text,city:field('city').value},AbortSignal.any([signal,AbortSignal.timeout(95000)]));
      if(!Array.isArray(data.items))throw Error('INVALID_RESPONSE');
      const list=document.createElement('div');list.dataset.extractResults='';list.className='extraction-results';
      for(const item of data.items){
        if(typeof item.name!=='string'||!text.includes(item.name))continue;
        const row=document.createElement('div'),label=document.createElement('p'),use=document.createElement('button');
        label.textContent=[item.name,item.city].filter(Boolean).join(' · ');use.type='button';use.className='secondary';use.textContent='核对地图位置';
        use.addEventListener('click',()=>{field('mapQuery').value=item.name;openMap(item.name,item.city);},{signal});row.append(label,use);if(item.warning){const warning=document.createElement('p');warning.textContent=item.warning;row.append(warning);}list.append(row);
      }
      button.after(list);status(list.childElementCount?`识别到 ${list.childElementCount} 个候选地点，请逐个核对地图位置；不会自动提交。`:'未识别到可靠地点，请补充城市和具体名称，或直接使用地图搜索。');
    } catch(error) { if(!signal.aborted)status(['AUTH_NOT_CONFIGURED','UNAUTHENTICATED'].includes(error.code)?'文字识别需要登录身份；当前身份服务尚未接入。原文已保留，可先使用地图搜索。':'识别暂不可用或超时，原文已保留。可以重试或使用地图搜索。'); }
    finally {button.disabled=false;}
  },{signal});
  return () => {lifecycle.abort();close();addRouteStop?.destroy();};
}
