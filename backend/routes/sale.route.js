const express = require("express");
const {
  createSale,
  getAllSales,
  findOne,
  findOneByCode,
  updateSale,
  deleteSale,
  checkStock,
  addPayment
} = require("../controller/sale.controller");
const restrict = require("../guards/restrict.guard");

const saleRouter = express.Router();

saleRouter
  .route("/")
  .post(restrict("super_admin", "admin", "cashier"), createSale)
  .get(restrict("super_admin", "admin", "cashier"), getAllSales);

saleRouter.get("/stock", restrict("super_admin", "admin", "cashier"), checkStock);
saleRouter.get("/code/:code", restrict("super_admin", "admin", "cashier"), findOneByCode);
saleRouter.post("/payment/:id", restrict("super_admin", "admin", "cashier"), addPayment);

saleRouter
  .route("/:id")
  .get(restrict("super_admin", "admin", "cashier"), findOne)
  .put(restrict("super_admin", "admin"), updateSale)
  .delete(restrict("super_admin", "admin"), deleteSale);

module.exports = saleRouter;
