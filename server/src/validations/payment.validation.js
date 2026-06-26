const { body } = require("express-validator");

const createPaymentOrderValidation = [
  body("bookingId").isUUID().withMessage("Valid booking ID is required"),
];

const verifyPaymentValidation = [
  body("bookingId").isUUID().withMessage("Valid booking ID is required"),

  body("razorpayOrderId")
    .trim()
    .notEmpty()
    .withMessage("Razorpay order ID is required"),

  body("razorpayPaymentId")
    .trim()
    .notEmpty()
    .withMessage("Razorpay payment ID is required"),

  body("razorpaySignature")
    .trim()
    .notEmpty()
    .withMessage("Razorpay signature is required"),
];

module.exports = {
  createPaymentOrderValidation,
  verifyPaymentValidation,
};