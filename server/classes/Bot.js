const puppeteer = require("puppeteer");
const { PuppeteerBlocker } = require("@cliqz/adblocker-puppeteer");
const fetch = require("cross-fetch"); // required 'fetch'
const moment = require("moment");
const { timeout } = require("../utils/utils.js");
const config = require("../config");
const uuidv1 = require("uuid/v1");

module.exports = class Bot {
  constructor() {
    //check mongoose model
    this.BASE_URL = "https://pl.ogame.gameforge.com/";
    this.LOGIN_URL = "https://lobby.ogame.gameforge.com/es_ES/";
    this._id = null;
    this.server = null;
    this.language = null;
    this.telegramGroupId = null;
    this.telegramId = null;
    this.ogameEmail = null;
    this.ogamePassword = null;
    this.state = null;
    this.userId = null;
    this.page = null;
    this.browser = null;
    this.navigationPromise = null;
    this.typingDelay = 50;
    this.currentPage = 0;
    this.actions = [];

    //currentPage
    // 0 -- > mainPage
    // 1 -- > Galaxy
    // this.HEADERS = [('User-agent', 'Mozilla/5.0 (Windows NT 6.2; WOW64)\
    //  AppleWebKit/537.15 (KHTML, like Gecko) Chrome/24.0.1295.0 Safari/537.15')]
  }
  async initialize(botOjbect) {
    this._id = botOjbect._id;
    this.server = botOjbect.server;
    this.language = botOjbect.language;
    this.telegramGroupId = botOjbect.telegramGroupId;
    this.telegramId = botOjbect.telegramId;
    this.ogameEmail = botOjbect.ogameEmail;
    this.ogamePassword = botOjbect.ogamePassword;
    this.state = botOjbect.state;
    this.userId = botOjbect.userId;
    this.page = null;
    this.browser = null;
    this.navigationPromise = null;
    this.typingDelay = 50;
    this.currentPage = 0;
    this.actions = [];
  }
  async begin() {
    console.log("iniciando bot...");
    if (config.environment === "dev") {
      this.browser = await puppeteer.launch({
        headless: false
      });
    } else {
      this.browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      });
    }

    this.page = await this.browser.newPage();
    this.page.setDefaultTimeout(10000);
    // await this.page._client.send("Emulation.clearDeviceMetricsOverride");
    // PuppeteerBlocker.fromPrebuiltAdsAndTracking(fetch).then(blocker => {
    //   blocker.enableBlockingInPage(this.page);
    // });
    // this.page.on("console", consoleObj => console.log(consoleObj.text())); //enable console.log inside evaluate function
    this.navigationPromise = this.page.waitForNavigation();

    await this.page.goto(this.LOGIN_URL);

    console.log("se termino el inicio");
  }
  async login(ogameEmail, ogamePassword) {
    try {
      console.log(`Empezando Logeo...`);
      //closing add
      // await this.closeAds();

      await this.page.waitForSelector(
        "div > #loginRegisterTabs > .tabsList > li:nth-child(1) > span"
      );
      await this.page.click(
        "div > #loginRegisterTabs > .tabsList > li:nth-child(1) > span"
      );

      await this.page.waitForSelector('input[type="email"]');
      await this.page.click('input[type="email"]');
      await this.page.type(
        'input[type="email"]',
        ogameEmail ? ogameEmail : this.ogameEmail,
        { delay: this.typingDelay }
      );

      await this.page.waitForSelector('input[type="password"]');
      await this.page.click('input[type="password"]');
      await this.page.type(
        'input[type="password"]',
        ogamePassword ? ogamePassword : this.ogamePassword,
        { delay: this.typingDelay }
      );
      await this.page.waitForSelector(
        "#loginTab > #loginForm > p > .button-primary > span"
      );
      await this.page.click(
        "#loginTab > #loginForm > p > .button-primary > span"
      );
      await this.page.waitForSelector("div > #joinGame > a > .button > span", {
        timeout: 3000
      });
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
      // await this.closeAds();
      console.log("Logeo finalizado exitosamente");
      return true;
    } catch (error) {
      return false;
    }
  }

  async checkLoginStatus(page) {
    var page = page || this.page;
    var currentPage = null;
    currentPage = await page.evaluate(() => {
      var selector;
      selector = document.querySelector("div#toolbarcomponent");
      if (selector) {
        console.log("se cumplio mainPage");
        return "mainPage";
      }
      selector = document.querySelector("#joinGame>a>button.button");
      if (selector) {
        console.log("se cumplio playoage");
        return "playPage";
      }
      selector = document.querySelector(
        '.rt-td.action-cell>button[type="button"]'
      );
      if (selector) {
        console.log("se cumplio selecUniversePage");
        return "selectUniversePage";
      }
    });
    switch (currentPage) {
      case "mainPage":
        return 0;
        break;
      case "playPage":
        await page.click("#joinGame>a>button.button");
        await page.waitForSelector('.rt-td.action-cell>button[type="button"]');
        this.page = await this.clickAndWaitForTarget(
          '.rt-td.action-cell>button[type="button"]',
          this.page,
          this.browser
        );
        return 0;
        break;
      case "selectUniversePage":
        this.page = await this.clickAndWaitForTarget(
          '.rt-td.action-cell>button[type="button"]',
          this.page,
          this.browser
        );
        //main page ogame

        return 0;
        break;
      default:
        await this.login();
        return 0;
        break;
    }
  }

  async watchDog() {
    try {
      console.log("verificando ataques...");
      await this.refreshPage();
      await this.page.waitForSelector("#attack_alert");
      var self = this;
      let notAttacked = await self.page.evaluate(() => {
        return document.querySelector("#attack_alert.noAttack");
      });
      if (notAttacked) {
        console.log("no estas siendo atacado");
        return false;
      } else {
        console.log("estas siendo atacado !!");
        return true;
      }
    } catch (error) {
      console.log("se dio un error y verificaremos el login en watchDog");
      console.log("el error es: ", error);
      await this.checkLoginStatus();
      return await this.watchDog();
    }
  }
  async attackDetail() {
    let enemyMissions = [];
    // await timeout(5000);
    console.log("verificando los detalles del ataque...");

    //Click to overview enemy missions
    await this.page.waitForSelector(
      "#notificationbarcomponent > #message-wrapper > #messages_collapsed #js_eventDetailsClosed",
      { visible: true }
    );
    await this.page.click(
      "#notificationbarcomponent > #message-wrapper > #messages_collapsed #js_eventDetailsClosed"
    );
    await this.page.waitForSelector("table#eventContent");
    //checking details
    await timeout(1000);
    var self = this;
    let attackDetails = [];
    let enemyMissionsRows = await this.page.$$("tr.eventFleet");
    for (const enemyMission of enemyMissionsRows) {
      var isEnemy = await enemyMission.$("td.countDown>span.hostile");
      if (isEnemy) {
        let fleet = await enemyMission.$("td.icon_movement");
        await fleet.hover();
        var attackDetail = await enemyMission.evaluate(enemyMission => {
          var attackDetail = {
            hostilePlayer: {
              name: "",
              origin: { planetName: "", coords: "", type: "" },
              target: { planetName: "", coords: "", type: "" },
              impactHour: "",
              timeRemaining: ""
            },
            ships: []
          };
          attackDetail.hostilePlayer.origin.coords = enemyMission
            .querySelector("td.coordsOrigin")
            .innerText.replace(/[\[\]']+/g, "");
          let planetPosition = attackDetail.hostilePlayer.origin.coords.split(
            ":"
          )[2];
          attackDetail.hostilePlayer.origin.planetName = enemyMission.querySelector(
            "td.originFleet"
          ).innerText;
          attackDetail.hostilePlayer.origin.type = enemyMission.querySelector(
            "td.originFleet>figure.moon"
          )
            ? "moon"
            : "planet";

          attackDetail.hostilePlayer.target.coords = enemyMission
            .querySelector("td.destCoords")
            .innerText.replace(/[\[\]']+/g, "");
          attackDetail.hostilePlayer.target.planetName = enemyMission.querySelector(
            "td.destFleet"
          ).innerText;
          attackDetail.hostilePlayer.target.type = enemyMission.querySelector(
            "td.destFleet>figure.moon"
          )
            ? "moon"
            : "planet";
          //impacto hour
          attackDetail.hostilePlayer.impactHour = parseInt(
            enemyMission.getAttribute("data-arrival-time") * 1000
          );
          attackDetail.hostilePlayer.timeRemaining = parseInt(
            enemyMission.getAttribute("data-arrival-time") * 1000 - Date.now()
          );

          var shipsRows = document.querySelectorAll("table.fleetinfo>tbody>tr");
          //get ships
          shipsRows.forEach(async (ship, index) => {
            if (index > 0) {
              var shipJson = {
                name: "",
                qty: 0
              };
              try {
                shipJson.name = ship.querySelector("td").innerText;
                shipJson.qty = ship.querySelector("td.value").innerText;
                attackDetail.ships.push(shipJson);
              } catch (exception) {
                console.log("hubo un error con el scraping del ataque");
                console.log(exception);
              }
            }
          });
          console.log("ships es: ", attackDetail.ships);
          return attackDetail;
        });
        //get hostil player name
        console.log("se termino la evaluacion, empieza hover");
        await this.page.click("#ingamepage");
        await timeout(500);
        let hostilPlayerSelector = await enemyMission.$("td.sendMail");
        await hostilPlayerSelector.hover();
        let hostilPlayerName = await enemyMission.evaluate(() => {
          return document.querySelector(".tpd-tooltip").innerText;
        });
        attackDetail.hostilePlayer.name = hostilPlayerName;
        attackDetails.push(attackDetail);
      }
    }
    console.log("te estan atacando con: ", JSON.stringify(attackDetails));
    return attackDetails;
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
    //closing add
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
    // await this.closeAds();
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

  // async closeAds() {
  //   try {
  //     await this.page.waitForResponse(
  //       response => {
  //         return (
  //           response.url() ===
  //             "https://ads-media.gameforge.com/53f75e5be1b5087082575d4181613f27.jpg" &&
  //           response.status() === 200
  //         );
  //       },
  //       { timeout: 5000 }
  //     );
  //     console.log("se termino de esperar la respuesta del ad");
  //     await timeout(500);
  //   } catch (error) {
  //     console.log(error);
  //   }

  //   let adState = await this.page.evaluate(() => {
  //     let ad = document.querySelector(".openX_int_closeButton > a");
  //     return ad;
  //   });
  //   console.log("se encontro este add: ", adState);
  //   if (adState) {
  //     console.log("cerrando add en goToPage");
  //     await this.page.waitForSelector(".openX_int_closeButton > a");
  //     await this.page.click(".openX_int_closeButton > a");
  //   }
  //   return 0;
  // }

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
    try {
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
    } catch (error) {
      console.log("se dio un error y verificaremos el login en refresh");
      await this.checkLoginStatus();
      await this.refreshPage();
    }
  }

  async getOgameUsername(page) {
    try {
      var page = page || this.page;
      let username = "";
      await this.page.waitForSelector("li#playerName");
      username = await this.page.evaluate(() => {
        console.log("estoy en esta pagina");
        var username = document.querySelector("li#playerName>span>a").innerText;
        return username;
      });
      return username;
    } catch (error) {
      console.log(
        "se dio un error y verificaremos el login en getOgameUsername"
      );
      console.log("el error es: ", error);
      await this.checkLoginStatus();
    }
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
  async stop() {
    this.actions.forEach(action => {
      clearInterval(action.action);
    });
    this.actions = [];
    await this.browser.close();
  }
  getActions() {
    let result = [];
    this.actions.forEach(action => {
      result.push({
        actionId: action.actionId,
        type: action.type,
        milliseconds: action.milliseconds,
        payload: action.payload
      });
    });
    return result;
  }
  addAction(action, type, milliseconds, payload = {}) {
    console.log("se recibio este action:", action);
    let actionId = uuidv1();
    this.actions.push({ actionId, action, type, milliseconds, payload });
    return actionId;
  }
  async stopAction(actionId) {
    try {
      console.log("se dentendra este action:", actionId);
      console.log("antes actions era: ", this.actions);
      let index = this.actions.findIndex(action => action.actionId == actionId);
      clearInterval(this.actions[index].action);
      this.actions.splice(this.actions[index], 1);
      console.log("ahora actions es: ", this.actions);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
};
