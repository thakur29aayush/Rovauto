const { body, param } = require("express-validator");

const garageRequestIdParamSchema = [
  param("requestId").isUUID().withMessage("Invalid request ID"),
];

const rejectGarageRequestSchema = [
  param("requestId").isUUID().withMessage("Invalid request ID"),

  body("note")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Note cannot exceed 500 characters"),
];

const acceptGarageRequestSchema = [
  param("requestId").isUUID().withMessage("Invalid request ID"),

  body("note")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Note cannot exceed 500 characters"),
];

module.exports = {
  garageRequestIdParamSchema,
  rejectGarageRequestSchema,
  acceptGarageRequestSchema,
};