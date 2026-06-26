const express = require("express");

const vehicleMetaController = require("../controllers/vehicleMeta.controller");

const router = express.Router();

router.get("/brands", vehicleMetaController.getVehicleBrands);
router.get("/brands/:brandId/models", vehicleMetaController.getVehicleModelsByBrand);

module.exports = router;