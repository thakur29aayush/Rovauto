const express = require("express");

const authRoutes = require("./auth.routes");
const customerRoutes = require("./customer.routes");
const vehicleRoutes = require("./vehicle.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/customer", customerRoutes);
router.use("/vehicles", vehicleRoutes);

module.exports = router;