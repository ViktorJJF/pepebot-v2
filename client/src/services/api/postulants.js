export default {
  fetchPostulants() {
    return axios.get("/fake/postulants.json");
  },
  editMember(id, payload) {
    return axios.put(`/members/${id}`, payload);
  },
  saveMember(payload) {
    return axios.post("/members/", payload);
  },
  deleteMember(id) {
    return axios.delete(`/members/${id}`);
  }
};
