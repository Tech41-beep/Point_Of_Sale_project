const Sale = require("../model/sale.model");
const Product = require("../model/product.model");
const generateReport = async (req, res) => {
  try {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Valid startDate and endDate are required",
      });
    }
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const report = await Sale.find(
      {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
      { totalCost: 1 },
    );
    const totalSales = report.reduce((acc, sale) => {
      return acc + sale.totalCost;
    }, 0);
    // total due amount
    const dueSale = await Sale.find(
      {
        paymentStatus: "due",
      },
      {
        totalCost: 1,
      },
    );

    // total die amount for purchase
    const duePurchase = await Sale.find(
      {
        paymentStatus: "due",
      },
      {
        totalCost: 1,
      },
    );
    const totalDueSale = dueSale.reduce((acc, sale) => {
      acc + sale.totalCost;
    }, 0);
    const totalDuePurchase = duePurchase.reduce((acc, purchase) => {
      acc + purchase.totalCost;
    }, 0);

    // monthly sale
    const monthlySale = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      new Date().getDate(),
    );
    const monthlyReport = await Sale.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });
    //total customer
    const totalCustomer = await Sale.find(
      {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
      {
        totalCost: 1,
      },
    );
    const totalCustomerCount = totalCustomer.length;
    //total supplier
    const totalSupplier = await Sale.find(
      {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
      {
        totalCost: 1,
      },
    );
    const totalSupplierCount = totalSupplier.length;
    if (report.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No report found for the given date range",
      });
    }

    res.status(200).json({
      success: true,
      result: report,
      totalSales: {
        totalSales: totalSales,
        dueSale: totalDueSale,
        duePurchase: totalDuePurchase,
        monthlySale: monthlyReport,
        monthlyLength: monthlyReport.length,
        totalCustomerCount: totalCustomerCount,
        totalSupplierCount: totalSupplierCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const saleReport = async (req, res) => {
  try {
    if(!req.query?.startDate || !req.query?.endDate){
    return res.status(400).json({
      success: false,
      message: "startDate and endDate are required",
    });
    }
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return res.status(400).json({
            success: false,
            message: "Valid startDate and endDate are required",
        });
    }
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const report = await Sale.find(
          {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        }, 
    }).population("customer", "name email phoneNumber")
    .populate("products.product", "name price");
    const totalSales = report.reduce((acc,sale)=>{
        return acc+ sale.totalCost;
    })
    res.status(200).json({
      success: true,
      message: "Sale report generated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const stockReport = async (req, res) => {
try{
    console.log(req.query);
    if(!req.query.Qty){
       return  res.status(400).json({
            success: false,
            message: "Qty is required",
        })
    }
    const doc = await Product.find({
        currentStockQuantity: { $lte: Number(req.query.Qty) },
    })
  res.status(200).json({
    success: true,
    message: "Stock report generated successfully",
    result: doc,
  })
}catch(error) {
    res.status(500).json({
        success: false,
        message: error.message,
    })
}

}
module.exports = {
  generateReport,
    saleReport,
    stockReport
};
