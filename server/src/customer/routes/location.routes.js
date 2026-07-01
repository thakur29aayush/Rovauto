const express = require("express");

const locationController = require("../controllers/location.controller");
const { protect } = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const rateLimit = require("../../middlewares/rateLimit.middleware");

const {
  locationIdValidation,
  createLocationValidation,
  updateLocationValidation,
  geocodeLocationValidation,
} = require("../validations/location.validation");

const router = express.Router();

router.use(protect);

// Increased rate limit for geocoding to allow Nominatim + Groq fallback flow
// 20 requests per minute per user (Groq free tier: 30 RPM)
const geocodeRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per window (increased from 10)
  keyGenerator: (req) => `geocode:${req.user.id}`, // Per-user limit
});

router.get(
  "/geocode",
  geocodeRateLimit,
  geocodeLocationValidation,
  validate,
  locationController.geocodeLocation
);

router
  .route("/")
  .post(createLocationValidation, validate, locationController.createLocation)
  .get(locationController.getMyLocations);

router
  .route("/:id")
  .get(locationIdValidation, validate, locationController.getLocationById)
  .patch(updateLocationValidation, validate, locationController.updateLocation)
  .delete(locationIdValidation, validate, locationController.deleteLocation);

router.patch(
  "/:id/default",
  locationIdValidation,
  validate,
  locationController.setDefaultLocation
);

module.exports = router;
