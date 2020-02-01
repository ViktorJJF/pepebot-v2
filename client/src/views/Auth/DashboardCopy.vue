<template>
  <div>
    <v-row>
      <v-col cols="12" md="8" class="ligne">
        <v-container>
          <v-row>
            <v-col cols="12" sm="9" offset-md="1">
              <v-text-field
                label="Buscar"
                prepend-inner-icon="mdi-search"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="2" align="center" justify="center">
              <v-badge color="error" overlap class="mt-5">
                <template slot="badge">2</template>
                <v-icon color="accent">mdi-bell</v-icon>
              </v-badge>
            </v-col>
            <v-col cols="12" sm="12">
              <h1 class="headline mb-2 grey--text">Money status</h1>
              <template>
                <div id="app">
                  <GChart
                    type="ColumnChart"
                    :data="chartData"
                    :options="chartOptions"
                  ></GChart>
                </div>
              </template>
            </v-col>
            <v-col cols="12" sm="12">
              <h1 class="headline mb-2 grey--text">Budgets</h1>
            </v-col>
            <v-col cols="12" sm="8">
              <v-card>
                <v-list>
                  <v-list-item>
                    <v-list-item-avatar color="blue">
                      <v-icon dar>mdi-car</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>Auto & Transport</v-list-item-title>
                      <v-list-item-subtitle>$700 left</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-content align="right">
                      <v-list-item-title class="indigo--text"
                        >$1200</v-list-item-title
                      >
                      <v-list-item-subtitle>$700 left</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-avatar color="red">
                      <v-icon dar>mdi-car</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>Auto & Transport</v-list-item-title>
                      <v-list-item-subtitle>$700 left</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-content align="right">
                      <v-list-item-title class="indigo--text"
                        >$1200</v-list-item-title
                      >
                      <v-list-item-subtitle>$700 left</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-avatar color="orange">
                      <v-icon dar>mdi-car</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>Auto & Transport</v-list-item-title>
                      <v-list-item-subtitle>$700 left</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-content align="right">
                      <v-list-item-title class="indigo--text"
                        >$1200</v-list-item-title
                      >
                      <v-list-item-subtitle>$700 left</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider inset></v-divider>
                </v-list>
              </v-card>
            </v-col>
            <v-col cols="12" sm="4">
              <v-card class="mx-auto" max-height="400">
                <v-img
                  class="white--text align-end"
                  height="150px"
                  src="/images/ship1.jpg"
                ></v-img>
                <v-card-title class="pb-0">Cash Loan</v-card-title>
                <v-card-text class="text-primary">
                  <div>Up to 2 milllion dollars</div>
                  <div>Money the next date</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
      <v-col cols="12" md="4">
        <v-container>
          <v-row>
            <v-col cols="12" sm="12">
              <v-list-item>
                <v-list-item-avatar>
                  <v-img
                    src="/images/ship2.jpg"
                    contain
                    aspect-ratio="5"
                  ></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>AAE IDEA PRO</v-list-item-title>
                  <v-list-item-subtitle
                    >aaeideapro@gmail.com</v-list-item-subtitle
                  >
                </v-list-item-content>
                <v-list-item-action>
                  <v-icon>mdi-home</v-icon>
                </v-list-item-action>
              </v-list-item>
              <v-divider></v-divider>
            </v-col>
            <v-col cols="12">
              <v-list-item>
                <v-list-item-avatar color="grey">
                  <v-icon>mdi-currency-usd</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-subtitle>heisenberg</v-list-item-subtitle>
                  <v-list-item-title>$15,423</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-icon color="indigo" large>mdi-home</v-icon>
                </v-list-item-action>
              </v-list-item>
            </v-col>
            <v-col cols="12">
              <v-list-item>
                <v-list-item-avatar color="grey">
                  <v-icon>mdi-currency-usd</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-subtitle>heisenberg</v-list-item-subtitle>
                  <v-list-item-title>$15,423</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-icon color="indigo" large>mdi-home</v-icon>
                </v-list-item-action>
              </v-list-item>
            </v-col>
            <v-col cols="12">
              <v-list-item>
                <v-list-item-avatar color="grey">
                  <v-icon>mdi-currency-usd</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-subtitle>heisenberg</v-list-item-subtitle>
                  <v-list-item-title>$15,423</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-icon color="indigo" large>mdi-home</v-icon>
                </v-list-item-action>
              </v-list-item>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "overview",
  data() {
    return {
      chartData: [
        ["Year", "Sales", "Expenses", "Profit"],
        ["2014", 1000, 400, 200],
        ["2015", 1170, 460, 250],
        ["2016", 660, 1120, 300],
        ["2017", 1030, 540, 350],
        ["2018", 1025, 530, 302],
        ["2019", 1040, 560, 356]
      ],
      chartOptions: {
        chart: {
          title: "Company Performance",
          subtitle: "Sales, expenses and profits"
        }
      }
    };
  }
};
</script>

<style lang="scss" scoped>
.ligne {
  border-right: 1px solid #95a5a6;
}
</style>
