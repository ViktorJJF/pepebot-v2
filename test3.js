const axios = require("axios");
const cheerio = require("cheerio");
var data = JSON.stringify({
  identity: "rodrigo.diazranilla@gmail.com",
  password: "phoneypeople",
  locale: "es_ES",
  gfLang: "es",
  platformGameId: "1dfd8e7e-6e1a-4eb1-8c64-03c3b62efd2f",
  gameEnvironmentId: "0a31d605-ffaf-43e7-aa02-d06df7116fc8",
  autoGameAccountCreation: false,
});

var config = {
  method: "post",
  url: "https://gameforge.com/api/v1/auth/thin/sessions",
  headers: {
    authority: "gameforge.com",
    "sec-ch-ua":
      '" Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"',
    "content-type": "application/json",
    "tnt-installation-id": "",
    "sec-ch-ua-mobile": "?0",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
    "sec-ch-ua-platform": '"Windows"',
    accept: "*/*",
    origin: "https://lobby.ogame.gameforge.com",
    "sec-fetch-site": "same-site",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty",
    referer: "https://lobby.ogame.gameforge.com/",
    "accept-language": "en,en-US;q=0.9,es-ES;q=0.8,es;q=0.7",
  },
  data: data,
  proxy: {
    host: "217.25.221.60",
    port: 4145,
  },
};

function findTextAndReturnRemainder(target, variable) {
  var chopFront = target.substring(
    target.search(variable) + variable.length,
    target.length
  );
  var result = chopFront.substring(0, chopFront.search(";"));
  return result;
}

axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });
