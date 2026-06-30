const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const ApiError = require("../../utils/apiError");
const walletService = require("../services/wallet.service");

const getWallet = asyncHandler(async (req, res) => {
  const wallet = await walletService.getWallet(req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Wallet fetched successfully", wallet));
});

const getWalletTransactions = asyncHandler(async (req, res) => {
  const result = await walletService.getWalletTransactions(
    req.user.id,
    req.query
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Wallet transactions fetched successfully", result));
});

const rechargeWallet = asyncHandler(async (req, res) => {
  throw new ApiError(
    501,
    "Wallet recharge requires verified payment processing and is temporarily disabled"
  );
});

module.exports = {
  getWallet,
  getWalletTransactions,
  rechargeWallet,
};
