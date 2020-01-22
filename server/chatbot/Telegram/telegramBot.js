const telegram = require("telegram-bot-api");
const dialogflow = require("../Dialogflow");
const axios = require("../../utils/axios");

var api = new telegram({
  token: "1070317592:AAE3c9b5EexG76uzResutG2_Qd0C9Xm4yWY",
  updates: {
    enabled: true
  }
});

api.setWebhook("https://48791559.ngrok.io/api/webhook");

// sendTextMessage(-339549424, "hola");

api.on("message", async message => {
  let sender = message.chat.id;
  let msg = message.text;
  console.log("se recibio el mensaj1e:", msg, " de: ", sender);
  sendTypingOn(sender); //typing on
  let result = await dialogflow.sendToDialogFlow(sender, msg);
  handleDialogFlowResponse(sender, result);
  // console.log("respuestas recibidas: ", responses);
  // for (const response of responses) {
  //   await sendTextMessage(sender, response);
  // }
});

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
  switch (action) {
    case "checkPlayerActivitiesAction":
      axios
        .get("/api/hunter", {
          params: {
            user_id: sender,
            nickname: parameters.fields.nickname.stringValue
          }
        })
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          console.error(err);
        });
      // handleMessages(messages, sender);
      break;
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
  console.log("se enviara la respuesta: ", text);
  await api.sendMessage({ chat_id: recipientId, text: text });
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

module.exports = { sendTextMessage };
