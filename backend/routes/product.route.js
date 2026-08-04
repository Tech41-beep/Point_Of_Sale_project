const express = require("express");
const app = express();
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  findOne,
  findOneByCode
} = require("../controller/product.controller");

const productRouter = express.Router();
const router = express.Router();
productRouter.route("/").post(createProduct).get(getAllProducts);
productRouter.post("/create", createProduct);
productRouter.get("/code/:code", findOneByCode);

productRouter
  .route("/:id")
  .get(findOne)
  .put(updateProduct)
  .delete(deleteProduct);

router.use("/product", productRouter);
module.exports = productRouter;
