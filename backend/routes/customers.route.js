const express = require("express");
const app = express();
const { 
    create,
    findAll
    ,findOne
    ,update
    ,Remove
}= require("../controller/customers.controller");
const restrict = require("../guards/restrict.guard");

const customerRouter = express.Router();
const router = express.Router();
customerRouter
.route("/")
.post(restrict("super_admin", "admin"), create)
.get(restrict("super_admin", "admin"), findAll);

customerRouter
.route("/:id")
.get(restrict("super_admin", "admin"), findOne)
.put(restrict("super_admin", "admin"), update)
.delete(restrict("super_admin", "admin"), Remove);

router.use("/customers", customerRouter);
module.exports= customerRouter;
