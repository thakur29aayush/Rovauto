const express = require("express");

const serviceController = require("../controllers/service.controller");
const validate = require("../../middlewares/validate.middleware");

const {
  serviceIdParamSchema,
} = require("../validations/service.validation");

const router = express.Router();

router.get("/categories", serviceController.getServiceCategories);
router.get("/", serviceController.getServices);

router.get(
  "/:id",
  serviceIdParamSchema,
  validate,
  serviceController.getServiceById
);

module.exports = router;
