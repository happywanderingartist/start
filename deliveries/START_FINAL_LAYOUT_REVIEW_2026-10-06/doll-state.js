(function(root){'use strict';
const allowed={character:['girl','boy'],outfit:['original','stage','campus','casual','show'],expression:['default','happy_open_eye','curious','surprised'],accessory:['none','bag','camera','earmuffs','scarf','clip','backpack']};
function create(){return {version:1,character:'girl',outfit:'original',expression:'default',accessory:'none'}}
function valid(s){return s&&s.version===1&&Object.keys(allowed).every(k=>allowed[k].includes(s[k]))&&!(s.outfit!=='original'&&s.expression!=='default')}
function restore(raw){try{const s=JSON.parse(raw);return valid(s)?Object.fromEntries(['version',...Object.keys(allowed)].map(k=>[k,s[k]])):null}catch{return null}}
function select(s,k,v){if(!valid(s)||!allowed[k]?.includes(v))throw Error('Invalid doll selection');const n={...s,[k]:v};if(k==='character'){n.outfit='original';n.expression='default'}if(k==='outfit'){n.expression='default'}if(k==='expression')n.outfit='original';return n}
root.DollState={create,restore,select};})(globalThis);