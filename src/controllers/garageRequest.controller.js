const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const garageRequestService = require("../services/garageRequest.service");
const prisma = require("../config/prisma");

const getGarageIdForOwner = async (userId) => {
  const garage = await prisma.garage.findFirst({
    where: {
      ownerId: userId,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!garage) {
    throw new ApiError(404, "Garage not found for this owner");
  }

  return garage.id;
};

const getGarageRequests = asyncHandler(async (req, res) => {
  const garageId = await getGarageIdForOwner(req.user.id);

  const requests = await garageRequestService.getGarageRequests(
    garageId,
    req.query
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Garage requests fetched successfully", requests));
});

const acceptGarageRequest = asyncHandler(async (req, res) => {
  const garageId = await getGarageIdForOwner(req.user.id);

  const request = await garageRequestService.acceptGarageRequest(
    garageId,
    req.params.requestId,
    req.body.note
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Garage request accepted successfully", request));
});

const rejectGarageRequest = asyncHandler(async (req, res) => {
  const garageId = await getGarageIdForOwner(req.user.id);

  const request = await garageRequestService.rejectGarageRequest(
    garageId,
    req.params.requestId,
    req.body.note
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Garage request rejected successfully", request));
});

module.exports = {
  getGarageRequests,
  acceptGarageRequest,
  rejectGarageRequest,
};