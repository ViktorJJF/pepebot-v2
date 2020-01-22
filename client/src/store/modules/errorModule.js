const namespaced = true;

const getters = {
  showErrorMessage: state => state.showErrorMessage,
  errorMessage: state => state.errorMessage
};

const mutations = {
  //   error(state, payload) {
  //     if (payload === null) {
  //       state.showErrorMessage = false;
  //       state.errorMessage = null;
  //     } else {
  //       state.showErrorMessage = true;
  //       state.errorMessage = payload;
  //     }
  //   },
  //   activeError(state, payload) {
  //     state.showErrorMessage = !!payload;
  //   }
  showError(state, msg) {
    state.showErrorMessage = true;
    state.errorMessage = msg;
  }
};

const state = {
  showErrorMessage: false,
  errorMessage: null
};

export default {
  namespaced,
  state,
  getters,
  mutations
};
