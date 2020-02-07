const { timeout } = require("../utils/utils.js");
class Fleet {
  constructor() {
    this.page = null; // puppeteer page
    this.origin = null; //1:241:4
    this.destination = null; //1:241:4
    this.speed = null; //0.10 - 1
    this.mission = null; //EXPEDITION - ATTACK - TRANSPORT
    this.duration = null; //
    this.ships = [
      {
        id: "202",
        name: "Nave pequeña de carga",
        type: "transporterSmall",
        qty: 0
      },
      {
        id: "203",
        name: "Nave Grande de carga",
        type: "transporterLarge",
        qty: 0
      },
      {
        id: 3,
        name: "Cazador Ligero",
        type: "fighterLight",
        qty: 0
      },
      {
        id: "205",
        name: "Cazador Pesado",
        type: "fighterHeavy",
        qty: 0
      },
      {
        id: "206",
        name: "Crucero",
        type: "cruicer",
        qty: 0
      },
      {
        id: "207",
        name: "Nave de batalla",
        type: "battleship",
        qty: 0
      },
      {
        id: "208",
        name: "Colonizador",
        type: "colonyShip",
        qty: 0
      },
      {
        id: "209",
        name: "Reciclador",
        type: "recycler",
        qty: 0
      },
      {
        id: "210",
        name: "Sonda de espionaje",
        type: "espionageProbe",
        qty: 0
      },
      {
        id: "211",
        name: "Bombardero",
        type: "bomber",
        qty: 0
      },
      {
        id: "213",
        name: "Destructor",
        type: "destroyer",
        qty: 0
      },
      {
        id: "214",
        name: "Estrella de la muerte",
        type: "deathstar",
        qty: 0
      },
      {
        id: "215",
        name: "Acorazado",
        type: "interceptor",
        qty: 0
      },
      {
        id: "218",
        name: "Segador",
        type: "reaper",
        qty: 0
      },
      {
        id: "219",
        name: "Explorador",
        type: "explorer",
        qty: 0
      }
    ];
  }
  setPage(value) {
    this.page = value;
  }
  setOrigin(value) {
    this.origin = value;
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
  async sendNow() {
    //select origin
    console.log("yendo al origen");
    await this.page.waitForSelector("span.planet-koords");
    await this.page.evaluate(origin => {
      var planetCoords = document.querySelectorAll("span.planet-koords");
      for (let i = 0; i < planetCoords.length; i++) {
        console.log("la coordenada es: ", planetCoords[i].innerText);
        var planetCoordsText = planetCoords[i].innerText.replace(
          /[\[\]']+/g,
          ""
        );
        console.log("ahora planet coords es: ", planetCoords[i]);
        if (planetCoordsText == origin) {
          console.log("se clickeara : ", planetCoords[i].innerText);
          planetCoords[i].click();
        }
      }
    }, this.origin);
    //go to fleet view
    await this.page.waitForSelector(
      "#toolbarcomponent > #links > #menuTable > li:nth-child(9) > .menubutton"
    );
    await this.page.click(
      "#toolbarcomponent > #links > #menuTable > li:nth-child(9) > .menubutton"
    );
    await timeout(1500);
    await this.page.waitForSelector("#slots>.fleft:nth-child(2)");
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
          var lastBattleShipId = battleShips[i].getAttribute("data-technology");
          i = -1;
        }
      }
      return [
        {
          id: "202",
          qty: parseInt((navePequenaDeCargaTotal * 0.95) / freeExpSlots)
        },
        {
          id: "203",
          qty: parseInt((naveGrandeDeCargaTotal * 0.95) / freeExpSlots)
        },
        { id: "210", qty: 15 },
        { id: "219", qty: 9 },
        {
          id: lastBattleShipId,
          qty: 1
        }
      ];
    });
    ships.forEach(localShip => {
      this.ships[this.ships.findIndex(ship => ship.id == localShip.id)].qty =
        localShip.qty;
    });
    for (const ship of this.ships) {
      if (ship.qty > 0) {
        console.log(
          "se colocara esta nave: ",
          ship.name,
          " - ",
          String(ship.qty)
        );
        await this.page.click(`li.${ship.type}>input`);
        await this.page.type(`li.${ship.type}>input`, String(ship.qty));
        await timeout(800);
      }
    }
    await this.page.click("a#continueToFleet2");
    let [galaxy, system, planet] = this.destination.split(":");
    await this.page.waitForSelector("input#galaxy", { visible: true });
    await this.page.click("input#galaxy");
    await this.page.type("input#galaxy", galaxy);
    await this.page.type("input#system", system);
    await this.page.type("input#position", planet);
    await this.page.waitForSelector("a#continueToFleet3.continue.on", {
      visible: true
    });
    await this.page.click("a#continueToFleet3");

    switch (this.mission) {
      case "expedition":
        console.log("se escogio expedicion");
        await this.page.waitForSelector("li#button15>a#missionButton15", {
          visible: true
        });
        await this.page.click("li#button15>a#missionButton15");
        await this.page.waitForSelector("a#sendFleet.start.on");
        await this.page.click("a#sendFleet.start.on");
        break;

      default:
        break;
    }
    console.log("mandando la flota...");
  }
}

module.exports = Fleet;
