import fs from 'node:fs/promises';
const base='D:/Downloads/fan-route-codex-handoff/deliveries/';
const dst=base+'START_ME_VISUAL_REVIEW_2026-10-05_v3/';
await fs.cp(base+'START_ME_VISUAL_REVIEW_2026-10-05_v2/',dst,{recursive:true});
const source='D:/Downloads/fan-route-codex-handoff/.worktrees/character-asset-baseline/character-assets/';
const manifest=JSON.parse(await fs.readFile(source+'character-assets.json','utf8'));
for(const gender of ['girl','boy'])for(const state of ['default','happy_open_eye','curious','surprised']){
 const file=`${gender}/expressions/${gender}_expr_${state}_v1.png`;
 if(!manifest.candidates.some(a=>a.file===file&&a.qaStatus==='accepted'))throw Error('Unaccepted '+file);
 await fs.copyFile(source+file,dst+`assets/${gender}_${state}.png`);
}
let build=await fs.readFile(dst+'build-visuals.mjs','utf8');
build=build.replace('<section class="doll-destinations">','<section class="doll-personalise">${row(\'换装\',\'上装、下装与配饰\',boy?\'dress-boy.html\':\'dress.html\',\'clay\')}${row(\'换表情\',\'日常、开心、好奇、惊讶\',boy?\'expression-boy.html\':\'expression.html\',\'leaf\')}</section><section class="doll-destinations">');
const extra=`
function customise(boy=false,expression=false){
 const gender=boy?'boy':'girl';
 const options=expression?[['default','日常'],['happy_open_eye','开心'],['curious','好奇'],['surprised','惊讶']]:[['original','原始穿搭'],['shirt','冰蓝衬衫'],['knit','叶绿针织'],['vest','陶黄马甲']];
 return top(true).replace('href="me.html"','href="'+(boy?'doll-boy':'doll')+'.html"').replace('返回 Me','返回棉花娃娃')+title(expression?'换表情':'换装')+
 '<nav class="doll-tabs" aria-label="装扮分类"><a href="'+(boy?'dress-boy':'dress')+'.html" '+(!expression?'aria-current="page"':'')+'>换装</a><a href="'+(boy?'expression-boy':'expression')+'.html" '+(expression?'aria-current="page"':'')+'>换表情</a></nav>'+
 '<section class="doll-stage custom-stage '+(expression?'expression-stage':'dress-stage')+'" aria-label="当前装扮静态预览"><span class="stage-circle" aria-hidden="true"></span><span class="stage-ground" aria-hidden="true"></span><img src="assets/LOCKED_DOLL_'+(boy?'BOY':'GIRL')+'.png" alt="锁定角色原图，当前为原始穿搭与日常表情"><small>当前 / '+(expression?'日常表情':'原始穿搭')+'</small></section>'+
 (expression?'': '<nav class="wardrobe-tabs" aria-label="衣橱分类视觉示意"><span aria-current="page">上装</span><span>下装</span><span>配饰</span></nav>')+
 '<section class="custom-options" aria-label="'+(expression?'表情':'上装')+'候选视觉稿">'+options.map(([id,name],i)=>'<button disabled aria-pressed="'+(i===0)+'" class="option '+(i===0?'chosen':'')+'">'+(expression?'<span class="option-art tone-'+i+'"><img src="assets/'+gender+'_'+id+'.png" alt="'+name+'表情原素材"></span>':i===0?'<span class="option-art tone-0"><img src="assets/LOCKED_DOLL_'+(boy?'BOY':'GIRL')+'.png" alt="原始穿搭"></span>':'<span class="option-art tone-'+i+'"><svg viewBox="0 0 100 100" aria-hidden="true"><path d="M31 20L20 26 8 47 25 57 31 45 31 85 69 85 69 45 75 57 92 47 80 26 69 20Q50 37 31 20Z"/></svg></span>')+'<span class="option-label">'+name+'</span><small>'+(i===0?'✓ 当前':expression?'已有素材':'款式草图 · 待制作')+'</small></button>').join('')+'</section>'+
 '<div class="actions"><a class="secondary" href="'+(boy?'doll-boy':'doll')+'.html">取消</a>'+button(expression?'使用表情':'保存穿搭')+'</div><p class="small-note">'+(expression?'静态视觉稿，选择与保存待确认后接入。':'服装为款式草图，角色试穿素材待制作。')+'</p>'+foot();
}
`;
build=build.replace('const pages=[',extra+"\nconst pages=[['dress','换装',()=>customise()],['dress-boy','男娃换装',()=>customise(true)],['expression','换表情',()=>customise(false,true)],['expression-boy','男娃换表情',()=>customise(true,true)],");
build=build.replace("['dolls','棉花娃娃 · 两种锁定角色',['doll','doll-boy','me','settings']]","['dolls','棉花娃娃 · 两种锁定角色',['doll','doll-boy','me','settings']],['customisation','棉花娃娃 · 换装与表情',['doll','dress','expression','expression-boy']]");
build=build.replace('<a href="states.html">编辑与隐私</a>','<a href="states.html">编辑与隐私</a><a href="customisation.html">换装与表情</a>');
build=build.replace('14 Me static pages and 3 boards generated','18 Me static pages and 4 boards generated');
await fs.writeFile(dst+'build-visuals.mjs',build);
await fs.appendFile(dst+'me.css',`
/* V3 customisation: locked identity; distinct wardrobe and expression panels */
.doll-personalise{background:var(--linen);border-radius:12px;padding:0 14px}.doll-personalise .row:last-child{border-bottom:0}
.custom-stage{height:275px}.custom-stage>img{width:240px;height:240px}.dress-stage{background:var(--clay)}.dress-stage .stage-ground{background:var(--linen)}.expression-stage{background:var(--ice)}.expression-stage .stage-circle{background:var(--paper)}.expression-stage .stage-ground{background:var(--leaf)}
.wardrobe-tabs{display:flex;gap:24px;border-bottom:1px solid var(--rule);padding-bottom:12px;color:var(--muted)}.wardrobe-tabs [aria-current]{color:var(--coffee);font-weight:700}
.custom-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.option{background:transparent;text-align:left;padding:0;min-width:0;border-radius:12px}.option-art{display:flex;justify-content:center;align-items:center;height:130px;border-radius:12px;border:2px solid transparent}.chosen .option-art{border-color:var(--coffee)}.option-art img{width:116px;height:116px;object-fit:contain}.tone-0{background:var(--linen)}.tone-1{background:var(--ice)}.tone-2{background:var(--leaf)}.tone-3{background:var(--clay)}.option-art svg{width:75px;height:75px;fill:var(--paper);stroke:var(--coffee);stroke-width:2;stroke-linejoin:round}.option-label{display:block;font-size:14px;font-weight:600;margin:8px 0 2px}.option small{font-size:10px;color:var(--muted)}.custom-options+.actions{margin-top:0}.board-cell .custom-stage{height:250px}.board-cell .custom-options{gap:12px}.board-cell .option-art{height:115px}.board-cell .option-art img{width:103px;height:103px}
`);
let exporter=await fs.readFile(dst+'export-review.mjs','utf8');
exporter=exporter.replace("['dolls','DOLL_BOARD.png']","['dolls','DOLL_BOARD.png'],['customisation','DOLL_CUSTOMISATION_BOARD.png']");
await fs.writeFile(dst+'export-review.mjs',exporter);
await fs.writeFile(dst+'APPROVAL_STATUS.json',JSON.stringify({version:3,approved:false,integrated:false,visual_status:'awaiting_user_confirmation',business_changes:false,static_width_checks:0,open_design_preview_verified:false,motion_approved:false,outfit_assets:'concept sketches only; try-on assets missing',expression_assets:'8 accepted byte-identical source files'},null,2));
await fs.appendFile(dst+'DESIGN_CONTRACT.md', '\nV3 补齐换装与换表情独立页面（女娃/男娃各一）。Interaction Design：当前装扮明确标识、预览后保存、取消返回。Apple Design：大标题、稳定分类、下方主动作。Hallmark：沿用色卡、明确素材状态、无需商店与虚构解锁数量。表情使用 accepted 现有原图，服装只有示意款式草图，尚无锁定角色试穿资产；原母版不编辑。所有业务控件禁用，等待视觉确认。GitHub 复核 DiceBear 及 styles/schema：固定身份与选项分离可复用，MIT 核心与样式单独许可；约9.8k stars 仅作规模背景。已有测试与跨语言输出一致性可参考，近期提交日期未验证。局限是 SVG 头像体系不能替换棉花娃娃，未复制素材/代码或添加依赖。https://github.com/dicebear/dicebear 。\n');
await fs.writeFile(dst+'DELIVERY_REPORT.md','# Me V3：换装与表情视觉补齐\n新增 dress/dress-boy/expression/expression-boy 与 customisation 画板。原 V2 保留。换装为界面与服装款式示意，无试穿图；表情为锁定身份已验收素材。未实现保存、切换、动画或接入现有原型。等待本批视觉确认。\n');
console.log(dst);
