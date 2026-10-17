import fs from 'node:fs/promises';
const source=await fs.readFile(new URL('../START_FINAL_LAYOUT_REVIEW_2026-10-06/home.html',import.meta.url),'utf8');
const head=source.match(/<head>([\s\S]*?)<\/head>/i)[1].replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<title>[\s\S]*?<\/title>/i,'<title>START</title>');
await fs.mkdir(new URL('./public-ui/',import.meta.url),{recursive:true});
await fs.writeFile(new URL('./public-ui/index.html',import.meta.url),`<!doctype html><html lang="zh-CN"><head>${head}<link rel="stylesheet" href="public.css"><script defer src="vendor/embla.js"></script><script type="module" src="public.js"></script></head><body><a class="skip-link" href="#app">跳到内容</a><div id="app" tabindex="-1" aria-live="polite"></div><noscript>请开启浏览器脚本以查看已发布内容。</noscript></body></html>`);
const me=await fs.readFile(new URL('../START_FINAL_LAYOUT_REVIEW_2026-10-06/me.html',import.meta.url),'utf8');
await fs.writeFile(new URL('./public-ui/legacy-me.html',import.meta.url),me.replace('<head>','<head><base href="/prototype/">').replace('<script defer src="./app.js">','<script defer src="/app/legacy-bridge.js"></script><script defer src="./app.js">'));
