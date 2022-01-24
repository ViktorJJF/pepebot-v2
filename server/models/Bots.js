const mongoose = require("mongoose");

let Schema = mongoose.Schema;

var actionsSchema = new mongoose.Schema(
  {
    type: String,
    active: { type: Boolean, default: false },
    payload: {
      coords: String,
      isSpecial: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

let botsSchema = new Schema(
  {
    server: {
      type: String,
      required: [true, "El servidor es requerido"],
    },
    language: {
      type: String,
      required: [true, "El lenguaje del servidor es requerido"],
    },
    telegramGroupId: {
      type: String,
    },
    telegramId: {
      type: String,
    },
    telegramUsername: {
      type: String,
    },
    ogameEmail: {
      type: String,
      unique: true,
      required: [true, "El correo de ogame es necesario!"],
    },
    ogamePassword: {
      type: String,
      required: [true, "La contraseña de ogame es necesaria!"],
    },
    state: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    proxy: {
      type: String,
    },
    playerId: Number, // id de ogame en el universo del bot
    actions: [actionsSchema],
    gf_token: String,
  },
  {
    timestamps: true,
  }
);

mongoose.model("Bots", botsSchema).syncIndexes();

module.exports = mongoose.model("Bots", botsSchema);
