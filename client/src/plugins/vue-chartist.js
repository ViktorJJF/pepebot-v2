//vue chartist
import Vue from "vue";
import "chartist/dist/chartist.min.css";
Vue.use(require("vue-chartist"));

Vue.config.productionTip = false;

import Chartist from "chartist";
Vue.prototype.$Chartist = Chartist;
