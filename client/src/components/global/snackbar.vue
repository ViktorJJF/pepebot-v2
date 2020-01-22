  
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
        return this.$store.state.successModule.showSuccessMessage;
      },
      set(newValue) {
        this.$store.state.successModule.showSuccessMessage = newValue;
      }
    },
    snackbarText() {
      return this.$store.state.successModule.successMessage;
    },
    snackbarColor() {
      return "success";
    }
  }
};
</script>

<style lang="scss" scoped>
</style>