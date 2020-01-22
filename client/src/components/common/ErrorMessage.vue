  
<template>
  <v-snackbar :color="snackbarColor" :timeout="3000" v-model="snackbar">
    {{ snackbarText }}
    <v-btn text @click="snackbar = false">Cerrar</v-btn>
  </v-snackbar>
</template>

<script>
export default {
  computed: {
    snackbar: {
      get() {
        return this.$store.state.errorModule.showErrorMessage;
      },
      set(newValue) {
        this.$store.state.errorModule.showErrorMessage = newValue;
      }
    },
    snackbarText() {
      return this.$store.state.errorModule.errorMessage;
    },
    snackbarColor() {
      return "error";
    }
  }
};
</script>

<style lang="scss" scoped>
</style>