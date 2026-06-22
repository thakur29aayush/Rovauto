const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const serviceService = require("../services/service.service");

const getServiceCategories = asyncHandler(async (req, res) => {
  const categories = await serviceService.getServiceCategories();

  return res
    .status(200)
    .json(new ApiResponse(200, "Service categories fetched successfully", categories));
});

const getServices = asyncHandler(async (req, res) => {
  const services = await serviceService.getServices();

  return res
    .status(200)
    .json(new ApiResponse(200, "Services fetched successfully", services));
});

module.exports = {
  getServiceCategories,
  getServices,
};