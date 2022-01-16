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
  sendTelegramMessage,
} = require("../utils/utils");

async function beginExpeditions(
  origin,
  ships,
  bot,
  speed = 1,
  expeditionDuration = 1
) {
  while (await bot.hasAction("expeditions")) {
    try {
      let minSecs = await start(bot, origin, ships, speed);
      if (minSecs) await timeout(minSecs + 0.1 * 6 * 1000);
      // Sleep until one of the expedition fleet come back
      console.log("empezando nueva vuelta...");
    } catch (error) {
      console.log("expeditions error 2", error);
    }
  }
  return;
}

async function start(bot, origin, ships, speed) {
  try {
    console.log("empezando nueva expedicion");
    var page = await bot.createNewPage();
    let cookies = bot.getFormattedCookies(); // es necesario para solicitudes
    let { fleets, slots } = await bot.getFleets(page);
    console.log("🚀 Aqui *** -> slots", slots);
    console.log("🚀 Aqui *** -> fleets", fleets);
    let bigNum = 999999999;
    let minSecs = bigNum;
    fleets.forEach((fleet) => {
      if (fleet.missionType == "15" && fleet.return == "true") {
        minSecs = Math.min(fleet.arrivalTime * 1000 - Date.now(), minSecs);
      }
    });
    // Sends new expeditions
    let expeditionsPossible = slots.expTotal - slots.expInUse;
    var ogameUsername = await bot.getOgameUsername(page);
    if (expeditionsPossible > 0)
      await sendTelegramMessage(
        bot.telegramId,
        `<b>${ogameUsername}</b> estoy mandando expediciones...`,
        true
      );
    var expeditionNumber = 1;
    while (expeditionsPossible > 0 && (await bot.hasAction("expeditions"))) {
      let shipsToSend = await sendExpedition({
        origin,
        ships,
        page,
        speed,
        cookies,
      });
      let msg = `<b>Expedición nro ${expeditionNumber}\n</b>`;
      shipsToSend.forEach((shipToSend) => {
        msg += "✅<b>" + shipToSend.name + ":</b> " + shipToSend.qty + "\n";
      });
      console.log("mandando expedicion...");
      console.log(
        "las expediciones posibles son: ",
        expeditionsPossible,
        " y se restara -1"
      );
      expeditionsPossible--;
      sendTelegramMessage(bot.telegramId, msg, true);
      expeditionNumber++;
      await timeout(Random(1000, 3000));
    }
    // If we didn't found any expedition fleet and didn't create any, let's wait 5min
    if (minSecs == bigNum) {
      minSecs = 6 * 1000;
    }
    await sendTelegramMessage(
      bot.telegramId,
      `<b>${ogameUsername}</b> acabo de completar todas las expediciones ... esperare a que la siguiente expedición vuelva dentro de ${msToTime(
        minSecs
      )} `,
      true
    );
    await bot.closePage(page);
    bot.closeSession(); //closing session
    return minSecs;
  } catch (error) {
    console.log("se dio un error en expeditions..probablemente el logeo");
    console.log("el error es: ", error);
    let newPage = await bot.createNewPage();
    await bot.checkLoginStatus(newPage);
    console.log("terminado el error de expeditions");
    return;
  }
}

async function sendExpedition({ origin, ships, page, speed, cookies } = {}) {
  // if(activateRandomSystem) let randomSystem = Random(minSystem, maxSystem)
  let [galaxy, system, planet] = origin.split(":");
  let destination = new Coordinate(galaxy, system, 16);
  let fleet = new Fleet();
  console.log("creando nueva pagina");
  console.log("se termino de crear la nueva pagina");
  fleet.setCookies(cookies);
  fleet.setPage(page);
  fleet.setOrigin(origin);
  fleet.setDestination(destination.generateCoords());
  fleet.setSpeed(speed);
  fleet.setType("moon");
  fleet.setMission("expedition");
  return await fleet.sendNow();
}

module.exports = beginExpeditions;
