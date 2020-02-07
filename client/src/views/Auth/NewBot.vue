<template>
  <auth-layout-background title="Creando bots">
    <v-row class="fill-height">
      <v-container fluid>
        <v-row>
          <v-col cols="12" sm="6" class="line">
            <h2 class="display-1">Datos del servidor</h2>
            <v-alert
              v-show="bot.server"
              dense
              type="success"
            >La Url será: https://{{bot.server}}-{{bot.language}}.ogame.gameforge.com</v-alert>
            <v-row align="center">
              <v-col cols="12" sm="2">
                <b>Servidor:</b>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="bot.server"
                  outlined
                  dense
                  width="100"
                  hide-details
                  placeholder="s167"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col cols="12" sm="2">
                <b class="mr-3">Idioma:</b>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select v-model="bot.language" dense outlined hide-details :items="['es']"></v-select>
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col cols="12" sm="2">
                <b class="mr-3">ID de Telegram:</b>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="bot.telegramId"
                  outlined
                  dense
                  width="100"
                  hide-details
                  placeholder="-339549424"
                ></v-text-field>
                <v-btn small color="info" @click="testTelegramId(bot.telegramId)">Probar</v-btn>
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col cols="12" sm="2">
                <b class="mr-3">ID Grupo de Telegram:</b>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="bot.telegramGroupId"
                  outlined
                  dense
                  width="100"
                  hide-details
                  placeholder="-339549424"
                ></v-text-field>
                <v-btn small color="info" @click="testTelegramGroupId(bot.telegramGroupId)">Probar</v-btn>
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col cols="12" sm="2">
                <b class="mr-3">Proxy:</b>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="bot.proxy"
                  outlined
                  dense
                  width="100"
                  hide-details
                  placeholder="159.203.163.19:3128"
                ></v-text-field>
              </v-col>
            </v-row>
            <h2 class="display-1 mt-3">Datos de inicio de sesión</h2>
            <v-alert
              class="mt-3"
              v-show="ogameLoginState===true"
              type="success"
              icon="mdi-account-check"
              dense
            >Sesión iniciada correctamente</v-alert>
            <v-alert
              v-show="ogameLoginState===false"
              type="error"
              icon="mdi-alert-circle"
              dense
            >Datos de inicio de sesión incorrectos</v-alert>
            <v-row align="center">
              <v-col cols="12" sm="2">
                <b>Correo:</b>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="bot.ogameEmail"
                  outlined
                  dense
                  width="100"
                  hide-details
                  placeholder="usuarioOgame1@gmail.com"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col cols="12" sm="2">
                <b>Contraseña:</b>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  type="password"
                  v-model="bot.ogamePassword"
                  outlined
                  dense
                  width="100"
                  hide-details
                  placeholder="Contraseña de ogame"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-btn
              class="mr-3"
              color="primary"
              :loading="ogameLoginLoading"
              @click="testOgameLogin(bot.ogameEmail,bot.ogamePassword)"
            >Probar Login de Ogame</v-btn>
            <v-btn color="info" @click="beginBot()" :disabled="!ogameLoginState">Actualizar datos</v-btn>
            <!-- <v-btn color="error" @click="stopBot()" v-else>DETENER</v-btn> -->
          </v-col>
          <v-col cols="12" sm="6">
            <h2 class="display-1">Listado de bots</h2>
            <v-alert type="error" v-if="bots.length==0">Aún no cuentas con bots creados</v-alert>
            <v-row v-else>
              <v-col cols="12">
                <v-card>
                  <v-list>
                    <v-list-item v-for="bot in bots" :key="bot._id">
                      <v-list-item-avatar color="blue">
                        <v-icon dark>mdi-robot</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-content>
                        <v-list-item-title>Pepebot</v-list-item-title>
                        <v-list-item-subtitle>{{bot.createdAt}}</v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-content align="right">
                        <v-list-item-title class="indigo--text">
                          <v-chip class="ma-2" color="success" text-color="white">Activo</v-chip>
                        </v-list-item-title>
                        <v-list-item-subtitle class="indigo--text">
                          <v-btn color="error" small @click="deleteBot(bot._id)">Eliminar</v-btn>
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                    <v-divider inset></v-divider>
                  </v-list>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-row>
  </auth-layout-background>
</template>

<script>
import AuthLayoutBackground from "@/components/common/AuthLayoutBackground";

export default {
  components: {
    AuthLayoutBackground
  },
  data() {
    return {
      dialog: false,
      bot: {
        _id: null,
        server: "s167",
        language: "es",
        telegramId: null,
        telegramGroupId: "-339549424",
        ogameEmail: "",
        ogamePassword: "",
        state: null,
        proxy: null
      },
      ogameLoginLoading: false,
      ogameLoginState: null,
      bots: [],
      server2: { state: false }
    };
  },
  created() {
    console.log("inicializando");
    this.initialData();
  },
  methods: {
    testTelegramGroupId(sender) {
      axios
        .post("/api/bots/telegram", { sender })
        .then(res => {
          console.log(res.data);
        })
        .catch(err => {
          console.error(err);
        });
    },
    testTelegramId(sender) {
      console.log("se enviara este sender: ", sender);
      axios
        .post("/api/bots/telegram", { sender })
        .then(res => {
          console.log(res.data);
        })
        .catch(err => {
          console.error(err);
        });
    },
    async initialData() {
      this.bots = this.$store.state.botsModule.bots;
      console.log("los bots: ", this.bots);
      console.log("los bots: ", this.bots.length);
      if (this.bots.length > 0) Object.assign(this.bot, this.bots[0]);
    },
    async beginBot() {
      let newBot = {
        server: this.bot.server,
        language: this.bot.language,
        telegramId: this.bot.telegramId,
        telegramGroupId: this.bot.telegramGroupId,
        ogameEmail: this.bot.ogameEmail,
        ogamePassword: this.bot.ogamePassword,
        proxy: this.bot.proxy,
        state: true
      };
      if (this.bots.length == 0) {
        let createdBot = await this.$store.dispatch(
          "botsModule/createBot",
          newBot
        );
        Object.assign(this.bot, createdBot);
      } else {
        //update bot
        this.updateBot();
      }
      console.log("empezando bot");
      await this.$store.dispatch("botsModule/beginBot", {
        ogameEmail: this.bot.ogameEmail,
        ogamePassword: this.bot.ogamePassword,
        botId: this.bot._id
      });
    },
    async updateBot() {
      console.log("actualizando botw");
      await this.$store.dispatch("botsModule/updateBot", {
        id: this.bot._id,
        payload: this.bot
      });
    },
    async deleteBot(id) {
      if (confirm("¿Seguro que deseas eliminar este bot?")) {
        await this.$store.dispatch("botsModule/deleteBot", id);
        this.bot = {};
      }
    },
    testOgameLogin() {
      this.ogameLoginLoading = true;
      axios
        .post("/api/bots/test", {
          ogameEmail: this.bot.ogameEmail,
          password: this.bot.ogamePassword,
          proxy: this.bot.proxy
        })
        .then(res => {
          console.log(res.data);
          this.ogameLoginState = true;
        })
        .catch(err => {
          console.error(err);
          this.ogameLoginState = false;
        })
        .finally(() => {
          this.ogameLoginLoading = false;
        });
    },
    stopBot() {
      axios
        .get(`/api/bots/${this.bot._id}/stop`)
        .then(res => {
          console.log(res);
          this.$store.commit(
            "successModule/showSuccess",
            "Bot detenido con éxito",
            {
              root: true
            }
          );
          this.bot.state = false;
          console.log("deteniendo bot");
        })
        .catch(err => {
          console.error(err);
        });
    }
  },
  computed: {
    activeBot() {
      return this.$store.state.botsModule.bots[0];
    }
  }
};
</script>

<style lang="scss" scoped>
.line {
  border-right: 1px solid #95a5a6;
}
</style>