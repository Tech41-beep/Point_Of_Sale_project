const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
      default: "My Store",
    },

    currency: {
      type: String,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
      default: "USD",
    },

    taxRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 10,
    },

    defaultPaymentMethod: {
      type: String,
      enum: ["cash", "card", "qr"],
      default: "cash",
    },

    allowDiscount: {
      type: Boolean,
      default: true,
    },

    maxDiscount: {
      type: Number,
      min: 0,
      max: 100,
      default: 20,
    },

    allowNegativeStock: {
      type: Boolean,
      default: false,
    },

    lowStockThreshold: {
      type: Number,
      min: 0,
      default: 10,
    },

    autoPrintReceipt: {
      type: Boolean,
      default: true,
    },

    receiptFooter: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "Thank you for shopping with us!",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", settingsSchema);
