import fs from 'node:fs/promises';
const base='D:/Downloads/fan-route-codex-handoff/deliveries/';const target=base+'START_DOLL_IMPLEMENTATION_2026-10-05/';const p=target+'prototype/';
await fs.cp(base+'START_TRADE_IMPLEMENTATION_2026-10-05/prototype',p,{recursive:true});await fs.mkdir(target+'tests',{recursive:true});await fs.mkdir(target+'evidence',{recursive:true});
await fs.cp(base+'START_DOLL_CARD_REVIEW_2026-10-05/assets',p+'assets/doll',{recursive:true});
await fs.writeFile(p+'doll-state.js',`(function(root){'use strict';
const allowed={character:['girl','boy'],outfit:['original','stage','campus','casual','show'],expression:['default','happy_open_eye','curious','surprised'],accessory:['none','bag','camera','earmuffs','scarf','clip','backpack']};
function create(){return {version:1,character:'girl',outfit:'original',expression:'default',accessory:'none'}}
function valid(s){return s&&s.version===1&&Object.keys(allowed).every(k=>allowed[k].includes(s[k]))&&!(s.character==='boy'&&s.outfit!=='original')&&!(s.outfit!=='original'&&s.expression!=='default')}
function restore(raw){try{const s=JSON.parse(raw);return valid(s)?Object.fromEntries(['version',...Object.keys(allowed)].map(k=>[k,s[k]])):null}catch{return null}}
function select(s,k,v){if(!valid(s)||!allowed[k]?.includes(v))throw Error('Invalid doll selection');const n={...s,[k]:v};if(k==='character'){n.outfit='original';n.expression='default'}if(k==='outfit'){if(n.character==='boy'&&v!=='original')throw Error('Boy outfit unavailable');n.expression='default'}if(k==='expression')n.outfit='original';return n}
root.DollState={create,restore,select};})(globalThis);`);
let css=await fs.readFile(base+'START_DOLL_CARD_REVIEW_2026-10-05/arc.css','utf8');css=css.replace('main{max-width:560px','.doll-screen{max-width:560px');css+='\n.doll-save-actions{display:flex;gap:12px;margin-top:12px}.doll-save-actions .cancel{width:35%;background:var(--paper);border:1px solid var(--line);border-radius:26px;min-height:48px}.save:enabled{opacity:1;cursor:pointer}.doll-feedback{font-size:12px;color:var(--coffee);margin:10px 0;min-height:18px}.doll-character{display:flex;gap:8px;margin:12px 0}.doll-character a{padding:7px 15px;border-radius:18px;color:var(--coffee);text-decoration:none;background:var(--paper);border:1px solid var(--line);font-size:12px}.doll-character a[aria-current]{background:var(--ice)}\n';await fs.writeFile(p+'doll.css',css);
let html=(await fs.readFile(base+'START_DOLL_CARD_REVIEW_2026-10-05/index.html','utf8')).match(/<main>[\s\S]*<\/main>/)[0].replace('<main>','<main class="doll-screen">').replace('../me-visual-v3/doll.html','/me').replace('assets/START_LOGO_APPROVED.png','assets/doll/START_LOGO_APPROVED.png').replace('<h1>棉花娃娃</h1>','<h1>棉花娃娃</h1><nav class="doll-character" aria-label="角色"><a href="/me/doll?character=girl">女娃</a><a href="/me/doll?character=boy">男娃</a></nav>').replace('<button class="save" disabled>使用这套穿搭</button>','<p class="doll-feedback" role="status" aria-live="polite"></p><div class="doll-save-actions"><button class="cancel">取消</button><button class="save">使用这套穿搭</button></div>').replace('视觉与动效样片 · 不保存角色配置','本地演示选择 · 未接云端');
let arc=await fs.readFile(base+'START_DOLL_CARD_REVIEW_2026-10-05/arc.js','utf8');arc=arc.replace("'use strict';",'').replace(/const outfits=/,'const girlOutfits=').replace("const accessories=","const outfits=draft.character==='boy'?[{name:'原始穿搭',file:'LOCKED_DOLL_BOY.png',id:'original'}]:[{name:'原始穿搭',file:'LOCKED_DOLL_GIRL.png',id:'original'},...girlOutfits.map((o,i)=>({...o,id:['stage','campus','casual','show'][i]}))];\nconst accessories=");
arc=arc.replace('const expressions=',"const accessoryIds=['bag','camera','earmuffs','scarf','clip','backpack'];accessories.forEach((a,i)=>a.id=accessoryIds[i]);accessories.unshift({name:'不佩戴',file:'LOCKED_DOLL_'+(draft.character==='boy'?'BOY':'GIRL')+'.png',id:'none'});\nconst expressions=");arc=arc.replace("file:'girl_'+id+'.png'","file:draft.character+'_'+id+'.png',id");
arc=arc.replace('assets/','assets/doll/'); // literal first occurrence; replace all below
arc=arc.replaceAll('src="assets/','src="assets/doll/').replaceAll('href="assets/','href="assets/doll/');
arc=arc.replace("let mode='outfit',data=outfits,current=1","let mode='outfit',data=outfits,current=-1");
arc=arc.replace("current=nearest;preview.innerHTML=art(data[current]);","current=nearest;draft=DollState.select(draft,mode,data[current].id);preview.innerHTML=art(data[current]);");
arc=arc.replace('new ResizeObserver(schedule).observe(rail);reduced.addEventListener(\'change\',schedule);',"const observer=new ResizeObserver(schedule);observer.observe(rail);reduced.addEventListener('change',schedule);dollUnmount=()=>{observer.disconnect();reduced.removeEventListener('change',schedule);if(frame)cancelAnimationFrame(frame);};");
arc=arc.replace("mode==='expression'?'表情预览':mode==='accessory'?'配饰参考':'穿搭参考'","mode==='expression'?'表情预览':mode==='accessory'?'配饰偏好':'穿搭预览'");
arc=arc.replace("mode==='expression'?'已有素材':'参考搭配'","mode==='accessory'?'参考图':mode==='expression'?'已有素材':'本地选择'");
arc=arc.replace("mode==='expression'?'仅预览，不保存角色配置':'原始参考搭配 · 尚未拆为正式试穿素材'","mode==='expression'?'更换表情将恢复原始穿搭':mode==='accessory'?'仅保存配饰偏好，暂不合成佩戴效果':'更换穿搭将恢复日常表情'");
arc=arc.replace("mode==='accessory'?'佩戴配饰'","mode==='accessory'?'保存配饰偏好'");
arc=arc.replace("select(mode==='outfit'?1:0,true);","const chosen=data.findIndex(o=>o.id===draft[mode]);select(chosen<0?0:chosen,true);");
arc=arc.replace("render('outfit');",`document.querySelector('.cancel').addEventListener('click',()=>go('/me'));
document.querySelector('.save').addEventListener('click',()=>{paint();try{sessionStorage.setItem('start.doll.demo.v1',JSON.stringify(draft));dollSaved={...draft};document.querySelector('.doll-feedback').textContent=mode==='accessory'?'配饰偏好已保存，尚未合成佩戴效果':'已保存本地选择';}catch{document.querySelector('.doll-feedback').textContent='保存失败，浏览器存储不可用。选择未保存。';}});
render('outfit');`);
await fs.writeFile(p+'doll-views.js',`let dollUnmount=null,dollSaved=null;
function cleanupDoll(){dollUnmount?.();dollUnmount=null;document.querySelector('#doll-style')?.remove();}
function dollRender(){if(pathNow()!=='/me/doll')return false;let warning='';try{const raw=sessionStorage.getItem('start.doll.demo.v1');dollSaved=DollState.restore(raw)||DollState.create();if(raw&&!DollState.restore(raw))warning='旧选择无法读取，已显示默认角色。';}catch{dollSaved=DollState.create();warning='浏览器存储不可用。';}let draft={...dollSaved};if(['girl','boy'].includes(qs().get('character'))&&qs().get('character')!==draft.character)draft=DollState.select(draft,'character',qs().get('character'));const link=document.createElement('link');link.id='doll-style';link.rel='stylesheet';link.href=new URL('doll.css',assetBase).href;document.head.append(link);document.title='START · 棉花娃娃';app.innerHTML=${JSON.stringify(html)};document.querySelectorAll('.doll-character a').forEach(a=>{if(a.getAttribute('href').endsWith(draft.character))a.setAttribute('aria-current','page');});document.querySelector('.doll-feedback').textContent=warning;
${arc}
return true;}
`);
let app=await fs.readFile(p+'app.js','utf8');app=app.replace('function render() {','function render() { cleanupDoll();');app=app.replace('if (tradeRender() || communityRender() || memoryRender() || journeyRender()) return;',`if(dollRender() || tradeRender() || communityRender())return;
    if(memoryRender()){if(pathNow()==='/me'){const section=document.createElement('section');section.className='section';section.innerHTML='<h2>棉花娃娃</h2><a class="rule-row" href="/me/doll"><span>换装、表情与配饰</span><span>›</span></a>';app.querySelector('main')?.append(section);}return;}if(journeyRender())return;`);await fs.writeFile(p+'app.js',app);
for(const file of(await fs.readdir(p)).filter(f=>f.endsWith('.html'))){let doc=await fs.readFile(p+file,'utf8');if(doc.includes('./app.js'))doc=doc.replace('<script defer src="./app.js">','<script defer src="./doll-state.js"></script><script defer src="./doll-views.js"></script><script defer src="./app.js">');await fs.writeFile(p+file,doc);}
let server=await fs.readFile(p+'server.mjs','utf8');server=server.replace("requested === '/community'","requested === '/me/doll' || requested === '/community'").replaceAll('4316','4317');await fs.writeFile(p+'server.mjs',server);
await fs.writeFile(target+'DELIVERY_REPORT.md',`# 已确认娃娃小卡接入
批准范围：2026-10-05 用户确认小卡和独立人物与弧形选择。只新增 /me/doll 与原 Me 下入口，不实现未确认 START Card/隐私等批次。原票根、行程、社群、集市文件保留。
Skill: Apple Design / Animate / Hallmark / Executing Plans。GitHub复核 Embla carousel、package.json及维护者讨论978：MIT，David Jerleke维护，约8.4k stars非质量证明，workspace test存在，最近commit日期未加载；借鉴固定槽宽按距离transform，不引入依赖；局限是改变槽宽会重置，不解决角色组合。
Ruling：素材缺少组合图层，穿搭与表情互斥重置并在操作处说明，配饰只保存偏好不伪造佩戴效果。男女角色独立合法选项；男娃无服装候选则保留原装。保存采用sessionStorage本地演示，取消丢弃未保存选择；存储损坏与拒绝时明确反馈。原图与母版不改。
状态测试先失败（模块尚未实现），随后运行；集成/回归与Open Design验证待执行。
`);
console.log(target);
