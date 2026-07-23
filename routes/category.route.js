const express = require("express");
const app = express();
const { 
    create,
    findAll
    ,findOne
    ,update
    ,Remove
}= require("../controller/category.controller");

const categoryRouter = express.Router();
const router = express.Router();
categoryRouter
.route("/")
.post(create)
.get(findAll);

categoryRouter
.route("/:id")
.get(findOne)
.put(update)
.delete(Remove);

router.use("/categories", categoryRouter);
module.exports= categoryRouter;
