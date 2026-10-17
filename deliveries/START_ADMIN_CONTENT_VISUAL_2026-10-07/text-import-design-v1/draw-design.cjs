const fs=require('node:fs'),path=require('node:path');
const C={paper:'#FBF3E8',ink:'#3F241C',coffee:'#702720',ice:'#CBE5FE',blue:'#3B7789',linen:'#EAE5DA',line:'#D7BEB0',muted:'#765C51'};const out=[];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function rect(x,y,w,h,fill=C.paper,stroke='none',r=12){out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`);}
function text(x,y,s,size=16,fill=C.ink,weight=400){out.push(`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}">${esc(s)}</text>`);}
function line(x1,y1,x2,y2){out.push(`<path d="M${x1},${y1}L${x2},${y2}" stroke="${C.line}"/>`);}
function btn(x,y,w,s,primary=true,disabled=false){rect(x,y,w,44,primary?C.ice:C.paper,primary?'none':C.line,10);out.push(`<g${disabled?' opacity="0.5"':''}>`);text(x+16,y+28,s,15,primary?C.blue:C.coffee,600);out.push('</g>');}
function field(x,y,w,label,value){text(x,y,label,14,C.ink,600);rect(x,y+11,w,44,C.paper,C.line,9);text(x+13,y+39,value,16);}
rect(0,0,1400,1120,C.paper,'none',0);text(40,48,'从文字提取地点',30,C.ink,700);text(1010,45,'视觉确认稿 · 示例结果',16,C.coffee,600);text(40,82,'粘贴原文，检查名称和地图地点，再加入草稿。',17,C.muted);
line(40,104,1360,104);text(40,139,'01  粘贴文字',17,C.coffee,650);text(680,139,'02  检查地点',17,C.coffee,650);
rect(40,159,610,746,C.paper,C.line,18);rect(680,159,680,746,C.paper,C.line,18);
text(66,197,'原文',17,C.ink,650);text(443,197,'小红书等平台 · 手动粘贴',12,C.muted);
rect(66,216,558,251,C.paper,C.line,12);const raw=['安溥济南 Citywalk','先去趵突泉，旁边是李清照纪念堂；','再到大明湖、曲水亭街、厚德泉，','最后逛不贵书店。','不贵书店别忘了拍照。'];raw.forEach((s,i)=>text(83,253+i*32,s,18));text(83,449,'也支持无序的地点清单。',13,C.muted);
field(66,501,263,'默认城市','济南');field(361,501,263,'艺人（单独选择）','安溥');field(66,595,558,'来源链接（选填）','粘贴原始笔记链接');
text(66,690,'导入到',14,C.ink,600);rect(66,704,558,44,C.linen,'none',9);text(79,732,'当前路线：安溥济南 Citywalk',16);btn(449,786,175,'识别地点');text(66,819,'城市缺失或跨城市地点，会留待核对。',13,C.muted);text(66,858,'原文保留在草稿中，方便回看和修改。',13,C.muted);
text(706,197,'6 个候选名称',20,C.ink,650);text(706,227,'示例排版 · 尚未搜索高德，尚未加入路线',13,C.muted);text(1198,198,'＋ 手动补充',14,C.coffee,600);line(706,248,1334,248);
const rows=[['趵突泉','先去趵突泉','高德匹配待查询','查找地点'],['李清照纪念堂','旁边是李清照纪念堂','高德匹配待查询','查找地点'],['大明湖','再到大明湖','高德匹配待查询','查找地点'],['曲水亭街','曲水亭街','同名候选时，由你选具体地点','选择地图'],['厚德泉','厚德泉','没匹配到时，可改名后重试','修改名称'],['不贵书店','最后逛不贵书店','原文出现 2 次，建议合并','查看原文']];
rows.forEach((row,i)=>{const y=268+i*88;rect(706,y+4,19,19,C.paper,C.line,4);text(741,y+20,String(i+1).padStart(2,'0'),12,C.muted);rect(770,y-5,327,37,C.paper,C.line,7);text(782,y+19,row[0],17,C.ink,600);text(1315,y+20,'×',22,C.muted);text(770,y+51,'原文：'+row[1],12,C.muted);text(770,y+72,row[2],11,i===3||i===4?C.coffee:C.muted);btn(1142,y-6,132,row[3],i!==4);if(i<5)line(706,y+80,1334,y+80);});
line(706,813,1334,813);text(706,846,'地图地点未确认',14,C.coffee,600);text(706,872,'可删、可改、可补充；顺序仍可调整。',12,C.muted);btn(1129,829,205,'检查后加入路线',true,true);
line(40,938,1360,938);text(40,970,'同一入口的状态',16,C.ink,650);const states=[['识别中','正在提取地点 · 可取消'],['空结果','未找到地点 · 手动补充'],['失败','保留原文 · 重试识别'],['加入后','进入草稿 · 可撤销本批']];states.forEach((s,i)=>{const x=40+i*330;text(x,1004,s[0],14,C.coffee,600);text(x,1031,s[1],14,C.muted);});text(40,1080,'本稿仅展示结构与样例。智能识别、高德批量匹配及加入草稿的业务逻辑，待视觉确认后接入。',14,C.muted);
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1120" viewBox="0 0 1400 1120"><title>START 从文字提取地点视觉确认稿</title><desc>左侧粘贴原文，右侧核对地点名称、原文片段及地图匹配。所有结果为示例，不代表真实识别。</desc><g font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Microsoft YaHei, sans-serif">${out.join('')}</g></svg>`;
fs.writeFileSync(path.join(__dirname,'TEXT_IMPORT_VISUAL.svg'),svg);
fs.writeFileSync(path.join(__dirname,'TEXT_IMPORT_VISUAL.html'),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>START 文字识别地点 · 视觉确认稿</title><style>body{margin:0;background:${C.paper}}svg{display:block;width:100%;height:auto}*{box-sizing:border-box}</style><body>${svg}</body></html>`);