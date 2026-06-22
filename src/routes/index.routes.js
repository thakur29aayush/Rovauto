const express = require("express");

const authRoutes = require("./auth.routes");
const customerRoutes = require("./customer.routes");
const vehicleRoutes = require("./vehicle.routes");
const locationRoutes = require("./location.routes");
const serviceRoutes = require("./service.routes");
const garageRoutes = require("./garage.routes");
const bookingRoutes = require("./booking.routes");
const paymentRoutes = require("./payment.routes");
const reviewRoutes = require("./review.routes");
const complaintRoutes = require("./complaint.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/customer", customerRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/locations", locationRoutes);
router.use("/services", serviceRoutes);
router.use("/garages", garageRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/complaints", complaintRoutes);

module.exports = router;