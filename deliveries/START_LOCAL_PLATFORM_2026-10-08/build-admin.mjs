import fs from 'node:fs/promises';
const root=new URL('./ui/',import.meta.url),source=new URL('../START_ADMIN_CONTENT_VISUAL_2026-10-07/',import.meta.url);
await fs.mkdir(root,{recursive:true});
let html=await fs.readFile(new URL('index.html',source),'utf8');
html=html.replace('START · 内容建设后台视觉稿','START · 本地内容建设后台').replace('后台视觉稿','本地后台').replace('示例内容 · 操作仅在本页演示，刷新后重置','本机数据库 · 登录能力尚未配置').replace('ADMIN_DESIGN.md','/api/status').replace('平台管理员 · 演示角色','身份等待验证').replace('<script src="admin.js"></script>','<script src="admin.js"></script><script src="bootstrap.js"></script>');
await fs.writeFile(new URL('index.html',root),html);
let js=await fs.readFile(new URL('admin.js',source),'utf8');js=js.replace("!['','安溥','苏打绿'].includes(e.data.artist)","!['',...(window.START_ALLOWED_ARTISTS||[])].includes(e.data.artist)");await fs.writeFile(new URL('admin.js',root),js);
await fs.copyFile(new URL('admin.css',source),new URL('admin.css',root));
