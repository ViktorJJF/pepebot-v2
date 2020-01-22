<template>
  <v-card></v-card>
</template>

<script>
export default {
  props: {
    id: {
      type: Number
    }
  },
  mounted() {
    this.initialData();
  },
  methods: {
    async initialData() {
      this.dataTableLoading = true;
      await this.$store.dispatch("membersModule/fetchMembers");
      this.dataTableLoading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>