import * as types from "@/store/mutation-types";
import api from "@/services/api/members.js";
import { buildSuccess, handleError } from "@/utils/utils.js";

const module = {
  namespaced: true,
  state: {
    members: [],
    totalMembers: 0
  },
  actions: {
    fetchMembers({ commit, state }) {
      return new Promise((resolve, reject) => {
        if (state.members.length > 0) resolve();
        else {
          api
            .fetchMembers()
            .then(response => {
              // commit(types.TOTAL_USERS, response.data.totalDocs)
              commit("fetchMembers", response.data);
              resolve();
            })
            .catch(error => {
              console.log("se produjo un error");
              handleError(error, commit, reject);
            });
        }
      });
    },
    editMember({ commit }, { id, data }) {
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
      commit("editMember", {
        id,
        data
      });
    },
    deleteMember({ commit }, id) {
      return new Promise((resolve, reject) => {
        buildSuccess("Eliminado con éxito", commit, resolve);
      });
    }
  },
  mutations: {
    fetchMembers(state, members) {
      members.forEach(member => {
        member["paymentState"] = Math.random() >= 0.5;
      });
      state.members = members;
    },
    editMember(state, { id, data }) {
      let indexToUpdate = state.members.findIndex(member => member._id == id);
      console.log(
        "se modificara: ",
        state.members[indexToUpdate],
        " con : ",
        data
      );
      state.members.splice(indexToUpdate, 1, {
        ...data
      });
      console.log("ahora state es: ", state.members);
    },
    [types.TOTAL_MEMBERS](state, value) {
      state.totalMembers = value;
    }
  },
  getters: {
    getTotalMembers: state => {
      return state.members.length;
    },
    getMemberByDNI: state => dni => {
      let member = state.members.find(member => member.dni == dni);
      if (member) {
        return member;
      }
      return {};
    }
  }
};

export default module;
