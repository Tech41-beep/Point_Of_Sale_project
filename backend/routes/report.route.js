const express = require("express");
const app = express();
const reportRouter = express.Router();

const { generateReport ,
    saleReport,
    stockReport,
    report30days
} = require("../controller/report.controller");
const restrict = require("../guards/restrict.guard")

reportRouter.get("/", restrict("super_admin", "admin"), generateReport);
reportRouter.get("/sale", restrict("super_admin", "admin"), saleReport);
reportRouter.get("/stock", restrict("super_admin", "admin"), stockReport);
reportRouter.get("/30days", restrict("super_admin", "admin"), report30days);

module.exports = reportRouter;