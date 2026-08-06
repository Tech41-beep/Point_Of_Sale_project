
const express = require("express");
const {
  createPurchase,
  getAllPurchases,
    findOne,
    findOneByCode,
    updatePurchase,
    deletePurchase,
    addPayment
} = require("../controller/purchase.controller");
const restrict = require("../guards/restrict.guard");
const purchaseRouter = express.Router();

purchaseRouter
  .route("/")
  .post(restrict("super_admin", "admin"), createPurchase)
  .get(restrict("super_admin", "admin"), getAllPurchases);

purchaseRouter
  .route("/:id")
    .get(restrict("super_admin", "admin"), findOne)
    .put(restrict("super_admin", "admin"), updatePurchase)
    .delete(restrict("super_admin", "admin"), deletePurchase);
    
purchaseRouter
    .route("/code/:code")
    .get(restrict("super_admin", "admin"), findOneByCode);

purchaseRouter
    .patch("/:id/payment", restrict("super_admin", "admin"), addPayment);
    
module.exports = purchaseRouter;
