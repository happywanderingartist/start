import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const require=createRequire('D:/AI-Data/Cache/codex-runtimes/codex-primary-runtime/dependencies/node/entry.js');
const {chromium}=require('playwright');
const out='D:/Downloads/fan-route-codex-handoff/deliveries/START_FINAL_LAYOUT_REVIEW_2026-10-06';
const browser=await chromium.launch({executablePath:'D:/AppDataMigrated/Playwright/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe'});
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try {
 await page.goto('http://127.0.0.1:4324/home.html');
 const doll=page.locator('.home-companion');await doll.waitFor();
 assert.equal(await doll.locator('img').evaluate(el=>getComputedStyle(el).objectFit),'contain');
 const before=await doll.evaluate(el=>getComputedStyle(el).transform);
 await page.waitForTimeout(650);
 assert.notEqual(await doll.evaluate(el=>getComputedStyle(el).transform),before);
 await page.locator('.companion-pause').click();
 assert.equal(await doll.evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
 await page.locator('.companion-pause').click();
 assert.equal(await doll.evaluate(el=>getComputedStyle(el).animationPlayState),'running');
 await page.screenshot({path:out+'/HOME_DOLL_390.png',fullPage:true});
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await doll.evaluate(el=>getComputedStyle(el).animationName),'none');
 await page.goto('http://127.0.0.1:4324/home.html#/me/doll?preview=boy');
 await page.locator('.carousel .item').first().waitFor();
 assert.equal(await page.locator('[data-mode=accessory]').count(),0);
 assert.equal(await page.locator('.carousel .item').count(),5);
 const rail=page.locator('.carousel');await rail.focus();
 await page.keyboard.press('Home');await page.waitForTimeout(100);
 for(let i=0;i<5;i++) {
  assert.equal(await page.locator('.item[aria-selected=true]').count(),1);
  await page.locator('.save').click();
  const expected=['stage','casual','campus','show','original'][i];
  assert.equal(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('start.doll.demo.v1')).outfit),expected);
  if(i<4){await rail.focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(100);}
 }
 await page.reload();await page.locator('.item[aria-selected=true]').waitFor();
 assert.match(await page.locator('#selected').textContent(),/牛仔/);
 await page.screenshot({path:out+'/BOY_OUTFITS_390.png',fullPage:true});
 await page.locator('[data-mode=expression]').click();
 assert.equal(await page.locator('.carousel .item').count(),4);
 await page.goto('http://127.0.0.1:4324/home.html');
 assert.match(await page.locator('.home-companion img').getAttribute('src'),/LOCKED_DOLL_BOY/);
 assert.deepEqual(errors,[]);
 await fs.writeFile(out+'/DOLL_CHECKS.json',JSON.stringify({errors,checks:['preserved aspect ratio','motion changes transform','pause and resume','reduced motion','five boy outfits selectable and saved','saved outfit restored','four expressions','accessories hidden','home role restored']},null,2));
 console.log('PASS home motion and boy wardrobe');
} finally {await browser.close();}
