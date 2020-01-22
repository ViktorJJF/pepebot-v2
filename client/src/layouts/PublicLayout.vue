<template>
  <v-content class="public-bg">
    <div class="public-overlay">
      <router-view></router-view>
    </div>
  </v-content>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.public-bg {
  background-image: url("/images/ogame-bg2.jpg");
  background-repeat: no-repeat;
  background-size: cover;
}
.public-overlay {
  //   background: rgba(226, 106, 106, 0.3);
  height: 100%;
}
</style>