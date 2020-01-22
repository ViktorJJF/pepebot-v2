<template>
  <v-container fluid class="overlay-ogame">
    <v-card class="overflow-hidden">
      <v-app-bar
        absolute
        color="#43a047"
        dark
        shrink-on-scroll
        prominent
        src="https://picsum.photos/1920/1080?random"
        fade-img-on-scroll
        scroll-target="#scrolling-techniques-5"
        scroll-threshold="500"
      >
        <template v-slot:img="{ props }">
          <v-img v-bind="props" gradient="to top right, rgba(55,236,186,.7), rgba(25,32,72,.7)"></v-img>
        </template>

        <v-app-bar-nav-icon></v-app-bar-nav-icon>

        <v-toolbar-title>Title</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon>
          <v-icon>mdi-magnify</v-icon>
        </v-btn>

        <v-btn icon>
          <v-icon>mdi-heart</v-icon>
        </v-btn>

        <v-btn icon>
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </v-app-bar>
      <v-sheet id="scrolling-techniques-5" class="overflow-y-auto" max-height="600">
        <v-container style="height: 1500px;"></v-container>
      </v-sheet>
    </v-card>
    <v-card class="background-ogame">
      <v-container>
        <h1>Distribucion del universo</h1>
        <div v-for="(galaxy,idx) in universeDistribution" :key="idx+'i'">
          <p>Distribución de la Galaxia {{idx+1}}</p>
          <v-simple-table dense>
            <template v-slot:default>
              <thead>
                <tr>
                  <th>SS</th>
                  <th v-for="i in 15" :key="i">{{ i }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(solarSystem,idy) in galaxy" :key="idx+idy+'j'">
                  <td width="1">{{idy+1}}</td>
                  <td
                    style="width:5px !important;"
                    v-for="(planet,idz) in solarSystem"
                    :key="idx+idy+idz+'k'"
                  >
                    <div class="box1" v-show="planet"></div>
                    <div class="box2" v-show="!planet"></div>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </div>
      </v-container>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      universe: [],
      universeDistribution: []
    };
  },
  created() {
    let [maxGalaxies, maxSolarSystems, maxPlanetsPerSS] = [5, 499, 15];
    for (let k = 0; k < maxGalaxies; k++) {
      this.universeDistribution[k] = [];
      for (let i = 0; i < maxSolarSystems; i++) {
        this.universeDistribution[k][i] = [];
        for (let j = 0; j < maxPlanetsPerSS; j++) {
          this.universeDistribution[k][i][j] = false;
        }
      }
    }
    // this.initialData();
  },
  methods: {
    initialData() {
      axios
        .get("/api/universe")
        .then(res => {
          let planets = res.data;
          planets.forEach(planet => {
            var coords = planet.coords.split(":").map(x => parseInt(x));
            this.universeDistribution[coords[0] - 1][coords[1] - 1][
              coords[2] - 1
            ] = true;
          });
          this.universeDistribution = this.universeDistribution.slice();
        })
        .catch(err => {
          console.error(err);
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.box1 {
  background-color: green;
  width: 20px;
  height: 20px;
  display: inline-block;
  border: 1px solid #000000;
}
.box2 {
  background-color: #b2b2b2;
  width: 20px;
  height: 20px;
  display: inline-block;
  border: 1px solid #000000;
}
.overlay-ogame {
  background-color: aqua;
  opacity: 1;
}
.background-ogame {
  background-image: url("https://www.juegaenred.com/wp-content/uploads/2019/10/OGame-Wallpapers-4.jpg");
  width: 100%;
  height: 100%;
}
</style>
