const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    type: String,
    enum: ["Error", "Info"],
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Logs", schema);
