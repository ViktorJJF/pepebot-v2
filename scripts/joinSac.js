let tokenScript = "";
let continueRetarding = true;
const MAX_RETARD_PERCENT = 0.2;

async function joinProbeToSac(sacId, speed = 1, objetiveCoords, isMoon = true) {
  try {
    let [galaxy, system, position] = objetiveCoords.split(":");
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
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36"
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
    var raw = `token=${tokenScript}&am210=1&galaxy=${galaxy}&system=${system}&position=${position}&type=${
      isMoon ? "3" : "1"
    }&metal=0&crystal=0&deuterium=0&prioMetal=1&prioCrystal=2&prioDeuterium=3&mission=2&speed=${speed}&retreatAfterDefenderRetreat=0&union=${sacId}&holdingtime=0`;

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
    tokenScript = data.token;
    if (!data.success) {
      //   console.log("🚀 Aqui *** -> data", data);
      throw new Error("Error token");
    } else {
      console.log("SUCESS: SONDA ENVIADA PARA RETRASAR SAC");
    }
  } catch (error) {
    console.log(error);
    await joinProbeToSac(sacId, speed, objetiveCoords, isMoon);
  }
}

function timeout(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

async function startToRetardAttack(
  timeRemaining,
  sacId,
  speed = 1,
  objetiveCoords,
  isMoon = true
) {
  while (continueRetarding) {
    await joinProbeToSac(sacId, speed, objetiveCoords, isMoon);
    console.log("ATAQUE RETARDADO!");
    await timeout(parseInt(timeRemaining * MAX_RETARD_PERCENT));
    console.log("EMPEZANDO A ENVIAR NUEVA SONDA");
  }
}

function getTimeToStartScript(timeToArrive) {
  // coloca el tiempo en que llegara la sonda
  // el maximo para retrasar es 30%, pero por seguridad usamos 28%
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
  return msToTime(parseInt(timeToArrive / (1 + MAX_RETARD_PERCENT)));
}
