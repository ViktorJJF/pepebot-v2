<template>
  <v-card outlined>
    <v-row no-gutters>
      <v-col cols="12" sm="5" :style="{ background: color }" class="pa-3">
        <v-row align="center" justify="center">
          <v-icon color="white" :size="90">{{ icon }}</v-icon>
        </v-row>
      </v-col>
      <v-col sm="7">
        <v-row align="center">
          <v-col cols="12" sm="12">
            <p class="display-1 font-weight-bold center-paragraph">{{ qty }}</p>
            <p class="title center-paragraph">{{ title }}</p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  props: ["title", "qty", "color", "icon"]
};
</script>

<style lang="scss" scoped>
.center-paragraph {
  text-align: center;
}
.iconBackgroundGreen {
  background: #91c968;
}
</style>
