import "@mdi/font/css/materialdesignicons.css"; //material design icons
import Vue from "vue";
import Vuetify from "vuetify/lib";
import theme from "./theme/theme.js";
import vueGoogleCharts from "vue-google-charts";
Vue.use(vueGoogleCharts);
Vue.use(Vuetify);

export default new Vuetify({
  theme,
  icons: {
    iconfont: "mdi"
  }
});
