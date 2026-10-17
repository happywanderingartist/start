import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
const dir=path.resolve(fileURLToPath(new URL('../',import.meta.url))),original=path.resolve(fileURLToPath(new URL('../../START_ADMIN_CONTENT_VISUAL_2026-10-07/',import.meta.url)));
const types={'.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.html':'text/html; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const approved=path.resolve(fileURLToPath(new URL('../../START_FINAL_LAYOUT_REVIEW_2026-10-06/',import.meta.url)));
export async function serveStatic(req,res,url){
 if(req.method!=='GET')return false;
 let file;
 if(url.pathname==='/client.mjs')file=path.join(dir,'client.mjs');
 else if(url.pathname.startsWith('/app/')||url.pathname.startsWith('/prototype/')){
  const prototype=url.pathname.startsWith('/prototype/'),name=decodeURIComponent(url.pathname.slice(prototype?11:5))||'index.html';
  if(name.split('/').some(s=>s==='..'||s==='.'||s.includes('\\'))||!types[path.extname(name)])return false;
  const local=path.resolve(dir,'public-ui',name),fallback=path.resolve(approved,name);
  if(!local.startsWith(path.join(dir,'public-ui')+path.sep)||!fallback.startsWith(approved+path.sep))return false;
  if(prototype)file=fallback;else{try{await fs.access(local);file=local;}catch{if(!/^(assets\/|vendor\/embla\.js$|[a-z-]+\.(css|mjs)$)/.test(name))return false;file=fallback;}}
 }
 else if(url.pathname.startsWith('/admin/')){let name=decodeURIComponent(url.pathname.slice(7))||'index.html';if(name.split('/').some(s=>s==='..'||s==='.'||s.includes('\\'))||!types[path.extname(name)])return false;const local=path.resolve(dir,'ui',name),fallback=path.resolve(original,name);if(!local.startsWith(path.join(dir,'ui')+path.sep)||!fallback.startsWith(original+path.sep))return false;try{await fs.access(local);file=local;}catch{if(!/^(assets\/|map-picker\.(html|js|css)$|text-import\.(html|js|css)$|batch-domain\.js$)/.test(name))return false;file=fallback;}}
 else return false;
 try{const bytes=await fs.readFile(file);res.writeHead(200,{'content-type':types[path.extname(file)],'cache-control':'no-store','x-content-type-options':'nosniff'});res.end(bytes);return true;}catch{return false;}
}
