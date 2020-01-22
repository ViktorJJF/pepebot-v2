<template>
  <v-app>
    <router-view :key="$store.state.componentKey"></router-view>
    <success-message />
    <error-message />
    <loading-screen />
  </v-app>
</template>

<script>
import SuccessMessage from "@/components/common/SuccessMessage";
import ErrorMessage from "@/components/common/ErrorMessage";
import LoadingScreen from "@/components/common/LoadingScreen";
export default {
  components: {
    SuccessMessage,
    ErrorMessage,
    LoadingScreen
  },
  mounted() {}
};
</script>
<style lang="scss">
</style>
