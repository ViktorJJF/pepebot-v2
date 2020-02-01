export default {
  login(payload) {
    console.log("se intenrara iniciar sesion con: ", payload);
    return axios.post("/api/login", {
      email: payload.email,
      password: payload.password
    });
  },
  logout(id, payload) {
    return axios.get("/api/logout");
  }
};
