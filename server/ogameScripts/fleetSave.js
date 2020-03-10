const axios = require("../utils/axios");

const Coordinate = require("../classes/Coordinate");
const Fleet = require("../classes/Fleet");
const watchDog = require("./watchDog.js");

const { Random, timeout, msToTime } = require("../utils/utils");

async function beginFleetSave(bot) {
  const botTelegram = require("../chatbot/Telegram/telegramBot");
  var page = await bot.createNewPage();
  let playerId = bot.playerId;
  console.log("el playerId es: ", playerId);
  const res = await axios(
    "https://pepehunter.herokuapp.com/api/players/" + playerId
  );
  let playerInfo = res.data.playerInfo;
  console.log("informacion de planetas: ", playerInfo.planets);
  for (let i = 0; i < playerInfo.planets.length; i++) {
    const planet = playerInfo.planets[i];
    if (planet.planetType === "moon") {
      try {
        if (!page) page = await bot.createNewPage();
        let ogameUsername = await bot.getOgameUsername(page);
        let shipsToSend = await sendFleetSave(planet.coords, page);
        console.log("naves para enviar es: ", shipsToSend);
        if (shipsToSend)
          await botTelegram.sendTextMessage(
            bot.telegramId,
            "<b>" +
              ogameUsername +
              "</b>" +
              " acabo de hacer fleet save en la luna <b>[" +
              planet.coords +
              "]</b>"
          );
        else
          await botTelegram.sendTextMessage(
            bot.telegramId,
            "<b>" +
              ogameUsername +
              "</b>" +
              " ⚠️ no tenías naves en tu luna <b>[" +
              planet.coords +
              "]</b>"
          );
      } catch (error) {
        console.log("se dio un error en fleet save..probablemente el logeo");
        console.log("el error es: ", error);
        await bot.checkLoginStatus(page);
        page = null;
        i--;
      }
    }
  }
  await botTelegram.sendTextMessage(
    bot.telegramId,
    "acabo de completar los fleets en todas tus lunas"
  );
  playerInfo = null;

  //begin watchdog
  let { fleets, slots } = await bot.getFleets(page);
  await bot.closePage(page);
  page = null;
  let bigNum = 999999999;
  let minSecs = bigNum;
  fleets.forEach(fleet => {
    if (fleet.missionType == "6" && fleet.return == "true") {
      minSecs = Math.min(fleet.arrivalTime * 1000 - Date.now(), minSecs);
    }
  });

  await botTelegram.sendTextMessage(
    bot.telegramId,
    `<b>vigilaré tu cuenta</b> cuando tu primer fleet vuelva, dentro de ${msToTime(
      minSecs + 0.2 * 60 * 1000
    )} `
  );
  await timeout(minSecs + 0.1 * 6 * 1000); // Sleep until one of the expedition fleet come back
  if (!bot.hasAction("watchDog")) {
    bot.addAction("watchDog");
    watchDog(bot);
  } else {
    console.log(" no se entro al watchdog");
  }
  return;
}

async function sendFleetSave(origin, page, speed = 1) {
  let [galaxy, system, planet] = origin.split(":");
  let destination = new Coordinate(galaxy, system, 16);
  let fleet = new Fleet();
  console.log("creando nueva pagina");
  console.log("se termino de crear la nueva pagina");
  fleet.setPage(page);
  fleet.setOrigin(origin);
  fleet.setDestination(destination.generateCoords());
  fleet.setSpeed(0.2);
  fleet.setMission("espionage");
  fleet.SetAllResources();
  fleet.SetAllShips();
  return await fleet.sendNow();
}

module.exports = beginFleetSave;
