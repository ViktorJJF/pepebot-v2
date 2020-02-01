import * as types from "@/store/mutation-types";
import api from "@/services/api/bots.js";
import { buildSuccess, handleError } from "@/utils/utils.js";

const module = {
  namespaced: true,
  state: {
    bots: null,
    totalPostulants: 0
  },
  actions: {
    list({ commit, state }, userId) {
      return new Promise((resolve, reject) => {
        api
          .list(userId)
          .then(res => {
            console.log("listado hecho con exito", res.data);
            commit("list", res.data.payload);
            resolve(res.data.payload);
          })
          .catch(err => {
            console.log("se produjo un error");
            handleError(err, commit, reject);
          });
      });
    },
    createBot({ commit }, payload) {
      return new Promise((resolve, reject) => {
        console.log("se creara el bot con esta data: ", payload);
        commit("loadingModule/showLoading", true, { root: true });
        api
          .createBot(payload)
          .then(res => {
            if (res.status === 200) {
              buildSuccess("Bot creado con éxito", commit);
              commit("createBot", res.data.payload);
              console.log("se resolvera el bot");
              resolve(res.data.payload);
            }
          })
          .catch(err => {
            handleError(err, commit, reject);
          });
      });
    },
    updateBot({ commit }, { id, payload }) {
      return new Promise((resolve, reject) => {
        commit("loadingModule/showLoading", true, { root: true });
        api
          .updateBot(id, payload)
          .then(res => {
            if (res.status === 200) {
              buildSuccess("Bot actualizado con éxito", commit);
              commit("updateBot", { id, payload: res.data.payload });
              resolve(res.data.payload);
            }
          })
          .catch(err => {
            handleError(err, commit);
            reject(err);
          });
      });
    },
    deleteBot({ commit }, id) {
      return new Promise((resolve, reject) => {
        commit("loadingModule/showLoading", true, { root: true });
        api
          .deleteBot(id)
          .then(res => {
            buildSuccess("Bot eliminado con éxito", commit, resolve);
            commit("deleteBot", id);
            resolve();
          })
          .catch(err => {
            handleError(err, commit, reject);
          });
      });
    },
    beginBot({ commit }, { ogameEmail, ogamePassword, botId }) {
      return new Promise((resolve, reject) => {
        commit("loadingModule/showLoading", true, { root: true });
        api
          .beginBot(ogameEmail, ogamePassword, botId)
          .then(res => {
            buildSuccess("Bot iniciado con éxito", commit);
            resolve(res.data);
          })
          .catch(err => {
            handleError(err, commit);
            reject(err);
          });
      });
    }
  },
  mutations: {
    list(state, payload) {
      state.bots = payload;
    },
    createBot(state, payload) {
      state.bots.push(payload);
    },
    updateBot(state, { id, payload }) {
      let indexToUpdate = state.bots.findIndex(bot => bot._id === id);
      state.bots[indexToUpdate] = payload;
    },
    deleteBot(state, id) {
      state.bots.splice(
        state.bots.findIndex(bot => bot._id === id),
        1
      );
    }
  },
  getters: {
    getBotId: state => {
      return state.bots.length > 0 ? state.bots[0]._id : 0;
    }
  }
};

export default module;
