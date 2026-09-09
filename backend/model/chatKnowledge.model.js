const mongoose = require("mongoose");

const chatKnowledgeSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    keywords: [{
      type: String,
      lowercase: true,
      trim: true,
    }],
    category: {
      type: String,
      default: "general",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

chatKnowledgeSchema.index({
  question: "text",
  answer: "text",
  keywords: "text",
});

module.exports = mongoose.model("ChatKnowledge", chatKnowledgeSchema);