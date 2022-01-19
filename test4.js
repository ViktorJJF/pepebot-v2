const axios = require("axios");
const cheerio = require("cheerio");
const { setCommonHeaders } = require("./server/utils/utils");

var config = {
  method: "get",
  url: "https://s183-es.ogame.gameforge.com/game/index.php?page=ingame&component=fleetdispatch",
  headers: {
    Connection: "keep-alive",
    "sec-ch-ua":
      '" Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "Upgrade-Insecure-Requests": "1",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-User": "?1",
    "Sec-Fetch-Dest": "document",
    Referer:
      "https://s183-es.ogame.gameforge.com/game/index.php?page=ingame&component=galaxy",
    "Accept-Language": "en,en-US;q=0.9,es-ES;q=0.8,es;q=0.7",
    Cookie:
      "locale=es; maximizeId=null; tabBoxFleets=%7B%2282272%22%3A%5B1%2C1642454851%5D%2C%2282201%22%3A%5B1%2C1642457847%5D%2C%2282203%22%3A%5B1%2C1642457849%5D%2C%2282204%22%3A%5B1%2C1642457851%5D%2C%2282296%22%3A%5B1%2C1642458013%5D%2C%2282298%22%3A%5B1%2C1642458015%5D%2C%2282301%22%3A%5B1%2C1642458017%5D%7D; __auc=0d49033a17e512274d05b6176a1; _ga=GA1.2.2000616038.1642038720; _gid=GA1.2.498502270.1642038720; gf-cookie-consent-4449562312=|7|1; gf-token-production=751ce7db-bc97-4088-afbc-2535ca500b63; pc_idt=AKNsQ7XqgJg8UVGW1a2ACDmTtftcEd2E7eizxGwKXR1j2qdCInBD522VEouUDeIQ8s58EDmkZTEPVeXW-Psx_Kt19R6zeQmOSD98fNYXjlZ7AtUwhnOxFXIwBOhTmok0GSghR4WhWiCF8nzdi_HE6fYyDKJUyN4I5V-F7A; PHPSESSID=cedae169aed2ad1b841f4081fc84793e9a4d2f74; prsess_100545=924d874ccf7fc17ac44160af3640b32f",
  },
};

axios(config)
  .then(function (response) {
    let $ = cheerio.load(response.data);
    var text = $($("script")).text();
    console.log("🚀 Aqui *** -> text", text);
  })
  .catch(function (error) {
    console.log(error);
  });
