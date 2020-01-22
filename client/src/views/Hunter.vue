<template>
  <v-container fluid>
    <h2>Actividades del jugador ViktorJJF</h2>
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">Planetas</th>
            <th
              v-for="i in playerstoHunt[0].planets[0].activities.length"
              :key="i"
              class="text-left"
            >8:15</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(planet,idx) in playerstoHunt[0].planets" :key="idx">
            <td>{{ planet.name }} - {{planet.coords}}</td>
            <td v-for="(activity,idy) in planet.activities" :key="idy">
              <span class="on-activity">{{ activity.state }}</span>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      playerstoHunt: []
    };
  },
  mounted() {
    this.playerstoHunt.push({ _id: 1, nickname: "ViktorJJF", planets: [] });
    let planet = { coords: "4:244:10", name: "Planeta Sur", activities: [] };
    let activities = { id: 1, date: new Date(), state: "on" };
    for (let i = 0; i < 10; i++) {
      this.playerstoHunt[0].planets.push(planet);
      for (let j = 0; j < 10; j++) {
        this.playerstoHunt[0].planets[i].activities.push(activities);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.on-activity {
  color: red;
}
</style>