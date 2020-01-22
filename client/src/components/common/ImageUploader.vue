<template>
  <div>
    <div class="mb-5">
      <v-btn @click="pickFile" rounded outlined color="info" class="text-none center">
        Escoge la imagen
        <v-icon right>mdi-upload</v-icon>
      </v-btn>
    </div>
    <v-img
      class="border-image mb-3"
      :src="imageUrl"
      aspect-ratio="1.7"
      contain
      v-if="!img || imageUrl"
    ></v-img>
    <v-img
      v-else
      class="border-image mb-3"
      :src="img"
      lazy-src="/images/image-placeholder.png"
      contain
      max-width="200"
      max-height="150"
    ></v-img>
    <input type="file" id="file" ref="file" v-on:change="handleFileUpload" style="display: none" />
    <!-- <div class="text-center" v-if="editMode">
      <div class="headline">{{ imageName }}</div>
      <v-btn color="success" @click="submitFile()">Subir</v-btn>
      <v-btn color="error" outlined @click="resetValues()">Cancelar</v-btn>
    </div>-->
  </div>
</template>

<script>
export default {
  props: {
    img: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      file: "",
      imageName: "",
      imageUrl: "",
      editMode: false
    };
  },
  mounted() {
    console.log("se monto la imagen");
  },
  methods: {
    pickFile() {
      console.log("lista de refs: ", this.$refs);
      this.$refs.file.click();
    },
    submitFile() {
      let formData = new FormData();
      formData.append("image", this.file);
      axios
        .post("/api/images/store", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(response => {
          console.log("SUCCESS!!");
          console.log("respuesta: ", response.data);
          //saving into store
          let newImagePath = response.data.path;

          this.resetValues();
        })
        .catch(error => {
          console.log(error);
          console.log("FAILURE!!");
        });
    },
    handleFileUpload(e) {
      this.editMode = true;
      this.file = this.$refs.file.files[0];
      const files = e.target.files;
      if (files[0] !== undefined) {
        this.imageName = files[0].name;
        if (this.imageName.lastIndexOf(".") <= 0) {
          return;
        }
        const fr = new FileReader();
        fr.readAsDataURL(files[0]);
        fr.addEventListener("load", () => {
          this.imageUrl = fr.result;
        });
      } else {
        this.imageName = "";
        this.imageUrl = "";
      }
    },
    resetValues() {
      this.imgUrl = "";
      this.imageName = "";
      this.file = "";
      this.editMode = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.border-image {
  border-style: solid;
  border-width: 1px;
}
</style>
