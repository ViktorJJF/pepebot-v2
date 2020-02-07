//get time changed
var times = [];
var msg = "aprox. 10m";
var interval = setInterval(() => {
  document.querySelector("p.auction_info>span").innerText;
}, 800);

var buyInterval = setInterval(() => {
  if (document.querySelector("a.currentPlayer").innerText != "Jose Cuervo") {
    document.querySelector("a.js_sliderCrystalMax").click();
    document.querySelector("a.pay").click();
    console.log("no eres el mejor postor y pagaremos mas");
  }
}, 100);

// clearInterval(buyInterval);
