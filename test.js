let token = "d8b7bc6a46ab723061761aa1948c6079";

function spyCoords(coords) {
  const [galaxy, system, position] = coords.split(":");
  var raw = `mission=6&galaxy=${galaxy}&system=${system}&position=${position}&type=1&shipCount=25&token=${token}`;

  var myHeaders = new Headers();
  myHeaders.append("Connection", "keep-alive");
  myHeaders.append(
    "sec-ch-ua",
    '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"'
  );
  myHeaders.append("Accept", "application/json, text/javascript, */*; q=0.01");
  myHeaders.append(
    "Content-Type",
    "application/x-www-form-urlencoded; charset=UTF-8"
  );
  myHeaders.append("X-Requested-With", "XMLHttpRequest");
  myHeaders.append("sec-ch-ua-mobile", "?0");
  myHeaders.append(
    "User-Agent",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36"
  );
  myHeaders.append("sec-ch-ua-platform", '"Windows"');
  myHeaders.append("Origin", "https://s183-es.ogame.gameforge.com");
  myHeaders.append("Sec-Fetch-Site", "same-origin");
  myHeaders.append("Sec-Fetch-Mode", "cors");
  myHeaders.append("Sec-Fetch-Dest", "empty");
  myHeaders.append(
    "Referer",
    "https://s183-es.ogame.gameforge.com/game/index.php?page=ingame&component=galaxy"
  );
  myHeaders.append("Accept-Language", "en,en-US;q=0.9,es-ES;q=0.8,es;q=0.7");

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch(
    "https://s183-es.ogame.gameforge.com/game/index.php?page=ingame&component=fleetdispatch&action=miniFleet&ajax=1&asJson=1",
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => {
      console.log("el resultado: ", console.log(result));
      token = JSON.parse(result).newToken;
      fetch(
        "https://s183-es.ogame.gameforge.com/game/index.php?page=componentOnly&component=eventList&action=fetchEventBox&ajax=1&asJson=1",
        {
          headers: {
            accept: "text/plain, */*; q=0.01",
            "accept-language": "en,en-US;q=0.9,es-ES;q=0.8,es;q=0.7",
            "sec-ch-ua":
              '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
          },
          referrer:
            "https://s183-es.ogame.gameforge.com/game/index.php?page=ingame&component=galaxy",
          referrerPolicy: "strict-origin-when-cross-origin",
          body: null,
          method: "GET",
          mode: "cors",
          credentials: "include",
        }
      );
    })
    .catch((error) => console.log("El error", error));
}

// expeditions

(async () => {
  function timeout(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  function Random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  let token = "";
  let numberExpeditions = parseInt(
    document
      .querySelector("#slots>.fleft:nth-child(2)>span")
      .innerText.match(/([^\/]+$)/)[0]
  );
  let qtyNGC = parseInt(
    document
      .querySelector("span.transporterLarge>span")
      .getAttribute("data-value")
  );
  let qtyNGCtoSend = parseInt(qtyNGC / numberExpeditions);
  let coords = "1:108:8";
  let [galaxy, system, position] = coords.split(":");
  let success = true;
  while (success) {
    var myHeaders = new Headers();
    myHeaders.append("Connection", "keep-alive");
    myHeaders.append(
      "sec-ch-ua",
      '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"'
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
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36"
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

    var raw = `token=${token}&am203=${qtyNGCtoSend}&am210=1&am219=1&galaxy=${galaxy}&system=${system}&position=16&type=1&metal=0&crystal=0&deuterium=0&prioMetal=1&prioCrystal=2&prioDeuterium=3&mission=15&speed=10&retreatAfterDefenderRetreat=0&union=0&holdingtime=1`;

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        "https://s183-es.ogame.gameforge.com/game/index.php?page=ingame&component=fleetdispatch&action=sendFleet&ajax=1&asJson=1",
        requestOptions
      );
      let data = await response.json();
      token = data.token;
      if (
        !data.success &&
        !data.errors.find((error) =>
          error.message.includes(
            "Error de partida de flota: no se ha podido enviar la flota"
          )
        )
      ) {
        console.log("algo salio mal: ", data.errors);
        success = false;
      }
    } catch (error) {
      console.log("err: ", error);
    }
    console.log("FLOTA ENVIADA!!");
    await timeout(Random(2, 5) * 1000);
  }
  console.log("FIN - ENVIE TODAS LAS EXPEDICIONES");
})();
