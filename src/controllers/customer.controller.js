const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const customerService = require("../services/customer.service");

const completeOnboarding = asyncHandler(async (req, res) => {
  const result = await customerService.completeOnboarding(req.user.id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, "Onboarding completed successfully", result));
});

module.exports = {
  completeOnboarding,
};