const express = require("express");

const dashboardController = require("../controllers/dashboard.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/customer", dashboardController.getCustomerDashboard);

module.exports = router;