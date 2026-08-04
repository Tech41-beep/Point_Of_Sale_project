const { default: mongoose } = require("mongoose");

const schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customers",
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    saleDate: {
      type: Date,
      required: true,
    },
    items: {
      type: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity must be at least 1"],
          },
          price: {
            type: Number,
            required: true,
            min: [0, "Price cannot be negative"],
          },
        },
      ],
      validate: {
        validator: (items) => items.length > 0,
        message: "At least one sale item is required",
      },
    },
    totalCost: {
      type: Number,
      required: true,
      min: [0, "Total cost cannot be negative"],
    },
    paidAmount: {
      type: Number,
      required: true,
      min: [0, "Paid amount cannot be negative"],
    },
    dueAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    changeAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "mobile_payment"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed"],
      required: true,
    },
    saleStatus: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "completed",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Sale", schema);
