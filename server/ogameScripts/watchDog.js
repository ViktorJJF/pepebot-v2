const {
  Random,
  timeout,
  msToTime,
  sendTelegramMessage,
  log,
} = require("../utils/utils");
const formatISO9075 = require("date-fns/formatISO9075");
const callMeBot = require("../services/callMeBot");

async function watchDog(bot, page) {
  try {
    // await timeout(1 * 60 * 1000);
    sendTelegramMessage(
      bot.telegramId,
      bot.ogameEmail + " empezare a cuidar tu cuenta 🐕",
      true
    );
    while (await bot.hasAction("watchDog")) {
      try {
        let watchDogStatus = await start(page, bot);
        if (watchDogStatus)
          await timeout(Random(0.75 * 60 * 1000, 1 * 60 * 1000));
      } catch (error) {
        console.log(error);
      }
    }
    console.log("se terminó el watchdog");
    return;
  } catch (error) {
    console.log("el error: ", error);
    // algo paso y se salio del bucle sin haber cancelado el watchdog
    callMeBot("@ViktorJJF", "Se desactivo el watchdog por algún  problema");
    sendTelegramMessage(
      bot.telegramId,
      bot.ogameEmail + " tu watchdog se desactivo por algún problema 🚨🐕",
      true
    );
    log(JSON.stringify(error), "Error");
  }
}

async function start(page, bot) {
  try {
    var page = await bot.createNewPage();
    console.log("se encontro la accion watchDog");
    let attacked = await bot.watchDog(page);
    console.log(attacked);
    if (attacked) {
      var ogameUsername = await bot.getOgameUsername(page);
      await sendTelegramMessage(
        bot.telegramId, //bot.telegramGroupId
        "⚠️ <b>" +
          ogameUsername +
          "</b>" +
          " te están atacando ⚠️\nverificaré los detalles..."
      );
      var attackDetails = await bot.attackDetail(page);
      if (attackDetails.normal.length === 0 && attackDetails.sac.length === 0) {
        await sendTelegramMessage(
          bot.telegramId,
          "parece que solo fue un espionaje"
        );
      } else {
        console.log("llego esta respuesta: ", attackDetails);
        callMeBot("@ViktorJJF", "Te estan atacando"); //make telegram phonecall
        callMeBot("@Juancarlosjf", "Te estan atacando"); //make telegram phonecall
        await sendTelegramMessage(
          bot.telegramId, //bot.telegramGroupId
          "⚠️ <b>" +
            ogameUsername +
            "</b>" +
            " tienes " +
            attackDetails.normal.length +
            " ataques normales y " +
            attackDetails.sac.length +
            " SACS en tu contra",
          true
        );
        if (attackDetails.normal.length > 0) {
          await sendTelegramMessage(
            bot.telegramId, //bot.telegramGroupId
            "<b>Detalle de Ataques normales</b>",
            true
          );
          attackDetails.normal.forEach(async (attackDetail) => {
            let shipsDetailMsg = "";
            attackDetail.ships.forEach((ship) => {
              shipsDetailMsg += "✔️ " + ship.name + " " + ship.qty + "\n";
            });
            await sendTelegramMessage(
              bot.telegramId,
              "<b>Detalles</b>:\n" +
                "✅ <b>Jugador hostil:</b> " +
                attackDetail.hostilePlayer.name +
                "\n" +
                "✅ <b>Desde:</b> " +
                attackDetail.hostilePlayer.origin.planetName +
                " (" +
                attackDetail.hostilePlayer.origin.coords +
                ") (" +
                (attackDetail.hostilePlayer.origin.type == "moon"
                  ? "luna"
                  : "planeta") +
                ")\n" +
                "✅ <b>A tu planeta:</b> " +
                attackDetail.hostilePlayer.target.planetName +
                " (" +
                attackDetail.hostilePlayer.target.coords +
                ") (" +
                (attackDetail.hostilePlayer.target.type == "moon"
                  ? "luna"
                  : "planeta") +
                ")\n" +
                "🕜 <b>Hora de impacto:</b> " +
                formatISO9075(attackDetail.hostilePlayer.impactHour) +
                "\n" +
                "🕜 <b>Tiempo restante:</b> " +
                msToTime(attackDetail.hostilePlayer.timeRemaining) +
                "\n" +
                "📝 <b>Detalle de Naves:</b>\n" +
                shipsDetailMsg,
              true
            );
          });
        }
        if (attackDetails.sac.length > 0) {
          await timeout(2000);
          await sendTelegramMessage(
            bot.telegramId, //bot.telegramGroupId
            "<b>Detalle de ataques en SAC</b>\nte mostraré los detalles proximamente !!",
            true
          );
        }
      }
    }
    await bot.closePage(page);
    // await timeout(Random(3000, 6000));
    return true;
  } catch (error) {
    console.log(
      "se dio un error en watchdog..probablemente el logeo, el error es este: ",
      error
    );
    await bot.checkLoginStatus(page);
    return;
  }
}

module.exports = watchDog;
