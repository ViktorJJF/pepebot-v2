<template>
  <v-app id="keep">
    <toolbar />
    <drawer />
    <v-content>
      <v-fade-transition mode="out-in">
        <router-view></router-view>
      </v-fade-transition>
    </v-content>
  </v-app>
</template>

<script>
import Drawer from "@/components/core/Drawer";
import Toolbar from "@/components/core/Toolbar";
export default {
  components: {
    Drawer,
    Toolbar
  },
  data() {
    return {
      componentKey: 0
    };
  },
  props: {
    source: String
  },
  mounted() {
    this.initialData();
  },
  methods: {
    async initialData() {
      // this.dataTableLoading = true;

      await this.$store.dispatch("logiaModule/fetchLogia");
      this.$vuetify.theme.themes.light.primary = this.$store.state.logiaModule.logia.color;
      this.$store.commit("successModule/showSuccess", "Bienvenido");
      console.log("se monto app2");
    }
  }
};
</script>

<style></style>
