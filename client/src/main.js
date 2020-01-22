import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import { store } from "./store";
import vuetify from "@/plugins/vuetify";
import VuetifyConfirm from "vuetify-confirm";
Vue.use(VuetifyConfirm, {
  vuetify,
  buttonTrueText: "Aceptar",
  buttonFalseText: "Cancelar",
  color: "error",
  icon: "mdi-alert-circle-outline",
  title: "Advertencia",
  width: 350,
  property: "$confirm",
  buttonTrueColor: "red lighten3"
  // buttonFalseColor: "yellow lighten3"
});
//other plugins
import "@/plugins/veevalidate";
import "@/plugins/deepCopy";
import "@/plugins/safeAccess";
import "./bootstrap.js";
import "@/assets/scss/myStyles.scss";

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
