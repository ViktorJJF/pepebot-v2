// WARNING: This script doesn't care about the "reserved slots"
// origin = GetCachedCelestial("4:208:8")
// minSystem = 1
// maxSystem = 10
// ships = { cazadorLigero: 2, cazadorPesado: 3 };
// expeditionDuration = 1

//----------------------------------------

const Coordinate = require("../classes/Coordinate");
const Fleet = require("../classes/Fleet");

const {
  Random,
  timeout,
  msToTime,
  handleError,
  getNearestPlanet,
} = require("../utils/utils");
const { PendingXHR } = require("pending-xhr-puppeteer");
const botTelegram = require("../chatbot/Telegram/telegramBot");
const axios = require("axios");
const config = require("../config");

async function spyPlayer(bot, playerName, type = "planet") {
  console.log("empezando espionaje");
  let timesSpied = 0; // cantidad de veces espiadas
  var page = await bot.createNewPage(null, 6000);
  var ogameUsername = await bot.getOgameUsername(page);
  //check
  const pendingXHR = new PendingXHR(page);
  // primero se obtiene el origen mas cercano
  const playerInfo = (
    await axios(config.PEPEHUNTER_BASE + "/api/players/by-name", {
      params: { name: playerName },
    })
  ).data.payload;
  const planets = playerInfo.planets;
  let nearestCoords;
  for (let i = 0; i < planets.length; i++) {
    const coords = planets[i].coords;
    if (
      i === 0 ||
      (nearestCoords && nearestCoords.split(":")[0] != coords.split(":")[0])
    ) {
      nearestCoords = await getNearestPlanet(bot, coords);
      await bot.goToPlanetMoon(nearestCoords, page);
      console.log("yendo al planeta...");
    } else {
      console.log("manteniendo mismo planeta");
    }
    // console.log("object");
    // await bot.goToSolarSystem(coords, page);
    await timeout(3 * 1000);
    try {
      // await bot.goToSolarSystem(coords, page);
      // await bot.waitForAllXhrFinished(page);
      console.log("antes de espiar...");
      await bot.spyPlanetMoon(coords, page, type, false);
    } catch (error) {
      console.log("ERROR SPY", error);
      await bot.checkLoginStatus(page);
      i = i - 1;
    }
  }
  console.log("ESPIONAJES TERMINADOS!!");
}

module.exports = spyPlayer;
