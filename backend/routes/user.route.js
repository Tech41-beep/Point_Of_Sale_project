const express = require("express");
const app = express();
const { 
    create,
    findAll
    ,findOne
    ,update
    ,Remove
}= require("../controller/user.controller");
const restrict = require("../guards/restrict.guard");

const userRouter = express.Router();
const router = express.Router();
userRouter
.route("/")
.post(restrict("super_admin", "admin"), create)
.get(restrict("super_admin", "admin"), findAll);

userRouter
.route("/:id")
.get(restrict("super_admin", "admin"), findOne)
.put(restrict("super_admin", "admin"), update)
.delete(restrict("super_admin", "admin"), Remove);

router.use("/users", userRouter);
module.exports= userRouter;
