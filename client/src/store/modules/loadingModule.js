const namespaced = true;

const getters = {
  // showLoading: state => state.showLoading
};

const mutations = {
  showLoading(state, value) {
    state.loading = value;
  }
};

const state = {
  loading: false
};

export default {
  namespaced,
  state,
  getters,
  mutations
};
