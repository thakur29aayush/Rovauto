const express = require("express");

const authRoutes = require("./auth.routes");
const customerRoutes = require("./customer.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/customer", customerRoutes);

module.exports = router;