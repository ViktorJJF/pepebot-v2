export default {
  list(userId) {
    return axios.get("/api/bots/self", { params: { userId } });
  },
  createBot(payload) {
    return axios.post(`/api/bots`, payload);
  },
  updateBot(id, payload) {
    return axios.put(`/api/bots/${id}`, payload);
  },
  deleteBot(id) {
    return axios.delete(`/api/bots/${id}`);
  },
  beginBot(ogameEmail, ogamePassword, botId) {
    return axios.get(`/api/bots/${botId}/begin`, {
      params: { ogameEmail, ogamePassword }
    });
  }
};
