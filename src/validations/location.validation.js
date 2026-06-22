const { body, param } = require("express-validator");

const locationIdValidation = [
  param("id").isUUID().withMessage("Invalid location ID"),
];

const createLocationValidation = [
  body("latitude")
    .notEmpty()
    .withMessage("Latitude is required")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),

  body("longitude")
    .notEmpty()
    .withMessage("Longitude is required")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),

  body("address")
    .optional({ nullable: true, checkFalsy: true })
    .trim(),

  body("source")
    .optional()
    .isIn(["GPS", "MANUAL"])
    .withMessage("Invalid location source"),

  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be true or false"),
];

const updateLocationValidation = [
  param("id").isUUID().withMessage("Invalid location ID"),

  body("latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),

  body("longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),

  body("address")
    .optional({ nullable: true, checkFalsy: true })
    .trim(),

  body("source")
    .optional()
    .isIn(["GPS", "MANUAL"])
    .withMessage("Invalid location source"),

  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be true or false"),
];

module.exports = {
  locationIdValidation,
  createLocationValidation,
  updateLocationValidation,
};