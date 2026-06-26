const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const reviewService = require("../services/review.service");

const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.user.id, req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, "Review created successfully", review));
});

const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getMyReviews(req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Reviews fetched successfully", reviews));
});

const updateReview = asyncHandler(async (req, res) => {
  const review = await reviewService.updateReview(
    req.user.id,
    req.params.id,
    req.body
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Review updated successfully", review));
});

const deleteReview = asyncHandler(async (req, res) => {
  const result = await reviewService.deleteReview(req.user.id, req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Review deleted successfully", result));
});

module.exports = {
  createReview,
  getMyReviews,
  updateReview,
  deleteReview,
};