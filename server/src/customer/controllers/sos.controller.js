const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const sosService = require("../services/sos.service");

const createSosRequest = asyncHandler(async (req, res) => {
  const result = await sosService.createSosRequest(req.user.id, req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, "SOS signal sent successfully", result));
});

const getSosRequestById = asyncHandler(async (req, res) => {
  const result = await sosService.getSosRequestById(req.user.id, req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "SOS request fetched successfully", result));
});

module.exports = {
  createSosRequest,
  getSosRequestById,
};
