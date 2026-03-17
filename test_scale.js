const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
    const TMP = path.join(process.cwd(), '.tmp');
    fs.mkdirSync(TMP, { recursive: true });

    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-zygote']
    });

    const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const page = await context.newPage();

    const logs = { console: [], errors: [], network: [] };
    page.on('console', msg => {
        logs.console.push({ type: msg.type(), text: msg.text() });
        if (msg.type() === 'error' || msg.type() === 'warn') console.error(`[browser:${msg.type()}] ${msg.text()}`);
    });
    page.on('pageerror', err => {
        logs.errors.push({ message: err.message, stack: err.stack });
        console.error(`[browser:pageerror] ${err.message}`);
    });

    try {
        await page.goto(`file://${process.cwd()}/index.html`, { waitUntil: 'networkidle' });

        // Click on the GSAP App Type to see its dummy apps
        await page.click('li[onclick="selectAppType(\'gsap\')"]');

        // Wait for the dummy app to render in the sidebar
        await page.waitForSelector('.app-card-grid', { state: 'visible' });

        // Click on the first app card (which should be the demo app with 1920x1080)
        const appCards = await page.$$('.app-card-grid');
        if (appCards.length > 0) {
            await appCards[0].click();
        } else {
            console.error("No app cards found!");
        }

        // Wait for the preview container and iframe to load
        await page.waitForSelector('.preview-container', { state: 'visible' });
        await page.waitForSelector('#previewIframe', { state: 'attached' });

        // Wait a bit for the resize observer to trigger
        await page.waitForTimeout(1000);

        // Take a screenshot of the preview container area
        const previewContainer = await page.$('.preview-container');
        await previewContainer.screenshot({ path: path.join(TMP, 'preview_screenshot.png') });

        // Also take a full page screenshot to see the whole layout
        await page.screenshot({ path: path.join(TMP, 'full_screenshot.png') });

        // Evaluate and print the dimensions of the wrapper and iframe
        const dimensions = await page.evaluate(() => {
            const wrapper = document.querySelector('.preview-frame-wrapper');
            const iframe = document.querySelector('#previewIframe');
            const contentArea = document.querySelector('.preview-content-area');
            return {
                contentArea: {
                    width: contentArea ? contentArea.clientWidth : null,
                    height: contentArea ? contentArea.clientHeight : null
                },
                wrapper: {
                    width: wrapper ? wrapper.style.width : null,
                    height: wrapper ? wrapper.style.height : null,
                    clientWidth: wrapper ? wrapper.clientWidth : null,
                    clientHeight: wrapper ? wrapper.clientHeight : null
                },
                iframe: {
                    width: iframe ? iframe.style.width : null,
                    height: iframe ? iframe.style.height : null,
                    transform: iframe ? iframe.style.transform : null
                }
            };
        });

        console.log("Dimensions:", dimensions);
        fs.writeFileSync(path.join(TMP, 'browser-logs.json'), JSON.stringify(logs, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await context.close();
        await browser.close();
    }
})();
