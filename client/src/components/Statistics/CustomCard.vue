<template>
  <v-container fluid>
    <v-row justify="center">
      <v-card width="90%">
        <v-card-title class="primary">
          <v-icon dark size="30" class="mr-4">{{ icon }}</v-icon>
          <h2 class="headline white--text font-weight-light">{{ title }}</h2>
        </v-card-title>
        <v-container fluid>
          <slot name="content"></slot>
        </v-container>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: ["title", "icon"]
};
</script>

<style lang="scss" scoped></style>
