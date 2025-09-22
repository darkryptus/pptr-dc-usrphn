const express = require('express');
const { launch } = require("puppeteer-core");
const app = express();
const PORT = process.env.PORT || 6282;
app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
  });
(async () => {
  // Launch puppeteer instance

  console.log("Launching Puppeteer browser...");

  const browser = await launch({
      headless: true,
      executablePath: '/opt/render/project/.render/chrome/opt/google/chrome/google-chrome',
      args: ['--no-sandbox']
  });
  //In the near future `headless: true` will default to the new Headless mode headless: "new"
  const page = await browser.newPage();
  const discordToken = process.env.TOKEN;
  //Added env variable to secure token
  // Local Storage error with Puppeteer, found bypass, CREDIT: https://gist.github.com/zelbov/58e9fbbe5157bf61067d2693118dd09a

  const bypassLocalStorageOverride = (page) =>
    page.evaluateOnNewDocument(() => {
      // Preserve localStorage as separate var to keep it before any overrides
      let __ls = localStorage;

      // Restrict closure overrides to break global context reference to localStorage
      Object.defineProperty(window, "localStorage", {
        writable: false,
        configurable: false,
        value: __ls,
      });
    });

  console.log(
    "Redirecting to https://discord.com/app ... (May take a few seconds)"
  );

  // Calling function before storing token into Discord so that errors don't occur
  bypassLocalStorageOverride(page);

  await page.goto("https://discord.com/app");

  // Setting token into Discord Local Storage (Don't worry it's not being sent/stored anywhere, this is how Discord does it)
  await page.evaluate((token) => {
    localStorage.setItem("token", `"${token}"`);
  }, discordToken);

//  Replace page.waitForTimeout(3000);
  await new Promise(resolve => setTimeout(resolve, 20000));
  // Navigate to a page where you want to use the local storage value
  await page.goto("https://discord.com/channels/1169266223125647491/1169266223125647494");
//   console.log("Successfully logged in...");

const messageBoxSelector = 'div[role="textbox"]';

await new Promise(resolve => setTimeout(resolve, 20000));
await page.focus(messageBoxSelector);
await page.keyboard.type('Hello from Puppeteer!');


const checkSpans = async () => {
  const lastFiveSpans = await page.evaluate(() => {
    const spans = document.querySelectorAll('span');
    const arr = Array.from(spans);
    const lastFive = arr.slice(-5); // get the last 5 elements
    return lastFive.map(span => span.innerText.trim()); // trim whitespace
  });

  console.log("Last 5 spans:", lastFiveSpans);

  // Check for "--userphone"
  if (lastFiveSpans[0] == "--userphone") {
    console.log("usrphn");
    await page.keyboard.type('/userp');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

  // Check for "--hangup"
  } else if (lastFiveSpans[0] == "--hangup") {
    console.log("hngp");
    await page.keyboard.type('/hangup');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
  }
};

// Run every 2 seconds
setInterval(() => {
  checkSpans().catch(err => console.error(err));
}, 2000);



//   await browser.close();
})();
