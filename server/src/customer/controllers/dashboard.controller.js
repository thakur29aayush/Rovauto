const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const dashboardService = require("../services/dashboard.service");

const getCustomerDashboard = asyncHandler(async (req, res) => {
  const dashboard = await dashboardService.getCustomerDashboard(req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Dashboard fetched successfully", dashboard));
});

module.exports = {
  getCustomerDashboard,
};
