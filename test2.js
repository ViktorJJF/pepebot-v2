const token = "def6fe74e5b59d6e2944056348b382c3";
var myHeaders = new Headers();
myHeaders.append("Connection", "keep-alive");
myHeaders.append(
  "sec-ch-ua",
  '" Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"'
);
myHeaders.append("Accept", "*/*");
myHeaders.append(
  "Content-Type",
  "application/x-www-form-urlencoded; charset=UTF-8"
);
myHeaders.append("X-Requested-With", "XMLHttpRequest");
myHeaders.append("sec-ch-ua-mobile", "?0");
myHeaders.append(
  "User-Agent",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36"
);
myHeaders.append("sec-ch-ua-platform", '"Windows"');
myHeaders.append("Origin", "https://s183-es.ogame.gameforge.com");
myHeaders.append("Sec-Fetch-Site", "same-origin");
myHeaders.append("Sec-Fetch-Mode", "cors");
myHeaders.append("Sec-Fetch-Dest", "empty");
myHeaders.append(
  "Referer",
  "https://s183-es.ogame.gameforge.com/game/index.php?page=ingame&component=fleetdispatch"
);
myHeaders.append("Accept-Language", "en,en-US;q=0.9,es-ES;q=0.8,es;q=0.7");
myHeaders.append(
  "Cookie",
  "locale=es; maximizeId=null; tabBoxFleets=%7B%2249719%22%3A%5B1%2C1642373283%5D%2C%2249721%22%3A%5B1%2C1642373285%5D%2C%2249722%22%3A%5B1%2C1642373288%5D%2C%2249724%22%3A%5B1%2C1642373292%5D%2C%2249725%22%3A%5B1%2C1642373295%5D%2C%2249729%22%3A%5B1%2C1642373297%5D%2C%2251020%22%3A%5B1%2C1642376917%5D%2C%2251254%22%3A%5B1%2C1642373025%5D%7D; __auc=0d49033a17e512274d05b6176a1; _ga=GA1.2.2000616038.1642038720; _gid=GA1.2.498502270.1642038720; gf-cookie-consent-4449562312=|7|1; gf-token-production=24e627bf-42ce-432a-a755-085dcd48f360; pc_idt=AEQ1sTUokrb4Bpt1jCkCodRPJK_2Gbf8BxiK9hJ6NUziSUolYQSaF6ELPzlRtx5Igr2iTt2k_yOfaW5ZcDUb1b4R0J9vrBkO_UoVY534sAJlrNDEglix1w75Pvn_2GBw9olTqIAseiFNqeJ510RWe-l2MaPqJHUWn_4z3g; __asc=5d18bc4217e65073c65e720f2cb; PHPSESSID=74eeb32ad40da6197da7e32b62f7135652f29de5; prsess_100545=d42d98e3a0667bcf70caa213b6b22e40; prsess_100545=8401774322bf39360c5a9b54b57361a8"
);

var raw = `token=${token}&am210=1&galaxy=3&system=382&position=12&type=1&metal=0&crystal=0&deuterium=0&prioMetal=1&prioCrystal=2&prioDeuterium=3&mission=4&speed=10&retreatAfterDefenderRetreat=0&union=0&holdingtime=0`;

var requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow",
};

fetch(
  "https://s183-es.ogame.gameforge.com/game/index.php?page=ingame&component=fleetdispatch&action=sendFleet&ajax=1&asJson=1",
  requestOptions
)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.log("error", error));
