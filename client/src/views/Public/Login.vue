<template>
  <v-container fluid class="fill-height pa-3">
    {{$store.state.authModule.user}}
    <v-row align="center" justify="center" dense>
      <v-card class="elevation-12">
        <v-window v-model="step">
          <v-window-item>
            <v-row>
              <v-col cols="12" sm="8">
                <v-card-text class="mt-12">
                  <h1
                    class="text-center display-2 teal--text primary--text"
                  >Iniciar sesión a PepeBot</h1>
                  <div class="text-center mt-4">
                    <v-btn class="mx-2" fab color="black" outlined>
                      <v-icon>mdi-facebook</v-icon>
                    </v-btn>
                    <v-btn class="mx-2" fab color="black" outlined>
                      <v-icon>mdi-google-plus</v-icon>
                    </v-btn>
                    <v-btn class="mx-2" fab color="black" outlined>
                      <v-icon>mdi-linkedin</v-icon>
                    </v-btn>
                  </div>
                  <h4 class="text-center mt-4">Asegura tu email para registrarte</h4>
                  <v-form>
                    <v-text-field
                      label="Email"
                      prepend-icon="mdi-email"
                      type="text"
                      color="primary"
                      v-model="user.email"
                    ></v-text-field>
                    <v-text-field
                      label="Contraseña"
                      prepend-icon="mdi-lock"
                      type="password"
                      color="primary"
                      v-model="user.password"
                    ></v-text-field>
                  </v-form>
                  <h3 class="text-center mt-3">Olvidaste tu contraseña?</h3>
                </v-card-text>
                <div class="text-center mt-3">
                  <v-btn rounded color="primary" dark @click="login()">Iniciar sesión</v-btn>
                </div>
              </v-col>
              <v-col cols="12" sm="4" class="primary">
                <v-card-text class="white--text mt-12">
                  <h1 class="text-center display-1">¿No tienes cuenta? Regístrate!</h1>
                  <!-- <h5 class="text-center">Ingresa tus detalles personales y empieza a botear</h5> -->
                </v-card-text>
                <div class="text-center">
                  <v-btn rounded outlined dark @click="step++">Ir a registro</v-btn>
                </div>
                <v-img src="/images/pepebot.png" aspect-ratio="2.7" contain class="mt-6"></v-img>
              </v-col>
            </v-row>
          </v-window-item>
          <v-window-item>
            <v-row class="fill-height">
              <v-col cols="12" sm="4" class="primary">
                <v-card-text class="white--text mt-12">
                  <!-- <v-icon dark size="40" class="mb-4">mdi-arrow-left-thick</v-icon> -->
                  <h1 class="text-center display-1">¿Ya tienes cuenta? Inicia sesión</h1>
                  <!-- <h5
                      class="text-center"
                  >Para mantenerte conectado, por favor ingresa con tu información personal</h5>-->
                </v-card-text>
                <div class="text-center">
                  <v-btn rounded outlined dark @click="step--">Ir a Iniciar sesión</v-btn>
                </div>
              </v-col>
              <v-col cols="12" sm="8">
                <v-card-text class="mt-12">
                  <h1 class="text-center display-2 teal--text primary--text">Crear cuenta</h1>
                  <div class="text-center mt-4">
                    <v-btn class="mx-2" fab color="black" outlined>
                      <v-icon>mdi-facebook</v-icon>
                    </v-btn>
                    <v-btn class="mx-2" fab color="black" outlined>
                      <v-icon>mdi-google-plus</v-icon>
                    </v-btn>
                    <v-btn class="mx-2" fab color="black" outlined>
                      <v-icon>mdi-linkedin</v-icon>
                    </v-btn>
                  </div>
                  <h4 class="text-center mt-4">Asegura tu correo para el registro</h4>
                  <v-form>
                    <v-text-field
                      prepend-icon="mdi-account"
                      label="Nombre"
                      type="text"
                      color="primary"
                    ></v-text-field>
                    <v-text-field
                      label="Email"
                      prepend-icon="mdi-email"
                      type="text"
                      color="primary"
                    ></v-text-field>
                    <v-text-field
                      label="Contraseña"
                      prepend-icon="mdi-lock"
                      type="password"
                      color="primary"
                    ></v-text-field>
                  </v-form>
                </v-card-text>
                <div class="text-center mt-5">
                  <v-btn rounded color="primary" dark>REGÍSTRATE</v-btn>
                </div>
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      step: 0,
      user: {
        email: "",
        password: ""
      }
    };
  },
  methods: {
    async login() {
      await this.$store.dispatch("authModule/userLogin", {
        email: this.user.email,
        password: this.user.password
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.centered {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  min-height: 100vh;
}
</style>