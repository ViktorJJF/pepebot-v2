const formatISO9075 = require("date-fns/formatISO9075");
const BotModel = require("../models/Bots.js");
const {
  timeout,
  Random,
  getFirstNumber,
  buildErrObject,
  handleError,
  sendTelegramMessage,
} = require("../utils/utils.js");
const config = require("../config");
const chronium = require("../classes/Chronium");
const { PendingXHR } = require("pending-xhr-puppeteer");
const callMeBot = require("../services/callMeBot");

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
    // this.actions = null;
    this.playerId = null;
    this.timesSpied = 1;
    this.gf_token = null;
    this.cookies = null;
    this.fleet_token = null;
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
    this.telegramUsername = botOjbect.telegramUsername;
    this.ogameEmail = botOjbect.ogameEmail;
    this.ogamePassword = botOjbect.ogamePassword;
    this.state = botOjbect.state;
    this.userId = botOjbect.userId;
    this.proxy = botOjbect.proxy;
    this.page = null;
    this.browser = null;
    this.navigationPromise = null;
    this.typingDelay = 50;
    this.currentPage = 0;
    // this.actions = botOjbect.actions;
    this.playerId = botOjbect.playerId;
    this.gf_token = botOjbect.gf_token;
    this.token_ships = "";
  }
  async begin() {
    try {
      console.log("iniciando bot...");
      // // let browser = chronium.getBrowser();
      // this.browser = chronium.getBrowser();
      // // this.browser = await browser.createIncognitoBrowserContext();
      let browser = chronium.getBrowser();
      this.browser = await browser.createIncognitoBrowserContext();
    } catch (error) {
      console.log("ERROR EN BEGIN: ", error);
      await this.begin();
    }
  }
  async closeSession() {
    await this.browser.close();
    this.browser = null;
  }
  async login(ogameEmail, ogamePassword, page) {
    try {
      if (!this.browser) {
        console.log("no existe browser, inicializando");
        await this.begin();
      }
      var page = await this.createNewPage(this.LOGIN_URL);
      console.log(`Empezando Logeooo...`);
      //closing add
      await this.closeAds(page);
      console.log("se termino de pasar por closeAds");
      await page.waitForSelector("#loginRegisterTabs .tabsList li", {
        timeout: 15000,
      });
      await page.click("#loginRegisterTabs .tabsList li");
      // await page.click(
      //   "div > #loginRegisterTabs > .tabsList > li:nth-child(1) > span"
      // );
      await page.waitForSelector('input[type="email"]', {
        timeout: 15000,
      });
      await page.click('input[type="email"]');
      await page.type(
        'input[type="email"]',
        ogameEmail ? ogameEmail : this.ogameEmail,
        {
          delay: this.typingDelay,
        }
      );

      await page.waitForSelector('input[type="password"]', {
        timeout: 15000,
      });
      await page.click('input[type="password"]');
      await page.type(
        'input[type="password"]',
        ogamePassword ? ogamePassword : this.ogamePassword,
        {
          delay: this.typingDelay,
        }
      );
      // se escoge el tipo de inicio de sesion
      if (process.env.NODE_ENV === "development") {
        await page.waitForSelector(
          "#loginForm > p > button.button.button-primary.button-lg",
          {
            timeout: 15000,
          }
        );
        await page.click(
          "#loginForm > p > button.button.button-primary.button-lg"
        );
      } else {
        // inicio de sesion con cookies
        await page.evaluate((token) => {
          console.log("el token: ", token);
          function setCookie(name, value, days) {
            let expires = "";
            if (days) {
              let date = new Date();
              date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
              expires = `; expires=${date.toUTCString()}`;
            }
            document.cookie = `${name}=${value || ""}${expires}; path=/`;
          }
          setCookie("gf-token-production", token, 7);
          console.log("COOKIE AGREGADO!");
          return true;
        }, this.gf_token);
        await page.goto(
          `https://${config.SERVER}-es.ogame.gameforge.com/game/index.php?page=ingame&component=overview&relogin=1`
        );
      }

      await page.waitForSelector("div > #joinGame > a > .button > span", {
        timeout: 15000,
      });
      await page.evaluate(() => {
        document.querySelector("div > #joinGame > a > .button > span").click();
      });
      // await page.click("div > #joinGame > a > .button > span");

      // await page.waitForSelector(".open > .rt-tr > .rt-td > .btn > span");
      // await page.click(".open > .rt-tr > .rt-td > .btn > span");

      await page.waitForSelector(".open > .rt-tr > .rt-td > .btn > span", {
        timeout: 15000,
      });
      let previousPage = page;
      //main page ogame
      page = await this.clickAndWaitForTarget(
        ".open > .rt-tr > .rt-td > .btn > span",
        page,
        this.browser
      );
      // guardando cookies
      this.setCookies(page);
      await this.closePage(previousPage);
      await this.closePage(page);
      // await this.closeAds();
      console.log("Logeo finalizado exitosamente");
      return true;
    } catch (error) {
      console.log("aaaaa", error);
      // timbrarme
      // callMeBot(config.TELEGRAM_OWN_USERNAME, "Error en logeo");
      return false;
    }
  }

  async goToPlanetMoon(coords, page) {
    console.log("Cambiando a planeta/luna", coords);
    await page.waitForSelector("span.planet-koords");
    let coordsExists = await page.evaluate((coords) => {
      let coordsExists = false;
      var planetCoords = document.querySelectorAll(".smallplanet");
      for (let i = 0; i < planetCoords.length; i++) {
        var planetCoordsText = planetCoords[i]
          .querySelector("span.planet-koords")
          .innerText.replace(/[\[\]']+/g, "");
        if (planetCoordsText == coords) {
          coordsExists = true;
          if (planetCoords[i].querySelector(".moonlink")) {
            planetCoords[i].querySelector(".moonlink").click();
            console.log("nos vamos a luna");
          } else {
            console.log("nos vamos a planeta");
            planetCoords[i].querySelector("span.planet-koords").click();
          }
        }
      }
      return coordsExists;
    }, coords);
    if (!coordsExists) {
      throw buildErrObject(
        400,
        `No tienes un planeta con las coordenadas *${coords}*`
      );
    } else {
      await page.waitForSelector("#notificationbarcomponent");
      console.log("todo en orden");
    }
    return coordsExists;
  }

  async getSolarSystemPlanets(page) {
    let availablePlanetsIndex = await page.evaluate(() => {
      let indexes = [];
      Array.from(document.querySelectorAll(".galaxyRow.ctContentRow")).filter(
        (e, index) => {
          let activePlanet = e.querySelector(".galaxyCell.cellPlayerName");
          if (activePlanet) {
            let span = activePlanet.querySelector("span[rel]");
            if (
              span &&
              (span.classList.contains("status_abbr_active") ||
                span.classList.contains("status_abbr_outlaw") ||
                span.classList.contains("status_abbr_honorableTarget"))
            ) {
              indexes.push(index);
            }
          }
        }
      );
      console.log("🚀 Aqui *** -> indexes", indexes);
      return indexes;
    });
    return availablePlanetsIndex;
  }

  async spyPlanetMoon(coords, page, type = "planet", checkRank = true) {
    console.log("🚀 Aqui *** -> coords", coords);
    let [galaxy, system, planet] = coords.split(":");
    //get planets
    try {
      await this.goToSolarSystem(coords, page);
      await this.waitForAllXhrFinished(page);
      await page.waitForSelector("#galaxy_input");
      // primero se valida si el jugador a espiar no es muy fuerte (rank)
      let planetSelector = `.galaxyRow.ctContentRow#galaxyRow${planet}`;
      await page.waitForSelector(planetSelector);
      let playerSelector = ".cellPlayerName .tooltipRel";
      await page.waitForSelector(
        planetSelector + " .cellPlayerName .tooltipRel"
      );
      let planetElement = await page.$(planetSelector);
      if (checkRank) {
        let playerId = await planetElement.evaluate((e) => {
          let playerId = e.querySelector(".cellAction a:nth-child(2)");
          return playerId ? playerId.getAttribute("data-playerid") : 0;
        });
        await page.hover(planetSelector + " .cellPlayerName .tooltipRel");
        let ownRank = await this.getRank(page);
        let playerRank = await page.evaluate((playerId) => {
          return parseInt(
            document.querySelector(`#player${playerId} .rank a`).innerText
          );
        }, playerId);
        // si el rank del jugador es mayor al propio por 5, ignorar
        const LIMIT = 0;
        if (playerRank + LIMIT < ownRank) {
          console.log("jugador fuerte, ignorar");
          return true;
        }
        console.log("🚀 Aqui *** -> playerRank", playerRank);
      }

      // let planets = await page.$$("tr.row");
      // await page.waitForSelector(".icon_eye");
      // await page.waitForSelector(".moon_a");
      // let planetToSpy = await planets[parseInt(planet) - 1].$(`${planetSelector}`);
      if (type === "planet") {
        let planetBeignSpied = await page.$(`${planetSelector} .fleetHostile`);
        if (!planetBeignSpied) {
          console.log("planeta no esta siendo espiado");
          await page.waitForSelector(
            planetSelector + " " + `[rel=planet${planet}]`
          );
          await page.click(planetSelector + " " + `[rel=planet${planet}]`);
          // await page.hover(planetSelector + " " + `[rel=planet${planet}]`);
          // await page.waitForSelector(`#planet${planet}.galaxyTooltip`);
          // console.log("tratando de hacer click x1");
          // await page.evaluate((planetNumber) => {
          //   let options = document.querySelectorAll(
          //     `#planet${planetNumber}.galaxyTooltip ul.ListLinks>li`
          //   );
          //   options.forEach((option) => {
          //     if (option.innerText.includes("Espionaje"))
          //       return option.querySelector("a").click();
          //   });
          //   return;
          // }, planet);
          await page.waitForSelector(`${planetSelector} .fleetHostile`);
        }
      }
      //hover moon
      let moonToSpy;
      moonToSpy = await page.$(`[rel="moon${planet}"]`);
      if (moonToSpy) {
        let moonBeignSpied = await page.$(
          `[rel="moon${planet}"] .fleetHostile`
        );
        let moonWithActivity = await page.$(`[rel="moon${planet}"] .minute15`);
        // if (!moonBeignSpied && !moonWithActivity) {
        if (!moonBeignSpied) {
          await page.waitForSelector(`[rel="moon${planet}"]`);
          await page.click(`[rel="moon${planet}"]`);
          // await page.hover(`[rel="moon${planet}"]`);
          // await page.waitForSelector(`#moon${planet}.galaxyTooltip`, {
          //   visible: true,
          // });
          // console.log("tratando de hacer click x2");
          // await page.evaluate((planetNumber) => {
          //   let options = document.querySelectorAll(
          //     `#moon${planetNumber}.galaxyTooltip ul.ListLinks>li`
          //   );
          //   options.forEach((option) => {
          //     if (option.innerText === "Espionaje")
          //       option.querySelector("a").click();
          //   });
          //   return;
          // }, planet);
          //wait for icon
          await page.waitForSelector(`[rel="moon${planet}"] .fleetHostile`);
        }
      }

      console.log("se espió el planeta de posicion: ", parseInt(planet));
    } catch (error) {
      console.log("algo salio mal espiando: ", coords);
      console.log(error);
      // se verifica el estado del login
      // await this.checkLoginStatus(page);
      // var newPage = await bot.createNewPage();
      await this.refreshGalaxyView(page);
      await this.spyPlanetMoon(coords, page, type, checkRank);
      return false;
    }
    await timeout(200);
    return true;
  }

  /**
   * @Description Espera a que todas las solicitudes Xhr hayan finalizado para continuar
   */
  async waitForAllXhrFinished(page) {
    const pendingXHR = new PendingXHR(page);
    await pendingXHR.waitForAllXhrFinished();
  }

  setTimesSpied(qty) {
    this.timesSpied = qty;
  }
  async filterSpyMessages(page) {
    console.log("empezando a filtrar mensajes");
    await page.waitForSelector(".comm_menu");
    await page.click(".comm_menu");
    let minFleet = 20 * 1000000; //10M
    let minResources = 20 * 1000000; // 10M
    // try {
    //   await page.waitForSelector("#fleetsgenericpage");
    // } catch (error) {
    //   console.log("se espero mucho...");
    // }
    const { PendingXHR } = require("pending-xhr-puppeteer");
    const pendingXHR = new PendingXHR(page);
    await pendingXHR.waitForAllXhrFinished();
    await page.waitForSelector(".msg");
    let maxMessagesPages = Math.ceil(this.timesSpied / 10) || 3; // maximo de paginas a revisar
    console.log("CANTIDAD DE PAGINAS A REVISAR", maxMessagesPages);
    let i = 0;
    let fleet, totalResources;
    while (i < maxMessagesPages) {
      await pendingXHR.waitForAllXhrFinished();
      console.log("estoy dentro del bucle: ", i, maxMessagesPages);
      let messages = await page.$$(".msg");
      console.log("el tamaño de mensajes: ", messages.length);
      for (const message of messages) {
        let messageInfo = await message.evaluate((message) => {
          var numberPattern = /\d+/g;
          if (
            !message
              .querySelector(".msg_head>span.msg_title")
              .innerText.includes("Informe de espionaje en")
          )
            return; // significa que no es informe de espionaje

          let planetWithCoords = message.querySelector(".txt_link").innerText;
          let playerName = message
            .querySelector(".compacting span:nth-child(2)")
            .innerText.trim();
          var metalSelector = message
            .querySelector(".resspan:nth-child(1)")
            .innerText.replace("Metal", "");
          var metal = parseFloat(
            metalSelector
              .match(numberPattern)
              .join(metalSelector.includes(".") ? "" : ".")
          );
          metal = metalSelector.includes("Mrd")
            ? metal * 1000000000
            : metalSelector.includes("M")
            ? metal * 1000000
            : metal;
          console.log("el metal: ", metal);
          var crystalSelector = message.querySelector(
            ".resspan:nth-child(2)"
          ).innerText;
          var crystal = parseFloat(
            crystalSelector
              .match(numberPattern)
              .join(crystalSelector.includes(".") ? "" : ".")
          );
          crystal = crystalSelector.includes("Mrd")
            ? crystal * 1000000000
            : crystalSelector.includes("M")
            ? crystal * 1000000
            : crystal;
          console.log("el cristal: ", crystal);
          var deuteriumSelector = message.querySelector(
            ".resspan:nth-child(3)"
          ).innerText;
          var deuterium = parseFloat(
            deuteriumSelector
              .match(numberPattern)
              .join(deuteriumSelector.includes(".") ? "" : ".")
          );
          deuterium = deuteriumSelector.includes("Mrd")
            ? deuterium * 1000000000
            : deuteriumSelector.includes("M")
            ? deuterium * 1000000
            : deuterium;
          console.log("el deuterio: ", deuterium);
          totalResources = metal + crystal + deuterium;
          //getting fleet
          var fleetSelector = message.querySelector(
            ".compacting:nth-child(9) .tooltipLeft"
          );
          if (fleetSelector) {
            fleetSelector = fleetSelector.innerText;
            var fleet = parseFloat(
              fleetSelector.match(numberPattern).join(".")
            );
            fleet = fleetSelector.includes("Mrd")
              ? fleet * 1000000000
              : fleetSelector.includes("M")
              ? fleet * 1000000
              : fleet * 1000;
          } else {
            fleet = 0;
          }
          //getting defense
          var defenseSelector = message.querySelector(
            ".compacting:nth-child(9) .tooltipRight"
          );
          if (defenseSelector) {
            defenseSelector = defenseSelector.innerText;
            var defense = parseFloat(
              defenseSelector.match(numberPattern).join(".")
            );
            defense = defenseSelector.includes("Mrd")
              ? defense * 1000000000
              : defenseSelector.includes("M")
              ? defense * 1000000
              : defense * 1000;
          } else {
            defense = 0;
          }
          totalResources = totalResources || 0;
          // console.log("la flota es: ", fleet);
          console.log("se retornara: ", {
            playerName,
            planetWithCoords,
            fleet,
            defense,
            totalResources,
          });
          return {
            playerName,
            planetWithCoords,
            fleet,
            defense,
            totalResources,
          };
        });
        if (messageInfo) {
          // await timeout(10 * 60 * 1000);
          console.log("evaluando mensaje ", messageInfo);
          console.log("el fleet y recurso: ", fleet, totalResources);
          if (
            messageInfo.fleet < minFleet &&
            messageInfo.totalResources < minResources
          ) {
            // if (fleet < minFleet) {
            console.log("SE procedera a eliminar");
            // await page.waitForSelector("span.fright>a.fright");
            // let deleteMessageButton = await message.$("span.fright>a.fright");
            // await deleteMessageButton.click();
            // await pendingXHR.waitForAllXhrFinished();
          } else {
            console.log("SE CONSERVA");
          }
        }
      }
      console.log("cambiando de pagina ...");
      await page.waitForSelector(".paginator:nth-child(4)");
      await page.click(".paginator:nth-child(4)");
      //filtering messages
      try {
        console.log("esperando cuerpo de mensajes...");
        await page.waitForSelector("#fleetsgenericpage");
      } catch (error) {
        console.log("se espero mucho...");
      }
      //updating index
      i++;
    }
    console.log("se acabo el filtrado de mensajes...");
    this.setTimesSpied(0); // se reinicia el contador de las veces que se espio
  }

  async getRank(page) {
    var page = page || this.page;
    let rank = 0;
    await page.waitForSelector("#bar", {
      timeout: 15000,
    });
    rank = await page.evaluate(() => {
      var rank = document.querySelector(
        "#bar > ul > li:nth-child(2)"
      ).innerText;
      return rank;
    });
    return getFirstNumber(rank);
  }

  async refreshGalaxyView(page) {
    await page.waitForSelector(".btn_blue");
    await page.click(".btn_blue");
    await this.waitForAllXhrFinished(page);
    return;
  }

  async getFleetsFromGalaxyView(page) {
    let fleetDetails = {
      fleets: [],
      slots: {
        expTotal: null,
        expInUse: null,
        all: null,
        current: null,
      },
    };
    [fleetDetails.slots.current, fleetDetails.slots.all] = await page.evaluate(
      () => [
        parseInt(document.querySelector("#slots #slotUsed").innerText),
        parseInt(document.querySelector("#slots #slotValue").innerText),
      ]
    );
    return fleetDetails;
  }

  async createNewPage(url, timeout) {
    timeout = timeout || 20 * 1000;
    if (!this.browser) await this.begin();
    let mainMenuUrl =
      url ||
      `https://${config.SERVER}-es.ogame.gameforge.com/game/index.php?page=ingame&component=overview&relogin=1`;
    let page = await this.browser.newPage();
    // await page.setViewport({
    //   width: 3440,
    //   height: 1440,
    //   deviceScaleFactor: 1,
    // });
    page.setDefaultTimeout(timeout);
    await page.goto(mainMenuUrl, {
      waitUntil: "networkidle0",
      timeout: 0,
    });
    return page;
  }

  async checkLoginStatus(page) {
    try {
      var page = page || this.createNewPage();
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
      // eliminando ads por siacaso
      await this.closeAds(page);
      console.log("se verificara en que pagina estamos...");
      switch (currentPage) {
        case "mainPage":
          console.log("no paso nada.. seguimos normal");
          this.setCookies(page); // se reingrensan los cookies
          await this.closePage(page);
          break;
        case "playPage":
          console.log("nos encontramos en vista playPage");
          await page.click("#joinGame>a>button.button");
          await page.waitForSelector(
            '.rt-td.action-cell>button[type="button"]',
            {
              timeout: 15000,
            }
          );
          let previousPage = page;
          page = await this.clickAndWaitForTarget(
            '.rt-td.action-cell>button[type="button"]',
            page,
            this.browser
          );
          this.setCookies(page); // se reingrensan los cookies
          await this.closePage(previousPage);
          await this.closePage(page);
          break;
        case "selectUniversePage":
          console.log("nos encontramos en vista universo");
          console.log("empezaremos el clickAndwait");
          let previousPage2 = page;
          page = await this.clickAndWaitForTarget(
            '.rt-td.action-cell>button[type="button"]',
            page,
            this.browser
          );
          this.setCookies(page); // se reingrensan los cookies
          await this.closePage(previousPage2);
          await this.closePage(page);
          console.log("se termino el click and wait");
          //main page ogame
          break;
        default:
          console.log("el caso default: a logearse");
          await this.login(null, null, page);
          console.log("cambiamos de pagina");
          break;
      }
      console.log("se retornara la pagina cerrada");
      return 0;
    } catch (error) {
      console.log("aaaaaa", error);
    }
  }

  async watchDog(page) {
    console.log("empezando watchdog");
    var page = page || this.page;
    console.log(`verificando ataques para ${this.ogameEmail}...`);
    await this.refreshPage(page);
    await page.waitForSelector("#attack_alert", {
      timeout: 15000,
    });
    let notAttacked = await page.evaluate(() => {
      return !document.querySelector("#attack_alert.soon");
    });
    if (notAttacked) {
      sendTelegramMessage(
        "624818317",
        `verificando ataques para ${this.ogameEmail}... - SIN ATAQUE ✅`
      );
      sendTelegramMessage(
        "893530350",
        `verificando ataques para ${this.ogameEmail}... - SIN ATAQUE ✅`
      );
      console.log("no estas siendo atacado");
      return false;
    } else {
      console.log("estas siendo atacado !!");
      sendTelegramMessage(
        "624818317",
        `verificando ataques para ${this.ogameEmail}... - TE ATACAN 🚨`
      );
      sendTelegramMessage(
        "893530350",
        `verificando ataques para ${this.ogameEmail}... - TE ATACAN 🚨`
      );
      return true;
    }
  }
  async attackDetail(page) {
    var page = page || this.page;
    let enemyMissions = [];
    // await timeout(5000);
    console.log("verificando los detalles del ataque...");

    //Click to overview enemy missions
    await page.waitForSelector(
      "#notificationbarcomponent > #message-wrapper > #messages_collapsed #js_eventDetailsClosed",
      {
        visible: true,
        timeout: 15000,
      }
    );
    await page.click(
      "#notificationbarcomponent > #message-wrapper > #messages_collapsed #js_eventDetailsClosed"
    );
    await page.waitForSelector("table#eventContent", {
      timeout: 15000,
    });
    //checking details
    await timeout(3000);
    let attackDetails = {
      normal: [],
      sac: [],
    };
    let enemyMissionsRows = await page.$$("tr.eventFleet");
    for (let i = 0; i < enemyMissionsRows.length; i++) {
      console.log("el tamaño de misiones es: ", enemyMissionsRows.length);
      let isSac = await enemyMissionsRows[i].evaluate((mission) => {
        return mission.getAttribute("class").includes("partnerInfo");
      });
      if (isSac) {
        console.log("se cortara la mision", i, " con valor: ", isSac);
        enemyMissionsRows.splice(i, 1);
        i = -1;
      }
    }
    console.log(
      "finalmente, las misiones que quedan: ",
      enemyMissionsRows.length
    );
    for (const enemyMission of enemyMissionsRows) {
      var isEnemy = await enemyMission.$("td.countDown>span.hostile");
      if (isEnemy) {
        // await page.waitForSelector("td.icon_movement", { visible: true });
        let fleet = await enemyMission.$("td.icon_movement");
        await fleet.hover();
        var attackDetail = await enemyMission.evaluate((enemyMission) => {
          var attackDetail = {
            hostilePlayer: {
              name: "",
              origin: {
                planetName: "",
                coords: "",
                type: "",
              },
              target: {
                planetName: "",
                coords: "",
                type: "",
              },
              impactHour: "",
              timeRemaining: "",
            },
            ships: [],
          };
          attackDetail.hostilePlayer.origin.coords = enemyMission
            .querySelector("td.coordsOrigin")
            .innerText.replace(/[\[\]']+/g, "");
          let planetPosition =
            attackDetail.hostilePlayer.origin.coords.split(":")[2];
          attackDetail.hostilePlayer.origin.planetName =
            enemyMission.querySelector("td.originFleet").innerText;
          attackDetail.hostilePlayer.origin.type = enemyMission.querySelector(
            "td.originFleet>figure.moon"
          )
            ? "moon"
            : "planet";

          attackDetail.hostilePlayer.target.coords = enemyMission
            .querySelector("td.destCoords")
            .innerText.replace(/[\[\]']+/g, "");
          attackDetail.hostilePlayer.target.planetName =
            enemyMission.querySelector("td.destFleet").innerText;
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
                qty: 0,
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
        await page.click("#ingamepage");
        await timeout(500);
        let hostilPlayerSelector = await enemyMission.$("td.sendMail");
        await hostilPlayerSelector.hover();
        let hostilPlayerName = await enemyMission.evaluate(() => {
          return document.querySelector(".tpd-tooltip").innerText;
        });
        attackDetail.hostilePlayer.name = hostilPlayerName;
        attackDetails.normal.push(attackDetail);
      }
    }
    let sacs = await page.$$(".allianceAttack");
    for (const sac of sacs) {
      attackDetails.sac.push(true); //to modify
    }
    console.log("te estan atacando con: ", JSON.stringify(attackDetails));
    return attackDetails;
  }

  async goToSolarSystem(coords, page) {
    console.log("Dirigiendo bot al sistema solar: ", coords);
    var page = page || this.page;
    let [galaxy, system, planet] = coords.split(":");
    if (this.currentPage !== "galaxy") {
      await this.goToPage("galaxy", page);
    }
    await this.waitForAllXhrFinished(page);
    let galaxyInputSelector = "#galaxy_input";
    await page.waitForSelector(galaxyInputSelector);
    let galaxyCurrentValue = await page.evaluate(
      () => document.querySelector("#galaxy_input").value
    );
    if (galaxyCurrentValue !== galaxy) {
      await page.click(galaxyInputSelector);
      await page.type(galaxyInputSelector, galaxy, {
        delay: this.typingDelay,
      });
    }
    let systemInputSelector = "#system_input";
    await page.waitForSelector(systemInputSelector);
    let systemCurrentValue = await page.evaluate(
      () => document.querySelector("#system_input").value
    );
    if (systemCurrentValue !== system) {
      await page.click(systemInputSelector);
      await page.type(systemInputSelector, system, {
        delay: this.typingDelay,
      });
    }
    if (galaxyCurrentValue !== galaxy || systemCurrentValue !== system) {
      console.log("dando click en vamos...");
      //click !vamos!
      await page.waitForSelector(
        "#galaxycomponent > #inhalt > #galaxyHeader > form > .btn_blue:nth-child(9)"
      );
      // await timeout(1000);
      await page.click(
        "#galaxycomponent > #inhalt > #galaxyHeader > form > .btn_blue:nth-child(9)"
      );
    } else {
      console.log(
        "entramos aca: ",
        galaxyCurrentValue !== galaxy || systemCurrentValue !== system
      );
      console.log("entramos aca: ", {
        galaxyCurrentValue,
        galaxy,
        systemCurrentValue,
        system,
      });
    }
    await this.waitForAllXhrFinished(page);
    await page.waitForSelector(".galaxyRow.ctContentRow");
  }

  async goToPage(pageName, page) {
    var page = page || this.page;
    //closing add
    switch (pageName) {
      case "galaxy":
        this.currentPage = "galaxy";
        console.log("yendo a vista galaxias");
        // const buttons = await page.$$(".menubutton");
        // await page.goto(
        //   "https://s208-es.ogame.gameforge.com/game/index.php?page=ingame&component=galaxy"
        // );
        // for (const button of buttons) {
        //   let innerText = await button.evaluate((e) => e.innerText);
        //   console.log("🚀 Aqui *** -> innerText", innerText);
        //   if (innerText === "Galaxia") {
        //     await button.click();
        //   }
        // }
        await page.waitForSelector(
          "#toolbarcomponent > #links > #menuTable > li:nth-child(9) > .menubutton",
          {
            timeout: 15000,
          }
        );
        await page.click(
          "#toolbarcomponent > #links > #menuTable > li:nth-child(9) > .menubutton"
        );
        // await navigationPromise
        break;
      case "fleet":
        console.log("yendo a vista flota");
        let isOnFleetPage = await page.evaluate(() => {
          return Boolean(document.querySelector(".fleetStatus"));
        });
        if (!isOnFleetPage) {
          await page.waitForSelector(
            "#toolbarcomponent > #links > #menuTable > li:nth-child(8) > .menubutton",
            {
              timeout: 15000,
            }
          );
          await page.click(
            "#toolbarcomponent > #links > #menuTable > li:nth-child(8) > .menubutton"
          );
        }

        break;
      case "fleetMovement":
        console.log("yendo a vista flota movement");
        await page.waitForSelector(
          "#toolbarcomponent > #links > #menuTable > li:nth-child(9)>span.menu_icon>a",
          {
            timeout: 15000,
          }
        );
        await page.click(
          "#toolbarcomponent > #links > #menuTable > li:nth-child(9)>span.menu_icon>a"
        );
        break;

      default:
        break;
    }
    // await this.closeAds();
  }

  async checkPlanetActivity(coords, type, page) {
    //type = moon || planet
    var page = page || this.page;
    var [galaxy, system, planet] = coords.split(":");
    await this.goToSolarSystem(coords, page);
    type == "planet"
      ? console.log("Empezando a escanear planeta: ", coords)
      : console.log("Empezando a escanear luna: ", coords);
    // await timeout(5000);
    try {
      await page.waitForResponse((response) => {
        return (
          response.url() ===
            `https://${config.SERVER}-es.ogame.gameforge.com/game/index.php?page=ingame&component=overview&relogin=1` &&
          response.status() === 200
        );
      });
      await timeout(500);
    } catch (error) {
      goToPage("galaxy"); //refresh page
      console.log(error);
    }
    var planetActivity = {
      date: new Date(),
      lastActivity: "off",
    };

    try {
      planetActivity.lastActivity = await page.evaluate(
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
        {
          planet,
          type,
        }
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
      await this.page.waitForResponse((response) => {
        return (
          response.url() ===
            `https://${config.SERVER}-es.ogame.gameforge.com/game/index.php?page=ingame&component=overview&relogin=1` &&
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

  async closeAds(page) {
    console.log("entrando a closeAds");
    page = page || this.page;
    await timeout(2700);
    let hasCookie = await page.evaluate(() => {
      return Boolean(document.querySelector(".cookiebanner5:nth-child(2)"));
    });
    console.log("🚀 Aqui *** -> hasCookie", hasCookie);
    if (hasCookie) {
      await page.click(".cookiebanner5:nth-child(2)");
    }
    let adState = await page.evaluate(() => {
      let ad = document.querySelector(".openX_int_closeButton > a");
      if (ad) {
        ad.click();
      }
      return true;
    });
    let secondAd = await page.evaluate(() => {
      let ad = document.querySelector(
        ".openX_interstitial .openX_int_closeButton a"
      );
      if (ad) {
        ad.click();
      }
      return true;
    });
    console.log("se encontro este add: ", adState, secondAd);
    return 0;
  }

  async closePage(page) {
    await page.goto("about:blank");
    await page.close();
  }

  async sendMessageToPlayer(nickname, msg) {
    try {
      await this.page.waitForSelector(
        "#headerbarcomponent > #bar > ul > li:nth-child(5) > .overlay",
        {
          timeout: 15000,
        }
      );
      await this.page.click(
        "#headerbarcomponent > #bar > ul > li:nth-child(5) > .overlay"
      );

      await this.page.waitForSelector("#searchText", {
        timeout: 15000,
      });
      await this.page.click("#searchText");

      await this.page.type("#searchText", nickname, {
        delay: this.typingDelay,
      });

      await this.page.waitForSelector(
        "tbody > tr > .ptb10 > #searchForm > .btn_blue",
        {
          timeout: 15000,
        }
      );
      await this.page.click("tbody > tr > .ptb10 > #searchForm > .btn_blue");
      await this.page.waitForSelector(
        "tbody > .alt > .action > .tooltip > .icon",
        {
          timeout: 15000,
        }
      );
      await this.page.click("tbody > .alt > .action > .tooltip > .icon");

      await this.navigationPromise;

      await this.page.waitForSelector(
        "#contentWrapper > #chatContent > .content > .editor_wrap > .new_msg_textarea",
        {
          timeout: 15000,
        }
      );
      await this.page.click(
        "#contentWrapper > #chatContent > .content > .editor_wrap > .new_msg_textarea"
      );

      await this.page.type(
        "#contentWrapper > #chatContent > .content > .editor_wrap > .new_msg_textarea",
        msg,
        {
          delay: this.typingDelay / 2,
        }
      );

      await this.page.waitForSelector(
        "#contentWrapper > #chatContent > .content > .editor_wrap > .btn_blue",
        {
          timeout: 15000,
        }
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
      (target) => target.opener() === pageTarget
    ); //check that you opened this page, rather than just checking the url
    const newPage = await newTarget.page(); //get the page object
    // await newPage.once("load",()=>{}); //this doesn't work; wait till page is loaded
    await newPage.waitForSelector("body", {
      timeout: 15000,
    }); //wait for page to be loaded
    // newPage.on("console", consoleObj => console.log(consoleObj.text()));
    return newPage;
  }
  async refreshPage(page) {
    page = page || this.page;
    console.log("refrescando ogame a las : ", formatISO9075(new Date()));
    // await page.waitForSelector(
    //   "#links > #menuTable > li:nth-child(1) > .menubutton > .textlabel"
    // );
    // await page.click(
    //   "#links > #menuTable > li:nth-child(1) > .menubutton > .textlabel"
    // );
    await page.waitForSelector(".smallplanet", {
      timeout: 15000,
    });
    let planets = await page.$$(".smallplanet");
    let selectedPlanet = planets[Random(0, planets.length - 1)];
    // let selectedPlanet;
    // // seleccionando planeta posicion especifica
    // for (const planet of planets) {
    //   let innerText = await planet.evaluate(
    //     (e) => e.querySelector(".planet-koords ").innerText
    //   );
    //   if (innerText.includes("5:171:7") || innerText.includes("5:171:8")) {
    //     console.log("SELECCIONE ESTO: ", innerText);
    //     selectedPlanet = planet;
    //   }
    // }
    await timeout(1.5 * 1000);
    let hasMoon = await selectedPlanet.evaluate((e) =>
      e.querySelector("a.moonlink")
    );
    // let hasMoon = true;
    if (hasMoon) {
      console.log("tiene luna, se escogera actividad al azar...");
      let randomNumber = Random(0, 1);
      console.log("numero aleatorio: ", randomNumber);
      if (randomNumber === 0)
        await selectedPlanet.evaluate((e) => e.querySelector("a").click());
      else
        await selectedPlanet.evaluate((e) =>
          e.querySelector("a.moonlink").click()
        );
    } else {
      console.log("no tiene luna, se cliqueara un planeta...");
      await selectedPlanet.evaluate((e) => e.querySelector("a").click());
    }
    // await this.navigationPromise;
  }

  async getFleets(page) {
    var page = page || this.page;
    let fleetDetails = {
      fleets: [],
      slots: {
        expTotal: null,
        expInUse: null,
        all: null,
        current: null,
      },
    };
    //go to fleet view
    await this.goToPage("fleet", page);
    // await timeout(5000);
    //Click to overview missions
    //check fleets
    let fleetOverviewButton = await page.$("p.event_list");
    if (fleetOverviewButton) {
      await page.waitForSelector(
        "#notificationbarcomponent > #message-wrapper > #messages_collapsed #js_eventDetailsClosed",
        {
          visible: true,
          timeout: 15000,
        }
      );
      await page.click(
        "#notificationbarcomponent > #message-wrapper > #messages_collapsed #js_eventDetailsClosed"
      );
      await page.waitForSelector("table#eventContent", {
        timeout: 15000,
      });
    }

    //checking fleet details
    await timeout(5000);
    fleetDetails = await page.evaluate(() => {
      var fleets = [];
      var slots = {
        expTotal: null,
        expInUse: null,
        all: null,
        current: null,
      };
      var fleetEvents = document.querySelectorAll("tr.eventFleet");
      console.log("fleet events es de tamaño: ", fleetEvents.length);
      fleetEvents.forEach((fleetEvent) => {
        fleets.push({
          missionType: fleetEvent.getAttribute("data-mission-type"),
          return: fleetEvent.getAttribute("data-return-flight"),
          arrivalTime: fleetEvent.getAttribute("data-arrival-time"),
        });
      });

      slots.current = parseInt(
        document
          .querySelector("#slots>.fleft>span")
          .innerText.match(/([0-9])/)[0]
      );
      slots.all = parseInt(
        document
          .querySelector("#slots>.fleft>span")
          .innerText.match(/([^\/]+$)/)[0]
      );
      slots.expInUse = parseInt(
        document
          .querySelector("#slots>.fleft:nth-child(2)>span")
          .innerText.innerText.replace("Expediciones: ", "")
          .split("/")[0]
      );
      slots.expTotal = parseInt(
        document
          .querySelector("#slots>.fleft:nth-child(2)>span")
          .innerText.innerText.replace("Expediciones: ", "")
          .split("/")[1]
      );
      return {
        fleets,
        slots,
      };
    });
    return fleetDetails;
  }

  async getOgameUsername(page) {
    var page = page || this.page;
    let username = "";
    await page.waitForSelector("li#playerName", {
      timeout: 15000,
    });
    username = await page.evaluate(() => {
      console.log("estoy en esta pagina");
      var username = document.querySelector("li#playerName>span>a").innerText;
      return username;
    });
    return username;
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
  async viejoProfeta(page) {
    async function updateMine(type) {
      await page.waitForSelector(
        "li.deuteriumSynthesizer>span>button.upgrade",
        {
          timeout: 15000,
        }
      );
      switch (type) {
        case "metal":
          await page.click("li.metalMine>span>button.upgrade");
          break;
        case "crystal":
          await page.click("li.crystalMine>span>button.upgrade");
          break;
        case "deuterim":
          await page.click("li.deuteriumSynthesizer>span>button.upgrade");
          break;

        default:
          break;
      }
    }
  }
  async stop() {
    await this.browser.close();
  }
  async hasAction(actionType) {
    //expeditions - watchDog - hunter - dailyFleetSave
    let actions = await this.getActions();
    let actionIndex = actions.findIndex((action) => action.type === actionType);
    console.log("se retornara: ", actionIndex, actions[actionIndex]);
    return actionIndex > -1 ? true : false;
  }
  async getActions() {
    try {
      let result = await BotModel.aggregate([
        {
          $match: {
            ogameEmail: this.ogameEmail,
          },
        },
        {
          $project: {
            ogameEmail: 1,
            actions: {
              $filter: {
                input: "$actions",
                as: "action",
                cond: {
                  $eq: ["$$action.active", true],
                },
              },
            },
          },
        },
      ]);
      return result[0].actions;
    } catch (error) {
      console.log("algo salio mal en getActions:", error);
      return [];
    }
  }
  async addAction(type, payload = {}) {
    try {
      let botModel = await BotModel.findOne(
        {
          ogameEmail: this.ogameEmail,
        },
        "actions"
      );
      let actionToUpdate = botModel.actions.find(
        (action) => action.type === type
      );
      actionToUpdate.active = true;
      actionToUpdate.payload.coords = payload.coords;
      actionToUpdate.payload.isSpecial = payload.isSpecial;
      await botModel.save();
      console.log("se recibio este action:", type);
      return true;
    } catch (error) {
      console.log("algo salio mal en addaction:", error);
      return;
    }
  }
  async stopAction(type) {
    try {
      let botModel = await BotModel.findOne(
        {
          ogameEmail: this.ogameEmail,
        },
        "actions"
      );
      let actionToUpdate = botModel.actions.find(
        (action) => action.type === type
      );
      if (actionToUpdate.active == false) return false;
      actionToUpdate.active = false;
      await botModel.save();
      return true;
    } catch (error) {
      console.log("algo salio mal en stopaction:", error);
      return;
    }
  }
  /**
   * @Description Obtiene los datos naves del planeta actual. Se dirigirá a vista flota
   */
  async getShipsAvailable(page) {
    page = page || this.page;
    await this.goToPage("fleet", page);
    await timeout(30 * 1000);
    let response = await page.evaluate(() => {
      console.log("la cantidad: ", window["shipsOnPlanet"]);
      return window["shipsOnPlanet"];
    });
    return response;
  }

  async setCookies(page) {
    this.cookies = await page.cookies();
  }

  async getCookies() {
    return this.cookies;
  }

  getTelegramUsername() {
    return this.telegramUsername;
  }

  getFormattedCookies() {
    return this.cookies
      .map(
        (cookie, index) =>
          `${cookie.name}=${cookie.value}${
            index !== this.cookies.length - 1 ? ";" : ""
          }`
      )
      .join(" ");
  }
  getFleetToken() {
    return this.fleet_token;
  }
  setFleetToken(value) {
    this.fleet_token = value;
  }
};
