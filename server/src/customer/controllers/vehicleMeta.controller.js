const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const vehicleMetaService = require("../services/vehicleMeta.service");

const getVehicleBrands = asyncHandler(async (req, res) => {
  const brands = await vehicleMetaService.getVehicleBrands();

  return res
    .status(200)
    .json(new ApiResponse(200, "Vehicle brands fetched successfully", brands));
});

const getVehicleModelsByBrand = asyncHandler(async (req, res) => {
  const models = await vehicleMetaService.getVehicleModelsByBrand(
    req.params.brandId
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Vehicle models fetched successfully", models));
});

module.exports = {
  getVehicleBrands,
  getVehicleModelsByBrand,
};
