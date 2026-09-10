const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      quantity: { type: Number, required: true, min: 1 },
    }],
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["placed", "processing", "completed", "cancelled"], default: "placed" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
