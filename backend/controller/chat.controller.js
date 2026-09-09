const { GoogleGenAI } = require("@google/genai");
const Product = require("../model/product.model");
const ChatConversation = require("../model/chatConversation.model");
const ChatKnowledge = require("../model/chatKnowledge.model");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function chat(req, res) {
  try {
    // 1. Read input
    const { message: rawMessage, conversationId } =
      req.body ?? {};

    const message =
      typeof rawMessage === "string"
        ? rawMessage.trim()
        : "";

    // 2. Validate input
    if (!message) {
      return res.status(400).json({
        success: false,
        message: "A message is required.",
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "The message is too long.",
      });
    }

    // 3. Create or load conversation
    let conversation;

    if (conversationId) {
      conversation = await ChatConversation.findOne({
        _id: conversationId,
        user: req.user._id,
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found.",
        });
      }
    } else {
      conversation = await ChatConversation.create({
        user: req.user._id,
        title: message.slice(0, 100),
        messages: [],
      });
    }

    // 4. Search POS knowledge
    const knowledge = await ChatKnowledge.find(
      
      {
        $text: { $search: message },
        active: true,
      },
      {
        score: { $meta: "textScore" },
      },
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(5)
      .lean();

    const [products, productCount] = await Promise.all([
  Product.find()
    .select("name code salePrice currentStockQuantity")
    .sort({ name: 1 })
    .limit(50)
    .lean(),

  Product.countDocuments(),
]);


const recentHistory = conversation.messages
  .slice(-10)
  .map((item) => `${item.role}: ${item.content}`)
  .join("\n");

const interaction = await ai.interactions.create({
  model: "gemini-3.6-flash",
  input: `
    You are a helpful assistant for a point-of-sale application.
    Give concise and practical answers.

    Product information:
    Total number of products: ${productCount}
    Products supplied in this request:
    ${JSON.stringify(products)}

    POS knowledge:
    ${JSON.stringify(knowledge)}

    Recent conversation:
    ${recentHistory || "No previous messages."}

    Rules:
    - Answer product questions only from the supplied product data.
    - Use POS knowledge for questions about using the application.
    - Never invent products, prices, quantities, or instructions.
    - If the required information is unavailable, say so clearly.
    - Do not claim that you changed any data.

    User question: ${message}
  `,
});


const assistantMessage =
  interaction.output_text ||
  "I could not generate a response.";

conversation.messages.push(
  {
    role: "user",
    content: message,
  },
  {
    role: "assistant",
    content: assistantMessage,
  },
);

await conversation.save();

return res.json({
  success: true,
  conversationId: conversation._id,
  message: assistantMessage,
});

  } catch (error) {
    console.error("Error in chat controller:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the request.",
    });
  }
}

module.exports = chat;
