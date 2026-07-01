const express = require("express");

const applicationController = require("../controllers/application.controller");
const validate = require("../../middlewares/validate.middleware");
const upload = require("../../middlewares/upload.middleware");
const { submitGarageApplicationSchema } = require("../validations/application.validation");

const router = express.Router();

router.post(
  "/",
  upload.array("images", 15),
  submitGarageApplicationSchema,
  validate,
  applicationController.submitApplication
);

module.exports = router;
