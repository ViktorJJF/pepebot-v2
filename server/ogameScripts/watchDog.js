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
  var page = page || (await bot.createNewPage());
  while (bot.hasAction("watchDog")) {
    try {
      console.log("se encontro la accion watchDog");
      let attacked = await bot.watchDog(page);
      console.log("al fin! estuve esperando prro: ", attacked);
      console.log(attacked);
      if (attacked) {
        var ogameUsername = await bot.getOgameUsername();
        await botTelegram.sendTextMessage(
          bot.telegramGroupId, //bot.telegramGroupId
          "⚠️ <b>" +
            ogameUsername +
            "</b>" +
            " te están atacando ⚠️\nverificando detalles..."
        );
        var attackDetails = await bot.attackDetail(page);
        attackDetails.forEach(async attackDetail => {
          let shipsDetailMsg = "";
          attackDetail.ships.forEach(ship => {
            shipsDetailMsg += "✔️ " + ship.name + " " + ship.qty + "\n";
          });
          await botTelegram.sendTextMessage(
            bot.telegramGroupId,
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
      await timeout(Random(15 * 60 * 1000, 25 * 60 * 1000));
      // await timeout(Random(3000, 6000));
    } catch (error) {
      // console.log("se dio un error en watchdog..probablemente el logeo");
      await bot.checkLoginStatus(page);
      console.log("creando una nueva pagina");
      page = await bot.createNewPage();
    }
  }
  page.close();
}

module.exports = watchDog;
