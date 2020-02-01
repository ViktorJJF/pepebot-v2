var i = 0;

let async = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      i++;
      console.log("aea mongol");
      resolve(i);
    }, 2000);
  });
};

(async () => {
  while (i !== 3) {
    var res = await async();
    console.log("brus:", res);
  }
  console.log("por fin sali del blucle");
})();
