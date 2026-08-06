const express = require("express");
const app = express();
const reportRouter = express.Router();

const { generateReport ,
    saleReport,
    stockReport
} = require("../controller/report.controller");
const restrict = require("../guards/restrict.guard")

reportRouter.get("/", restrict("super_admin", "admin"), generateReport);
reportRouter.get("/sale", restrict("super_admin", "admin"), saleReport);
reportRouter.get("/stock", restrict("super_admin", "admin"), stockReport);
module.exports = reportRouter;