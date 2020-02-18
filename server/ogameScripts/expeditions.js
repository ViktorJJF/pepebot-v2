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
const watchDog = require("./watchDog.js");

async function beginExpeditions(
  origin,
  ships,
  bot,
  speed = 1,
  expeditionDuration = 1
) {
  const botTelegram = require("../chatbot/Telegram/telegramBot");

  //quitar este watchdog luego
  // bot.addAction("watchDog");
  // watchDog(bot, page); // mientras arreglo el problema de headless no funciona bien
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
    try {
      console.log("empezando nueva expedicion");
      var page = await bot.createNewPage();
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
      var ogameUsername = await bot.getOgameUsername(page);

      if (expeditionsPossible > 0)
        await botTelegram.sendTextMessage(
          bot.telegramId,
          `<b>${ogameUsername}</b> estoy empezando a mandar las expediciones...`
        );

      var expeditionNumber = 1;
      while (expeditionsPossible > 0) {
        let shipsToSend = await sendExpedition();
        let msg = `<b>Expedición nro ${expeditionNumber}\n</b>`;
        shipsToSend.forEach(shipToSend => {
          msg += "✔️<b>" + shipToSend.name + ":</b> " + shipToSend.qty + "\n";
        });
        console.log("mandando expedicion...");
        console.log(
          "las expediciones posibles son: ",
          expeditionsPossible,
          " y se restara -1"
        );
        expeditionsPossible--;
        botTelegram.sendTextMessage(bot.telegramId, msg);
        expeditionNumber++;
        await timeout(Random(10000, 20000));
      }

      // If we didn't found any expedition fleet and didn't create any, let's wait 5min
      if (minSecs == bigNum) {
        minSecs = 5 * 60;
      }
      await botTelegram.sendTextMessage(
        bot.telegramId,
        `<b>${ogameUsername}</b> acabo de completar todas las expediciones ... esperare a que la siguiente expedición vuelva dentro de ${msToTime(
          minSecs + 0.55 * 60 * 1000
        )} `
      );
      console.log(
        `me activare dentro de: <b>${msToTime(minSecs + 5 * 60 * 1000)}</b>`
      );
      page.close();
      await timeout(minSecs + 0.5 * 6 * 1000); // Sleep until one of the expedition fleet come back
    } catch (error) {
      console.log("se dio un error en expeditions..probablemente el logeo");
      console.log("el error es: ", error);
      await bot.checkLoginStatus(page);
    }
  }
}

module.exports = beginExpeditions;
