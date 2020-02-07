const { timeout } = require("./server/utils/utils");

let func1 = async k => {
  console.log("el valor es: ", k);
  await timeout(2000);
  if (k < 5) func1(k + 1);
  console.log("llegamos a retornar algo");
};

(async () => {
  console.log(await func1(1));
})();
