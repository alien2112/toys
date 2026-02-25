const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');
  await page.waitForSelector('.pc__wishlist');
  const html = await page.$eval('.pc__wishlist', el => el.innerHTML);
  console.log("HTML inside pc__wishlist:", html);
  await browser.close();
})();
