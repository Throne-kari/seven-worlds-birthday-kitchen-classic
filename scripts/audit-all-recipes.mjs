import {chromium} from '@playwright/test';
import fs from 'node:fs';
const recipes=JSON.parse(fs.readFileSync('src/data/recipes/all.json','utf8'));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});const failures=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
let count=0;
for(const r of recipes){
 await page.goto(`http://127.0.0.1:5173/?world=${r.categoryId}&recipe=${r.id}`,{waitUntil:'domcontentloaded'});
 await page.locator('#panel-title').waitFor();
 const actual=await page.evaluate(()=>({title:document.querySelector('#panel-title').textContent,ingredients:document.querySelectorAll('.ingredient-row').length,prep:document.querySelectorAll('.prep-section li').length,steps:[...document.querySelectorAll('.step-action')].map(e=>e.textContent),doneness:[...document.querySelectorAll('.doneness')].map(e=>e.textContent),overflow:document.querySelector('dialog').scrollWidth-document.querySelector('dialog').clientWidth}));
 if(actual.title!==r.titleZh||actual.ingredients!==r.ingredients.length||actual.prep!==r.prepSteps.length||actual.steps.length!==r.steps.length||actual.steps.some((text,i)=>text!==r.steps[i].action)||actual.doneness.some((text,i)=>!text.includes(r.steps[i].doneness)||!text.includes(r.steps[i].visualCue))||actual.overflow>1)failures.push({id:r.id,actual});
 count++;if(count%25===0)console.log(`Rendered and checked ${count} / ${recipes.length}`);
}
await browser.close();const report={checkedAt:new Date().toISOString(),viewport:'390x844',total:count,failures,errors};fs.writeFileSync('qa/all-recipe-rendering.json',JSON.stringify(report,null,2));console.log(JSON.stringify({total:count,failures:failures.length,errors},null,2));if(failures.length||errors.length)process.exitCode=1;
