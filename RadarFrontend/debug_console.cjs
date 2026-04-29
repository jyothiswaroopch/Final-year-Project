const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('PAGE ERROR:', msg.text());
        }
    });

    page.on('pageerror', err => {
        console.log('PAGE EXCEPTION:', err.toString());
    });

    try {
        await page.goto('http://localhost:5173/investor/watchlists', { waitUntil: 'networkidle0', timeout: 10000 });
        console.log('Page loaded');
    } catch (e) {
        console.log('Navigation error:', e.toString());
    }

    await browser.close();
})();
