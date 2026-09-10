const express = require("express");
const authGuard = require("../guards/auth.guard");
const restrict = require("../guards/restrict.guard");
const { listProducts, createOrder, listOrders, listAllOrders } = require("../controller/store.controller");

const router = express.Router();
router.get("/products", authGuard, restrict("user"), listProducts);
router.post("/orders", authGuard, restrict("user"), createOrder);
router.get("/orders", authGuard, restrict("user"), listOrders);
router.get("/orders/all", authGuard, restrict("super_admin", "admin", "cashier"), listAllOrders);
module.exports = router;
