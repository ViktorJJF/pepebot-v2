import * as types from "@/store/mutation-types";
import api from "@/services/api/postulants.js";
import { buildSuccess, handleError } from "@/utils/utils.js";

const module = {
  namespaced: true,
  state: {
    postulants: [],
    totalPostulants: 0
  },
  actions: {
    fetchPostulants({ commit, state }) {
      return new Promise((resolve, reject) => {
        if (state.postulants.length > 0) resolve();
        else {
          api
            .fetchPostulants()
            .then(response => {
              console.log("se chequeara la api de postulants");
              // commit(types.TOTAL_USERS, response.data.totalDocs)
              commit("fetchPostulants", response.data);
              resolve();
            })
            .catch(error => {
              console.log("se produjo un error");
              handleError(error, commit, reject);
            });
        }
      });
    },
    editPostulant({ commit }, { id, data }) {
      // return new Promise((resolve, reject) => {
      //   // const data = {
      //   //   // type your data to update
      //   // };
      //   //type your id and data
      //   // api
      //   //   .editMember(payload._id, data)
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
      commit("editPostulant", { id, data });
    },
    deletePostulant({ commit }, id) {
      return new Promise((resolve, reject) => {
        buildSuccess("Eliminado con éxito", commit, resolve);
      });
    }
  },
  mutations: {
    fetchPostulants(state, postulants) {
      state.postulants = postulants;
    },
    editPostulant(state, { id, data }) {
      let indexToUpdate = state.postulants.findIndex(
        postulant => postulant._id == id
      );
      console.log(
        "se modificara: ",
        state.postulants[indexToUpdate],
        " con : ",
        data
      );
      state.postulants.splice(indexToUpdate, 1, { ...data });
      console.log("ahora state es: ", state.postulants);
    },
    [types.TOTAL_POSTULANTS](state, value) {
      state.totalPostulants = value;
    }
  }
};

export default module;
