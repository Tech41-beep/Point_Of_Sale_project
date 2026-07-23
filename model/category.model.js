const { default: mongoose } = require("mongoose");

const schema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    note: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Category = mongoose.model("Category", schema);

module.exports = Category;
