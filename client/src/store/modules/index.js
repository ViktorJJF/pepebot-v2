import camelCase from "lodash/camelCase";
const requireModule = require.context(".", false, /\.js$/); // Get js files inside modules folder
const modules = {};

requireModule.keys().forEach(fileName => {
  // Avoid the index.js file
  if (fileName === "./index.js") {
    return;
  }
  const moduleName = camelCase(fileName.replace(/(\.\/|\.js)/g, ""));
  modules[moduleName] = requireModule(fileName).default;
});

export default modules;

// // https://vuex.vuejs.org/en/modules.html

// const requireModule = require.context('.', true, /\.js$/)
// const modules = {}

// requireModule.keys().forEach(fileName => {
//     if (fileName === './index.js') return

//     // Replace ./ and .js
//     const path = fileName.replace(/(\.\/|\.js)/g, '')
//     const [moduleName, imported] = path.split('/')

//     if (!modules[moduleName]) {
//         modules[moduleName] = {
//             namespaced: true
//         }
//     }
//     console.log(moduleName, imported);
//     modules[moduleName][imported] = requireModule(fileName).default
// })

// export default modules
