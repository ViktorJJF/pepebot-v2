const puppeteer = require("puppeteer");
const moment = require("moment");
const { timeout } = require("../utils/utils.js");

module.exports = class Bot {
  constructor() {
    this.BASE_URL = "https://pl.ogame.gameforge.com/";
    this.LOGIN_URL = "https://lobby.ogame.gameforge.com/es_ES/";
    this.page = null;
    this.browser = null;
    this.navigationPromise = null;
    this.typingDelay = 50;
    this.currentPage = 0;

    //currentPage
    // 0 -- > mainPage
    // 1 -- > Galaxy
    // this.HEADERS = [('User-agent', 'Mozilla/5.0 (Windows NT 6.2; WOW64)\
    //  AppleWebKit/537.15 (KHTML, like Gecko) Chrome/24.0.1295.0 Safari/537.15')]
  }
  async begin(environment) {
    console.log("iniciando bot...");
    if (environment === "dev") {
      this.browser = await puppeteer.launch({ headless: false });
    } else {
      this.browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      });
    }

    this.page = await this.browser.newPage();
    // this.page.on("console", consoleObj => console.log(consoleObj.text())); //enable console.log inside evaluate function
    this.navigationPromise = this.page.waitForNavigation();

    await this.page.goto(this.LOGIN_URL);

    // await this.page.setViewport({ width: 1920, height: 937 });
    console.log("se termino el inicio");
  }
  async login(username, password) {
    console.log(`Empezando Logeo...`);
    await this.page.waitForSelector(
      "div > #loginRegisterTabs > .tabsList > li:nth-child(2) > span"
    );
    await this.page.click(
      "div > #loginRegisterTabs > .tabsList > li:nth-child(2) > span"
    );

    await this.page.waitForSelector(
      "div > #loginRegisterTabs > .tabsList > li:nth-child(1) > span"
    );
    await this.page.click(
      "div > #loginRegisterTabs > .tabsList > li:nth-child(1) > span"
    );

    await this.page.waitForSelector(
      "#loginTab > #loginForm > .inputWrap:nth-child(1) > div > input"
    );
    await this.page.click(
      "#loginTab > #loginForm > .inputWrap:nth-child(1) > div > input"
    );
    await this.page.type(
      "#loginTab > #loginForm > .inputWrap:nth-child(1) > div > input",
      username,
      { delay: this.typingDelay }
    );

    await this.page.waitForSelector(
      "#root > #content > div > div > div:nth-child(3)"
    );
    await this.page.click("#root > #content > div > div > div:nth-child(3)");
    await this.page.type(
      "#root > #content > div > div > div:nth-child(3)",
      password,
      { delay: this.typingDelay }
    );
    await this.page.waitForSelector(
      "#loginTab > #loginForm > p > .button-primary > span"
    );
    await this.page.click(
      "#loginTab > #loginForm > p > .button-primary > span"
    );

    await this.page.waitForSelector("div > #joinGame > a > .button > span");
    await this.page.click("div > #joinGame > a > .button > span");

    // await this.page.waitForSelector(".open > .rt-tr > .rt-td > .btn > span");
    // await this.page.click(".open > .rt-tr > .rt-td > .btn > span");

    await this.page.waitForSelector(".open > .rt-tr > .rt-td > .btn > span");
    //main page ogame
    this.page = await this.clickAndWaitForTarget(
      ".open > .rt-tr > .rt-td > .btn > span",
      this.page,
      this.browser
    );
    console.log("Logeo finalizado exitosamente");
  }

  async checkAttack() {
    console.log("verificando ataques...");
    await this.refreshPage();
    await this.page.waitForSelector("#attack_alert");
    var self = this;
    let notAttacked = await self.page.evaluate(() => {
      return document.querySelector("#attack_alert.noAttack");
    });
    if (notAttacked) {
      console.log("no estas siendo atacado");
    } else {
      console.log("estas siendo atacado !!");
      await this.attackDetail();
    }
  }
  async attackDetail() {
    // await timeout(5000);
    console.log("verificando los detalles del ataque...");
    await this.page.waitForSelector(
      "#notificationbarcomponent > #message-wrapper > #messages_collapsed #js_eventDetailsClosed",
      { visible: true }
    );
    await this.page.click(
      "#notificationbarcomponent > #message-wrapper > #messages_collapsed #js_eventDetailsClosed"
    );
    await this.page.waitForSelector(
      'tr[data-mission-type="1"]>td.icon_movement'
    );
    await this.page.hover('tr[data-mission-type="1"]>td.icon_movement');

    //checking details
    var self = this;
    let shipsData = await self.page.evaluate(() => {
      let ships = [];
      // get the hotel elements
      let shipsElms = document.querySelectorAll("table.fleetinfo>tbody>tr");
      // get the planet data
      shipsElms.forEach(async (ship, position) => {
        let shipJson = {};
        try {
          shipJson.name = ship.querySelector("td").innerText;
          shipJson.qty = ship.querySelector("td.value").innerText;
        } catch (exception) {
          console.log("hubo un error con el scraping del ataque");
          console.log(exception);
        }
        ships.push(shipJson);
      });
      return ships;
    });
    console.log("te estan atacando con: ", shipsData);
  }

  async goToSolarSystem(coords) {
    console.log("Dirigiendo bot al sistema solar: ", coords);
    let [galaxy, system, planet] = coords.split(":");
    if (this.currentPage !== "galaxy") {
      await this.goToPage("galaxy");
    }
    let galaxyInputSelector = "#galaxy_input";
    await this.page.waitForSelector(galaxyInputSelector);
    await this.page.click(galaxyInputSelector);
    await this.page.type(galaxyInputSelector, galaxy, {
      delay: this.typingDelay
    });
    let systemInputSelector =
      "#galaxycomponent > #inhalt > #galaxyHeader #system_input";
    await this.page.waitForSelector(systemInputSelector);
    await this.page.click(systemInputSelector);
    await this.page.type(systemInputSelector, system, {
      delay: this.typingDelay
    });
    //click !vamos!
    await this.page.waitForSelector(
      "#galaxycomponent > #inhalt > #galaxyHeader > form > .btn_blue:nth-child(9)"
    );
    await timeout(1000);
    await this.page.click(
      "#galaxycomponent > #inhalt > #galaxyHeader > form > .btn_blue:nth-child(9)"
    );
    await this.page.waitForSelector("tr.row");
  }

  async goToPage(pageName) {
    switch (pageName) {
      case "galaxy":
        this.currentPage = "galaxy";
        console.log("yendo a vista galaxias");
        await this.page.waitForSelector(
          "#toolbarcomponent > #links > #menuTable > li:nth-child(10) > .menubutton"
        );
        await this.page.click(
          "#toolbarcomponent > #links > #menuTable > li:nth-child(10) > .menubutton"
        );
        // await navigationPromise
        break;

      default:
        break;
    }
  }

  async checkPlanetActivity(coords, type) {
    //type = moon || planet
    var [galaxy, system, planet] = coords.split(":");
    await this.goToSolarSystem(coords);
    type == "planet"
      ? console.log("Empezando a escanear planeta: ", coords)
      : console.log("Empezando a escanear luna: ", coords);
    // await timeout(5000);
    try {
      await this.page.waitForResponse(response => {
        return (
          response.url() ===
            "https://s166-es.ogame.gameforge.com/game/index.php?page=ingame&component=galaxyContent&ajax=1" &&
          response.status() === 200
        );
      });
      await timeout(500);
    } catch (error) {
      this.goToPage("galaxy"); //refresh page
      console.log(error);
    }
    var planetActivity = {
      date: new Date(),
      lastActivity: "off"
    };

    try {
      planetActivity.lastActivity = await this.page.evaluate(
        ({ planet, type }) => {
          var lastActivity = "off";
          let planetSelector = document.querySelector(
            type == "planet"
              ? `tr.row>td[rel="planet${planet}"]>.ListImage`
              : `tr.row>td[rel="moon${planet}"]`
          );
          if (planetSelector.querySelector(".activity")) {
            if (planetSelector.querySelector(".activity.showMinutes")) {
              lastActivity = planetSelector.querySelector(
                ".activity.showMinutes"
              ).innerText;
            } else {
              lastActivity = "on";
            }
          }
          return lastActivity;
        },
        { planet, type }
      );
      console.log("Estado: ", planetActivity.lastActivity);
      return planetActivity;
    } catch (error) {
      console.log("algo salio mal buscando la actividad del planeta");
      console.log(error);
    }
  }

  async solarSystemScraping(coords) {
    console.log("Empezando a escanear sistema solar: ", coords);
    await this.goToSolarSystem(coords);
    // await timeout(5000);
    console.log("esperando respuesta del sistema solar...");
    try {
      await this.page.waitForResponse(response => {
        return (
          response.url() ===
            "https://s166-es.ogame.gameforge.com/game/index.php?page=ingame&component=galaxyContent&ajax=1" &&
          response.status() === 200
        );
      });
      await timeout(500);
    } catch (error) {
      console.log(error);
    }
    console.log("empezando scraping");
    var self = this;
    let ssData = await self.page.evaluate(() => {
      let planets = [];
      // get the hotel elements
      let planetsElms = document.querySelectorAll("tr.row");
      // get the planet data
      planetsElms.forEach(async (planet, position) => {
        let planetJson = {};
        try {
          planetJson.position = position + 1;
          planetJson.name = planet.querySelector("td.planetname").innerText;
          planetJson.playerName = planet.querySelector(
            ".status_abbr_strong"
          ).innerText;
          //check activity
          var checkSelector = planet.querySelector(
            "td.microplanet>.ListImage>.activity"
          );
          var checkActivityMinutes = planet.querySelector(
            "td.microplanet>.ListImage>.activity.showMinutes"
          );
          if (!checkSelector) planetJson.lastActivity = "off";
          else if (checkActivityMinutes) {
            planetJson.lastActivity = checkActivityMinutes.innerText;
          } else {
            planetJson.lastActivity = "on";
          }
        } catch (exception) {
          console.log("hubo un error con el scraping de ss");
          console.log(exception);
        }
        planets.push(planetJson);
      });
      return planets;
    });
    console.log("los datos son: ", ssData);
  }

  async sendMessageToPlayer(nickname, msg) {
    try {
      await this.page.waitForSelector(
        "#headerbarcomponent > #bar > ul > li:nth-child(5) > .overlay"
      );
      await this.page.click(
        "#headerbarcomponent > #bar > ul > li:nth-child(5) > .overlay"
      );

      await this.page.waitForSelector("#searchText");
      await this.page.click("#searchText");

      await this.page.type("#searchText", nickname, {
        delay: this.typingDelay
      });

      await this.page.waitForSelector(
        "tbody > tr > .ptb10 > #searchForm > .btn_blue"
      );
      await this.page.click("tbody > tr > .ptb10 > #searchForm > .btn_blue");
      await this.page.waitForSelector(
        "tbody > .alt > .action > .tooltip > .icon"
      );
      await this.page.click("tbody > .alt > .action > .tooltip > .icon");

      await this.navigationPromise;

      await this.page.waitForSelector(
        "#contentWrapper > #chatContent > .content > .editor_wrap > .new_msg_textarea"
      );
      await this.page.click(
        "#contentWrapper > #chatContent > .content > .editor_wrap > .new_msg_textarea"
      );

      await this.page.type(
        "#contentWrapper > #chatContent > .content > .editor_wrap > .new_msg_textarea",
        msg,
        { delay: this.typingDelay / 2 }
      );

      await this.page.waitForSelector(
        "#contentWrapper > #chatContent > .content > .editor_wrap > .btn_blue"
      );
      await this.page.click(
        "#contentWrapper > #chatContent > .content > .editor_wrap > .btn_blue"
      );

      console.log("mensaje enviado exitosamente al jugador: ", nickname);
    } catch (error) {
      console.log("algo salio mal enviando el mensaje...");
      console.log(error);
    }
  }

  async clickAndWaitForTarget(clickSelector, page, browser) {
    const pageTarget = page.target(); //save this to know that this was the opener
    await page.click(clickSelector); //click on a link
    const newTarget = await browser.waitForTarget(
      target => target.opener() === pageTarget
    ); //check that you opened this page, rather than just checking the url
    const newPage = await newTarget.page(); //get the page object
    // await newPage.once("load",()=>{}); //this doesn't work; wait till page is loaded
    await newPage.waitForSelector("body"); //wait for page to be loaded
    // newPage.on("console", consoleObj => console.log(consoleObj.text()));
    return newPage;
  }
  async refreshPage() {
    console.log(
      "refrescando ogame a las : ",
      moment().format("MMMM Do YYYY, h:mm:ss a")
    );
    await this.page.waitForSelector(
      "#links > #menuTable > li:nth-child(1) > .menubutton > .textlabel"
    );
    await this.page.click(
      "#links > #menuTable > li:nth-child(1) > .menubutton > .textlabel"
    );
    await this.navigationPromise;
  }

  async hunter(playerInfo) {
    console.log("empezando hunter...");
    for (const planet of playerInfo.planets) {
      let activity = await this.checkPlanetActivity(planet.coords, planet.type);
      planet.activities.push(activity);
    }
    console.log("info: ", JSON.stringify(playerInfo));
    return playerInfo;
  }
};
