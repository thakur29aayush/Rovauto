const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const serviceMediaService = require("../services/serviceMedia.service");

const addServiceMedia = asyncHandler(async (req, res) => {
  const media = await serviceMediaService.addServiceMedia(
    req.params.serviceId,
    req.body
  );

  return res
    .status(201)
    .json(new ApiResponse(201, "Service media added successfully", media));
});

const getServiceMedia = asyncHandler(async (req, res) => {
  const media = await serviceMediaService.getServiceMedia(req.params.serviceId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Service media fetched successfully", media));
});

const updateServiceMedia = asyncHandler(async (req, res) => {
  const media = await serviceMediaService.updateServiceMedia(
    req.params.mediaId,
    req.body
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Service media updated successfully", media));
});

const deleteServiceMedia = asyncHandler(async (req, res) => {
  const result = await serviceMediaService.deleteServiceMedia(req.params.mediaId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Service media deleted successfully", result));
});

module.exports = {
  addServiceMedia,
  getServiceMedia,
  updateServiceMedia,
  deleteServiceMedia,
};
