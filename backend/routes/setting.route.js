const express = require("express");
const {
  getSettings,
  updateSettings,
} = require("../controller/setting.controller");
const restrict = require("../guards/restrict.guard");

const router = express.Router();

router.get("/", restrict("super_admin", "admin"), getSettings);
router.put("/", restrict("super_admin", "admin"), updateSettings);

module.exports = router;
