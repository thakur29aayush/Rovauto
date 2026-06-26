const WALLET_TRANSACTION_TYPES = {
  CREDIT: "CREDIT",
  DEBIT: "DEBIT",
  RECHARGE: "RECHARGE",
  REFUND: "REFUND",
  CASHBACK: "CASHBACK",
  BOOKING_PAYMENT: "BOOKING_PAYMENT",
  BOOKING_REFUND: "BOOKING_REFUND",
  GARAGE_ACCEPT_FEE: "GARAGE_ACCEPT_FEE",
  SOS_DEDUCTION: "SOS_DEDUCTION",
};

const WALLET_TRANSACTION_STATUS = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
};

const getBalanceAfterCredit = (currentBalance, amount) => {
  return currentBalance + amount;
};

const getBalanceAfterDebit = (currentBalance, amount) => {
  if (currentBalance < amount) {
    throw new Error("Insufficient wallet balance");
  }

  return currentBalance - amount;
};

const isCreditTransaction = (type) => {
  return [
    WALLET_TRANSACTION_TYPES.CREDIT,
    WALLET_TRANSACTION_TYPES.RECHARGE,
    WALLET_TRANSACTION_TYPES.REFUND,
    WALLET_TRANSACTION_TYPES.CASHBACK,
    WALLET_TRANSACTION_TYPES.BOOKING_REFUND,
  ].includes(type);
};

const isDebitTransaction = (type) => {
  return [
    WALLET_TRANSACTION_TYPES.DEBIT,
    WALLET_TRANSACTION_TYPES.BOOKING_PAYMENT,
    WALLET_TRANSACTION_TYPES.GARAGE_ACCEPT_FEE,
    WALLET_TRANSACTION_TYPES.SOS_DEDUCTION,
  ].includes(type);
};

const calculateWalletBalance = ({ currentBalance, amount, type }) => {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Invalid wallet transaction amount");
  }

  if (isCreditTransaction(type)) {
    return getBalanceAfterCredit(currentBalance, amount);
  }

  if (isDebitTransaction(type)) {
    return getBalanceAfterDebit(currentBalance, amount);
  }

  throw new Error("Invalid wallet transaction type");
};

module.exports = {
  WALLET_TRANSACTION_TYPES,
  WALLET_TRANSACTION_STATUS,
  getBalanceAfterCredit,
  getBalanceAfterDebit,
  isCreditTransaction,
  isDebitTransaction,
  calculateWalletBalance,
};