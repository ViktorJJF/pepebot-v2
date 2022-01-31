let axios = require("axios");
const cheerio = require("cheerio");

// la salida sera de esta forma

let format = [{ ships: [], id: "", linkToCancel: "" }];

async function getFleetMovements() {
  var config = {
    method: "get",
    url: "https://s183-es.ogame.gameforge.com/game/index.php?page=componentOnly&component=eventList&ajax=1",
    headers: {
      Connection: "keep-alive",
      "sec-ch-ua":
        '" Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"',
      Accept: "*/*",
      "X-Requested-With": "XMLHttpRequest",
      "sec-ch-ua-mobile": "?0",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36",
      "sec-ch-ua-platform": '"Windows"',
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Dest": "empty",
      Referer:
        "https://s183-es.ogame.gameforge.com/game/index.php?page=ingame&component=fleetdispatch",
      "Accept-Language": "en-US,en;q=0.9",
      Cookie:
        "locale=es; maximizeId=null; visibleChats=%7B%22chatbar%22%3Afalse%2C%22players%22%3A%5B%5D%2C%22associations%22%3A%5B%5D%7D; tabBoxFleets=%7B%22912993%22%3A%5B1%2C1643603234%5D%2C%22915448%22%3A%5B1%2C1643603698%5D%2C%22915887%22%3A%5B1%2C1643602923%5D%2C%22915891%22%3A%5B1%2C1643602925%5D%2C%22915893%22%3A%5B1%2C1643602927%5D%2C%22915901%22%3A%5B1%2C1643602934%5D%2C%22915903%22%3A%5B1%2C1643602936%5D%2C%22915900%22%3A%5B1%2C1643602944%5D%2C%22915959%22%3A%5B1%2C1643603066%5D%2C%22915957%22%3A%5B1%2C1643603088%5D%7D; gf-cookie-consent-4449562312=|7|1; gf-token-production=39eeec3d-080e-4afe-8f6f-1175d690cfe7; _ga=GA1.2.1182781869.1643513078; _gid=GA1.2.2065125461.1643513078; pc_idt=ANy1Fc6txaezfvxL7GyIhfxWm8GUb5JSQAdm1nQ8hFngx4qxJwVS65FdrfrdJC7n0kaYof-auojDBeRpcqqhmXulMPqi8DqsGzpHhePX4DAMXxUy5pWZUg6DIck_zjkUUQjI7SuYJNJGTj88YYR0nOjGDeAUjOHEcJD07Q; PHPSESSID=0df55e0e4add076a6c45bd4edf936b6b0d42e2ce; prsess_100545=9a8fe97cf4ccd20027b1578cf307789d; _gat=1",
    },
  };

  let response = await axios(config);
  let data = response.data;
  console.log("🚀 Aqui *** -> data", data);
  if (!data || data.includes("You need to enable JavaScript to run this app")) {
    console.log("LOGEATE");
    throw new Error("Cookie vencida");
  } else {
    let $ = cheerio.load(data);
    console.log("cargando data");
    $(".fleetDetails").each((index, element) => {
      console.log("🚀 Aqui *** -> index", index);
      // console.log('El rank: ', $(element));
      console.log("xd");
      $(".fleetinfo", element).each((index, element) => {
        console.log("AAAA");
      });
    });
  }
}

getFleetMovements();
