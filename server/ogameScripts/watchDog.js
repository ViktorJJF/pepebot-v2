const { Random, timeout, msToTime } = require("../utils/utils");
const moment = require("moment");
moment.locale("es");

async function watchDog(bot, page) {
  // await timeout(1 * 60 * 1000);
  const botTelegram = require("../chatbot/Telegram/telegramBot.js");
  botTelegram.sendTextMessage(
    bot.telegramId,
    bot.ogameEmail +
      " empezare a cuidar tu cuenta, para desactivar dime algo como 'pepebot ya no cuides mi cuenta'"
  );
  while (bot.hasAction("watchDog")) {
    try {
      var page = await bot.createNewPage();
      console.log("se encontro la accion watchDog");
      let attacked = await bot.watchDog(page);
      console.log("al fin! estuve esperando prro: ", attacked);
      console.log(attacked);
      if (attacked) {
        var ogameUsername = await bot.getOgameUsername(page);
        await botTelegram.sendTextMessage(
          bot.telegramId, //bot.telegramGroupId
          "⚠️ <b>" +
            ogameUsername +
            "</b>" +
            " te están atacando ⚠️\nverificaré los detalles..."
        );
        var attackDetails = await bot.attackDetail(page);
        console.log("llego esta respuesta: ", attackDetails);
        await botTelegram.sendTextMessage(
          bot.telegramId, //bot.telegramGroupId
          "⚠️ <b>" +
            ogameUsername +
            "</b>" +
            " tienes " +
            attackDetails.normal.length +
            " ataques normales y " +
            attackDetails.sac.length +
            " SACS en tu contra"
        );
        if (attackDetails.normal.length > 0) {
          await botTelegram.sendTextMessage(
            bot.telegramId, //bot.telegramGroupId
            "<b>Detalle de Ataques normales</b>"
          );
          attackDetails.normal.forEach(async attackDetail => {
            let shipsDetailMsg = "";
            attackDetail.ships.forEach(ship => {
              shipsDetailMsg += "✔️ " + ship.name + " " + ship.qty + "\n";
            });
            await botTelegram.sendTextMessage(
              bot.telegramId,
              "<b>Detalles</b>:\n" +
                "✅ Jugador hostil: " +
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
                moment(attackDetail.hostilePlayer.impactHour)
                  .format("DD MMM YYYY hh:mm a")
                  .replace(".", ".") +
                "\n" +
                "🕜 <b>Tiempo restante:</b> " +
                msToTime(attackDetail.hostilePlayer.timeRemaining) +
                "\n" +
                "📝 <b>Detalle de Naves:</b>\n" +
                shipsDetailMsg
            );
          });
        }
        if (attackDetails.sac.length > 0) {
          await timeout(2000);
          await botTelegram.sendTextMessage(
            bot.telegramId, //bot.telegramGroupId
            "<b>Detalle de ataques en SAC</b>\nte mostraré los detalles proximamente jajaj"
          );
        }
      }
      await timeout(Random(15 * 60 * 1000, 25 * 60 * 1000));
      await page.close();
      // await timeout(Random(3000, 6000));
    } catch (error) {
      console.log(
        "se dio un error en watchdog..probablemente el logeo, el error es este: ",
        error
      );
      await bot.checkLoginStatus(page);
      if (page) await page.close();
    }
  }
}

module.exports = watchDog;
