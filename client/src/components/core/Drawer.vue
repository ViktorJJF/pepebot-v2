<template>
  <v-navigation-drawer color="#040505" dark v-model="drawer" app width="260">
    <v-list>
      <v-list-item>
        <v-img aspect-ratio="1.7" contain src="/images/mason.png"></v-img>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="title">{{ user }}</v-list-item-title>
          <p class="text-center">{{ email }}</p>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-divider class="mx-3 mb-3"></v-divider>
    <v-list nav flat>
      <template v-for="(item, i) in items">
        <v-list-item
          @click="selectItem(i)"
          :style="
            $route.name === item.to
              ? { backgroundColor: $store.state.logiaModule.logia.color }
              : ''
          "
          :key="i"
          :to="{ name: item.to }"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="item.text" />
          </v-list-item-content>
        </v-list-item>
      </template>
      <!-- expansion menu -->
      <v-list-group
        color="white"
        v-for="item in expansionItems"
        :key="item.title"
        v-model="item.active"
        :prepend-icon="item.icon"
      >
        <template v-slot:activator>
          <v-list-item-content>
            <v-list-item-title v-text="item.text"></v-list-item-title>
          </v-list-item-content>
        </template>
        <v-list-item
          :style="
            $route.name === subItem.to
              ? { backgroundColor: $store.state.logiaModule.logia.color }
              : ''
          "
          :to="{ name: subItem.to }"
          v-for="(subItem, idy) in item.items"
          :key="subItem.title"
          @click="selectItemExansive(idy)"
        >
          <v-list-item-icon>
            <v-icon>{{ subItem.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="subItem.title"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  data() {
    return {
      activeClass: "active",
      selectedItem: null,
      selectedItemExpansive: null,
      selectedItemStyle: {},
      items: [
        {
          icon: "mdi-chart-bar",
          text: "Dashboard",
          to: "statistics"
        },
        {
          icon: "mdi-account-card-details",
          text: "Miembros",
          to: "members"
        },
        // {
        //   icon: "mdi-format-list-checks",
        //   text: "Postulantes",
        //   to: "postulants"
        // },
        {
          icon: "mdi-format-list-checks",
          text: "Control de pagos",
          to: "paymentsControl"
        },
        {
          icon: "mdi-format-list-checks",
          text: "Control de Asistencias",
          to: "assistancesControl"
        }
        // {
        //   icon: "mdi-format-list-checks",
        //   text: "Reportes",
        //   to: "reportes"
        // }
        // {
        //   icon: "mdi-format-list-checks",
        //   text: "test",
        //   to: "test"
        // }
      ],
      expansionItems: [
        {
          icon: "mdi-settings",
          text: "Ajustes",
          items: [
            {
              icon: "mdi-format-list-checks",
              title: "Personalización",
              to: "personalization"
            },
            {
              icon: "mdi-format-list-checks",
              title: "Suscripción",
              to: "suscription"
            }
          ]
        }
      ]
    };
  },
  computed: {
    drawer: {
      get() {
        return this.$store.state.toolbar.drawerIcon;
      },
      set(newValue) {
        this.$store.state.toolbar.drawerIcon = newValue;
      }
    },
    user() {
      return this.$store.getters.getFullNameUser;
    },
    email() {
      return "Logia Masonica Francisco de Paula Gonzales Vigil";
    }
  },
  methods: {
    selectItem(i) {
      this.selectedItem = i;
      this.selectedItemExpansive = -1;
    },
    selectItemExansive(i) {
      this.selectedItemExpansive = i;
      this.selectedItem = -1;
    }
  }
};
</script>

<style lang="scss" scoped></style>
