const express = require("express");
const app = express();
const { 
    create,
    findAll
    ,findOne
    ,update
    ,Remove
}= require("../controller/user.controller");

const userRouter = express.Router();
const router = express.Router();
userRouter
.route("/")
.post(create)
.get(findAll);

userRouter
.route("/:id")
.get(findOne)
.put(update)
.delete(Remove);

router.use("/users", userRouter);
module.exports= userRouter;
