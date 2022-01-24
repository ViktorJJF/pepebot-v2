const config = require("../config");
const axios = require("axios");
const Logs = require("../models/Logs");

function timeout(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

let timeTomiliseconds = (time) => {
  //7:05:15 3:32:40
  [hrs, min, sec] = time.split(":");
  return (
    (parseInt(hrs) * 60 * 60 + parseInt(min) * 60 + parseInt(sec)) * 1000 * 2
  );
};

let timeTomiliseconds2 = (duration) => {
  //1h:30min 5h 30min
  let matches = duration.match(/\d+/g);
  if (matches === undefined || matches === null) return;
  if (matches.length === 1 && duration.includes("h"))
    return (millisecs = matches[0] * 60 * 60 * 1000);
  if (matches.length === 1 && duration.includes("min"))
    return (millisecs = matches[0] * 60 * 1000);
  return (millisecs = (matches[0] * 60 * 60 + matches[1] * 60) * 1000);
};

let getCloserDurationIndex = (durations, goalDuration) => {
  //all in milliseconds
  if (goalDuration === undefined || goalDuration === null) return;
  let goalIsGreater = durations.every((e) => e < goalDuration);
  let goalIsLess = durations.every((e) => e > goalDuration);
  if (goalIsGreater) return 1;
  if (goalIsLess) return durations.length;
  let closerDuration, index;
  for (var i = durations.length - 1; i >= 0; i--) {
    if (goalDuration < durations[i]) {
      console.log("la siguiente hora es: ", durations[i]);
      console.log("la hora anterior es: ", durations[i + 1]);
      if (durations[i] - goalDuration < goalDuration - durations[i + 1]) {
        closerDuration = durations[i];
        index = i;
      } else {
        closerDuration = durations[i + 1];
        index = i + 1;
      }
      i = -1;
    }
  }
  return index + 1;
};

let msToTime = (duration) => {
  console.log("llego esta duracion: ", duration);
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  return (
    (hours != 1 ? hours + " horas " : hours + " hora ") +
    minutes +
    " minutos " +
    seconds +
    " segundos"
  );
};

function Random(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getFirstNumber(str) {
  return str.match(/\d+/g).length > 0 ? parseInt(str.match(/\d+/g)[0]) : null;
}

/**
 * @Description Esta funcion convierte JSON a objeto, caso contrario retorna null
 */

function isJson(item) {
  item = typeof item !== "string" ? JSON.stringify(item) : item;

  try {
    item = JSON.parse(item);
  } catch (e) {
    return false;
  }

  if (typeof item === "object" && item !== null) {
    return true;
  }
  return false;
}

async function handleError(err) {
  console.log(err);
  try {
    if (isJson(err)) {
      const parsedErr = JSON.parse(err);
      if (parsedErr.code === 400) {
        sendTelegramMessage(config.TELEGRAM_GROUP_ID, parsedErr.message);
        return true; // error conocido
      } else {
        throw new Error();
      }
    } else {
      throw new Error();
    }
  } catch (error) {
    console.log(error);
  }
}

function buildErrObject(code, message) {
  return JSON.stringify({
    code,
    message,
  });
}

async function sendTelegramMessage(senderId, message, isShared) {
  try {
    await axios.post(config.PEPEBOT_BASE + "/telegram/message", {
      senderId,
      message,
      isShared,
    });
  } catch (error) {
    console.log(error);
  }
}

async function sendTelegramMessageBroadcast(message) {
  try {
    await axios.post(config.PEPEBOT_BASE + "/telegram/message/broadcast", {
      message,
    });
  } catch (error) {
    console.log(error);
  }
}

async function getNearestPlanet(bot, coords) {
  let currentPlayer = bot.playerId == "102988" ? "Cosaco" : "Chief Orbiter";
  const playerInfo = (
    await axios(config.PEPEHUNTER_BASE + "/api/players/by-name", {
      params: { name: currentPlayer },
    })
  ).data.payload;
  const planets = playerInfo.planets;
  let selectedCoord = "";
  let possiblePlanets = [];
  let hasSameGalaxy = planets.some(
    (planet) => planet.coords.split(":")[0] === coords.split(":")[0]
  );
  if (hasSameGalaxy) {
    possiblePlanets = planets.filter(
      (planet) => planet.coords.split(":")[0] === coords.split(":")[0]
    );
  } else {
    possiblePlanets = planets.filter(
      (planet) =>
        parseInt(planet.coords.split(":")[0]) - 1 ===
          parseInt(coords.split(":")[0]) ||
        parseInt(planet.coords.split(":")[0]) + 1 ===
          parseInt(coords.split(":")[0])
    );
  }
  selectedCoord = possiblePlanets[Random(0, possiblePlanets.length - 1)].coords;
  console.log(selectedCoord);

  // let finalCoords = parseInt(system) + parseInt(range);
  //go to planet to begin to spy
  return selectedCoord;
}

function log(message, type) {
  const log = new Logs({ message, type });
  log.save();
}

function setCommonHeaders({ Referer, Cookie, contentType } = {}) {
  let headers = {
    Connection: "keep-alive",
    "sec-ch-ua":
      '" Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"',
    Accept: "*/*",
    "X-Requested-With": "XMLHttpRequest",
    "sec-ch-ua-mobile": "?0",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
    "sec-ch-ua-platform": '"Windows"',
    Origin: `https://${config.SERVER}-es.ogame.gameforge.com`,
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Dest": "empty",
    Referer,
    "Accept-Language": "en,en-US;q=0.9,es-ES;q=0.8,es;q=0.7",
    Cookie,
  };
  if (contentType) {
    headers["Content-Type"] = contentType;
  }
  return headers;
}

module.exports = {
  timeout,
  msToTime,
  Random,
  timeTomiliseconds,
  timeTomiliseconds2,
  getCloserDurationIndex,
  getFirstNumber,
  handleError,
  buildErrObject,
  getNearestPlanet,
  sendTelegramMessage,
  log,
  setCommonHeaders,
  sendTelegramMessageBroadcast,
};
