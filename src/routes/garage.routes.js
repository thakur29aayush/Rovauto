const express = require("express");

const garageController = require("../controllers/garage.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", garageController.getGarages);
router.get("/nearby", protect, garageController.getNearbyGarages);

router.get("/:id", garageController.getGarageById);
router.get("/:id/services", garageController.getGarageServices);
router.get("/:id/slots", garageController.getGarageSlots);

module.exports = router;