// const { api } = require("../../chatbot/Telegram/telegramBot");
const express = require("express");
const router = express.Router();
const telegramBot = require("../../chatbot/Telegram/telegramBot");

router.post("/message", (req, res) => {
  let { message, senderId, isShared } = req.body;
  await telegramBot.sendTextMessage(senderId, message, isShared);
  res.json({
    ok: true,
    message,
  });
});

module.exports = router;
