<template>
  <auth-layout-background title="Escaneos">
    <v-text-field outlined label="Jugador" v-model="username"></v-text-field>
    <v-btn color="info" @click="scan(username)">Escanear</v-btn>
  </auth-layout-background>
</template>

<script>
import axios from "axios";
import AuthLayoutBackground from "@/components/common/AuthLayoutBackground";
export default {
  components: {
    AuthLayoutBackground
  },
  data() {
    return {
      username: ""
    };
  },
  mounted() {},
  methods: {
    scan(username) {
      axios
        .post(`/api/bots/${this.getBotId}/actions`, {
          action: "scan",
          payload: { username: username }
        })
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          console.error(err);
        });
    }
  },
  computed: {
    getBotId() {
      return this.$store.getters["botsModule/getBotId"];
    }
  }
};
</script>

<style lang="scss" scoped>
</style>