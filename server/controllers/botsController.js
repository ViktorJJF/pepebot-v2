const Bot = require("../models/Bots.js");
const Botclass = require("../classes/Bot");
const bots = require("../classes/Bots.js");
const config = require("../config.js");
const dateTools = require("../tools/dateTools.js");
const ogameApi = require("../services/ogameApi");
const botTelegram = require("../chatbot/Telegram/telegramBot.js");
const { msToTime } = require("../utils/utils");
const moment = require("moment");
moment.locale("es");
const list = (req, res) => {
  Bot.find().exec((err, payload) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      });
    }
    res.json({
      ok: true,
      payload
    });
  });
};
const listByUser = (req, res) => {
  Bot.find({ userId: req.query.userId }).exec((err, payload) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      });
    }
    res.json({
      ok: true,
      payload
    });
  });
};
const getOne = (req, res) => {
  Bot.find({ _id: req.params.id }).exec((err, payload) => {
    if (err) {
      return res.status(400).json({
        ok: "false",
        err
      });
    }
    res.json({
      ok: true,
      payload
    });
  });
};
const create = async (req, res) => {
  let body = req.body;
  let bot = new Bot({
    server: body.server,
    language: body.language,
    telegramGroupId: body.telegramGroupId,
    telegramId: body.telegramId,
    ogameEmail: body.ogameEmail,
    ogamePassword: body.ogamePassword,
    state: body.state,
    userId: body.userId
  });
  console.log("se creara el bot con la siguiente info:", bot);

  bot.save((err, payload) => {
    if (err) {
      if (err.name === "MongoError" && err.code === 11000) {
        return res.status(400).json({
          ok: false,
          message: "El bot ya estaba registrado",
          err
        });
      }
      return res.status(400).json({
        ok: false,
        message: "Algo salió mal",
        err
      });
    }
    //adding bot to local class
    let botInstance = new Botclass();
    botInstance.initialize(payload);
    bots.addBot(botInstance);
    res.json({
      ok: true,
      message: "Bot creado con éxito",
      payload
    });
  });
};
const update = async (req, res) => {
  let id = req.params.id;
  let body = req.body;
  Bot.findByIdAndUpdate(
    id,
    {
      server: body.server,
      language: body.language,
      telegramId: body.telegramId,
      telegramGroupId: body.telegramGroupId,
      ogameEmail: body.ogameEmail,
      ogamePassword: body.ogamePassword,
      state: body.state,
      userId: req.user._id
    },
    {
      new: true
    },
    (err, payload) => {
      if (err) {
        if (err.name === "MongoError" && err.code === 11000) {
          return res.status(400).json({
            ok: false,
            message: "El bot estaba registrado",
            err
          });
        }
        return res.status(400).json({
          ok: false,
          message: "Algo salió mal",
          err
        });
      }
      res.json({
        ok: true,
        message: "Bot actualizado con éxito",
        payload
      });
      //updating bot instance
      let bot = bots.getBot(String(payload._id), "update");
      console.log("bot encontrado es: ", bot);
      bot.initialize(payload);
    }
  );
};
const deletes = (req, res) => {
  let botId = req.params.id;
  Bot.findByIdAndRemove({ _id: botId }, (err, payload) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        message: "Algo salió mal",
        err
      });
    }
    res.json({
      ok: true,
      message: "Bot eliminado con éxito",
      payload
    });
    //delete bot instance
    console.log("antes las instancias del bot eran:", bots);
    bots.deleteBot(botId);
    console.log("ahora las instancias del bot es: ", bots);
  });
};

const stop = async (req, res) => {
  let botId = req.params.id;
  let bot = bots.getBot(botId);
  console.log("el bot encontrado: ", bot);

  Bot.findByIdAndUpdate(
    { _id: botId },
    {
      state: false
    },
    {
      new: true
    },
    (err, payload) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          message: "Algo salió mal",
          err
        });
      }
      res.json({ ok: true, msg: "Bot detenido con éxito" });
      bot.stop();
    }
  );
};

const begin = async (req, res) => {
  let ogameEmail = req.query.ogameEmail;
  let ogamePassword = req.query.ogamePassword;
  let botId = req.params.id;
  let user_id = -339549424;
  console.log("se pasara este id para buscar:", botId);
  console.log("bots contiene: ", bots);
  var bot = bots.getBot(botId);
  await bot.begin();
  await bot.login(ogameEmail, ogamePassword);
  res.json({ ok: true, msg: "Bot iniciado con éxito" });
  // telegramBot.sendTextMessage(user_id, "Sesión iniciada con éxito!");
};

const actions = async (req, res) => {
  let action = req.body.action;
  let botId = req.params.id;
  switch (action) {
    case "scan":
      console.log("ejecutando scan");
      let username = req.body.payload.username;
      var bot = bots.getBot(botId);
      if (!bot)
        return res.json({
          ok: false,
          msg: "Hay un bot creado con ese id de usuario"
        });
      try {
        let playerInfo = await ogameApi.getPlayerInfo(username); //return object
        for (const [index, planet] of playerInfo.planets.entries()) {
          let activity = await bot.checkPlanetActivity(
            planet.coords,
            planet.type
          );
          console.log(activity);
        }
        res.json({ ok: true, msg: "accion terminada" });
      } catch (error) {
        console.log(error);
        res.json({ ok: false, msg: "el jugador no existe" });
      }
      break;
    case "watchDog":
      console.log("ejecutando watchDog");
      let milliseconds = req.body.payload.milliseconds;
      var bot = bots.getBot(botId);
      if (!bot)
        return res.json({
          ok: false,
          msg: "No hay un bot creado con ese id"
        });
      //first ejecution
      await watchdogAction(bot);
      let action = setInterval(async () => {
        await watchdogAction(bot);
      }, milliseconds);
      //stack action
      let actionId = bot.addAction(action, "watchDog", milliseconds);
      res.json({ ok: true, msg: "Empezando watchdog...", actionId });
      console.log("ahora las acciones del bot son: ", bot.actions);
      break;
    default:
      break;
  }
};

const stopAction = async (req, res) => {
  let botId = req.params.id;
  let actionId = req.params.actionid;
  let bot = bots.getBot(botId);
  let state = bot.stopAction(actionId);
  if (state) {
    res.json({ ok: true, msg: "Acción detenida con éxito" });
  }
  console.log("llegaron estos id: ", botId, actionId);
};

const listActions = async (req, res) => {
  let botId = req.params.id;
  let bot = bots.getBot(botId);
  let actions = bot.getActions();
  res.json({ ok: true, actions });
};

const testOgameLogin = async (req, res) => {
  let ogameEmail = req.body.ogameEmail;
  let ogamePassword = req.body.password;
  let bot = new Botclass();
  await bot.begin();
  let loginStatus = await bot.login(ogameEmail, ogamePassword);
  if (loginStatus)
    res.json({
      ok: true,
      msg: "Sesión en ogame iniciada correctamente",
      payload: { loginStatus }
    });
  else
    res
      .status(400)
      .json({ ok: false, msg: "Datos de inicio de sesión incorrectos" });
  return await bot.stop();
};

module.exports = {
  list,
  listByUser,
  getOne,
  create,
  update,
  deletes,
  begin,
  actions,
  stop,
  stopAction,
  listActions,
  testOgameLogin
};

//action functions
async function watchdogAction(bot) {
  let attacked = await bot.watchDog();
  console.log("al fin! estuve esperando prro: ", attacked);
  console.log(attacked);
  if (attacked) {
    var ogameUsername = await bot.getOgameUsername();
    await botTelegram.sendTextMessage(
      bot.telegramId,
      "⚠️ <b>" +
        ogameUsername +
        "</b>" +
        " te están atacando ⚠️\nverificando detalles..."
    );
    var attackDetails = await bot.attackDetail();
    attackDetails.forEach(async attackDetail => {
      let shipsDetailMsg = "";
      attackDetail.ships.forEach(ship => {
        shipsDetailMsg += "✔️ " + ship.name + " " + ship.qty + "\n";
      });
      await botTelegram.sendTextMessage(
        bot.telegramId,
        "<b>Detalles</b>:\n" +
          "✅ *Jugador hostil:* " +
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
}
