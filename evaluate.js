const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(1000);
  
  // Scroll to bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  
  const results = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.section-reveal')).map(el => ({
      className: el.className,
      isVisible: el.classList.contains('is-visible'),
      opacity: window.getComputedStyle(el).opacity,
      rect: el.getBoundingClientRect().toJSON()
    }));
  });
  console.log(JSON.stringify(results, null, 2));
  
  await browser.close();
})();
