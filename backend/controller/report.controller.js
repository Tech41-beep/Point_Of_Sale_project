const Sale = require("../model/sale.model");
const Product = require("../model/product.model");
const Purchase = require("../model/purchase.model");
const Customers = require("../model/customers.model");
const Supplier = require("../model/supplier.model");
const generateReport = async (req, res) => {
  try {
    const { startDate: startDateQuery, endDate: endDateQuery } = req.query;
    if (!startDateQuery || !endDateQuery) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required",
      });
    }

    const startDate = new Date(startDateQuery);
    const endDate = new Date(endDateQuery);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Valid startDate and endDate are required",
      });
    }
    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date must be on or before end date",
      });
    }
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);

    const dateFilter = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    const [report, dueSale, duePurchase, totalCustomerCount, totalSupplierCount] =
      await Promise.all([
        Sale.find(dateFilter, { totalCost: 1, createdAt: 1 }),
        Sale.find(
          { ...dateFilter, dueAmount: { $gt: 0 } },
          { dueAmount: 1 },
        ),
        Purchase.find(
          { ...dateFilter, dueAmount: { $gt: 0 } },
          { dueAmount: 1 },
        ),
        Customers.countDocuments(dateFilter),
        Supplier.countDocuments(dateFilter),
      ]);

    const totalSales = report.reduce(
      (acc, sale) => acc + Number(sale.totalCost || 0),
      0,
    );
    const totalDueSale = dueSale.reduce(
      (acc, sale) => acc + Number(sale.dueAmount || 0),
      0,
    );
    const totalDuePurchase = duePurchase.reduce(
      (acc, purchase) => acc + Number(purchase.dueAmount || 0),
      0,
    );

    res.status(200).json({
      success: true,
      result: report,
      totalSales: {
        totalSales,
        dueSale: totalDueSale,
        duePurchase: totalDuePurchase,
        monthlySale: report,
        monthlyLength: report.length,
        totalCustomerCount,
        totalSupplierCount,
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
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid startDate and endDate are required",
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "Start date must be on or before end date",
      });
    }

    // Interpret date boundaries consistently in UTC.
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);

    const report = await Sale.find({
      createdAt: {
        $gte: start,
        $lte: end,
      },
    })
      .populate("customer", "name email phoneNumber")
      .populate("user", "name")
      .populate("items.product", "name salePrice")
      .sort({ createdAt: -1 });

    const totalSales = report.reduce(
      (sum, sale) => sum + Number(sale.totalCost || 0),
      0,
    );

    return res.status(200).json({
      success: true,
      result: report,
      totalSales,
      totalItems: report.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const stockReport = async (req, res) => {
try{
    const { Qty } = req.query;
    if (Qty === undefined || (typeof Qty === "string" && Qty.trim() === "")) {
       return  res.status(400).json({
            success: false,
            message: "Qty is required",
        })
    }
    const quantity = Number(Qty);
    if (
      (typeof Qty !== "string" && typeof Qty !== "number") ||
      !Number.isFinite(quantity) || quantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Qty must be a non-negative number",
      });
    }
    const doc = await Product.find({
        currentStockQuantity: { $lte: quantity },
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
const report30days = async (req,res) =>{
    try{
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const report = await Sale.find({
            createdAt:{ 
                $gte: thirtyDaysAgo,
                $lte: today,
            }
        })
        res.status(200).json(
            {
                success : true,
                message: "Report generated successfully",
                result: report,
            }
        )
    }catch(error){
        res.status(500).json({
            success: false,
            error: error.message,
        })
    }
}
module.exports = {
  generateReport,
    saleReport,
    stockReport,
    report30days
};
