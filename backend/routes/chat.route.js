const express = require("express");
const chat = require("../controller/chat.controller");
const authGuard = require("../guards/auth.guard");

const router = express.Router();

router.post("/", authGuard, chat);

module.exports = router;