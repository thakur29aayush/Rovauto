const express = require("express");

const authRoutes = require("./auth.routes");
const customerRoutes = require("./customer.routes");
const vehicleRoutes = require("./vehicle.routes");
const locationRoutes = require("./location.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/customer", customerRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/locations", locationRoutes);

module.exports = router;