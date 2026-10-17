import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(fileURLToPath(new URL('./', import.meta.url)));
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.md':'text/plain; charset=utf-8'};
export function createServer() {
  return http.createServer(async (req,res) => {
    try {
      const u = new URL(req.url,'http://localhost');
      if(req.method !== 'GET' || u.pathname.startsWith('/api/')) {res.writeHead(404);res.end('Not available');return;}
      const requested = decodeURIComponent(u.pathname);
      const isRoute = requested === '/' || requested === '/search' || requested.startsWith('/me/') || requested === '/community' || requested === '/community/mine' || /^\/(communities|events)\//.test(requested) || ['/journey','/journey/arrival','/journey/finish','/memory/ticket','/memory/edit','/book','/me'].includes(requested) || /^\/(artists|routes|places)\//.test(requested);
      const name = isRoute ? 'index.html' : requested.replace(/^\//,'');
      const target = path.resolve(root,name);
      if(!target.startsWith(root + path.sep) && target !== path.join(root,'index.html')) {res.writeHead(403);res.end();return;}
      let data = await fs.readFile(target);
      if (name === 'index.html') data = Buffer.from(data.toString('utf8').replaceAll('href="./', 'href="/').replaceAll('src="./', 'src="/'));
      res.writeHead(200,{'content-type':types[path.extname(target)] ?? 'application/octet-stream','cache-control':'no-store'});res.end(data);
    } catch(error) {res.writeHead(error.code === 'ENOENT' ? 404 : 500);res.end('Prototype resource unavailable');}
  });
}
export function previewAddress(env=process.env) {
  const host=env.START_PREVIEW_HOST || '127.0.0.1';
  const port=Number(env.START_PREVIEW_PORT || 4319);
  const parts=host.split('.').map(Number);
  const ipv4=/^\d{1,3}(\.\d{1,3}){3}$/.test(host) && parts.every(n=>n>=0 && n<=255);
  const privateHost=ipv4 && (parts[0]===10 || (parts[0]===172 && parts[1]>=16 && parts[1]<=31) || (parts[0]===192 && parts[1]===168));
  if(host!=='127.0.0.1' && !privateHost) throw new Error('Preview must bind loopback or an explicit private IPv4 address');
  if(!Number.isInteger(port) || port<1024 || port>65535) throw new Error('Invalid preview port');
  return {host,port};
}
if(process.argv[1] === fileURLToPath(import.meta.url)) {
  const {host,port}=previewAddress();
  createServer().listen(port,host,()=>console.log(`START · http://${host}:${port} · 合成示例`));
}
