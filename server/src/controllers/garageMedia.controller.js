const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const garageMediaService = require("../services/garageMedia.service");

const uploadGarageMedia = asyncHandler(async (req, res) => {
  const garage = await garageMediaService.uploadGarageMedia(
    req.params.garageId,
    req.files,
    req.user
  );

  return res
    .status(201)
    .json(new ApiResponse(201, "Garage media uploaded successfully", garage));
});

module.exports = {
  uploadGarageMedia,
};
