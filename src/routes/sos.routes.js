const express = require("express");

const sosController = require("../controllers/sos.controller");
const { protect } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");

const {
  createSosSchema,
  sosIdParamSchema,
} = require("../validations/sos.validation");

const router = express.Router();

router.use(protect);

router.post(
  "/",
  createSosSchema,
  validate,
  sosController.createSosRequest
);

router.get(
  "/:id",
  sosIdParamSchema,
  validate,
  sosController.getSosRequestById
);

module.exports = router;