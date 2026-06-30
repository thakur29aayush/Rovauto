const { body, query } = require("express-validator");

const createRechargeOrderSchema = [
  body("amount")
    .isInt({ min: 1000 })
    .withMessage("Garage wallet recharge must be at least Rs. 1000"),
];

const verifyRechargeOrderSchema = [
  body("cashfreeOrderId").trim().notEmpty().withMessage("Cashfree order ID is required"),
];

const walletTransactionQuerySchema = [
  query("page").optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }),
  query("limit").optional({ nullable: true, checkFalsy: true }).isInt({ min: 1, max: 100 }),
  query("type")
    .optional({ nullable: true, checkFalsy: true })
    .isIn(["CREDIT", "DEBIT", "RECHARGE", "REFUND", "CASHBACK", "BOOKING_PAYMENT", "BOOKING_REFUND", "GARAGE_ACCEPT_FEE", "SOS_DEDUCTION"])
    .withMessage("Invalid wallet transaction type"),
];

module.exports = {
  createRechargeOrderSchema,
  verifyRechargeOrderSchema,
  walletTransactionQuerySchema,
};
