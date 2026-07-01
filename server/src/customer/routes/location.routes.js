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

// Strict rate limit for geocoding to prevent Nominatim API abuse
// 10 requests per minute per user
const geocodeRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per window
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
