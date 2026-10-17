import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {extractPlaces} from '../../START_ADMIN_CONTENT_VISUAL_2026-10-07/place-extractor.mjs';
const text='上海打卡：上海邮政博物馆，然后到乍浦路桥。';
let report={at:new Date().toISOString(),passed:false,realModel:true,cloud:false};
try{const result=await extractPlaces({text,city:'上海',signal:AbortSignal.timeout(90000)});assert.ok(result.items.some(item=>item.name==='上海邮政博物馆'));assert.ok(result.items.some(item=>item.name==='乍浦路桥'));assert.ok(result.items.every(item=>text.includes(item.name)));report={...report,passed:true,result};console.log('PASS local model real inference',result.items.length,'places');}
catch(error){report.error=error.code||error.message;throw error;}
finally{await fs.writeFile(new URL('../evidence/EXTRACTOR_LIVE_SMOKE.json',import.meta.url),JSON.stringify(report,null,2));}
