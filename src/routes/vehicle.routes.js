const express = require("express");

const vehicleController = require("../controllers/vehicle.controller");
const { protect } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");

const {
  vehicleIdValidation,
  createVehicleValidation,
  updateVehicleValidation,
} = require("../validations/vehicle.validation");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(createVehicleValidation, validate, vehicleController.createVehicle)
  .get(vehicleController.getMyVehicles);

router
  .route("/:id")
  .get(vehicleIdValidation, validate, vehicleController.getVehicleById)
  .patch(updateVehicleValidation, validate, vehicleController.updateVehicle)
  .delete(vehicleIdValidation, validate, vehicleController.deleteVehicle);

router.patch(
  "/:id/default",
  vehicleIdValidation,
  validate,
  vehicleController.setDefaultVehicle
);

module.exports = router;