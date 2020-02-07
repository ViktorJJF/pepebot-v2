<template>
  <auth-layout-background title="Expediciones">
    <v-container fluid>
      <v-row>
        <v-col cols="12" sm="4">
          <v-card>
            <v-container fluid>
              <h2>Planeta Origen</h2>
              <v-text-field
                clearable
                dense
                outlined
                class="d-inline-block"
                placeholder="1:124:12"
                v-model="origin"
              ></v-text-field>
              <h2>Naves</h2>
              <v-row dense justify="space-between" v-for="(ship,idx) in ships" :key="idx">
                <v-col cols="12" sm="9">
                  <p>{{ ship.name }}</p>
                </v-col>
                <v-col cols="12" sm="3">
                  <v-text-field
                    @keyup.enter="beginExpeditions()"
                    type="number"
                    v-model="ship.qty"
                    hide-details
                    dense
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="info"
                @click="beginExpeditions()"
                v-show="expeditions.length==0"
              >Comenzar expediciones</v-btn>
              <v-btn
                @click="stopExpedition()"
                color="error"
                v-show="expeditions.length>0"
              >Detener expediciones</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" sm="8">
          <v-card v-if="expeditions.length>0">
            <v-list>
              <h3 class="ma-6">Actualmente estas mandando expediciones de:</h3>
              <v-list-item v-for="ship in expeditions" :key="ship.id">
                <v-list-item-avatar color="blue">
                  <v-icon dark>mdi-ship-wheel</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ship.name}}</v-list-item-title>
                  <v-list-item-subtitle>Cantidad: {{ship.qty}}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-content align="right">
                  <v-list-item-title class="indigo--text">
                    <v-chip class="ma-2" color="success" text-color="white">{{ship.qty}}</v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
          <v-alert type="error" v-else>No tienes expediciones en proceso</v-alert>
        </v-col>
      </v-row>
    </v-container>
  </auth-layout-background>
</template>

<script>
import AuthLayoutBackground from "@/components/common/AuthLayoutBackground";

export default {
  components: {
    AuthLayoutBackground
  },
  data() {
    return {
      origin: "",
      expeditions: [],
      ships: [
        {
          id: 1,
          name: "Nave pequeña de carga",
          qty: 0
        },
        {
          id: 2,
          name: "Nave Grande de carga",
          qty: 0
        },
        {
          id: 3,
          name: "Cazador Ligero",
          qty: 0
        },
        {
          id: 4,
          name: "Cazador Pesado",
          qty: 0
        },
        {
          id: 5,
          name: "Crucero",
          qty: 0
        },
        {
          id: 6,
          name: "Nave de batalla",
          qty: 0
        },
        {
          id: 7,
          name: "Colonizador",
          qty: 0
        },
        {
          id: 8,
          name: "Reciclador",
          qty: 0
        },
        {
          id: 9,
          name: "Sonda de espionaje",
          qty: 0
        },
        {
          id: 10,
          name: "Bombardero",
          qty: 0
        },
        {
          id: 11,
          name: "Destructor",
          qty: 0
        },
        {
          id: 12,
          name: "Estrella de la muerte",
          qty: 0
        },
        {
          id: 13,
          name: "Acorazado",
          qty: 0
        },
        {
          id: 14,
          name: "Segador",
          qty: 0
        },
        {
          id: 15,
          name: "Explorador",
          qty: 0
        }
      ]
    };
  },
  methods: {
    beginExpeditions() {
      this.expeditions = [];
      axios
        .post(`/api/bots/${this.getBotId}/actions`, {
          action: "expeditions",
          payload: { origin: this.origin }
        })
        .then(res => {
          console.log("la respuesta");
          console.log(res.data);
        })
        .catch(err => {
          console.error(err);
        })
        .finally(() => {
          // this.loadingButton = false;
        });
      this.ships.forEach(ship => {
        if (ship.qty > 0) this.expeditions.push(ship);
      });
    },
    stopExpedition() {
      this.expeditions = [];
    }
  },
  computed: {
    getBotId() {
      return this.$store.getters["botsModule/getBotId"];
    }
  }
};
</script>

<style lang="scss" scoped>
</style>