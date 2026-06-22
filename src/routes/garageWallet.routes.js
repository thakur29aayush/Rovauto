const express = require("express");

const garageWalletController = require("../controllers/garageWallet.controller");
const { protect } = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");

const {
  walletRechargeSchema,
  walletTransactionQuerySchema,
} = require("../validations/wallet.validation");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("GARAGE_OWNER", "ADMIN"));

/**
 * GET /api/garage/wallet
 * Get garage wallet balance.
 */
router.get("/", garageWalletController.getGarageWallet);

/**
 * GET /api/garage/wallet/transactions
 * Get garage wallet transactions.
 */
router.get(
  "/transactions",
  walletTransactionQuerySchema,
  validate,
  garageWalletController.getGarageWalletTransactions
);

/**
 * POST /api/garage/wallet/recharge
 * Recharge garage wallet.
 */
router.post(
  "/recharge",
  walletRechargeSchema,
  validate,
  garageWalletController.rechargeGarageWallet
);

module.exports = router;