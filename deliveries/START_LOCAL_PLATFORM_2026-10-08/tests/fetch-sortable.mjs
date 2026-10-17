import fs from 'node:fs/promises';
for(const p of ['repos/SortableJS/Sortable','repos/SortableJS/Sortable/commits?per_page=1']){
 const r=await fetch('https://api.github.com/'+p);const j=await r.json();console.log(JSON.stringify(Array.isArray(j)?{date:j[0]?.commit?.committer?.date}:{stars:j.stargazers_count,pushed:j.pushed_at,license:j.license?.spdx_id}));
}
for(const [remote,local] of [['modular/sortable.esm.js','public-ui/sortable.mjs'],['LICENSE','public-ui/SORTABLE-LICENSE.txt']]){
 const r=await fetch('https://api.github.com/repos/SortableJS/Sortable/contents/'+remote+'?ref=1.15.6');if(!r.ok)throw Error(r.status);const j=await r.json();await fs.writeFile(local,Buffer.from(j.content,'base64'));
}
