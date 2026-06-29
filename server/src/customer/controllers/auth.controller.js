const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const authService = require("../services/auth.service");

const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, "OTP sent to email and phone.", result));
});

const verifyOtp = asyncHandler(async (req, res) => {
  const result = await authService.verifyOtp(req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, "Account verified successfully", result));
});

const resendOtp = asyncHandler(async (req, res) => {
  const result = await authService.resendOtp(req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, "OTP resent successfully", result));
});

const sendPhoneOtp = asyncHandler(async (req, res) => {
  const result = await authService.sendPhoneOtp(req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, "OTP sent successfully", result));
});

const verifyPhoneOtp = asyncHandler(async (req, res) => {
  const result = await authService.verifyPhoneNumberOtp(req.body, req.user?.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Phone verified successfully", result));
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, "Login successful", result));
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "User fetched successfully", user));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, "Password reset OTP sent successfully", result));
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, "Password reset successful", result));
});

module.exports = {
  signup,
  verifyOtp,
  resendOtp,
  sendPhoneOtp,
  verifyPhoneOtp,
  login,
  me,
  forgotPassword,
  resetPassword,
};
