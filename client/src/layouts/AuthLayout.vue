<template>
  <v-app>
    <toolbar></toolbar>
    <v-content class="auth-bg">
      <div class="bg-padding" v-if="bots">
        <router-view></router-view>
      </div>
    </v-content>
  </v-app>
</template>

<script>
import Toolbar from "@/components/core/Toolbar";
export default {
  components: {
    Toolbar
  },
  computed: {
    theme() {
      return this.$vuetify.theme.dark ? "dark" : "light";
    },
    bots() {
      return this.$store.state.botsModule.bots;
    },
    activeUserId() {
      return this.$store.state.authModule.user._id;
    }
  },
  async mounted() {
    console.log("se mandara este userId: ", this.activeUserId);
    await this.$store.dispatch("botsModule/list", this.activeUserId);
    console.log("bots es: ", this.bots);
  }
};
</script>

<style lang="scss" scoped>
.bg-padding {
  height: 100%;
  padding-top: 20px;
  padding-left: 15px;
  padding-right: 15px;
}
.auth-bg {
  background-image: url("/images/nebulosa1.jpg");
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
