<template>
  <auth-layout-background title="WatchDog">
    <v-row justify="center">
      <v-card class="mt-6">
        <v-container fluid>
          <b class="mr-3">Intervalo</b>
          <v-text-field
            :disabled="watchDogAction.actionId?true:false"
            class="field-width d-inline-block"
            outlined
            placeholder="en milisegundos (Ejemplo: 300000 = 5min)"
            v-model="watchDogAction.milliseconds"
          ></v-text-field>
          <v-btn
            v-if="!watchDogAction.actionId"
            block
            color="primary"
            @click="watchDog(watchDogAction.milliseconds) "
            large
            :loading="loadingButton"
          >Activar</v-btn>
          <v-btn
            v-else
            block
            color="error"
            @click="stopWatchDog(watchDogAction.type) "
            large
            :loading="loadingButton"
          >Desactivar</v-btn>
        </v-container>
      </v-card>
    </v-row>
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
      watchDogAction: {
        actionId: null,
        type: "watchDog",
        milliseconds: null,
        payload: null
      },
      loadingButton: false
    };
  },
  mounted() {
    this.initialData();
  },
  methods: {
    initialData() {
      console.log("listando actions");
      axios
        .get(`/api/bots/${this.getBotId}/actions`)
        .then(res => {
          let watchDogActions = res.data.actions.filter(
            action => action.type === "watchDog"
          );
          if (watchDogActions.length > 0)
            this.watchDogAction = watchDogActions[0];
        })
        .catch(err => {
          console.error(err);
        });
    },
    watchDog(milliseconds) {
      console.log("esperando watchdog");
      this.loadingButton = true;
      axios
        .post(`/api/bots/${this.getBotId}/actions`, {
          action: "watchDog",
          payload: { milliseconds }
        })
        .then(res => {
          console.log("la respuesta");
          console.log(res.data);
          this.watchDogAction.actionId = res.data.actionId;
        })
        .catch(err => {
          console.error(err);
        })
        .finally(() => {
          this.loadingButton = false;
        });
    },
    stopWatchDog(type) {
      this.loadingButton = true;
      axios
        .get(`/api/bots/${this.getBotId}/stop-action/${type}`)
        .then(res => {
          console.log(res.data);
          // this.watchDogAction.actionId = null;
          this.watchDogAction.milliseconds = null;
        })
        .catch(err => {
          console.error(err);
        })
        .finally(() => {
          this.loadingButton = false;
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
.field-width {
  width: 500px;
}
</style>