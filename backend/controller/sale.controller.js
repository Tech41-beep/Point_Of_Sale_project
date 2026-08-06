const Sale = require("../model/sale.model");
const Product = require("../model/product.model");
const calculateTotalAmount = require("../helpers/calculatePaymentStatus");
const { generateInvoiceNumber } = require("../controller/counter.controller");

const createSale = async (req, res, next) => {
  try {
    //1. fetch all products from the request body
    let { items, totalCost, paidAmount, customer, saleDate, paymentMethod } = req.body;
    if(!paidAmount){
      paidAmount = 0;
    }
    const productsIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productsIds } });
    console.log("productsIds", productsIds);
    console.log("products", products);

    // 2. validate the products and check if they exist in the database
    const productUpdate = [];
    for (const item of items) {
      const product = products.find(
        (p) => p._id.toString() === item.productId.toString(),
      );

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "One or more products not found",
        });
      }
      if (product.currentStockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is out of stock`,
        });
      }
      //update
      productUpdate.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $inc: { currentStockQuantity: -item.quantity } },
        }
      });
    } //loop end

    // 3. execute the stock and update
    await Product.bulkWrite(productUpdate);

    //4. calculate the payment status and total
    const paymentStatus = calculateTotalAmount(totalCost, paidAmount);
    //5. generate the invoice number
    const invoiceNumber = await generateInvoiceNumber();
    //6. calculate due amount
    const dueAmount = Math.max(totalCost - paidAmount, 0);
    //7. create the sale
    const changeAmount = Math.max(paidAmount - totalCost, 0);
    //8. create the sale
    const newSale = await Sale.create({
      invoiceNumber,
      user: req.user._id,
      customer,
      saleDate: saleDate || new Date(),
      paymentMethod,
      items: items.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      totalCost,
      paidAmount,
      dueAmount,
      changeAmount,
      paymentStatus,
    });

    await newSale.save();

    res.status(201).json({
      success: true,
      result: newSale,
    });
  } catch (error) {
    next(error);
  }
};

const getAllSales = async (req, res) => {
 try{
     const limit = parseInt(req.query.limit) || 10; // Default limit to 10 if not provided
     const pagevalue = parseInt(req.query.page) || 1; // Default page to 1 if not provided
     const skip = (pagevalue - 1) * limit;
     const querySearch = {};
 
     if(req.query.search){
         querySearch["$or"] = [
             { invoiceNumber: { $regex: req.query.search, $options: "i" } },
             { saleStatus: { $regex: req.query.search, $options: "i" } },
             { paymentStatus: { $regex: req.query.search, $options: "i" } },
         ];
     }
     //condition & validation
     if(!req.user){
         return res.status(401).json({
             success: false,
             message: "Unauthorized",
         })
     }
     
     // sort option 
     const sortOption = req.query.sort ? req.query.sort.split(',').join(' ') : '-createdAt';
 
     const doc= await Sale.find(querySearch)
     .populate('supplier')
     .populate('items.product')
     .populate('user')
     .skip(skip)
     .limit(limit)
     .sort(sortOption)
     .exec();
 
     res.status(200).json({
         success: true,
         result: doc ,
     })
 
 
 }catch(error){
     res.status(500).json({
         success: false,
         message: error.message,
     })
 }
 
};

const findOne = async (req, res) => {
    try{
         const { id } = req.params;
         const sale = await Sale.findById(id).populate('category');
         if(!sale){
             return res.status(404).json({
                 success: false,
                 message: 'Sale not found',
             })
         }
         res.status(200).json({
             success: true,
             result: sale,
         })
     }catch(error){
         res.status(500).json({
         success: false,
         message: error.message,
     })
 }
};

const findOneByCode = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      result: [],
    });
  } catch (error) {
    next(error);
  }
};
const updateSale = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      result: [],
    });
  } catch (error) {}
};

const deleteSale = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      result: [],
    });
  } catch (error) {
    next(error);
  }
};

const checkStock = async (req,res) => {
 try{
  const stock = req.query.stock;
  const productId = req.query.productId;
  if(!productId){
    return res.status(400).json({
      success: false,
      message: "Product ID is required",
    })
  }
  if(!stock){
    return res.status(400).json({
      success: false,
      message: "Stock is required",
    })
  }
  const product = await Product.findById(productId);
  if(!product){
    return res.status(404).json({
      success: false,
      message: "Product not found",
    })
  }
  if(product.currentStock < stock){
    return res.status(400).json({
      success: false,
      message: `Product ${product.name} is out of stock`,
    })
  }
  res.status(200).json({
    success: true,
    message: `Product ${product.name} is in stock`,
  })
 }catch(error){
  res.status(500).json({
    success: false,
    message: error.message,
  })
 }
}

const addPayment = async (req,res)=>{
    try{
        const {id}= req.params;
        const {paidAmount} = req.body?.paidAmount;

        if(!paidAmount || paidAmount <= 0) {
          return res.status(400).json({
            success: false, 
            message: "Paid amount must be greater than zero",
          })
        }
        // 1. find sale using id
        const sale = await Sale.findById(id);
        if(!sale){
           return res.status(404).json({
                success: false,
                message: "Sale not found",
            })
        }
        // 2. calculte new paidAmount and dueAmount
        const totalCost = sale.totalCost;
        const newPaidAmound = sale.paidAmount + paidAmount;
        // const newDueAmount = totalCost - newPaidAmound;

        // 3.calculate new due Amount
        const newPaidAmount= Math.max(0, totalCost - newPaidAmound);

        // 4.determine new payment status
        const paymentStatus = calculatePaymentStatus(totalCost, newPaidAmound);

        // 5. update the sale with new payment
        const updateSale = await Sale.findByIdAndUpdate(id, {
            paidAmount: newPaidAmound,
            dueAmount: newPaidAmount,
            paymentStatus: paymentStatus,
        }, {new: true});

        res.status(200).json({
            success: true,
            result: updateSale,
        })
    }catch(error){ 
      next(error)
    }
    }
module.exports = {
  createSale,
  getAllSales,
  findOne,
  findOneByCode,
  updateSale,
  deleteSale,
  checkStock,
  addPayment,
};
