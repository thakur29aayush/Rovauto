const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const applicationService = require("../services/application.service");

const submitApplication = asyncHandler(async (req, res) => {
  const application = await applicationService.submitApplication(req.body, req.files || []);
  return res.status(201).json(new ApiResponse(201, "Garage application submitted successfully", application));
});

const listApplications = asyncHandler(async (req, res) => {
  const applications = await applicationService.listApplications(req.query);
  return res.status(200).json(new ApiResponse(200, "Garage applications fetched successfully", applications));
});

const getApplication = asyncHandler(async (req, res) => {
  const application = await applicationService.getApplication(req.params.applicationId);
  return res.status(200).json(new ApiResponse(200, "Garage application fetched successfully", application));
});

const approveApplication = asyncHandler(async (req, res) => {
  const result = await applicationService.approveApplication(req.params.applicationId, req.body.adminNote);
  return res.status(200).json(new ApiResponse(200, "Garage application approved successfully", result));
});

const requestChanges = asyncHandler(async (req, res) => {
  const application = await applicationService.requestChanges(req.params.applicationId, req.body.adminNote);
  return res.status(200).json(new ApiResponse(200, "Garage application marked for changes", application));
});

const denyApplication = asyncHandler(async (req, res) => {
  const application = await applicationService.denyApplication(req.params.applicationId, req.body.adminNote);
  return res.status(200).json(new ApiResponse(200, "Garage application denied successfully", application));
});

const deleteApplications = asyncHandler(async (req, res) => {
  const result = await applicationService.deleteApplications(req.body.applicationIds);
  return res.status(200).json(new ApiResponse(200, "Garage applications deleted successfully", result));
});

module.exports = {
  approveApplication,
  deleteApplications,
  denyApplication,
  getApplication,
  listApplications,
  requestChanges,
  submitApplication,
};
