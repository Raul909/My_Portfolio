const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 2000 });
  await page.goto('http://localhost:8080');
  
  // Wait for animations and intersection observer
  await page.waitForTimeout(1000);
  
  // Scroll down to about section
  await page.evaluate(() => {
    window.scrollTo(0, document.querySelector('#about').offsetTop - 100);
  });
  
  await page.waitForTimeout(1000); // Wait for section reveal
  
  // Scroll further down to achievements
  await page.evaluate(() => {
    window.scrollBy(0, 500);
  });
  
  await page.waitForTimeout(1000); // Wait for stagger fade
  
  await page.screenshot({path: 'achievements_screenshot.png'});
  await browser.close();
})();
