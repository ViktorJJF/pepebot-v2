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

async function beginExpeditions(
  origin,
  ships,
  bot,
  speed = 1,
  expeditionDuration = 1
) {
  const botTelegram = require("../chatbot/Telegram/telegramBot");
  console.log("empezando a refrescar");
  let page = await bot.createNewPage();
  async function sendExpedition() {
    // if(activateRandomSystem) let randomSystem = Random(minSystem, maxSystem)
    let [galaxy, system, planet] = origin.split(":");
    let destination = new Coordinate(galaxy, system, 16);
    let fleet = new Fleet();
    console.log("creando nueva pagina");
    console.log("se termino de crear la nueva pagina");
    fleet.setPage(page);
    fleet.setOrigin(origin);
    fleet.setDestination(destination.generateCoords());
    fleet.setSpeed(speed);
    fleet.setMission("expedition");
    // Object.entries(ships).forEach(([key, value]) => {
    //   fleet.addShips(key, value);
    // });
    fleet.setDuration(expeditionDuration);
    return await fleet.sendNow();
  }

  while (bot.hasAction("expeditions")) {
    let { fleets, slots } = await bot.getFleets(page);
    let bigNum = 999999999;
    let minSecs = bigNum;
    fleets.forEach(fleet => {
      if (fleet.missionType == "15" && fleet.return == "true") {
        minSecs = Math.min(fleet.arrivalTime * 1000 - Date.now(), minSecs);
      }
    });
    // Sends new expeditions
    let expeditionsPossible = slots.expTotal - slots.expInUse;
    while (expeditionsPossible > 0) {
      await sendExpedition();
      console.log("mandando expedicion...");
      console.log(
        "las expediciones posibles son: ",
        expeditionsPossible,
        " y se restara -1"
      );
      expeditionsPossible--;
      await botTelegram.sendTextMessage(
        bot.telegramId,
        `${bot.ogameEmail} estoy mandando una nueva expedición...`
      );
      await timeout(Random(10000, 20000));
    }

    // If we didn't found any expedition fleet and didn't create any, let's wait 5min
    if (minSecs == bigNum) {
      minSecs = 5 * 60;
    }
    await botTelegram.sendTextMessage(
      bot.telegramId,
      `${
        bot.ogameEmail
      } estoy esperando que regresen las expediciones ... me despertaré dentro de ${msToTime(
        minSecs + 15
      )} `
    );
    console.log("me activare dentro de: ", msToTime(minSecs + 15));
    await timeout(minSecs + 15); // Sleep until one of the expedition fleet come back
  }
}

module.exports = beginExpeditions;
