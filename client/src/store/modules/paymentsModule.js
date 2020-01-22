import * as types from "@/store/mutation-types";
import api from "@/services/api/payments.js";
import { buildSuccess, handleError } from "@/utils/utils.js";

const module = {
  namespaced: true,
  state: {
    payments: [],
    totalPayments: 0
  },
  actions: {
    fetchPayments({ commit, state }) {
      return new Promise((resolve, reject) => {
        if (state.payments.length > 0) resolve();
        else {
          api
            .fetchPayments()
            .then(response => {
              // commit(types.TOTAL_USERS, response.data.totalDocs)
              commit("fetchPayments", response.data);
              resolve();
            })
            .catch(error => {
              console.log("se produjo un error");
              handleError(error, commit, reject);
            });
        }
      });
    },
    editPayment({ commit }, { id, data }) {
      // return new Promise((resolve, reject) => {
      //   // const data = {
      //   //   // type your data to update
      //   // };
      //   //type your id and data
      //   // api
      //   //   .editPayment(payload._id, data)
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
      commit("editPayment", { id, data });
    },
    deletePayment({ commit }, id) {
      return new Promise((resolve, reject) => {
        buildSuccess("Eliminado con éxito", commit, resolve);
      });
    }
  },
  mutations: {
    fetchPayments(state, payments) {
      state.payments = payments;
    },
    editPayment(state, { id, data }) {
      let indexToUpdate = state.payments.findIndex(member => member._id == id);
      console.log(
        "se modificara: ",
        state.payments[indexToUpdate],
        " con : ",
        data
      );
      state.payments.splice(indexToUpdate, 1, { ...data });
      console.log("ahora state es: ", state.payments);
    },
    [types.TOTAL_MEMBERS](state, value) {
      state.totalPayments = value;
    }
  },
  getters: {
    paymentsByMember: state => id => {
      return state.payments.filter(payment => payment.member_id == id);
    }
  }
};

export default module;
