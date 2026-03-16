const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const TMP = path.join(process.cwd(), '.tmp');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-zygote', '--disable-software-rasterizer'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    await page.goto(`file://${process.cwd()}/index.html`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.click('text=HTML App Builder');
    await page.waitForTimeout(500);
    await page.locator('.app-card-grid').first().click();
    await page.waitForTimeout(1500);
    
    // TAKE SCREENSHOT BEFORE FILL
    await page.screenshot({ path: path.join(TMP, '3-editor-debug.png') });

    await page.fill('#chatInput', 'Test message to check scrolling 1');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await context.close();
    await browser.close();
  }
})();
