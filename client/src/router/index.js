import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

let routes = [
  // {
  //   path: "/",
  //   component: require("@/views/Test").default,
  //   name: "test"
  // },
  {
    path: "/hunter",
    component: require("@/views/Hunter").default,
    name: "hunter"
  },
  {
    path: "/",
    component: require("@/layouts/PublicLayout").default,
    name: "publicLayout",
    redirect: "login",
    children: [
      {
        path: "/login",
        component: require("@/views/Public/Login").default,
        name: "login"
      }
    ]
  },
  {
    path: "/dashboard",
    component: require("@/views/Auth/Dashboard").default,
    name: "dashboard"
  }
];

const router = new Router({
  routes,
  mode: "history"
});

export default router;
