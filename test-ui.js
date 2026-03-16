const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const TMP = path.join(process.cwd(), '.tmp');
  fs.mkdirSync(TMP, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-zygote', '--disable-software-rasterizer'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const logs = { console: [], errors: [], network: [] };
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warn') {
      console.error(`[browser:${msg.type()}] ${msg.text()}`);
    }
  });
  page.on('pageerror', err => console.error(`[browser:pageerror] ${err.message}`));

  try {
    console.log('Navigating to index.html...');
    await page.goto(`file://${process.cwd()}/index.html`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    console.log('Taking screenshot of initial Playlist view...');
    await page.screenshot({ path: path.join(TMP, '1-playlist-initial.png') });

    console.log('Clicking HTML App Builder app type...');
    await page.click('text=HTML App Builder');
    await page.waitForTimeout(500);
    
    console.log('Taking screenshot of App Instances view...');
    await page.screenshot({ path: path.join(TMP, '2-playlist-instances.png') });

    console.log('Clicking an app to open the Editor...');
    await page.locator('.app-card-grid').first().click();
    await page.waitForTimeout(1500); // Wait for chat and iframe
    
    // Add some dummy chat messages to test scrolling
    await page.fill('#chatInput', 'Test message to check scrolling 1');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    await page.fill('#chatInput', 'Test message to check scrolling 2');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    await page.fill('#chatInput', 'Test message to check scrolling 3');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    console.log('Taking screenshot of Editor view...');
    await page.screenshot({ path: path.join(TMP, '3-editor-view.png') });

    console.log('Done!');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await context.close();
    await browser.close();
  }
})();
