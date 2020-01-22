export default {
  fetchLogia() {
    return axios.get("/fake/logias.json");
  },
  editLogia(id, payload) {
    return axios.put(`/logias/${id}`, payload);
  },
  saveLogia(payload) {
    return axios.post("/logias/", payload);
  },
  deleteLogia(id) {
    return axios.delete(`/logias/${id}`);
  }
};
