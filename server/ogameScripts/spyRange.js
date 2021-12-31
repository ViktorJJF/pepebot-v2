// WARNING: This script doesn't care about the "reserved slots"
// origin = GetCachedCelestial("4:208:8")
// minSystem = 1
// maxSystem = 10
// ships = { cazadorLigero: 2, cazadorPesado: 3 };
// expeditionDuration = 1

//----------------------------------------

const Coordinate = require("../classes/Coordinate");
const Fleet = require("../classes/Fleet");

const { Random, timeout, msToTime, handleError } = require("../utils/utils");
const { PendingXHR } = require("pending-xhr-puppeteer");
const botTelegram = require("../chatbot/Telegram/telegramBot");

async function beginSpies(origin, range, type, bot) {
  try {
    console.log("empezando espionaje");
    let timesSpied = 0; // cantidad de veces espiadas
    var page = await bot.createNewPage(null, 6000);
    var ogameUsername = await bot.getOgameUsername(page);
    //check
    const pendingXHR = new PendingXHR(page);
    let [galaxy, system, planet] = origin.split(":");
    galaxy = 7;
    let beginCoords = 100;
    // let beginCoords = parseInt(system) - parseInt(range);
    let finalCoords = 200;
    // let finalCoords = parseInt(system) + parseInt(range);
    //go to planet to begin to spy
    await bot.goToPlanetMoon(origin, page);
    for (let i = beginCoords; i <= finalCoords; i++) {
      console.log("mandando espionaje...");
      // Sends new spies
      let planetsToSpy = await bot.getSolarSystemPlanets(
        `${galaxy}:${String(i)}:${planet}`,
        pendingXHR,
        page
      );
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
          type,
          page
        );
        if (!spyStatus) {
          j--;
          await bot.refreshGalaxyView(pendingXHR, page);
        } else {
          timesSpied += 1;
        }

        // await timeout(1 * 1000);
        while (remainingSlots === 0) {
          console.log("te quedaste sin slots..");
          await bot.refreshGalaxyView(pendingXHR, page);
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
