let token = "";

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

async function getPlayerPlanets(nickname) {
  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  let response = await fetch(
    `https://pepehunter-v2.herokuapp.com/api/planets?playerName=${nickname}`,
    requestOptions
  );
  let data = await response.json();
  return data.payload;
}

async function spyCoords(coords, type = "planet") {
  try {
    const [galaxy, system, position] = coords.split(":");

    var myHeaders = new Headers();
    myHeaders.append("Connection", "keep-alive");
    myHeaders.append(
      "sec-ch-ua",
      '" Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"'
    );
    myHeaders.append(
      "Accept",
      "application/json, text/javascript, */*; q=0.01"
    );
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
      "https://s183-es.ogame.gameforge.com/game/index.php?page=ingame&component=galaxy"
    );
    myHeaders.append("Accept-Language", "en,en-US;q=0.9,es-ES;q=0.8,es;q=0.7");

    var raw = `mission=6&galaxy=${galaxy}&system=${system}&position=${position}&type=${
      type === "planet" ? "1" : "3"
    }&shipCount=10&token=${token}`;

    var requestOptions = {
      method: "POST",
      body: raw,
      headers: myHeaders,
      redirect: "follow",
    };

    let response = await fetch(
      "https://s183-es.ogame.gameforge.com/game/index.php?page=ingame&component=fleetdispatch&action=miniFleet&ajax=1&asJson=1",
      requestOptions
    );
    let data = await response.json();
    token = data.newToken;
    if (!data.response.success) {
      if (
        data.response.message === "Se ha alcanzado el número máximo de flotas"
      ) {
        // esperar un tiempo
        await timeout(Random(6, 12) * 1000);
        throw new Error("Alcanzado número máximo flotas");
      }
      if (data.response.message.includes("no hay naves disponibles")) {
        // esperar un tiempo
        throw new Error("No hay naves disponibles");
      }
      throw new Error("Cookie vencida");
    }
    // successOgameMessage();
  } catch (error) {
    console.log("err: ", error);
    await timeout(Random(6, 12) * 1000);
    console.log("HACIENDO SOLICITUD DE NUEVO");
    await spyCoords(coords);
  }
}

async function spyPlayerPlanets(nickname) {
  let planets = await getPlayerPlanets(nickname);
  let galaxiesToExclude = [1];
  for (const planet of planets) {
    if (!galaxiesToExclude.includes(planet.galaxy) || planet.coords) {
      // await spyCoords(planet.coords, "planet");
      // console.log("SONDA ENVIADA A: ", planet.coords);
      await timeout(Random(1, 2) * 1000);
      if (planet.moon) {
        console.log("SONDA ENVIADA A LUNA: ", planet.coords);
        await spyCoords(planet.coords, "moon");
      }
      await timeout(Random(2, 3) * 1000);
    }
  }
  console.log("TERMINADO!");
}

async function scanPlayer(nickname) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  var urlencoded = new URLSearchParams();
  urlencoded.append("nickname", nickname);

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  let response = await fetch(
    "https://pepehunter-v2.herokuapp.com/api/actions/scan-player",
    requestOptions
  );
  let data = await response.json();
  console.log("🚀 Aqui *** -> data", data);
  return data.payload;
}

async function getPlayers() {
  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  let response = await fetch(
    "https://pepehunter-v2.herokuapp.com/api/players?sort=rankMilitary&order=1",
    requestOptions
  );
  let data = await response.json();
  console.log("🚀 Aqui *** -> data", data);
  return data.payload;
}

async function spyOffsBetweenMilitaryRank(from, to) {
  let prePlayers = await getPlayers();
  let players = prePlayers.filter(
    (prePlayer) =>
      prePlayer.rankMilitary >= from &&
      prePlayer.rankMilitary <= to &&
      prePlayer.state !== "vacation"
  );
  for (let i = 0; i < players.length; i++) {
    try {
      let scanResult = await scanPlayer(players[i].name);
      let activities = scanResult.activities;
      let isOff = activities.every(
        (activity) => activity.lastActivity !== "on"
      );
      let isTotalOff = activities.every(
        (activity) => activity.lastActivity === "off"
      );
      if (isOff) {
        if (isTotalOff) {
          console.log("TOTALMENTE OFF: ", players[i].name, players[i].rank);
        } else {
          console.log("OFF: ", players[i].name, players[i].rank);
        }
        await spyPlayerPlanets(players[i].name);
      }
    } catch (error) {
      console.log("ALGO SALIO MAL, VOLVIENDO A INTENTAR");
      await timeout(5 * 1000);
      i -= 1;
    }
  }
  console.log("FIN DE TODO!");
}

function successOgameMessage() {
  console.log("ENVIANDO SUCCESS");
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
    "https://s183-es.ogame.gameforge.com/game/index.php?page=messages"
  );
  myHeaders.append("Accept-Language", "en,en-US;q=0.9,es-ES;q=0.8,es;q=0.7");

  var raw =
    "ids%5B%5D=0&ids%5B%5D=1&ids%5B%5D=2&ids%5B%5D=3&ids%5B%5D=4&ids%5B%5D=5&ids%5B%5D=6&ids%5B%5D=7&ids%5B%5D=8&ids%5B%5D=9&ids%5B%5D=10&ids%5B%5D=11&ids%5B%5D=12&ids%5B%5D=13&ids%5B%5D=14&ids%5B%5D=15&ids%5B%5D=16&ids%5B%5D=17&ids%5B%5D=18&ids%5B%5D=19";

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch(
    "https://s183-es.ogame.gameforge.com/game/index.php?page=componentOnly&component=eventList&action=checkEvents&ajax=1&asJson=1",
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
}

// expeditions

(async () => {
  let coords = "2:123:8";
  var battleShips = document.querySelectorAll("#battleships>ul#military>li");
  for (let i = battleShips.length - 2; i > -1; i--) {
    let lastBattleShipQty = parseInt(
      battleShips[i].querySelector("span>span").getAttribute("data-value")
    );
    if (lastBattleShipQty > 0) {
      var lastBattleShipId = battleShips[i].getAttribute("data-technology");
      i = -1;
    }
  }

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
  let qtyNGCtoSend = Math.ceil(qtyNGC / 3);
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

    var raw = `token=${token}&am203=${qtyNGCtoSend}&am${lastBattleShipId}=1&am210=1&am219=1&galaxy=${galaxy}&system=${system}&position=16&type=1&metal=0&crystal=0&deuterium=0&prioMetal=1&prioCrystal=2&prioDeuterium=3&mission=15&speed=10&retreatAfterDefenderRetreat=0&union=0&holdingtime=1`;

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
    await timeout(Random(1, 1) * 1000);
  }
  console.log("FIN - ENVIE TODAS LAS EXPEDICIONES");
})();
