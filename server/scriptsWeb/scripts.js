// ==UserScript==
// @name         My Pepe script
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://s183-es.ogame.gameforge.com/*
// @icon         https://www.google.com/s2/favicons?domain=gameforge.com
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // Your code here...

  // spyInRange("5:387", "5:387", {
  //   onlyMoons: true,
  //   excludeAlliances: ["Monguers", "Destroy"],
  //   excludePlayers: ["Nabucodonosor", "Latofi"],
  //   overRank: 40,
  // });

  // spyPlayerPlanets("Nabucodonosor",{onlyMoons:false})
  // spyOffsBetweenMilitaryRank(50,120)

  window.spyPlayerPlanets = spyPlayerPlanets;
  window.spyInRange = spyInRange;
  window.spyOffsBetweenMilitaryRank = spyOffsBetweenMilitaryRank;
  window.sendFleetToDebris = sendFleetToDebris;
  window.watchActiveMissions = watchActiveMissions;

  const EXCLUDE_ALLIANCES = ["Monguers", "DESTROY", "WolfCrew", "EPKB"];
  const EXCLUDE_PLAYERS = [
    "Nabucodonosor",
    "Latofi",
    "SekSek",
    "MISS Nicole KILLman",
    "Spike Spiegel",
    "Colt",
  ];

  async function spyInRange(
    from,
    to,
    { onlyMoons = true, excludeAlliances, excludePlayers, overRank } = {}
  ) {
    let planets = await getPlanetsInRange(from, to);
    excludeAlliances = excludeAlliances || EXCLUDE_ALLIANCES;
    excludePlayers = excludePlayers || EXCLUDE_PLAYERS;
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
        if (!onlyMoons) {
          console.log("ENVIANDO SONDA A PLANETA");
          await spyCoords(planet.coords, "planet");
        }
        if (planet.moon) {
          console.log("ENVIANDO SONDA A LUNA: ", planet.coords);
          await spyCoords(planet.coords, "moon");
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

  async function getPlayerInfo(nickname) {
    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    let response = await fetch(
      `https://pepehunter-v2.herokuapp.com/api/players?name=${nickname}`,
      requestOptions
    );
    let data = await response.json();
    if (data.payload.length === 0) {
      console.log("ESE JUGADOR NO EXISTE");
      throw new Error("ESE JUGADOR NO EXISTE");
    }
    return data.payload[0];
  }

  async function spyCoords(coords, type = "planet") {
    try {
      const typeCode = type === "moon" ? 3 : 1; // 1: Planeta, 3: Luna
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
      myHeaders.append(
        "Accept-Language",
        "en,en-US;q=0.9,es-ES;q=0.8,es;q=0.7"
      );

      var raw = `mission=6&galaxy=${galaxy}&system=${system}&position=${position}&type=${typeCode}&shipCount=10&token=${token}`;

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
      }
      // successOgameMessage();
    } catch (error) {
      console.log("err: ", error);
      await timeout(Random(4, 8) * 1000);
      console.log("HACIENDO SOLICITUD DE NUEVO");
      await spyCoords(coords, type);
    }
  }

  async function spyPlayerPlanets(nickname, { onlyMoons = true } = {}) {
    let player = await getPlayerInfo(nickname);
    if (player.planets && player.planets.length > 0) {
      for (const planet of player.planets) {
        if (planet.coords) {
          // await spyCoords(planet.coords, "planet");
          // console.log("SONDA ENVIADA A: ", planet.coords);
          await timeout(Random(1, 2) * 1000);
          if (planet.moon) {
            console.log("SONDA ENVIADA A LUNA: ", planet.coords);
            await spyCoords(planet.coords, "moon");
          }
          if (!onlyMoons && planet.coords !== player.mainPlanet) {
            await timeout(1000);
            console.log("SONDA ENVIADA A PLANETA: ", planet.coords);
            await spyCoords(planet.coords, "planet");
          }
        }
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

  async function spyOffsBetweenMilitaryRank(
    from,
    to,
    {
      onlyMoons = true,
      excludeAlliances,
      excludePlayers,
      checkOnlyMainPlanet,
    } = {}
  ) {
    excludeAlliances = excludeAlliances || EXCLUDE_ALLIANCES;
    excludePlayers = excludePlayers || EXCLUDE_PLAYERS;
    let prePlayers = await getPlayers();
    let players = prePlayers.filter(
      (prePlayer) =>
        prePlayer.rankMilitary >= from &&
        prePlayer.rankMilitary <= to &&
        prePlayer.state !== "vacation"
    );
    for (let i = 0; i < players.length; i++) {
      try {
        if (
          excludeAlliances.includes(players[i].allianceName) ||
          excludeAlliances.includes(players[i].allianceTag) ||
          excludePlayers.includes(players[i].name)
        ) {
          console.log("JUGADOR EXCLUIDO: ", players[i].name);
        } else {
          console.log("REVISANDO AL RANK: ", players[i].rankMilitary);
          let scanResult = await scanPlayer(players[i].name);
          let activities = scanResult.activities;
          if (activities.length > 0) {
            let isOff = activities.every(
              (activity) => activity.lastActivity !== "on"
            );
            let isTotalOff = activities.every(
              (activity) => activity.lastActivity === "off"
            );
            let isMainPlanetActivityOff =
              activities.find((el) => el.coords === players[i].mainPlanet)
                .lastActivity === "off";
            if (isOff || (checkOnlyMainPlanet && isMainPlanetActivityOff)) {
              if (isTotalOff) {
                console.log(
                  "TOTALMENTE OFF: ",
                  players[i].name,
                  players[i].rank
                );
              } else {
                console.log("OFF: ", players[i].name, players[i].rank);
              }
              if (checkOnlyMainPlanet && isMainPlanetActivityOff) {
                console.log(
                  "PRINCIPAL OFF: ",
                  players[i].name,
                  players[i].rank
                );
              }
              await spyPlayerPlanets(players[i].name, { onlyMoons });
            }
          }
        }
      } catch (error) {
        console.log("ALGO SALIO MAL, VOLVIENDO A INTENTAR", error);
        await timeout(5 * 1000);
        i -= 1;
      }
    }
    console.log("FIN DE TODO!");
  }

  async function sendFleetToDebris(coords) {
    try {
      let [galaxy, system, position] = coords.split(":");
      let resources = {
        metal: "920",
        crystal: "4000",
        deuterium: "70000",
      };
      let ships = [
        {
          id: "202",
          name: "Nave pequeña de carga",
          type: "transporterSmall",
          qty: 0,
        },
        {
          id: "203",
          name: "Nave Grande de carga",
          type: "transporterLarge",
          qty: 0,
        },
        {
          id: "204",
          name: "Cazador Ligero",
          type: "fighterLight",
          qty: 0,
        },
        {
          id: "205",
          name: "Cazador Pesado",
          type: "fighterHeavy",
          qty: 0,
        },
        {
          id: "206",
          name: "Crucero",
          type: "cruiser",
          qty: 0,
        },
        {
          id: "207",
          name: "Nave de batalla",
          type: "battleship",
          qty: 383,
        },
        {
          id: "208",
          name: "Colonizador",
          type: "colonyShip",
          qty: 3,
        },
        {
          id: "209",
          name: "Reciclador",
          type: "recycler",
          qty: 200,
        },
        {
          id: "210",
          name: "Sonda de espionaje",
          type: "espionageProbe",
          qty: 0,
        },
        {
          id: "211",
          name: "Bombardero",
          type: "bomber",
          qty: 0,
        },
        {
          id: "213",
          name: "Destructor",
          type: "destroyer",
          qty: 0,
        },
        {
          id: "214",
          name: "Estrella de la muerte",
          type: "deathstar",
          qty: 0,
        },
        {
          id: "215",
          name: "Acorazado",
          type: "interceptor",
          qty: 0,
        },
        {
          id: "218",
          name: "Segador",
          type: "reaper",
          qty: 0,
        },
        {
          id: "219",
          name: "Explorador",
          type: "explorer",
          qty: 0,
        },
      ];
      let shipsString = ships
        .map((ship) => `&am${ship.id}=${ship.qty}`)
        .join("");
      var myHeaders = new Headers();
      myHeaders.append("Connection", "keep-alive");
      myHeaders.append(
        "sec-ch-ua",
        '" Not A;Brand";v="99", "Chromium";v="98", "Google Chrome";v="98"'
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
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.82 Safari/537.36"
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
      myHeaders.append("Accept-Language", "en-US,en;q=0.9,es;q=0.8");

      var raw = `token=${token}&${shipsString}&galaxy=${galaxy}&system=${system}&position=${position}&type=2&metal=${resources.metal}&crystal=${resources.crystal}&deuterium=${resources.deuterium}&prioMetal=1&prioCrystal=2&prioDeuterium=3&mission=8&speed=1&retreatAfterDefenderRetreat=0&union=0&holdingtime=0`;

      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      let response = await fetch(
        "https://s183-es.ogame.gameforge.com/game/index.php?page=ingame&component=fleetdispatch&action=sendFleet&ajax=1&asJson=1",
        requestOptions
      );
      let data = await response.json();
      token = data.token;
      if (!data.success) {
        throw new Error("Error enviando a escombros");
      }
      console.log("FLOTA ENVIADA A ESCOMBROS");
      return true;
    } catch (error) {
      console.log(error);
      await sendFleetToDebris(coords);
    }
  }

  async function sendTelegramMessage(telegramId, message) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("message", message);
    urlencoded.append("senderId", telegramId);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow",
    };

    fetch("https://pepebot-v2.herokuapp.com/telegram/message", requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));
  }

  async function makePhoneCall(phone) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("number", phone);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow",
    };

    fetch(
      "https://pepebot-v2.herokuapp.com/api/test-phone-call",
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));
  }

  async function checkActiveMissions() {
    var myHeaders = new Headers();
    myHeaders.append("Connection", "keep-alive");
    myHeaders.append(
      "sec-ch-ua",
      '" Not A;Brand";v="99", "Chromium";v="98", "Google Chrome";v="98"'
    );
    myHeaders.append("Accept", "text/plain, */*; q=0.01");
    myHeaders.append("X-Requested-With", "XMLHttpRequest");
    myHeaders.append("sec-ch-ua-mobile", "?0");
    myHeaders.append(
      "User-Agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.82 Safari/537.36"
    );
    myHeaders.append("sec-ch-ua-platform", '"Windows"');
    myHeaders.append("Sec-Fetch-Site", "same-origin");
    myHeaders.append("Sec-Fetch-Mode", "cors");
    myHeaders.append("Sec-Fetch-Dest", "empty");
    myHeaders.append(
      "Referer",
      "https://s183-es.ogame.gameforge.com/game/index.php?page=ingame&component=shipyard"
    );
    myHeaders.append("Accept-Language", "en-US,en;q=0.9,es;q=0.8");

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    let response = await fetch(
      "https://s183-es.ogame.gameforge.com/game/index.php?page=componentOnly&component=eventList&action=fetchEventBox&ajax=1&asJson=1",
      requestOptions
    );
    let data = await response.json();
    return data;
  }

  async function watchActiveMissions() {
    const TIME_TO_CHECK = 1 * 60 * 1000;
    while (true) {
      try {
        let response = await checkActiveMissions();
        if (response.hostile > 0) {
          console.log("TE ATACAN!");
          sendTelegramMessage("-339549424", "🚨🚨🚨 TE ATACAN 🚨🚨🚨");
          makePhoneCall("+51983724476");
          //makePhoneCall("+51951342603");
          await timeout(10 * 1000);
        } else {
          console.log("✅ SIN ATAQUES, TODO OK: ", new Date());
          await timeout(TIME_TO_CHECK);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function readSpyReport(key) {}
})();
