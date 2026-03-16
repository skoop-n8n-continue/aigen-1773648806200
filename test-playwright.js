const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const TMP = path.join(process.cwd(), '.tmp');
fs.mkdirSync(TMP, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-zygote'],
  });
  
  // Set a typical viewport size (e.g. 1280x800)
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  
  const logs = { console: [], errors: [], network: [] };

  page.on('console', msg => {
    logs.console.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error' || msg.type() === 'warn')
      console.error(`[browser:${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', err => {
    logs.errors.push({ message: err.message, stack: err.stack });
    console.error(`[browser:pageerror] ${err.message}`);
  });

  try {
    const fileUrl = `file://${process.cwd()}/index.html`;
    console.log(`Navigating to ${fileUrl}`);
    await page.goto(fileUrl, { waitUntil: 'networkidle' });

    console.log("Waiting for app to load...");
    await page.waitForTimeout(1000);
    
    // Switch to "Product Animation Video" app type
    console.log("Clicking 'Product Animation Video' menu item...");
    // Find the menu item with text "Product Animation Video"
    await page.locator('li.content-type-item:has-text("Product Animation Video")').click();
    
    await page.waitForTimeout(1000);
    
    console.log("Clicking '3D Product Spin (Demo)' app card...");
    await page.locator('.app-card-grid:has-text("3D Product Spin (Demo)")').click();
    
    await page.waitForTimeout(2000); // Wait for the iframe to load and scale
    
    const screenshotPath = path.join(TMP, 'screenshot.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`Saved screenshot to ${screenshotPath}`);

    // Let's get the dimensions of the wrapper and iframe to verify our logic
    const dimensions = await page.evaluate(() => {
      const wrapper = document.querySelector('.preview-frame-wrapper');
      const iframe = document.querySelector('#previewIframe');
      const contentArea = document.querySelector('.preview-content-area');
      
      return {
        wrapper: wrapper ? {
          width: wrapper.style.width,
          height: wrapper.style.height,
          clientWidth: wrapper.clientWidth,
          clientHeight: wrapper.clientHeight,
        } : null,
        iframe: iframe ? {
          width: iframe.style.width,
          height: iframe.style.height,
          transform: iframe.style.transform
        } : null,
        contentArea: contentArea ? {
          clientWidth: contentArea.clientWidth,
          clientHeight: contentArea.clientHeight
        } : null
      };
    });
    
    console.log("Dimensions after scaling:", JSON.stringify(dimensions, null, 2));

  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await context.close();
    await browser.close();
  }
})();
