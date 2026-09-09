const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    helpful: {
      type: Boolean,
      default: null,
    },
  },
  { timestamps: true },
);

const chatConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    messages: [chatMessageSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "ChatConversation",
  chatConversationSchema,
);