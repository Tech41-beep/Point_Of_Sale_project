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
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one purchase item is required",
            });
        }

        const normalizedItems = items.map((item) => ({
            product: item.product,
            quantity: Number(item.quantity),
            price: Number(item.price),
        }));

        if (normalizedItems.some((item) => !item.product || item.quantity < 1 || item.price < 0)) {
            return res.status(400).json({
                success: false,
                message: "Each item requires a product, quantity of at least 1, and a valid price",
            });
        }

        if(purchaseStatus === "received" ){
            for(const item of normalizedItems) {
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
       
        const totalCost = normalizedItems.reduce(
            (total, item) => total + item.quantity * item.price,
            0,
        );
        const paid = Number(paidAmount) || 0;
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

    const [doc, totalItems] = await Promise.all([
        Purchase.find(querySearch)
            .populate('supplier')
            .populate('items.product')
            .populate('user')
            .skip(skip)
            .limit(limit)
            .sort(sortOption)
            .exec(),
        Purchase.countDocuments(querySearch),
    ]);

    res.status(200).json({
        success: true,
        result: doc ,
        currentPage: pagevalue,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
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
        const purchase = await Purchase.findById(id)
            .populate('supplier')
            .populate('items.product')
            .populate('user');
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
        const purchase = await Purchase.findOne({ invoiceNumber: code })
            .populate('supplier')
            .populate('items.product')
            .populate('user');
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
        const { id } = req.params;
        const purchase = await Purchase.findById(id);
        if(!purchase){
            return res.status(404).json({
                success: false,
                message: 'Purchase not found',
            })
        }

        const items = Array.isArray(req.body.items)
            ? req.body.items.map((item) => ({
                product: item.product?._id || item.product,
                quantity: Number(item.quantity),
                price: Number(item.price),
            }))
            : purchase.items;

        if (!items.length || items.some((item) => !item.product || item.quantity < 1 || item.price < 0)) {
            return res.status(400).json({
                success: false,
                message: "Each item requires a product, quantity of at least 1, and a valid price",
            });
        }

        const totalCost = items.reduce(
            (total, item) => total + item.quantity * item.price,
            0,
        );
        const paidAmount = Number(req.body.paidAmount ?? purchase.paidAmount) || 0;
        const purchaseStatus = req.body.purchaseStatus || purchase.purchaseStatus;

        purchase.supplier = req.body.supplier || purchase.supplier;
        purchase.invoiceNumber = req.body.invoiceNumber?.trim() || purchase.invoiceNumber;
        purchase.purchaseDate = req.body.purchaseDate || purchase.purchaseDate;
        purchase.items = items;
        purchase.totalCost = totalCost;
        purchase.paidAmount = paidAmount;
        purchase.dueAmount = Math.max(totalCost - paidAmount, 0);
        purchase.changeAmount = Math.max(paidAmount - totalCost, 0);
        purchase.paymentStatus = calculatePaymentStatus(totalCost, paidAmount);
        purchase.purchaseStatus = purchaseStatus;

        await purchase.save();

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
const addPayment = async (req,res,next)=>{
    try{
        const {id}= req.params;
        const {paidAmount} = req.body;
        // 1. find sale using id
        const purchase = await Purchase.findById(id);
        if(!purchase){
           return res.status(404).json({
                success: false,
                message: "Purchase not found",
            })
        }
        // 2. calculte new paidAmount and dueAmount
        const totalCost = purchase.totalCost;
        const payment = Number(paidAmount);
        if (!Number.isFinite(payment) || payment <= 0) {
            return res.status(400).json({
                success: false,
                message: "Paid amount must be greater than zero",
            });
        }
        const newPaidAmound = purchase.paidAmount + payment;
        // const newDueAmount = totalCost - newPaidAmound;

        // 3.calculate new due Amount
        const newPaidAmount= Math.max(0, totalCost - newPaidAmound);

        // 4.determine new payment status
        const paymentStatus = calculatePaymentStatus(totalCost, newPaidAmound);

        // 5. update the sale with new payment
        const updatePurchase = await Purchase.findByIdAndUpdate(id, {
            paidAmount: newPaidAmound,
            dueAmount: newPaidAmount,
            paymentStatus: paymentStatus,
        }, {new: true});

        res.status(200).json({
            success: true,
            result: updatePurchase,
        })
    }catch(error){ 
      next(error)
    }
}
module.exports = {
    createPurchase,
    addPayment,
    getAllPurchases,
    findOne,
    findOneByCode,
    updatePurchase,
    deletePurchase
}
