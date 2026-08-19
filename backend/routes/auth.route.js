const express = require("express");
const authGuard = require("../guards/auth.guard");
const { 
   signup,
    login,
    logout,
    getcurrentUser
}= require("../controller/auth.controller");

const authRouter = express.Router();
authRouter
.route("/signup")
.post(signup);

authRouter
.route("/login")
.post(login);

authRouter
.route("/logout")
.post(logout);

authRouter
.route("/me")
.get(authGuard, getcurrentUser);

module.exports= authRouter;
