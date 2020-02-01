import * as types from "@/store/mutation-types";
import router from "@/router";
import api from "@/services/api/auth";
import { buildSuccess, handleError } from "@/utils/utils.js";
import { addMinutes, format } from "date-fns";

const MINUTES_TO_CHECK_FOR_TOKEN_REFRESH = 1440;

const namespaced = true;
const getters = {
  fullname: state =>
    state.user ? state.user.first_name + " " + state.user.last_name : null,
  email: state => (state.user ? state.user.email : null),
  token: state => state.token,
  isTokenSet: state => state.isTokenSet
};

const actions = {
  userLogin({ commit }, payload) {
    return new Promise((resolve, reject) => {
      console.log("se mandaran estos datos: ", payload);
      api
        .login(payload)
        .then(response => {
          if (response.status === 200) {
            console.log("se inicio sesion correctamente");
            console.log("se comiteara: ", response.data.user);
            // commit("userLogin", response.data.user);
            // commit(types.SAVE_TOKEN, response.data.token);
            // commit(types.EMAIL_VERIFIED, response.data.user.verified);
            buildSuccess(
              "A experimentar!",
              commit,
              resolve,
              router.push({
                name: "authLayout"
              })
            );
          }
        })
        .catch(error => {
          handleError(error, commit, reject);
        });
    });
  },
  userLogout({ commit }) {
    return new Promise((resolve, reject) => {
      api
        .logout()
        .then(response => {
          if (response.status === 200) {
            console.log("se cerro sesion correctamente");
            commit("userLogout");
            // commit(types.SAVE_TOKEN, response.data.token);
            // commit(types.EMAIL_VERIFIED, response.data.user.verified);
            console.log("antes del buildsuccess");
            commit("loadingModule/showLoading", true, { root: true });
            buildSuccess(
              "Cerraste sesión",
              commit,
              resolve,
              router.push({
                name: "login"
              })
            );
          }
        })
        .catch(error => {
          console.log("se dio un error cerrando sesion");
          handleError(error, commit, reject);
        });
    });
  }
};

const mutations = {
  // userLogin(payload) {
  //   console.log("se colocara este payload: ", payload);
  //   state.user = payload;
  // },
  userLogout(state) {
    state.user = null;
    // state.token = null;
    // state.isTokenSet = false;
  },
  [types.SAVE_USER](state, user) {
    state.user = user;
  }
};

const state = {
  user: null,
  token: JSON.parse(!!localStorage.getItem("token")) || null,
  isTokenSet: !!localStorage.getItem("token")
};

export default {
  namespaced,
  state,
  getters,
  actions,
  mutations
};
