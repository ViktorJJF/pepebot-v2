// const { api } = require("../../chatbot/Telegram/telegramBot");
const express = require("express");
const app = express();
const config = require("../../config");
const telegramBot = require("../../chatbot/Telegram/telegramBot");

// We are receiving updates at the route below!
app.post(`${config.SERVER_URL}/webhook`, (req, res) => {
  // api.processUpdate(req.body);
  // res.sendStatus(200);
});

app.post("/api/telegram/message", (req, res) => {
  let { message, senderId } = req.body;
  telegramBot.sendTextMessage(senderId || config.TELEGRAM_GROUP_ID, message);
  res.json({
    ok: true,
    message,
  });
});

app.post("/api/telegram/v1/message", (req, res) => {
  let { message, senderId } = req.body;
  telegramBot.sendTextMessagePersonal(senderId, message);
  res.json({
    ok: true,
    message,
  });
});

module.exports = app;
