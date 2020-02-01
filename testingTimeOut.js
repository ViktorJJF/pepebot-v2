const moment = require("moment");

// console.log("ejecutando a: ", moment().format("MMMM Do YYYY, h:mm:ss a"));

function func1() {
  func2();
  console.log("brus");
}
function func2() {
  console.log("brus2");
}

func1();
