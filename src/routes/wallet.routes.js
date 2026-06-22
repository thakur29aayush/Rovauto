const express = require("express");

const walletController = require("../controllers/wallet.controller");
const { protect } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");

const {
  walletRechargeSchema,
  walletTransactionQuerySchema,
} = require("../validations/wallet.validation");

const router = express.Router();

router.use(protect);

router.get("/", walletController.getWallet);

router.get(
  "/transactions",
  walletTransactionQuerySchema,
  validate,
  walletController.getWalletTransactions
);

router.post(
  "/recharge",
  walletRechargeSchema,
  validate,
  walletController.rechargeWallet
);

module.exports = router;