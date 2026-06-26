const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const garageService = require("../services/garage.service");

const getGarages = asyncHandler(async (req, res) => {
  const garages = await garageService.getGarages(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, "Garages fetched successfully", garages));
});

const getNearbyGarages = asyncHandler(async (req, res) => {
  const garages = await garageService.getNearbyGarages(req.user.id, req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, "Nearby garages fetched successfully", garages));
});

const getGarageById = asyncHandler(async (req, res) => {
  const garage = await garageService.getGarageById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Garage fetched successfully", garage));
});

const getGarageServices = asyncHandler(async (req, res) => {
  const services = await garageService.getGarageServices(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Garage services fetched successfully", services));
});

module.exports = {
  getGarages,
  getNearbyGarages,
  getGarageById,
  getGarageServices,
};