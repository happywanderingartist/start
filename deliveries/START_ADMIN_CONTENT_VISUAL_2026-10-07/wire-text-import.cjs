const fs=require('node:fs');
const a='admin.js';let s=fs.readFileSync(a,'utf8');
s=s.replace("${button('＋ 地点','new-place','primary')}","${button('＋ 地点','new-place','primary')}${button('从文字识别','text-import','secondary')}");
s=s.replace("<div class=\"tabs\" aria-label=\"内容类型\">","${batchNotice()}<div class=\"tabs\" aria-label=\"内容类型\">");
s=s.replace("${header(d.name?'编辑地点':'新增地点','地点资料与艺人同款分开维护。',editActions())}","${header(d.name?'编辑地点':'新增地点','地点资料与艺人同款分开维护。',button('从文字识别','text-import','secondary')+editActions())}${batchNotice()}");
s=s.replace("${header('编辑路线','搜索地图地点，单独编排站点顺序。',editActions())}","${header('编辑路线','搜索地图地点，单独编排站点顺序。',editActions())}${batchNotice()}");
s=s.replace("${button('＋ 添加地点','add-stop','secondary')}</div>","<div class=\"actions\">${button('从文字识别','text-import','secondary')}${button('＋ 添加地点','add-stop','secondary')}</div></div>");
s=s.replace("document.querySelector('#approve-button').disabled", "document.querySelector('#approve-button').disabled");
// fromHash runs after the script has declared the import state, preventing a TDZ during initial render.
s=s.replace("window.addEventListener('hashchange',fromHash);fromHash();","window.addEventListener('hashchange',fromHash);");s+='\nfromHash();\n';
fs.writeFileSync(a,s);
let html=fs.readFileSync('index.html','utf8').replace('<script src="admin.js">','<script src="batch-domain.js"></script><script src="admin.js">');fs.writeFileSync('index.html',html);
fs.appendFileSync('admin.css','\n.text-dialog{width:min(1180px,calc(100vw - 24px));max-width:none;padding:0;overflow:hidden}.text-dialog>.dialog-header{display:none}.text-dialog .dialog-header{display:none}.text-dialog .dialog-body{padding:0}.text-dialog iframe{width:100%;height:min(840px,calc(100dvh - 35px));border:0;display:block}.batch-notice{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 17px;margin-bottom:20px;background:var(--ice);color:var(--blue);border-radius:12px;font-size:12px}\n');
let picker=fs.readFileSync('map-picker.js','utf8').replace("city.value=params.get('city')||'';","city.value=params.get('city')||'';keyword.value=params.get('keyword')?.slice(0,80)||'';");picker+='\nif(keyword.value&&city.value)search();\n';fs.writeFileSync('map-picker.js',picker);