const express = require("express");

const authController = require("../controllers/auth.controller");
const validate = require("../../middlewares/validate.middleware");
const { protect } = require("../../middlewares/auth.middleware");

const {
  signupValidation,
  verifyOtpValidation,
  resendOtpValidation,
  sendPhoneOtpValidation,
  verifyPhoneOtpValidation,
  loginValidation,
  googleAuthValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require("../validations/auth.validation");
const rateLimit = require("../../middlewares/rateLimit.middleware");

const router = express.Router();
const otpRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => `${req.ip}:${req.body?.phone || req.body?.email || "otp"}`,
});

router.post("/signup", otpRateLimit, signupValidation, validate, authController.signup);
router.post("/verify-otp", otpRateLimit, verifyOtpValidation, validate, authController.verifyOtp);
router.post("/resend-otp", otpRateLimit, resendOtpValidation, validate, authController.resendOtp);
router.post("/send-otp", otpRateLimit, sendPhoneOtpValidation, validate, authController.sendPhoneOtp);
router.post("/verify-phone-otp", otpRateLimit, verifyPhoneOtpValidation, validate, authController.verifyPhoneOtp);
router.post("/login", loginValidation, validate, authController.login);
router.post("/google", googleAuthValidation, validate, authController.googleAuth);
router.get("/me", protect, authController.me);
router.post(
  "/forgot-password",
  forgotPasswordValidation,
  validate,
  authController.forgotPassword
);

router.post(
  "/reset-password",
  resetPasswordValidation,
  validate,
  authController.resetPassword
);

module.exports = router;
