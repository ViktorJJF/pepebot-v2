export default {
  fetchMembers() {
    return axios.get("/fake/members.json");
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
