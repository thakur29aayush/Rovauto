const express = require("express");

const vehicleMetaRoutes = require("./vehicleMeta.routes");
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
const garageMediaRoutes = require("./garageMedia.routes");

const walletRoutes = require("./wallet.routes");
const garageWalletRoutes = require("./garageWallet.routes");
const garageRequestRoutes = require("./garageRequest.routes");
const serviceMediaRoutes = require("./serviceMedia.routes");
const sosRoutes = require("./sos.routes");
const contactRoutes = require("./contact.routes");
const dashboardRoutes = require("./dashboard.routes");
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/customer", customerRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/locations", locationRoutes);
router.use("/contact", contactRoutes);
router.use("/services", serviceRoutes);
router.use("/services", serviceMediaRoutes);
router.use("/vehicle-meta", vehicleMetaRoutes);
router.use("/garages", garageRoutes);
router.use("/garages", garageMediaRoutes);

router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/complaints", complaintRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/wallet", walletRoutes);
router.use("/garage/wallet", garageWalletRoutes);
router.use("/garage/requests", garageRequestRoutes);
router.use("/sos", sosRoutes);

module.exports = router;