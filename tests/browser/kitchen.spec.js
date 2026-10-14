import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
const worlds=['jin','chuan','xiang','lu','yue','jiangzhe','western-dessert'];
test('all seven worlds fit desktop, tablet and small phones and expose search',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [1440,1280,768,390,360,320]){
  await page.setViewportSize({width,height:width===768?1024:900});
  for(const world of worlds){
   await page.goto(`/?world=${world}`,{waitUntil:'domcontentloaded'});
   await expect(page.locator('.world-stage')).toBeVisible();
   await expect(page.locator('#global-search')).toBeVisible();
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   expect(overflow,`${world} at ${width}`).toBeLessThanOrEqual(1);
   const active=page.locator('.world-nav [aria-current=page]');
   const box=await active.boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width+1);
  }
 }
 expect(errors).toEqual([]);
});
test('Chinese and UK ingredient search, keyboard navigation, clear and no results',async({page})=>{
 await page.goto('/');const search=page.locator('#global-search');
 await search.fill('plain flour');await expect(page.locator('.search-result').first()).toBeVisible();
 await page.keyboard.press('ArrowDown');await expect(search).toHaveAttribute('aria-activedescendant','search-option-0');await page.keyboard.press('Enter');await expect(page.locator('dialog[open] h1')).toBeVisible();
 await page.keyboard.press('Escape');await expect(page.locator('dialog[open]')).toHaveCount(0);
 await search.fill('不可能存在的食材XYZ123');await expect(page.locator('.search-empty')).toContainText('没有匹配');
 await page.locator('[data-action="clear-search"]').click();await expect(search).toHaveValue('');await expect(page.locator('#global-results')).toBeHidden();
});
test('portion scaling, favourites, shopping checks and persistence',async({page})=>{
 await page.goto('/?world=jin&recipe=jin-001');
 const firstAmount=page.locator('.ingredient-amount').first();const before=parseFloat(await firstAmount.textContent());
 await page.locator('[data-action="portion-plus"]').click();await expect(firstAmount).toContainText(String(before*1.5));
 await page.locator('dialog [data-action="favourite"]').click();await page.locator('[data-action="add-plan"]').click();
 await page.keyboard.press('Escape');await page.locator('[data-action="show-plan"]').click();await expect(page.locator('.plan-dish')).toHaveCount(1);await expect(page.locator('.plan-dish .portion-control')).toContainText('3');
 await page.locator('.shopping-row input').first().check();
 await page.reload();await page.locator('[data-action="show-plan"]').click();await expect(page.locator('.shopping-row input').first()).toBeChecked();
 await page.keyboard.press('Escape');await page.locator('[data-action="show-favourites"]').click();await expect(page.locator('dialog .recipe-card')).toHaveCount(1);
});
test('waiting timer uses 30 minutes, pauses and recovers actual elapsed time',async({page})=>{
 await page.goto('/?world=jin&recipe=jin-001');await page.locator('[data-action="start-cooking"]').click();
 await page.locator('[data-action="start-step-timer"]').click();
 await expect(page.locator('.timer-panel-row time')).toContainText('30:');
 await page.locator('[data-action="toggle-timer"]').click();
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('seven-kitchens.v1')));
 const key=Object.keys(stored.timers)[0];expect(stored.timers[key].status).toBe('paused');expect(stored.timers[key].durationMs).toBe(1800000);
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('seven-kitchens.v1'));const t=Object.values(s.timers)[0];t.status='running';t.deadline=Date.now()-1000;localStorage.setItem('seven-kitchens.v1',JSON.stringify(s));});
 await page.reload();await page.keyboard.press('Escape');await expect(page.locator('.timer-dock')).toContainText('到时间了');
});
test('crate, map, wheel, stations and candle have actual state changes',async({page})=>{
 await page.goto('/?world=lu');await page.locator('[data-action="toggle-crate"]').click();await expect(page.locator('.crate-area')).toHaveClass(/is-open/);await expect(page.locator('#crate-manifest')).not.toHaveAttribute('inert','');
 await page.goto('/?world=chuan');await page.locator('[data-action="flavour"][data-value="鱼香"]').click();await expect(page.locator('#local-search')).toHaveValue('鱼香');
 await page.goto('/?world=jiangzhe');await page.locator('[data-action="map-taste"][data-value="炖"]').click();await expect(page.locator('#local-search')).toHaveValue('炖');await expect(page.locator('.recipe-card')).not.toHaveCount(0);
 await page.goto('/?world=yue');await page.locator('[data-action="station"][data-value="1"]').click();await expect(page.locator('.station-heat')).toHaveClass(/active/);await expect(page.locator('dialog .cooking-layout')).toBeVisible();await page.keyboard.press('Escape');await page.locator('[data-action="open-cooking"]').click();await expect(page.locator('dialog .cooking-layout')).toBeVisible();
 await page.goto('/?world=western-dessert');await page.locator('[data-action="wish"]').click();await expect(page.locator('.birthday-candle')).toHaveClass(/is-out/);await expect(page.locator('.candle-flame')).toHaveCSS('opacity','0');await page.locator('[data-action="wish"]').click();await expect(page.locator('.birthday-candle')).not.toHaveClass(/is-out/);
});
test('reduced motion disables ambient animation; settings survive reload',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?world=western-dessert');await expect(page.locator('.atmosphere')).toBeHidden();await expect(page.locator('.candle-flame')).toHaveCSS('animation-name','none');
 await page.locator('.header-tools [data-action="settings"]').click();await page.locator('#motion-setting').uncheck();await page.locator('#cursor-setting').check();await page.reload();await expect(page.locator('body')).toHaveClass(/motion-off/);await expect(page.locator('body')).not.toHaveClass(/custom-cursor-enabled/);
});
test('keyboard trap, modal escape and full recipe readability on a small phone',async({page})=>{
 await page.setViewportSize({width:320,height:800});await page.goto('/?world=jin&recipe=jin-001');
 for(let i=0;i<20;i++){await page.keyboard.press('Tab');expect(await page.evaluate(()=>Boolean(document.activeElement.closest('dialog')))).toBe(true);}
 await expect(page.locator('.recipe-header h1')).toBeVisible();const overflow=await page.locator('dialog').evaluate(el=>el.scrollWidth-el.clientWidth);expect(overflow).toBeLessThanOrEqual(1);
 await page.keyboard.press('Escape');await expect(page.locator('dialog[open]')).toHaveCount(0);
});
test('accessibility audit of homepage, recipe and shopping basket',async({page})=>{
 test.setTimeout(120000);
 const report=[];
 for(const url of [...worlds.map(world=>`/?world=${world}`),'/?world=jin&recipe=jin-001']){
  await page.goto(url);const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();report.push({url,violations:result.violations});
 }
 await page.locator('dialog details').evaluateAll(elements=>elements.forEach(el=>el.open=true));
 await page.locator('dialog').evaluate(el=>el.scrollTop=el.scrollHeight);
 report.push({url:'expanded recipe details',violations:(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations});
 await page.locator('dialog').evaluate(el=>el.scrollTop=0);await page.locator('[data-action="add-plan"]').click();await page.keyboard.press('Escape');await page.locator('[data-action="show-plan"]').click();
 report.push({url:'shopping basket',violations:(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations});
 fs.writeFileSync('qa/accessibility.json',JSON.stringify(report,null,2));
 expect(report.flatMap(r=>r.violations.filter(v=>['critical','serious'].includes(v.impact)).map(v=>({url:r.url,id:v.id,nodes:v.nodes.map(n=>n.target)})))).toEqual([]);
});
