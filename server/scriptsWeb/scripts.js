/**
 * @Description Espiar a todos dentro de un rango
 */

// spyInRange("5:387", "5:387", {
//   onlyMoons: true,
//   excludeAlliances: ["Monguers", "Destroy"],
//   excludePlayers: ["Nabucodonosor", "Latofi"],
//   overRank: 40,
// });

async function spyInRange(
  from,
  to,
  { onlyMoons, excludeAlliances, excludePlayers, overRank } = {}
) {
  let planets = await getPlanetsInRange(from, to);
  for (const planet of planets) {
    console.log("REVISANDO: ", planet.coords);
    if (
      excludeAlliances.includes(planet.allianceName) ||
      excludeAlliances.includes(planet.allianceTag) ||
      excludePlayers.includes(planet.playerName) ||
      planet.rank < overRank ||
      planet.state === "vacation"
    ) {
      console.log("EXCLUIDO:", planet.coords);
    } else {
      if (onlyMoons && planet.moon) {
        console.log("ENVIANDO SONDA A LUNA: ", planet.coords);
        await spyCoords(planet.coords, "moon");
      } else if (!onlyMoons) {
        console.log("ENVIANDO SONDA A PLANETA");
        await spyCoords(planet.coords);
      }
    }
  }
  console.log("TERMINADO!");
}

async function getPlanetsInRange(from, to) {
  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  let response = await fetch(
    `https://pepehunter-v2.herokuapp.com/api/planets/get-in-range?from=${from}&to=${to}`,
    requestOptions
  );
  let data = await response.json();
  return data.planets;
}

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

    var raw = `mission=6&galaxy=${galaxy}&system=${system}&position=${position}&type=3&shipCount=10&token=${token}`;

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
        await timeout(Random(4, 8) * 1000);
        throw new Error("Alcanzado número máximo flotas");
      }
      if (data.response.message.includes("no hay naves disponibles")) {
        // esperar un tiempo
        throw new Error("No hay naves disponibles");
      }
      if (data.response.message.includes("novato")) {
        return console.log(
          `Las coordenadas ${coords} tiene proteccion de novato`
        );
      }
      if (data.response.message.includes("vacaciones")) {
        console.log(`Las coordenadas ${coords} esta de vacaciones`);
      }
      throw new Error("Cookie vencida");
    }
    // successOgameMessage();
  } catch (error) {
    console.log("err: ", error);
    await timeout(Random(4, 8) * 1000);
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

async function getSolarSystemPlanets(from, to) {
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
