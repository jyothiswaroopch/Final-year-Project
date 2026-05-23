const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
    page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

    console.log('Navigating to http://localhost:5173/investor/dashboard...');
    await page.goto('http://localhost:5173/investor/dashboard', { waitUntil: 'networkidle2' });
    
    console.log('Waiting for a bit...');
    await new Promise(r => setTimeout(r, 3000));
    
    await browser.close();
})();
