// Existing approved views can consume this adapter; no embedded fixture identity.
export function createPlatformClient({base='',getBearer=async()=>null,fetchImpl=fetch}={}){
 async function request(path,{method='GET',value,key,raw,signal}={}){
  const token=await getBearer(),headers={};if(token)headers.authorization='Bearer '+token;
  if(key)headers['idempotency-key']=key;if(value!==undefined)headers['content-type']='application/json';if(raw)headers['content-type']='image/png';
  const r=await fetchImpl(base+path,{method,headers,body:raw??(value===undefined?undefined:JSON.stringify(value)),cache:'no-store',signal});
  const data=await r.json();if(!r.ok){const e=new Error(data.error||'REQUEST_FAILED');e.code=data.error;e.status=r.status;throw e;}return data;
 }
 return {command:(op,value,key=crypto.randomUUID())=>request('/api/commands/'+encodeURIComponent(op),{method:'POST',value,key}),public:(filters={})=>request('/api/public?'+new URLSearchParams(filters)),detail:(kind,id)=>request('/api/public/'+encodeURIComponent(kind)+'/'+encodeURIComponent(id)),admin:(section,id)=>request('/api/admin/'+encodeURIComponent(section)+(id?'?'+new URLSearchParams({id}):'')),me:section=>request('/api/me/'+encodeURIComponent(section)),recommend:city=>request('/api/recommend?'+new URLSearchParams({city})),share:token=>request('/api/share/'+encodeURIComponent(token)),upload:bytes=>request('/api/media',{method:'POST',raw:bytes}),
 extract:(value,signal)=>request('/api/extract/places',{method:'POST',value,signal}),
 async imageUrl(id){const token=await getBearer();const r=await fetchImpl(base+'/api/media/'+encodeURIComponent(id),{headers:token?{authorization:'Bearer '+token}:{},cache:'no-store'});if(!r.ok)throw Object.assign(Error('MEDIA_UNAVAILABLE'),{code:'MEDIA_UNAVAILABLE'});return URL.createObjectURL(await r.blob());},
 async uploadImage(file){if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>8*1024*1024)throw Object.assign(Error('INVALID_MEDIA'),{code:'INVALID_MEDIA'});const image=await createImageBitmap(file);try{if(image.width>4096||image.height>4096||image.width*image.height>16_000_000)throw Object.assign(Error('INVALID_MEDIA'),{code:'INVALID_MEDIA'});const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;canvas.getContext('2d').drawImage(image,0,0);const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));if(!blob||blob.size>5*1024*1024)throw Object.assign(Error('INVALID_MEDIA'),{code:'INVALID_MEDIA'});return request('/api/media',{method:'POST',raw:blob});}finally{image.close();}}
 };
}
