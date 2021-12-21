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
        args: [
          "--no-sandbox",
          "--single-process",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--no-zygote",
        ],
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
