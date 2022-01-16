const {
  timeout,
  Random,
  timeTomiliseconds,
  timeTomiliseconds2,
  getCloserDurationIndex,
  setCommonHeaders,
} = require("../utils/utils.js");
const config = require("../config");
const axios = require("axios");

class Fleet {
  constructor() {
    this.page = null; // puppeteer page
    this.origin = null; //1:241:4
    this.destination = null; //1:241:4
    this.speed = null; //0.10 - 1
    this.mission = null; //EXPEDITION - ATTACK - TRANSPORT
    this.duration = null; //1h 2h 1h:30min 40min etc
    this.allResources = null;
    this.allShips = null;
    this.type = null;
    this.missions = [
      { name: "expedition", id: "15" },
      { name: "espionage", id: "6" },
    ];
    this.bot = null;
    this.sentShips = [];
    this.ships = [
      {
        id: "202",
        name: "Nave pequeña de carga",
        type: "transporterSmall",
        qty: 0,
      },
      {
        id: "203",
        name: "Nave Grande de carga",
        type: "transporterLarge",
        qty: 0,
      },
      {
        id: "204",
        name: "Cazador Ligero",
        type: "fighterLight",
        qty: 0,
      },
      {
        id: "205",
        name: "Cazador Pesado",
        type: "fighterHeavy",
        qty: 0,
      },
      {
        id: "206",
        name: "Crucero",
        type: "cruiser",
        qty: 0,
      },
      {
        id: "207",
        name: "Nave de batalla",
        type: "battleship",
        qty: 0,
      },
      {
        id: "208",
        name: "Colonizador",
        type: "colonyShip",
        qty: 0,
      },
      {
        id: "209",
        name: "Reciclador",
        type: "recycler",
        qty: 0,
      },
      {
        id: "210",
        name: "Sonda de espionaje",
        type: "espionageProbe",
        qty: 0,
      },
      {
        id: "211",
        name: "Bombardero",
        type: "bomber",
        qty: 0,
      },
      {
        id: "213",
        name: "Destructor",
        type: "destroyer",
        qty: 0,
      },
      {
        id: "214",
        name: "Estrella de la muerte",
        type: "deathstar",
        qty: 0,
      },
      {
        id: "215",
        name: "Acorazado",
        type: "interceptor",
        qty: 0,
      },
      {
        id: "218",
        name: "Segador",
        type: "reaper",
        qty: 0,
      },
      {
        id: "219",
        name: "Explorador",
        type: "explorer",
        qty: 0,
      },
    ];
  }
  setPage(value) {
    this.page = value;
  }
  setOrigin(value) {
    this.origin = value;
  }
  setType(value) {
    this.type = value;
  }
  setDestination(value) {
    this.destination = value;
  }
  setSpeed(value) {
    this.speed = value;
  }
  setMission(value) {
    this.mission = value;
  }
  setDuration(value) {
    this.duration = value;
  }
  addShips(shipId, qty) {
    this[shipId] = qty;
  }
  SetAllResources() {
    this.allResources = true;
  }
  SetAllShips() {
    this.allShips = true;
  }
  setBot(value) {
    this.bot = value;
  }
  getSentShips() {
    return this.sentShips;
  }
  async sendNow() {
    //select origin
    console.log("yendo al origen");
    await this.page.waitForSelector("span.planet-koords");
    await this.page.evaluate(
      (origin, type = "moon") => {
        var planetCoords = document.querySelectorAll(".smallplanet");
        for (let i = 0; i < planetCoords.length; i++) {
          var planetCoordsText = planetCoords[i]
            .querySelector("span.planet-koords")
            .innerText.replace(/[\[\]']+/g, "");
          if (planetCoordsText == origin) {
            if (planetCoords[i].querySelector(".moonlink") && type == "moon") {
              // no se vuelve a dar click si ya estamos correctos
              if (!planetCoords[i].querySelector(".moonlink.active")) {
                planetCoords[i].querySelector(".moonlink").click();
              }
            } else {
              // no se vuelve a dar click si ya estamos correctos
              if (!planetCoords[i].querySelector(".active")) {
                planetCoords[i].querySelector("span.planet-koords").click();
              }
            }
          }
        }
      },
      this.origin,
      this.type
    );
    await this.page.waitForSelector("#planet.planet-header");
    //check if exists ships
    let existsShips = await this.page.evaluate((e) =>
      document.querySelector("#warning") ? false : true
    );
    if (!existsShips) return null;
    await this.page.waitForSelector("#slots>.fleft:nth-child(2)");
    if (this.mission === "expedition") {
      let ships = await this.page.evaluate(() => {
        //get max expeditions
        var expMax = parseInt(
          document
            .querySelector("#slots>.fleft:nth-child(2)")
            .innerText.match(/([^\/]+$)/)[0]
        );
        var expInUse = parseInt(
          document
            .querySelector("#slots>.fleft:nth-child(2)")
            .innerText.match(/[0-9]/)[0]
        );
        var freeExpSlots = expMax - expInUse;
        console.log("las expediciones restantes son: ", freeExpSlots);
        var naveGrandeDeCargaTotal = parseInt(
          document
            .querySelector("span.transporterLarge>span")
            .getAttribute("data-value")
        );
        var explorerTotal = parseInt(
          document
            .querySelector("span.explorer>span")
            .getAttribute("data-value")
        );
        var cazadorLigeroTotal = parseInt(
          document
            .querySelector("span.fighterLight>span")
            .getAttribute("data-value")
        );
        var navePequenaDeCargaTotal = parseInt(
          document
            .querySelector("span.transporterSmall>span")
            .getAttribute("data-value")
        );
        var sondaTotal = parseInt(
          document
            .querySelector("span.espionageProbe>span")
            .getAttribute("data-value")
        );
        var battleShips = document.querySelectorAll(
          "#battleships>ul#military>li"
        );
        for (let i = battleShips.length - 2; i > -1; i--) {
          let lastBattleShipQty = parseInt(
            battleShips[i].querySelector("span>span").getAttribute("data-value")
          );
          if (lastBattleShipQty > 0) {
            var lastBattleShipId =
              battleShips[i].getAttribute("data-technology");
            i = -1;
          }
        }
        // es importante calcular la cantidad de ngc a enviar
        let ngcToSend = parseInt((naveGrandeDeCargaTotal * 1) / freeExpSlots);
        return [
          // {
          //   id: "204",
          //   qty:
          //     parseInt((cazadorLigeroTotal * 1) / freeExpSlots) > 3000
          //       ? 3000
          //       : parseInt((cazadorLigeroTotal * 1) / freeExpSlots),
          // },
          // {
          //   id: "202",
          //   qty: parseInt((navePequenaDeCargaTotal * 1) / freeExpSlots),
          // },
          {
            id: "203",
            qty: ngcToSend > 2000 ? 2000 : ngcToSend, // maximo 2000 NGC
          },
          {
            id: "210",
            qty: 1,
          },
          // { id: "215", qty: 1 },
          {
            id: "219",
            qty: explorerTotal > 0 ? 1 : 0, // solo enviar un explorador
          },
          {
            id: lastBattleShipId,
            qty: 1,
          },
        ];
      });
      ships.forEach((localShip) => {
        let shipIndex = this.ships.findIndex((ship) => ship.id == localShip.id);
        console.log("el indice es: ", shipIndex);
        if (this.ships[shipIndex] && this.ships[shipIndex].id !== "214")
          this.ships[shipIndex].qty = localShip.qty;
      });
    }

    let shipsString = ""; // cadena de texto para solicitud
    for (const ship of this.ships) {
      if (ship.qty > 0 || this.allShips) {
        this.sentShips.push(ship);
        console.log(
          "se colocara esta nave: ",
          ship.name,
          " - ",
          String(ship.qty)
        );
        shipsString += `&am${ship.id}=${ship.qty}`;
      }
    }
    let [galaxy, system, planet] = this.destination.split(":");
    let missionCode = this.missions.find((el) => el.name == this.mission).id;
    //if all resources true
    if (this.allResources) {
    }
    // colocando velocidad
    // solicitud
    await this.makeRequest({
      shipsString,
      galaxy,
      system,
      planet,
      missionCode,
    });
    console.log("mandando la flota...");
    return this.getSentShips();
  }

  async makeRequest({ shipsString, galaxy, system, planet, missionCode } = {}) {
    try {
      const response = await axios({
        method: "post",
        url: `https://${config.SERVER}-es.ogame.gameforge.com/game/index.php?page=ingame&component=fleetdispatch&action=sendFleet&ajax=1&asJson=1`,
        headers: setCommonHeaders({
          Referer: `https://${config.SERVER}-es.ogame.gameforge.com/game/index.php?page=ingame&component=fleetdispatch`,
          Cookie: this.bot.getFormattedCookies(),
          contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        }),
        data: `token=${this.bot.getFleetToken()}${shipsString}&galaxy=${galaxy}&system=${system}&position=${planet}&type=1&metal=0&crystal=0&deuterium=0&prioMetal=1&prioCrystal=2&prioDeuterium=3&mission=${missionCode}&speed=${
          this.speed * 10
        }&retreatAfterDefenderRetreat=0&union=0&holdingtime=1`,
      });
      let data = response.data;
      console.log("🚀 Aqui *** -> data", data);
      this.bot.setFleetToken(data.token); // el token se autocompleta aqui en la instancia del bot
      if (!data || !data.success) {
        throw new Error("Cookie vencida");
      }
      if (
        !data.success &&
        !data.errors.find((error) =>
          error.message.includes(
            "Error de partida de flota: no se ha podido enviar la flota"
          )
        )
      ) {
        console.log("algo salio mal: ", data.errors);
      } else {
      }
    } catch (error) {
      console.log("err: ", error);
      console.log("HACIENDO SOLICITUD DE NUEVO");
      await this.makeRequest({
        shipsString,
        galaxy,
        system,
        planet,
        missionCode,
      });
    }
  }
}

module.exports = Fleet;
