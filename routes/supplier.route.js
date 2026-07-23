const express = require("express");
const app = express();
const { 
    create,
    findAll
    ,findOne
    ,update
    ,Remove
}= require("../controller/supplier.controller");

const supplierRouter = express.Router();
const router = express.Router();
supplierRouter
.route("/")
.post(create)
.get(findAll);

supplierRouter
.route("/:id")
.get(findOne)
.put(update)
.delete(Remove);

router.use("/suppliers", supplierRouter);
module.exports= supplierRouter;
