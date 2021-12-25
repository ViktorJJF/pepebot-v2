const puppeteer = require("puppeteer");
const config = require("../config");

class Chronium {
  constructor() {
    this.explorer = null;
  }
  async begin() {
    let browser;
    if (config.environment === "development") {
      browser = await puppeteer.launch({
        headless: true,
      });
    } else {
      browser = await puppeteer.launch({
        headless: true,
        // executablePath: "/usr/bin/firefox",
        // args: [
        //   "--no-sandbox",
        //   "--disable-setuid-sandbox",
        //   "--disable-dev-shm-usage",
        // ],
      });
    }
    console.log("se termino el inicio");
    this.explorer = browser;
  }
  getBrowser() {
    return this.explorer;
  }
}

let chronium = new Chronium();

module.exports = chronium;
