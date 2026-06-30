const express = require("express");

const locationController = require("../controllers/location.controller");
const { protect } = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");

const {
  locationIdValidation,
  createLocationValidation,
  updateLocationValidation,
  geocodeLocationValidation,
} = require("../validations/location.validation");

const router = express.Router();

router.use(protect);

router.get(
  "/geocode",
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
