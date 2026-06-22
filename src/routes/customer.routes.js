const express = require("express");

const customerController = require("../controllers/customer.controller");
const { protect } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { onboardingValidation } = require("../validations/customer.validation");

const router = express.Router();

router.post(
  "/onboarding",
  protect,
  onboardingValidation,
  validate,
  customerController.completeOnboarding
);

module.exports = router;