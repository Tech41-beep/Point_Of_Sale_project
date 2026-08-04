const express = require("express");
const {
  createSale,
  getAllSales,
  findOne,
  findOneByCode,
  updateSale,
  deleteSale,
} = require("../controller/sale.controller");
const restrict = require("../guards/restrict.guard");

const saleRouter = express.Router();

saleRouter
  .route("/")
  .post(restrict("super_admin", "admin"), createSale)
  .get(restrict("super_admin", "admin"), getAllSales);

saleRouter.get("/code/:code", restrict("super_admin", "admin"), findOneByCode);

saleRouter
  .route("/:id")
  .get(restrict("super_admin", "admin"), findOne)
  .put(restrict("super_admin", "admin"), updateSale)
  .delete(restrict("super_admin", "admin"), deleteSale);

module.exports = saleRouter;
