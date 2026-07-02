const express = require("express");

const applicationController = require("../controllers/application.controller");
const validate = require("../../middlewares/validate.middleware");
const upload = require("../../middlewares/upload.middleware");
const rateLimit = require("../../middlewares/rateLimit.middleware");
const {
  geocodeGarageApplicationSchema,
  submitGarageApplicationSchema,
} = require("../validations/application.validation");

const router = express.Router();

const geocodeRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: (req) => `garage-application-geocode:${req.ip}`,
});

router.get(
  "/geocode",
  geocodeRateLimit,
  geocodeGarageApplicationSchema,
  validate,
  applicationController.geocodeApplicationLocation
);

router.post(
  "/",
  upload.array("images", 15),
  submitGarageApplicationSchema,
  validate,
  applicationController.submitApplication
);

module.exports = router;
