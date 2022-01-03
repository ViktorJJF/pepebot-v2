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
const botTelegram = require("../chatbot/Telegram/telegramBot");
const axios = require("axios");
const config = require("../config");

async function beginSpies(bot, from, to, type = "planet") {
  try {
    console.log("empezando espionaje");
    let timesSpied = 0; // cantidad de veces espiadas
    var page = await bot.createNewPage();
    var ogameUsername = await bot.getOgameUsername(page);
    //check
    // primero se obtiene el origen mas cercano
    let nearestCoords = await getNearestPlanet(bot, from, page);
    console.log("🚀 Aqui *** -> nearestCoords", nearestCoords);
    await bot.goToPlanetMoon(nearestCoords, page);
    for (
      let i = parseInt(from.split(":")[1]);
      i <= parseInt(to.split(":")[1]);
      i++
    ) {
      let planet = i;
      let galaxy = from.split(":")[0];
      // Sends new spies
      console.log(`OBTENIENDO PLANETAS DE: ${galaxy}:${String(i)}:${planet}`);
      await bot.goToSolarSystem(`${galaxy}:${String(i)}:${planet}`, page);
      await timeout(10 * 1000);
      let planetsToSpy = await bot.getSolarSystemPlanets(page);
      console.log("🚀 Aqui *** -> planetsToSpy", planetsToSpy);
      let { slots } = await bot.getFleetsFromGalaxyView(page);
      let remainingSlots = slots.all - slots.current;
      for (let j = 0; j < planetsToSpy.length; j++) {
        console.log(
          `empezando espionaje en: ${galaxy}:${String(i)}:${
            planetsToSpy[j] + 1
          }`
        );
        let spyStatus = await bot.spyPlanetMoon(
          `${galaxy}:${String(i)}:${planetsToSpy[j] + 1}`,
          page,
          "moon",
          true
        );
        if (!spyStatus) {
          j--;
          // await bot.refreshGalaxyView(page);
        } else {
          timesSpied += 1;
        }

        // await timeout(1 * 1000);
        while (remainingSlots === 0) {
          console.log("te quedaste sin slots..");
          await bot.refreshGalaxyView(page);
          slots = (await bot.getFleetsFromGalaxyView(page)).slots;
          remainingSlots = slots.all - slots.current;
          console.log("quedan slots: ", remainingSlots);
          await timeout(5 * 1000);
        }
      }
    }
    console.log("cantidad de veces espiado: ", timesSpied);
    bot.setTimesSpied(timesSpied); // se coloca la cantidad de veces espiadas
    await botTelegram.sendTextMessage(
      bot.telegramId,
      `<b>${ogameUsername}</b> terminé de espiar la zona`
    );
    await bot.closePage(page);
    return;
  } catch (error) {
    const errorStatus = handleError(error);
    if (!errorStatus) {
      console.log("error desconocido...", error);
      await bot.checkLoginStatus(page);
      beginSpies(origin, range, type, bot);
    }
  }
}

module.exports = beginSpies;
