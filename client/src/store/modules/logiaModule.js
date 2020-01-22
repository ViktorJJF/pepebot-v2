import * as types from "@/store/mutation-types";
import api from "@/services/api/logia.js";
import { buildSuccess, handleError } from "@/utils/utils.js";

const module = {
  namespaced: true,
  state: {
    logia: {}
  },
  actions: {
    fetchLogia({ commit, state }) {
      return new Promise((resolve, reject) => {
        if (state.logia.hasOwnProperty("name")) resolve();
        else {
          api
            .fetchLogia()
            .then(response => {
              // commit(types.TOTAL_USERS, response.data.totalDocs)
              commit("fetchLogia", response.data);
              resolve();
            })
            .catch(error => {
              console.log("se produjo un error");
              handleError(error, commit, reject);
            });
        }
      });
    },
    updateLogia({ commit }, { id, data }) {
      // return new Promise((resolve, reject) => {
      //   // const data = {
      //   //   // type your data to update
      //   // };
      //   //type your id and data
      //   // api
      //   //   .editLogia(payload._id, data)
      //   //   .then(response => {
      //   //     if (response.status === 200) {

      //   //     }
      //   //   })
      //   //   .catch(error => {
      //   //     handleError(error, commit, reject);
      //   //   });
      //   commit("loadingModule/showLoading", true, { root: true });
      //   buildSuccess("Registro guardado con éxito", commit, resolve);
      //   console.log("se hara commit a: ", id, data);
      //   resolve();
      // });
      commit("editLogia", { id, data });
    },
    deleteLogia({ commit }, id) {
      return new Promise((resolve, reject) => {
        buildSuccess("Eliminado con éxito", commit, resolve);
      });
    }
  },
  mutations: {
    fetchLogia(state, logia) {
      state.logia = logia;
    },
    updateLogia(state, data) {
      console.log("se hara commit");
      state.logia.name = data.name;
      state.logia.number = data.number;
      state.logia.profile_picture = data.profile_picture;
      state.logia.color = data.color;
    },
    [types.TOTAL_MEMBERS](state, value) {
      state.totalLogia = value;
    }
  },
  getters: {
    logiaFullName(state) {
      return state.logia.name + " " + state.logia.number;
    }
  }
};

export default module;
