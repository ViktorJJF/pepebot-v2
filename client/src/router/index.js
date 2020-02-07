import Vue from "vue";
import Router from "vue-router";
import { store } from "@/store";
import { isLogged } from "@/utils/isLogged";
Vue.use(Router);

let routes = [
  {
    path: "/",
    component: require("@/layouts/PublicLayout").default,
    name: "publicLayout",
    redirect: { name: "login" },
    meta: {
      guest: true
    },
    children: [
      {
        path: "/login",
        component: require("@/views/Public/Login").default,
        name: "login"
      }
    ]
  },
  {
    path: "/",
    component: require("@/layouts/AuthLayout").default,
    name: "authLayout",
    meta: {
      requiresAuth: true
    },
    redirect: { name: "newBot" },
    children: [
      {
        path: "nuevo-bot",
        component: require("@/views/Auth/NewBot").default,
        name: "newBot"
      },
      {
        path: "scan",
        component: require("@/views/Auth/Scan").default,
        name: "scan"
      },
      {
        path: "watch-dog",
        component: require("@/views/Auth/WatchDog").default,
        name: "watchDog"
      },
      {
        path: "hunter",
        component: require("@/views/Auth/Hunter").default,
        name: "hunter"
      },
      {
        path: "overview",
        component: require("@/views/Auth/Overview").default,
        name: "overview"
      },
      {
        path: "expediciones",
        component: require("@/views/Auth/Expeditions").default,
        name: "expeditions"
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

router.beforeEach(async (to, from, next) => {
  if (!store.state.authModule.user) {
    let loginStatus = await isLogged();
    if (loginStatus) {
      store.state.authModule.user = loginStatus;
    }
  }
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.state.authModule.user) {
      next({
        name: "login"
      });
    } else {
      let user = store.state.authModule.user;
      if (to.matched.some(record => record.meta.requiresAuth)) {
        if (user.role == "ADMIN") {
          next();
        } else {
          next({
            name: "authLayout"
          });
        }
      } else {
        next();
      }
    }
  } else if (to.matched.some(record => record.meta.guest)) {
    if (store.state.authModule.user == null) {
      next();
    } else {
      next({
        name: "authLayout"
      });
    }
  } else {
    next();
  }
});

export default router;
