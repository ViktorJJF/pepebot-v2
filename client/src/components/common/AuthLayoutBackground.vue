<template>
  <v-container class="custom-background rounded pa-9">
    <h1 class="display-2 primary--text mb-3">{{title}}</h1>
    <v-divider></v-divider>
    <slot></slot>
  </v-container>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: "Título"
    }
  }
};
</script>

<style lang="scss" scoped>
.custom-background {
  background-color: #fafafa;
  height: 95%;
}
.rounded {
  border-radius: 30px;
}
</style>