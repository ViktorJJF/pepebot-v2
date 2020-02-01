<template>
  <AuthLayoutBackground>XD</AuthLayoutBackground>
</template>

<script>
import AuthLayoutBackground from "@/components/common/AuthLayoutBackground";
export default {
  name: "overview",
  components: {
    AuthLayoutBackground
  },
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
