const express = require("express");

const serviceController = require("../controllers/service.controller");

const router = express.Router();

router.get("/categories", serviceController.getServiceCategories);
router.get("/", serviceController.getServices);

module.exports = router;