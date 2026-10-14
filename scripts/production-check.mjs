import {chromium} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
const dist=path.resolve('dist');
const types={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://127.0.0.1');if(!url.pathname.startsWith('/birthday/')){res.writeHead(404);res.end();return;}const relative=decodeURIComponent(url.pathname.slice('/birthday/'.length))||'index.html';const file=path.resolve(dist,relative);if(!file.startsWith(dist+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
await new Promise(resolve=>server.listen(4174,'127.0.0.1',resolve));
const report=[];
for(const executablePath of ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']){
 const browser=await chromium.launch({headless:true,executablePath});const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('requestfailed',request=>errors.push(request.url()));
 for(const url of ['http://127.0.0.1:4173/','http://127.0.0.1:4174/birthday/?world=jiangzhe&recipe=jiangzhe-002']){
  await page.goto(url,{waitUntil:'networkidle'});await page.locator('.world-stage').waitFor();await page.locator('.scene-image img').evaluate(image=>image.decode());
  const state=await page.evaluate(()=>({title:document.title,recipe:document.querySelector('dialog[open] h1')?.textContent||null,readyImages:[...document.images].every(i=>i.complete&&i.naturalWidth>0),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}));
  report.push({browser:executablePath.includes('Edge')?'Edge':'Chrome',url,...state,errors:[...errors]});
 }
 await browser.close();
}
server.close();fs.writeFileSync('qa/production-check.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(report.some(r=>r.errors.length||!r.readyImages||r.overflow>1))process.exitCode=1;
