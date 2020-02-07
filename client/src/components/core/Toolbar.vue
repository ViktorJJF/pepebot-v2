<template>
  <v-navigation-drawer v-model="drawer" dark app>
    <template v-slot:img>
      <v-img src="/images/ship1.jpg" height="100%" class="transparent"></v-img>
    </template>
    <div class="drawer-overlay">
      <v-row column align="center">
        <v-col class="mt-10 mb-3 text-center">
          <v-img src="/images/pepebot.png" contain aspect-ratio="1.5"></v-img>
        </v-col>
      </v-row>
      <div class="text-center mb-3">
        <p class="white--text">{{user}}</p>
        <p class="white--text">{{email}}</p>
        <v-btn color="error" small @click="logout">Cerrar sesión</v-btn>
      </div>
      <div class="text-center mb-3">
        <v-btn color="info" small :to="{name:'newBot'}">Configurar bot</v-btn>
      </div>
      <v-divider></v-divider>
      <v-list>
        <v-list-item
          v-for="link in links"
          :key="link.id"
          router
          :to="link.route"
          active-class="border"
        >
          <v-list-item-action>
            <v-icon>{{ link.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ link.text }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-flex class="ma-2">
        <template>
          <v-carousel cycle dark height="230" hide-delimiter-background show-arrows-on-hover>
            <v-carousel-item v-for="(slide, i) in slides" :key="i">
              <v-sheet color="white" height="80%" align="center" tile>
                <v-row class="fill-height" align="center" justify="center">
                  <div class="grey--text">
                    <h4>Bots activos</h4>
                    <p class="ma-3">{{ slide }}</p>
                    <v-btn outlined color="indigo">Leer más</v-btn>
                  </div>
                </v-row>
              </v-sheet>
            </v-carousel-item>
          </v-carousel>
        </template>
      </v-flex>
    </div>
  </v-navigation-drawer>
</template>

<script>
export default {
  data() {
    return {
      drawer: true,
      links: [
        // { icon: "mdi-home", text: "Resumen", route: { name: "overview" } },
        // { icon: "mdi-home", text: "Escaneo", route: { name: "scan" } },
        // { icon: "mdi-home", text: "Hunter", route: { name: "hunter" } },
        { icon: "mdi-cat", text: "WatchDog", route: { name: "watchDog" } },
        {
          icon: "mdi-cat",
          text: "Expediciones",
          route: { name: "expeditions" }
        }
      ],
      slides: [
        "Este bot esta muy activo !! fwefwe",
        "Este bot esta muy activo !! fwefwe",
        "Este bot esta muy activo !! fwefwe"
      ]
    };
  },
  methods: {
    async logout() {
      await this.$store.dispatch("authModule/userLogout");
    }
  },
  computed: {
    user() {
      return this.$store.getters["authModule/fullname"];
    },
    email() {
      return this.$store.getters["authModule/email"];
    }
  }
};
</script>

<style lang="scss" scoped>
.border {
  border-left: 4px solid #dc9e47;
}
.drawer-bg {
  background-image: url("/images/ship1.jpg");
}
// .drawer-overlay {
//   background: rgba(226, 106, 106, 0.2);
// }
.transparent {
  opacity: 0.6;
}
</style>
