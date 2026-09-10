const Product = require("../model/product.model");
const Order = require("../model/order.model");

const listProducts = async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();
    const limit = Math.min(Math.max(Number(req.query.limit) || 24, 1), 25);
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
    ];
    const products = await Product.find(filter)
      .select("name code salePrice currentStockQuantity imageUrl category")
      .populate("category", "name")
      .sort({ name: 1 }).limit(limit).lean();
    return res.json({ success: true, result: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load products." });
  }
};

const createOrder = async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (!items.length) return res.status(400).json({ success: false, message: "Your cart is empty." });
    if (items.length > 25) return res.status(400).json({ success: false, message: "Too many items in one order." });

    const quantities = new Map();
    for (const item of items) {
      const id = String(item.productId || "");
      const quantity = Number(item.quantity);
      if (!id || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ success: false, message: "Each item needs a valid product and quantity." });
      }
      quantities.set(id, (quantities.get(id) || 0) + quantity);
    }
    const products = await Product.find({ _id: { $in: [...quantities.keys()] } });
    if (products.length !== quantities.size) return res.status(400).json({ success: false, message: "One or more products are unavailable." });

    const orderedItems = [];
    for (const product of products) {
      const quantity = quantities.get(product._id.toString());
      const updated = await Product.findOneAndUpdate(
        { _id: product._id, currentStockQuantity: { $gte: quantity } },
        { $inc: { currentStockQuantity: -quantity } },
        { new: true },
      );
      if (!updated) {
        return res.status(409).json({ success: false, message: `${product.name} no longer has enough stock.` });
      }
      orderedItems.push({ product: product._id, name: product.name, price: product.salePrice, quantity });
    }
    const total = orderedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await Order.create({
      customer: req.user._id,
      orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
      items: orderedItems,
      total,
    });
    return res.status(201).json({ success: true, result: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to place your order." });
  }
};

const listOrders = async (req, res) => {
  const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, result: orders });
};

const listAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, result: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load customer orders." });
  }
};

module.exports = { listProducts, createOrder, listOrders, listAllOrders };
