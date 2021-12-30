// WARNING: This script doesn't care about the "reserved slots"
// origin = GetCachedCelestial("4:208:8")
// minSystem = 1
// maxSystem = 10
// ships = { cazadorLigero: 2, cazadorPesado: 3 };
// expeditionDuration = 1

//----------------------------------------

const Coordinate = require("../classes/Coordinate");
const Fleet = require("../classes/Fleet");

const { Random, timeout, msToTime } = require("../utils/utils");
const { PendingXHR } = require("pending-xhr-puppeteer");
const botTelegram = require("../chatbot/Telegram/telegramBot");

async function beginSpies(origin, range, type, bot) {
  try {
    console.log("empezando espionaje");
    var page = await bot.createNewPage(null, 6000);
    var ogameUsername = await bot.getOgameUsername(page);
    //check
    const pendingXHR = new PendingXHR(page);
    let [galaxy, system, planet] = origin.split(":");
    let beginCoords = parseInt(system) - parseInt(range);
    let finalCoords = parseInt(system) + parseInt(range);
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

    await botTelegram.sendTextMessage(
      bot.telegramId,
      `<b>${ogameUsername}</b> terminé de espiar la zona`
    );
    await bot.closePage(page);
    return;
  } catch (error) {
    console.log("se dio un error en espionaje..probablemente el logeo");
    console.log("el error es: ", error);
    await bot.checkLoginStatus(page);
    console.log("terminado el error de expeditions");
    return;
  }
}

module.exports = beginSpies;
