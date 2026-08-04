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
    phone: {
      type: String,
    },
     address: {
      type: String,
    },
     note: {
      type: String,
    }
  },
  {
    timestamps: true,
  },
);

const Customers = mongoose.model("Customers", schema);

module.exports = Customers;
