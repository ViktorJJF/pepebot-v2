const namespaced = true;
const actions = {
  editMessage({ commit }, { id, object }) {
    commit("editMessage", { id, object });
  }
};
const mutations = {
  editMessage(state, { id, object }) {
    var indexToUpdate = state.messages.findIndex(message => message.id == id);
    state.messages.splice(indexToUpdate, 1, { ...object });
  }
};

const state = {
  messages: [
    { id: 0, description: "Brus" },
    { id: 1, description: "Brus2" },
    { id: 2, description: "Brus3" }
  ]
};

export default {
  namespaced,
  actions,
  state,
  mutations
};
