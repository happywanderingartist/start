import {extractPlaces} from './place-extractor.mjs';
import fs from 'node:fs/promises';
const cases=[['未知城市','打卡趵突泉，再去大明湖。'],['重复名称','上海：星巴克。南京：星巴克。'],['原文关闭描述','济南：不贵书店已停业，具体开放信息请核对。'],['济南','济南：起点趵突泉，接着李清照纪念堂、大明湖、曲水亭街、厚德泉，终点不贵书店。'],['混合城市','上海：外滩、上海邮政博物馆。南京：夫子庙、三七八巷。'],['空','我喜欢安溥和苏打绿，想去上海看看。']];
const output=[];
for(const [label,text] of cases){const start=Date.now();try{const r=await extractPlaces({text,signal:AbortSignal.timeout(90000)});output.push({label,ms:Date.now()-start,...r});console.log(JSON.stringify(output.at(-1)));}catch(e){output.push({label,error:e.code||e.name,ms:Date.now()-start});console.log(JSON.stringify(output.at(-1)));}}
await fs.writeFile('LOCAL_MODEL_CHECK.json',JSON.stringify(output,null,2));