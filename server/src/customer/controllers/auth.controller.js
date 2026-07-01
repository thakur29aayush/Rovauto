const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const authService = require("../services/auth.service");

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const sendAuthResponse = (res, statusCode, message, result) => {
  res.cookie("accessToken", result.token, authCookieOptions);

  return res
    .status(statusCode)
    .json(new ApiResponse(statusCode, message, result));
};

const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, "OTP sent to email.", result));
});

const verifyOtp = asyncHandler(async (req, res) => {
  const result = await authService.verifyOtp(req.body);

  return sendAuthResponse(res, 200, "Account verified successfully", result);
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

  return sendAuthResponse(res, 200, "Login successful", result);
});

const googleAuth = asyncHandler(async (req, res) => {
  const result = await authService.googleAuth(req.body);

  return sendAuthResponse(res, 200, "Google authentication successful", result);
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken", authCookieOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, "Logged out successfully", { loggedOut: true }));
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

const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(req.user.id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, "Password changed successfully", result));
});

module.exports = {
  signup,
  verifyOtp,
  resendOtp,
  sendPhoneOtp,
  verifyPhoneOtp,
  login,
  googleAuth,
  logout,
  me,
  forgotPassword,
  resetPassword,
  changePassword,
};
