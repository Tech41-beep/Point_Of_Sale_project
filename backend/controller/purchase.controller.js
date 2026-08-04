const Purchase = require("../model/purchase.model");
const Product = require("../model/product.model");
const calculatePaymentStatus = require("../helpers/calculatePaymentStatus");


const createPurchase = async (req, res) => {
    try{
        const {
            supplier,
            invoiceNumber,
            purchaseDate,
            items,
            paidAmount,
            purchaseStatus,
        } = req.body;

        if (!supplier || !invoiceNumber || !purchaseDate) {
            return res.status(400).json({
                success: false,
                message: "Supplier, invoice number and purchase date are required",
            });
        }
        if(purchaseStatus === "recieved" ){
            for(const item of items) {
                const product= await Product.findById(item.product);
                if(!product) {
                    return res.status(404).json({
                        success: false,
                        error: `Product with id ${item.product} not found`,
                    })
                }
                product.currentStockQuantity += Number(item.quantity);
                await product.save();
            }
        }
       
        const normalizedItems = items.map((item) => ({
            product: item.product,
            quantity: Number(item.quantity),
            price: Number(item.price),
        }));
        const totalCost = normalizedItems.reduce(
            (total, item) => total + item.quantity * item.price,
            0,
        );
        const paid = Number(paidAmount);
        const dueAmount = Math.max(totalCost - paid, 0);
        const changeAmount = Math.max(paid - totalCost, 0);
        const paymentStatus = calculatePaymentStatus(totalCost, paid);

        const newDoc = await Purchase.create({
            supplier,
            paymentStatus,
            dueAmount,
            changeAmount,
            invoiceNumber: invoiceNumber.trim(),
            user: req.user._id,
            purchaseDate,
            items: normalizedItems,
            totalCost,
            paidAmount: paid,
            ...(purchaseStatus && { purchaseStatus }),
        })
    
      return res.status(201).json({
        success: true,
        result: newDoc
      })
    }catch(error){
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "Invoice number already exists" });
        }
        const status = error.name === "ValidationError" || error.name === "CastError" ? 400 : 500;
        return res.status(status).json({
            success: false,
            message: error.message,
        })
    }
}
const getAllPurchases = async (req, res) => {
try{
    const limit = parseInt(req.query.limit) || 10; // Default limit to 10 if not provided
    const pagevalue = parseInt(req.query.page) || 1; // Default page to 1 if not provided
    const skip = (pagevalue - 1) * limit;
    const querySearch = {};

    if(req.query.search){
        querySearch["$or"] = [
            { invoiceNumber: { $regex: req.query.search, $options: "i" } },
            { purchaseStatus: { $regex: req.query.search, $options: "i" } },
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

    const doc= await Purchase.find(querySearch)
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

}

const findOne = async (req, res) => {
    try{
        const { id } = req.params;
        const purchase = await Purchase.findById(id).populate('category');
        if(!purchase){
            return res.status(404).json({
                success: false,
                message: 'Purchase not found',
            })
        }
        res.status(200).json({
            success: true,
            result: purchase,
        })
    }catch(error){
        res.status(500).json({
        success: false,
        message: error.message,
    })
}
}

const findOneByCode = async (req, res) => {
    try{
        const code = req.params.code;
        const purchase = await Purchase.findOne({ code }).populate('category');
        if(!purchase){
            return res.status(404).json({
                success: false,
                message: 'Purchase not found',
            })
        }
        res.status(200).json({
            success: true,
            result: purchase,
        })
    }catch(error){
        res.status(500).json({
        success: false,
        message: error.message,
    })
}
}

const updatePurchase = async (req, res) => {
    try{
        // purchaseStatus can only be changed to "recieved" at the time of creation, it cannot be changed after creation
        // doc.purchaseStatus can only be changed to "recieved" at the time of creation, it cannot be changed after creation
        const { id } = req.params;
        const purchase = await Purchase.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        if(!purchase){
            return res.status(404).json({
                success: false,
                message: 'Purchase not found',
            })
        }
        //if purchaseStatus is "recieved", update the stock quantity of the products from database
        const doc = req.body;
        if(doc.purchaseStatus === "recieved" && purchase.purchaseStatus !== "recieved"){
            return res.status(400).json({
                success: false,
                message: "Cannot change purchase status to 'recieved' after creation",
            })
        }

          //if purchaseStatus is not "recieved", update the stock quantity of the products
          if(purchase.purchaseStatus === "recieved" && doc.purchaseStatus !== "recieved"){
            for(const item of doc.items) {
                // Update stock quantity logic here
                const product = await Product.findById(item.product);
                if(!product) {
                    return res.status(404).json({
                        success: false,
                        error: `Product with id ${item.product} not found`,
                    })
                }
                product.currentStockQuantity -= Number(item.quantity);
                await product.save();
            }
            const newDoc = await Purchase.findByIdAndUpdate(id, doc, {
                new: true,
            });
          }
        res.status(200).json({
            success: true,
            result: purchase,
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}
const deletePurchase = async (req, res) => {
    try{
        const { id } = req.params;
        const purchase = await Purchase.findByIdAndDelete(id);
        if(!purchase){
            return res.status(404).json({
                success: false,
                message:"purchase not found",
            })
        }
        res.status(200).json({
            success: true,
            message: "Purchase deleted successfully",
            result: purchase,
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}
module.exports = {
    createPurchase,
    getAllPurchases,
    findOne,
    findOneByCode,
    updatePurchase,
    deletePurchase
}
