const moment = require("moment");

let i = 0;
let j = 0;

(async () => {
  let intervalId = setInterval(async () => {
    i++;
    console.log("i vale: ", i);
    if (i == 2) return clearInterval(intervalId);
    console.log(
      "ejecutando nuevo intervalo: ",
      moment().format("MMMM Do YYYY, h:mm:ss a")
    );
    await async1();
  }, 5000);
  console.log("seguimos ejecutando lo demas");
  let intervalId2 = setInterval(async () => {
    j++;
    console.log("j vale: ", j);
    await async1();
  }, 5000);
})();

function async1() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("ejecutando a: ", moment().format("MMMM Do YYYY, h:mm:ss a"));
    }, 3000);
  });
}
