const { default: mongoose } = require("mongoose");

const schema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    name:{
        type: String
    },
    phone: {
      type: String,
    },
    address:{
        type: String,
        required: true,
    },
    note :{
        type: String
    }
  },
  {
    timestamps: true,
  },
);

const Supplier = mongoose.model("Supplier", schema);

module.exports = Supplier;
