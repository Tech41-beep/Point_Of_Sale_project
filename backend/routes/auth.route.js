const express = require("express");
const authGuard = require("../guards/auth.guard");
const restrict = require("../guards/restrict.guard");
const { 
   signup,
    login,
    logout,
    getcurrentUser
}= require("../controller/auth.controller");

const authRouter = express.Router();
authRouter
.route("/signup")
.post(authGuard, restrict("super_admin", "admin"), signup);

authRouter
.route("/login")
.post(login);

authRouter
.route("/logout")
.post(authGuard, logout);

authRouter
.route("/me")
.get(authGuard, getcurrentUser);

module.exports= authRouter;
