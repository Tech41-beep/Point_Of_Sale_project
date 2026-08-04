const express = require("express");
const {
  create,
  findAll,
  findOne,
  update,
  Remove,
} = require("../controller/category.controller");
const restrict = require("../guards/restrict.guard");

const categoryRouter = express.Router();

categoryRouter
  .route("/")
  .post(create)
  .get(restrict("super_admin", "admin"), findAll);

categoryRouter
  .route("/:id")
  .get(restrict("super_admin", "admin"), findOne)
  .put(restrict("super_admin", "admin"), update)
  .delete(restrict("super_admin", "admin"), Remove);

module.exports = categoryRouter;
