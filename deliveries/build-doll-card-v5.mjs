import fs from 'node:fs/promises';
const base='D:/Downloads/fan-route-codex-handoff/deliveries/';const dst=base+'START_DOLL_CARD_REVIEW_2026-10-05/';
await fs.cp(base+'START_DOLL_ARC_REVIEW_2026-10-05/',dst,{recursive:true});
let js=await fs.readFile(dst+'arc.js','utf8');
js=js.replace(/const outfits=.*?;\n/,"const outfits=[['舞台造型','CUTOUT_STAGE.png'],['校园风','CUTOUT_CAMPUS.png'],['日常休闲','CUTOUT_CASUAL.png'],['综艺 / 舞台','CUTOUT_SHOW.png']].map(([name,file])=>({name,file}));\n");
await fs.writeFile(dst+'arc.js',js);
await fs.appendFile(dst+'arc.css',`
/* V5 portrait cards: clean individual subjects */
.stage{height:330px;overflow:visible}.halo{display:none}#preview{width:230px;height:310px;background:var(--ice);border:8px solid var(--paper);outline:1px solid var(--line);border-radius:16px;box-shadow:0 5px 14px color-mix(in srgb,var(--coffee) 8%,transparent);padding:12px 6px 22px}#preview>img{border-radius:0;max-height:100%;object-fit:contain}#preview>svg{border-radius:6px}.spark{right:20px;top:40px;font-size:23px}.picker{height:195px}.carousel{height:195px}.item{height:178px;padding:16px 10px 0}.item .thumb{height:120px;width:94px;background:var(--ice);border:5px solid var(--paper);outline:1px solid var(--line);border-radius:10px;padding:6px}.item[aria-selected=true] .thumb{border:5px solid var(--paper);outline:2px solid var(--coffee)}.thumb img{border-radius:0}.arc-line{top:98px}.selection{margin-top:8px}
`);
let html=await fs.readFile(dst+'index.html','utf8');html=html.replace('棉花娃娃弧形选择视觉样片','棉花娃娃人物小卡视觉样片');await fs.writeFile(dst+'index.html',html);
await fs.writeFile(dst+'APPROVAL_STATUS.json',JSON.stringify({approved:false,integrated:false,motion_sample:true,save_enabled:false,cutouts:'imagegen derived review candidates, not accepted identity masters',open_design_preview_verified:false},null,2));
await fs.appendFile(dst+'DESIGN_NOTES.md','\nV5：人物从参考图独立提取，使用 imagegen 保留身份的透明抠图候选，不覆盖原参考与已锁定母版。人物主预览与轮播均改为小卡（冰蓝底、奶油纸边、咖啡细边线），剔除临近角色头发及原纸背景。提取后的身份一致性等待用户视觉确认。\n');
console.log(dst);
