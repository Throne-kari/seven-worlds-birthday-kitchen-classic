import {chromium} from '@playwright/test';
import fs from 'node:fs';
fs.mkdirSync('qa/screenshots',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
const results=[];
const baseURL=process.env.REVIEW_URL||'http://127.0.0.1:5173';
for(const size of [{width:1440,height:1000},{width:390,height:844}]){
 await page.setViewportSize(size);
 for(const world of ['jin','chuan','xiang','lu','yue','jiangzhe','western-dessert']){
  await page.goto(`${baseURL}/?world=${world}`,{waitUntil:'networkidle'});
  await page.locator('.scene-image img').evaluate(image=>image.decode());
  await page.screenshot({path:`qa/screenshots/${world}-${size.width}.png`,fullPage:false});
  const dimensions=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,heading:document.querySelector('h1')?.textContent,buttons:[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0).length}));
  results.push({world,width:size.width,...dimensions});
 }
}
await page.setViewportSize({width:1440,height:1000});
await page.goto(`${baseURL}/?world=jin`,{waitUntil:'networkidle'});
await page.locator('#global-search').fill('番茄');
await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');
await page.locator('dialog[open]').waitFor();
await page.screenshot({path:'qa/screenshots/recipe-desktop.png'});
await page.locator('[data-action="portion-plus"]').click();
await page.locator('[data-action="add-plan"]').click();
await page.locator('[data-action="start-cooking"]').click();
await page.screenshot({path:'qa/screenshots/cooking-desktop.png'});
await page.setViewportSize({width:390,height:844});
await page.screenshot({path:'qa/screenshots/cooking-mobile.png'});
await page.locator('[data-action="back-to-recipe"]').click();
await page.screenshot({path:'qa/screenshots/recipe-mobile.png'});
await page.keyboard.press('Escape');
await page.locator('[data-action="show-plan"]').click();
await page.screenshot({path:'qa/screenshots/shopping-mobile.png'});
results.push({interaction:'search-keyboard / recipe / scale / add-plan / cooking / mobile / escape',status:'passed'});
fs.writeFileSync('qa/browser-first-pass.json',JSON.stringify({results,errors},null,2));
console.log(JSON.stringify({results,errors},null,2));
await browser.close();
if(errors.length)process.exitCode=1;
