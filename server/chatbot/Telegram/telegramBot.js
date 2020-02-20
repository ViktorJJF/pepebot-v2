const telegram = require("telegram-bot-api");
const dialogflow = require("../Dialogflow");
const axios = require("../../utils/axios");
const bots = require("../../classes/Bots.js");
const beginExpeditions = require("../../ogameScripts/expeditions");
const watchDog = require("../../ogameScripts/watchDog");
const { timeout } = require("../../utils/utils.js");

try {
  var api = new telegram({
    token: "1070317592:AAE3c9b5EexG76uzResutG2_Qd0C9Xm4yWY",
    updates: {
      enabled: true
    }
  });

  // api.setWebhook("https://48791559.ngrok.io/api/webhook");
  // sendTextMessage(624818317, "aea");
  // console.log("enviando mensaje de telegram");

  api.on("message", async message => {
    let sender = message.from.id;
    let msg = message.text.replace("/", "");
    console.log("mensaje completo: ", message);
    console.log("se recibio el mensaj1e:", msg, ".");
    console.log("de ", sender);
    sendTypingOn(sender); //typing on
    let result = await dialogflow.sendToDialogFlow(sender, msg);
    handleDialogFlowResponse(sender, result);
    // console.log("respuestas recibidas: ", responses);
    // for (const response of responses) {
    //   await sendTextMessage(sender, response);
    // }
  });
} catch (error) {
  console.log("algo salio mal en telegram...");
  console.log("el error es: ", error);
}

async function handleDialogFlowResponse(sender, response) {
  let responseText = response.fulfillmentMessages.fulfillmentText;
  let messages = response.fulfillmentMessages;
  let action = response.action;
  let contexts = response.outputContexts;
  let parameters = response.parameters;

  if (isDefined(action)) {
    console.log("se mandara a handleDialogFlowAction");
    handleDialogFlowAction(sender, action, messages, contexts, parameters);
  } else if (isDefined(messages)) {
    console.log("se entrara a handleMessages");
    handleMessages(messages, sender);
  } else if (responseText == "" && !isDefined(action)) {
    //dialogflow could not evaluate input.
    sendTextMessage(
      sender,
      "I'm not sure what you want. Can you be more specific? gaa"
    );
  } else if (isDefined(responseText)) {
    console.log("se mandara a sendTextMessage");
    sendTextMessage(sender, responseText);
  }
}

async function handleDialogFlowAction(
  sender,
  action,
  messages,
  contexts,
  parameters
) {
  //select the bot
  let bot = bots.getBotByTelegramId(sender);
  console.log("el id es: ", sender);
  //begin actions
  if (!bot) {
    return sendTextMessage(
      sender,
      "Lo siento pero aun no creaste una instancia mía 😅 debes entrar a mi web"
    );
  }
  switch (action) {
    case "loginOgameBotAction":
      console.log("se entro al action login");
      console.log("los parametros son:", parameters);
      let email = parameters.fields.email.stringValue;
      let password = parameters.fields.password.stringValue;
      if (email && password) {
        axios
          .post("/api/login-bot", { email, password, user_id: sender })
          .then(res => {
            console.log(res);
          })
          .catch(err => {
            console.error(err);
          });
      }
      handleMessages(messages, sender);
      break;
    case "listActionsAction":
      let actions = bot.getActions();
      console.log("las acciones son estas: ", actions);
      if (actions.length > 0) {
        await sendTextMessage(sender, "actualmente estoy haciendo esto");
        let msg = "";
        actions.forEach((action, index) => {
          msg +=
            (action.type == "expeditions"
              ? "✔️ Expediciones automáticas"
              : "✔️ Vigilando cuenta") + "\n";
        });
        sendTextMessage(sender, msg);
      } else {
        sendTextMessage(sender, "estoy de vago sin hacer nada 🤔");
      }
      break;
    case "beginExpeditionsAction":
      console.log("entrando a expediciones...");
      console.log(
        "los parametros son estos: ",
        JSON.stringify(parameters.fields)
      );
      if (parameters.fields.cooords.stringValue) {
        var coords = parameters.fields.cooords.stringValue;
      }
      if (coords) {
        sendTextMessage(
          sender,
          "Ok, empezare a hacer expediciones en tu luna de " + coords
        );
        var ships = [
          { id: 1, qty: 5 },
          { id: 9, qty: 10 }
        ];
        // var coords = "9:999:9";
        if (!bot.hasAction("expeditions")) {
          bot.addAction("expeditions");
          beginExpeditions(coords, ships, bot);
        }
      }
      handleMessages(messages, sender);
      break;
    case "stopExpeditionsAction":
      sendTextMessage(sender, "Ok, dejare de hacer expediciones");
      var state = bot.stopAction("expeditions");
      if (state) {
        await sendTextMessage(sender, "expediciones desactivadas con éxito...");
      } else {
        await sendTextMessage(
          sender,
          "algo salió mal y no pude detener las expediciones..."
        );
      }
      break;
    case "beginWatchDogAction":
      sendTextMessage(sender, "Ok, empezare a vigilar tu cuenta");
      if (!bot.hasAction("watchDog")) {
        console.log("se entro al watchdog de telegram");
        bot.addAction("watchDog");
        watchDog(bot);
      } else {
        console.log(" no se entro al watchdog");
      }
      break;
    case "checkPlayerActivitiesAction":
      console.log("llego este parametro: ", JSON.stringify(parameters.fields));
      if (parameters.fields.player.stringValue) {
        var player = parameters.fields.player.stringValue;
        await timeout(1000);
        sendTextMessage(
          sender,
          "Empezando a escanear a <b>" + player + "</b>..."
        );
      }
      if (player) {
        console.log("se entro al scan");
        bot.addAction("watchDog");
        axios
          .get("https://pepehunter.herokuapp.com/api/scan?nickname=" + player)
          .then(res => {
            let playerInfo = res.data.playerInfo;
            if (!playerInfo.hasOwnProperty("planets"))
              return sendTextMessage(sender, "Ese jugador no existe");
            let msg = `<b>Información de ${playerInfo.nickname}</b>\n`;
            playerInfo.planets.forEach((planet, idx) => {
              msg +=
                "<b>" +
                planet.name +
                "</b> " +
                "(" +
                planet.coords +
                ")" +
                (planet.planetType == "planet"
                  ? idx == 0
                    ? "(planeta principal)"
                    : "(planeta)"
                  : "(luna)") +
                ": " +
                planet.activities[0].lastActivity +
                "\n";
            });
            sendTextMessage(sender, msg);
          })
          .catch(err => {
            console.log("algo salio mal...");
            console.error(err);
          });
      }
      handleMessages(messages, sender);
      break;
    case "stopWatchDogAction":
      await sendTextMessage(sender, "Ok, entonces entrarás a la cuenta 😆");
      var state = bot.stopAction("watchDog");
      if (state) {
        await sendTextMessage(sender, "watchDog desactivado con éxito...");
      } else {
        await sendTextMessage(sender, "algo salió mal y no pude detenerme...");
      }
      break;
    default:
      //unhandled action, just send back the text
      console.log(
        "se mandara el mensaje por defecto de handleDialogFlowAction"
      );
      handleMessages(messages, sender);
  }
}

function handleMessages(messages, sender) {
  let timeoutInterval = 1100;
  let previousType;
  let cardTypes = [];
  let timeout = 0;
  for (var i = 0; i < messages.length; i++) {
    if (
      previousType == "card" &&
      (messages[i].message != "card" || i == messages.length - 1)
    ) {
      timeout = (i - 1) * timeoutInterval;
      setTimeout(handleCardMessages.bind(null, cardTypes, sender), timeout);
      cardTypes = [];
      timeout = i * timeoutInterval;
      setTimeout(handleMessage.bind(null, messages[i], sender), timeout);
    } else if (messages[i].message == "card" && i == messages.length - 1) {
      cardTypes.push(messages[i]);
      timeout = (i - 1) * timeoutInterval;
      setTimeout(handleCardMessages.bind(null, cardTypes, sender), timeout);
      cardTypes = [];
    } else if (messages[i].message == "card") {
      cardTypes.push(messages[i]);
    } else {
      timeout = i * timeoutInterval;
      setTimeout(handleMessage.bind(null, messages[i], sender), timeout);
    }
    previousType = messages[i].message;
  }
}

async function handleMessage(message, sender) {
  console.log("se entro a handleMessage");
  console.log("mensaje: ", message);
  console.log("switch: ", message.message);
  console.log("texto: ", message.text);
  switch (message.message) {
    case "text": //text
      for (const text of message.text.text) {
        if (text !== "") {
          await sendTextMessage(sender, text);
        }
      }
      break;
    case "quickReplies": //quick replies
      let replies = [];
      message.quickReplies.quickReplies.forEach(text => {
        let reply = {
          content_type: "text",
          title: text,
          payload: text
        };
        replies.push(reply);
      });
      sendQuickReply(sender, message.quickReplies.title, replies);
      break;
    case "image": //image
      sendImageMessage(sender, message.image.imageUri);
      break;
    case "payload":
      let desestructPayload = structProtoToJson(message.payload);
      var messageData = {
        recipient: {
          id: sender
        },
        message: desestructPayload.facebook
      };
      callSendAPI(messageData);
      break;
  }
}

function setSessionAndUser(senderID, callback) {
  if (!usersMap.has(senderID)) {
    console.log("empezando la segunda condicion");
    usersMap.set(senderID, uuid.v1());
    userService.addUser((err, user) => {
      if (err) {
        console.log("algo salio mal agregando al usuario..", err);
      } else {
        usersMap.set(senderID, user);
        console.log("se termino de resolver el add user");
        callback(true);
      }
    }, senderID);
  }
}

function handleMessageAttachments(messageAttachments, senderID) {
  //for now just reply
  sendTextMessage(senderID, "Attachment received. Thank you.");
}

function handleQuickReply(senderID, quickReply, messageId) {
  var quickReplyPayload = quickReply.payload;
  console.log(
    "Quick reply for message %s with payload %s",
    messageId,
    quickReplyPayload
  );
  //send payload to api.ai
  sendToDialogFlow(senderID, quickReplyPayload);
}

async function sendTextMessage(recipientId, text) {
  console.log("llego este recipient: ", recipientId);
  let bot = bots.getBotByTelegramId(recipientId); //bot.telegramGroupId
  console.log("se enviara la respuesta: ", text);
  await api.sendMessage({
    chat_id: bot.telegramGroupId,
    text: text,
    parse_mode: "html"
  });
}

function sendImageMessage(recipientId, imageUrl) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: imageUrl
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendGifMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: config.SERVER_URL + "/assets/instagram_logo.gif"
        }
      }
    }
  };

  callSendAPI(messageData);
}
function sendAudioMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "audio",
        payload: {
          url: config.SERVER_URL + "/assets/sample.mp3"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a video using the Send API.
 * example videoName: "/assets/allofus480.mov"
 */
function sendVideoMessage(recipientId, videoName) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "video",
        payload: {
          url: config.SERVER_URL + videoName
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendFileMessage(recipientId, fileName) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "file",
        payload: {
          url: config.SERVER_URL + fileName
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a button message using the Send API.
 *
 */
function sendButtonMessage(recipientId, text, buttons) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: text,
          buttons: buttons
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendGenericMessage(recipientId, elements) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: elements
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendQuickReply(recipientId, text, replies, metadata) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: text,
      metadata: isDefined(metadata) ? metadata : "",
      quick_replies: replies
    }
  };

  callSendAPI(messageData);
}

function sendTypingOn(recipientId) {
  api.sendChatAction({ chat_id: recipientId, action: "typing" });
}

function isDefined(obj) {
  if (typeof obj == "undefined") {
    return false;
  }

  if (!obj) {
    return false;
  }
  if (obj == "") {
    return false;
  }
  return obj != null;
}

module.exports = { sendTextMessage, api };
