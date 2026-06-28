const { body, param } = require("express-validator");

const serviceIdParamSchema = [
  param("serviceId").isUUID().withMessage("Invalid service ID"),
];

const serviceMediaIdParamSchema = [
  param("mediaId").isUUID().withMessage("Invalid media ID"),
];

const addServiceMediaSchema = [
  param("serviceId").isUUID().withMessage("Invalid service ID"),

  body("mediaType")
    .isIn(["IMAGE", "VIDEO"])
    .withMessage("Media type must be IMAGE or VIDEO"),

  body("url").isURL().withMessage("Invalid media URL"),

  body("publicId")
    .trim()
    .notEmpty()
    .withMessage("Public ID is required"),

  body("order")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage("Order must be a non-negative integer"),

  body("isThumbnail")
    .optional()
    .isBoolean()
    .withMessage("isThumbnail must be boolean"),

  body("durationSeconds")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive integer"),

  body("sizeBytes")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Size must be a positive integer"),
];

const updateServiceMediaSchema = [
  param("mediaId").isUUID().withMessage("Invalid media ID"),

  body("order")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage("Order must be a non-negative integer"),

  body("isThumbnail")
    .optional()
    .isBoolean()
    .withMessage("isThumbnail must be boolean"),
];

module.exports = {
  serviceIdParamSchema,
  serviceMediaIdParamSchema,
  addServiceMediaSchema,
  updateServiceMediaSchema,
};
