export default {
  fetchPayments() {
    return axios.get("/fake/payments.json");
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
