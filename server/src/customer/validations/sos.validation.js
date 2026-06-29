const { body, param } = require("express-validator");

const createSosSchema = [
  body("vehicleId").isUUID().withMessage("Invalid vehicle ID"),

  body("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),

  body("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),

  body("address")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Address cannot exceed 500 characters"),

  body("note")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Note cannot exceed 1000 characters"),
];

const sosIdParamSchema = [
  param("id").isUUID().withMessage("Invalid SOS request ID"),
];

module.exports = {
  createSosSchema,
  sosIdParamSchema,
};
