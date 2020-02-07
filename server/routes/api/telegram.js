// const { api } = require("../../chatbot/Telegram/telegramBot");
const express = require("express");
const app = express();
const config = require("../../config");

// We are receiving updates at the route below!
app.post(`${config.SERVER_URL}/webhook`, (req, res) => {
  // api.processUpdate(req.body);
  // res.sendStatus(200);
});

module.exports = app;
