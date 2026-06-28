const express = require("express");

const contactController = require("../controllers/contact.controller");
const validate = require("../../middlewares/validate.middleware");

const {
  contactMessageValidation,
} = require("../validations/contact.validation");

const router = express.Router();

router.post(
  "/",
  contactMessageValidation,
  validate,
  contactController.sendContactMessage
);

module.exports = router;
