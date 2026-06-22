const { body, param } = require("express-validator");

const bookingIdValidation = [
  param("id").isUUID().withMessage("Invalid booking ID"),
];

const createBookingValidation = [
  body("vehicleId").isUUID().withMessage("Valid vehicle ID is required"),
  body("garageId").isUUID().withMessage("Valid garage ID is required"),
  body("serviceId").isUUID().withMessage("Valid service ID is required"),

  body("slotId")
    .optional({ nullable: true, checkFalsy: true })
    .isUUID()
    .withMessage("Invalid slot ID"),

  body("scheduledDate")
    .notEmpty()
    .withMessage("Scheduled date is required")
    .isISO8601()
    .withMessage("Scheduled date must be valid"),

  body("startTime")
    .trim()
    .notEmpty()
    .withMessage("Start time is required"),

  body("endTime")
    .optional({ nullable: true, checkFalsy: true })
    .trim(),

  body("customerNote")
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
];

module.exports = {
  bookingIdValidation,
  createBookingValidation,
};