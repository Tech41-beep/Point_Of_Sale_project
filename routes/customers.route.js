const express = require("express");
const app = express();
const { 
    create,
    findAll
    ,findOne
    ,update
    ,Remove
}= require("../controller/customers.controller");

const customerRouter = express.Router();
const router = express.Router();
customerRouter
.route("/")
.post(create)
.get(findAll);

customerRouter
.route("/:id")
.get(findOne)
.put(update)
.delete(Remove);

router.use("/customers", customerRouter);
module.exports= customerRouter;
