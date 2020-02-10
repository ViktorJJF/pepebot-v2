const puppeteer = require("puppeteer");

(async () => {
  try {
    const browserWSEndpoint = "http://localhost:21222/json/version";
    const browser = await puppeteer.connect({ browserWSEndpoint });
  } catch (error) {
    console.log("el error es: ");
    console.log(error);
  }
})();
