const { body } = require("express-validator");

const onboardingValidation = [
  body("vehicle.brand")
    .trim()
    .notEmpty()
    .withMessage("Vehicle brand is required"),

  body("vehicle.model")
    .trim()
    .notEmpty()
    .withMessage("Vehicle model is required"),

  body("vehicle.year")
    .notEmpty()
    .withMessage("Vehicle year is required")
    .isInt({ min: 1980, max: new Date().getFullYear() + 1 })
    .withMessage("Enter a valid vehicle year"),

  body("vehicle.fuelType")
    .trim()
    .notEmpty()
    .withMessage("Fuel type is required")
    .isIn(["PETROL", "DIESEL", "ELECTRIC", "HYBRID", "CNG", "OTHER"])
    .withMessage("Invalid fuel type"),

  body("vehicle.registrationNumber")
    .optional({ nullable: true, checkFalsy: true })
    .trim(),

  body("location.latitude")
    .notEmpty()
    .withMessage("Latitude is required")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),

  body("location.longitude")
    .notEmpty()
    .withMessage("Longitude is required")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),

  body("location.address")
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
];

module.exports = {
  onboardingValidation,
};