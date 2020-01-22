import Vue from "vue";
import Vuex from "vuex";
import modules from "./modules";
Vue.use(Vuex);

export const store = new Vuex.Store({
  modules,
  state: {
    token: localStorage.getItem("token") || "",
    user: null,
    users: [],
    componentKey: 0,
    toolbar: {
      drawerIcon: null
    },
    //new data
    ranks: [,
      {
        id: 2,
        name: "Aprendiz"
      },
      {
        id: 3,
        name: "Compañero"
      },
      {
        id: 4,
        name: "Maestro"
      }
    ],
    countries: [{
        id: 1,
        name: "Perú"
      },
      {
        id: 2,
        name: "Colombia"
      },
      {
        id: 3,
        name: "Chile"
      },
      {
        id: 4,
        name: "Bolivia"
      }
    ]
  },
  mutations: {
    logout(state) {
      state.status = "";
      state.token = "";
      state.loggingIn = false;
      state.user = null;
      console.log("se borraran los datos");
    },
    auth_success(state, {
      token,
      user
    }) {
      state.status = "success";
      state.token = token;
      state.user = user;
      state.loggingIn = true;
    },
    auth_error(state) {
      state.status = "error";
    }
  },
  actions: {
    logout({
      commit
    }) {
      return new Promise((resolve, reject) => {
        axios
          .get("/api/logout")
          .then(res => {
            console.log("cerrando sesion");
            commit("logout");
            resolve();
          })
          .catch(err => {
            console.error(err);
            reject(err);
          });
      });
      // delete axios.defaults.headers.common['Authorization'];
    },
    showSnackbar({
      commit
    }, {
      text,
      color
    }) {
      commit("showSnackbar", {
        text,
        color
      });
    },
    login({
      commit
    }, user) {
      return new Promise((resolve, reject) => {
        commit("auth_request");
        axios
          .post("/api/login", {
            email: user.email,
            password: user.password
          })
          .then(res => {
            if (res.data.ok) {
              const token = res.data.token;
              const user = res.data.user;
              axios.defaults.headers.common["Authorization"] = token;
              commit("auth_success", {
                token,
                user
              });
              resolve(res.data.message);
            }
          })
          .catch(err => {
            commit("auth_error");
            if (err.response) {
              console.error(err.response.data);
              reject(err);
            }
          });
      });
    }
  },
  getters: {
    getFullNameUser: state => {
      if (state.user) {
        return state.user.first_name + " " + state.user.last_name;
      }
    },
    isLoggedIn: state => !!state.token,
    authStatus: state => state.status,
    getUserId: state => {
      return state.user._id;
    },
    getUserFullName: state => id => {
      if (id) {
        let user = state.users.find(user => user._id == id);
        return user ? user.name : "ELIMINADO";
      }
      return "";
    }
  }
});