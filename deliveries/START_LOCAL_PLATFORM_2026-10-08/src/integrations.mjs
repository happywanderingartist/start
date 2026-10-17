// Reuse the reviewed fixed-host map proxy and bounded local extractor.
import {createAdminPreviewServer} from '../../START_ADMIN_CONTENT_VISUAL_2026-10-07/server.mjs';
export function createIntegrations(options={}){
 const existing=createAdminPreviewServer(options);
 return async(req,res,url)=>{
  if(!url.pathname.startsWith('/api/map/')&&!url.pathname.startsWith('/_AMapService/')&&!url.pathname.startsWith('/api/extract/'))return false;
  existing.emit('request',req,res);return true;
 };
}
