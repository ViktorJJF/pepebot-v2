"use strict";

(async () => {
  const puppeteer = require("puppeteer");
  let proxy = "157.230.47.159:8080";
  const browser = await puppeteer.launch({
    headless: false,
    // Launch chromium using a proxy server on port 9876.
    // More on proxying:
    //    https://www.chromium.org/developers/design-documents/network-settings
    args: [`--proxy-server=${proxy}`]
  });
  const page = await browser.newPage();
  await page.goto(
    "https://s167-es.ogame.gameforge.com/game/index.php?page=ingame&component=research"
  );
  //   await browser.close();
})();
