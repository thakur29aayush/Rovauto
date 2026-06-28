const { body, param } = require("express-validator");

const complaintIdValidation = [
  param("id").isUUID().withMessage("Invalid complaint ID"),
];

const createComplaintValidation = [
  body("bookingId")
    .optional({ nullable: true, checkFalsy: true })
    .isUUID()
    .withMessage("Invalid booking ID"),

  body("title").trim().notEmpty().withMessage("Complaint title is required"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Complaint description is required"),
];

module.exports = {
  complaintIdValidation,
  createComplaintValidation,
};
