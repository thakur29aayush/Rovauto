const express = require("express");

const notificationRoutes = require("../customer/routes/notification.routes");
const vehicleMetaRoutes = require("../customer/routes/vehicleMeta.routes");
const authRoutes = require("../customer/routes/auth.routes");
const customerRoutes = require("../customer/routes/customer.routes");
const vehicleRoutes = require("../customer/routes/vehicle.routes");
const locationRoutes = require("../customer/routes/location.routes");
const serviceRoutes = require("../customer/routes/service.routes");
const garageRoutes = require("./garage.routes");
const bookingRoutes = require("../customer/routes/booking.routes");
const paymentRoutes = require("../customer/routes/payment.routes");
const reviewRoutes = require("../customer/routes/review.routes");
const complaintRoutes = require("../customer/routes/complaint.routes");
const garageMediaRoutes = require("./garageMedia.routes");

const walletRoutes = require("../customer/routes/wallet.routes");
const garageWalletRoutes = require("./garageWallet.routes");
const garageRequestRoutes = require("./garageRequest.routes");
const serviceMediaRoutes = require("../customer/routes/serviceMedia.routes");
const sosRoutes = require("../customer/routes/sos.routes");
const contactRoutes = require("../customer/routes/contact.routes");
const dashboardRoutes = require("../customer/routes/dashboard.routes");
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
router.use("/notifications", notificationRoutes);
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
