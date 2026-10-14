import {test,expect} from '@playwright/test';
test('navigation uses all seven world entrances and ambient motion stops when disabled',async({page})=>{
 await page.goto('/');
 for(const [id,theme]of [['chuan','csgo'],['xiang','delta'],['lu','pubg'],['yue','apex'],['jiangzhe','elden'],['western-dessert','palworld'],['jin','forest']]){
  await page.locator(`[data-action="world"][data-world="${id}"]`).click();
  await expect(page.locator('body')).toHaveAttribute('data-theme',theme);
  await expect(page.locator('html')).toHaveAttribute('data-scene-transition',theme);
  await expect(page.locator(`.world-${theme}`)).toBeVisible();
 }
 // Hover waits for the view-transition overlay to finish before delivering input.
 const stage=page.locator('.world-stage');const bounds=await stage.boundingBox();
 await stage.hover({position:{x:bounds.width*.75,y:bounds.height*.5}});
 await expect.poll(()=>stage.evaluate(e=>Math.abs(parseFloat(e.style.getPropertyValue('--mx'))||0))).toBeGreaterThan(1);
 await page.locator('.header-tools [data-action="settings"]').click();await page.locator('#motion-setting').uncheck();await page.keyboard.press('Escape');await expect(page.locator('.atmosphere')).toBeHidden();
});
test('touchscreen has no decorative pointer and the candle stays operable',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const page=await context.newPage();await page.goto('http://127.0.0.1:5173/?world=western-dessert');
 await expect(page.locator('body')).not.toHaveClass(/custom-cursor-enabled/);await page.locator('[data-action="wish"]').tap();await expect(page.locator('.birthday-candle')).toHaveClass(/is-out/);await context.close();
});
