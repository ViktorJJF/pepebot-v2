// const { api } = require("../../chatbot/Telegram/telegramBot");
const express = require("express");
const router = express.Router();
const telegramBot = require("../../chatbot/Telegram/telegramBot");
const Bots = require("../../models/Bots");

router.post("/message", async (req, res) => {
  let { message, senderId, isShared } = req.body;
  await telegramBot.sendTextMessage(senderId, message, isShared);
  res.json({
    ok: true,
    message,
  });
});

/**
 * @description Envia mensajes a todos los jugadores, pero en forma privada
 */
router.post("/message/broadcast", async (req, res) => {
  let { message } = req.body;
  const bots = await Bots.find({});
  for (const bot of bots) {
    telegramBot.sendTextMessage(bot.telegramId, message, false);
  }
  res.json({
    ok: true,
    message,
  });
});

module.exports = router;
