const Sale = require("../model/sale.model");
const Product = require("../model/product.model");
const calculatePaymentStatus = require("../helpers/calculatePaymentStatus");


//step 
//1. Create a new sale document with the provided data, including customer, invoice number, sale date, items, paid amount, payment method, and sale status. Validate the input data and ensure that the required fields are present. Normalize the items array to ensure that each item has a valid product ID, quantity, and price. Check if the products exist and if there is enough stock for each item. Calculate the total cost of the sale based on the items' quantities and prices. Calculate the due amount and change amount based on the paid amount. Determine the payment status based on the total cost and paid amount. If the sale status is "completed", update the stock quantity of each product by subtracting the sold quantity. Save the new sale document to the database and return a success response with the created sale.
//2. Retrieve all sales documents from the database, with optional pagination, sorting, and searching based on query parameters. Populate the customer, items' product, and user fields for each sale. Return a success response with the retrieved sales, total items count, and current page information.
//3. Retrieve a single sale document by its ID, populating the customer, items' product, and user fields. Return a success response with the retrieved sale or an error response if the sale is not found.
//4. Retrieve a single sale document by its invoice number, populating the customer, items' product, and user fields. Return a success response with the retrieved sale or an error response if the sale is not found.
//5. Update an existing sale document by its ID, allowing updates to the paid amount, payment method, and sale date. Recalculate the due amount, change amount, and payment status based on the updated paid amount. Save the updated sale document and return a success response with the updated sale.
//6. Delete an existing sale document by its ID. If the sale status is "completed", restore the stock quantity of each product by adding back the sold quantity. Delete the sale document from the database and return a success response with the deleted sale or an error response if the sale is not found.
const createSale = async (req, res) => {
  try {
    const {
      customer,
      invoiceNumber,
      saleDate,
      items,
      paidAmount,
      paymentMethod,
      saleStatus,
    } = req.body;

    if (!customer || !invoiceNumber || !saleDate) {
      return res.status(400).json({
        success: false,
        message: "Customer, invoice number, and sale date are required",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one sale item is required",
      });
    }

    const normalizedItems = items.map((item) => ({
      product: item.product,
      quantity: Number(item.quantity),
      price: Number(item.price),
    }));

    for (const item of normalizedItems) {
      if (item.quantity < 1 || item.price < 0) {
        return res.status(400).json({
          success: false,
          message: "Item quantity and price are invalid",
        });
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with id ${item.product} not found`,
        });
      }

      if (product.currentStockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${product.name}`,
        });
      }
    }

    const totalCost = normalizedItems.reduce(
      (total, item) => total + item.quantity * item.price,
      0,
    );

    const paid = Number(paidAmount);
    if (Number.isNaN(paid) || paid < 0) {
      return res.status(400).json({
        success: false,
        message: "Paid amount is invalid",
      });
    }

    const status = saleStatus || "completed";

    if (status === "completed") {
      for (const item of normalizedItems) {
        const product = await Product.findById(item.product);
        product.currentStockQuantity -= item.quantity;
        await product.save();
      }
    }

    const newSale = await Sale.create({
      customer,
      invoiceNumber: invoiceNumber.trim(),
      saleDate,
      items: normalizedItems,
      totalCost,
      paidAmount: paid,
      dueAmount: Math.max(totalCost - paid, 0),
      changeAmount: Math.max(paid - totalCost, 0),
      paymentMethod,
      paymentStatus: calculatePaymentStatus(totalCost, paid),
      saleStatus: status,
      user: req.user._id,
    });

    return res.status(201).json({
      success: true,
      result: newSale,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Invoice number already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllSales = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const querySearch = {};

    if (req.query.search) {
      querySearch.$or = [
        { invoiceNumber: { $regex: req.query.search, $options: "i" } },
        { saleStatus: { $regex: req.query.search, $options: "i" } },
        { paymentStatus: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const sortOption = req.query.sort
      ? req.query.sort.split(",").join(" ")
      : "-createdAt";

    const sales = await Sale.find(querySearch)
      .populate("customer")
      .populate("items.product")
      .populate("user")
      .skip(skip)
      .limit(limit)
      .sort(sortOption);

    const totalItems = await Sale.countDocuments(querySearch);

    return res.status(200).json({
      success: true,
      result: sales,
      totalItems,
      page,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const findOne = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("customer")
      .populate("items.product")
      .populate("user");

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    return res.status(200).json({
      success: true,
      result: sale,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const findOneByCode = async (req, res) => {
  try {
    const sale = await Sale.findOne({ invoiceNumber: req.params.code })
      .populate("customer")
      .populate("items.product")
      .populate("user");

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    return res.status(200).json({
      success: true,
      result: sale,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    if (req.body.paidAmount !== undefined) {
      const paid = Number(req.body.paidAmount);
      sale.paidAmount = paid;
      sale.dueAmount = Math.max(sale.totalCost - paid, 0);
      sale.changeAmount = Math.max(paid - sale.totalCost, 0);
      sale.paymentStatus = calculatePaymentStatus(sale.totalCost, paid);
    }

    if (req.body.paymentMethod) {
      sale.paymentMethod = req.body.paymentMethod;
    }

    if (req.body.saleDate) {
      sale.saleDate = req.body.saleDate;
    }

    await sale.save();

    return res.status(200).json({
      success: true,
      result: sale,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    if (sale.saleStatus === "completed") {
      for (const item of sale.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.currentStockQuantity += item.quantity;
          await product.save();
        }
      }
    }

    await Sale.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Sale deleted successfully",
      result: sale,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createSale,
  getAllSales,
  findOne,
  findOneByCode,
  updateSale,
  deleteSale,
};
