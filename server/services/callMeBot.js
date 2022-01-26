const axios = require("axios");

let callMebot = (telegramUsername, msg) => {
  console.log("🚀 MOTIVO DE LLAMADA: ", msg);
  // let telegramUsername = "@ViktorJJF";
  // let telegramUsername = "@Juancarlosjf";
  let url = `http://api.callmebot.com/start.php?source=web&user=${telegramUsername}&text=${encodeURI(
    msg
  )}&lang=es-ES-Standard-A`;
  axios
    .get(url)
    .then((res) => {
      console.log(
        `LLamada de telegram realizada con exito a ${telegramUsername}`
      );
    })
    .catch((err) => {
      console.error("Algo salio mal con la llamada de telegram: ", err);
    });
};

// callMebot(undefined, "Error en logeo");

module.exports = callMebot;
