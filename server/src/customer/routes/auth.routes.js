const express = require("express");

const authController = require("../controllers/auth.controller");
const validate = require("../../middlewares/validate.middleware");
const { protect } = require("../../middlewares/auth.middleware");

const {
  signupValidation,
  verifyOtpValidation,
  resendOtpValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require("../validations/auth.validation");

const router = express.Router();

router.post("/signup", signupValidation, validate, authController.signup);
router.post("/verify-otp", verifyOtpValidation, validate, authController.verifyOtp);
router.post("/resend-otp", resendOtpValidation, validate, authController.resendOtp);
router.post("/login", loginValidation, validate, authController.login);
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
