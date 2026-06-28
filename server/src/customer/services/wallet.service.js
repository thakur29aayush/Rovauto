const prisma = require("../../config/prisma");
const ApiError = require("../../utils/apiError");
const invalidateCustomerCache = require("../../utils/invalidateCustomerCache");

const getOrCreateWallet = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  let wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId,
        type: "CUSTOMER",
        balance: 0,
      },
    });
  }

  return wallet;
};

const getWallet = async (userId) => {
  return getOrCreateWallet(userId);
};

const getWalletTransactions = async (userId, query = {}) => {
  const { page = 1, limit = 20, type } = query;

  const wallet = await getOrCreateWallet(userId);

  const skip = (Number(page) - 1) * Number(limit);

  const where = {
    walletId: wallet.id,
    ...(type && { type }),
  };

  const [transactions, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.walletTransaction.count({ where }),
  ]);

  return {
    wallet,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
    transactions,
  };
};

const creditWallet = async (userId, amount, type = "CREDIT", meta = {}) => {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new ApiError(400, "Invalid wallet amount");
  }

  const wallet = await getOrCreateWallet(userId);

  const result = await prisma.$transaction(async (tx) => {
    const currentWallet = await tx.wallet.findUnique({
      where: { id: wallet.id },
    });

    const balanceAfter = currentWallet.balance + amount;

    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: balanceAfter,
      },
    });

    const transaction = await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type,
        status: "SUCCESS",
        amount,
        balanceAfter,
        cashfreeOrderId: meta.cashfreeOrderId || null,
        cashfreePaymentId: meta.cashfreePaymentId || null,
        description: meta.description || "Wallet credited",
      },
    });

    return {
      wallet: updatedWallet,
      transaction,
    };
  });

  await invalidateCustomerCache(userId);

  return result;
};

const debitWallet = async (userId, amount, type = "DEBIT", description) => {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new ApiError(400, "Invalid wallet amount");
  }

  const wallet = await getOrCreateWallet(userId);

  const result = await prisma.$transaction(async (tx) => {
    const currentWallet = await tx.wallet.findUnique({
      where: { id: wallet.id },
    });

    if (!currentWallet || currentWallet.balance < amount) {
      throw new ApiError(400, "Insufficient wallet balance");
    }

    const balanceAfter = currentWallet.balance - amount;

    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: balanceAfter,
      },
    });

    const transaction = await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type,
        status: "SUCCESS",
        amount,
        balanceAfter,
        description: description || "Wallet debited",
      },
    });

    return {
      wallet: updatedWallet,
      transaction,
    };
  });

  await invalidateCustomerCache(userId);

  return result;
};

const rechargeWallet = async (userId, amount, meta = {}) => {
  return creditWallet(userId, amount, "RECHARGE", {
    ...meta,
    description: meta.description || "RovAuto coins wallet recharge",
  });
};

const refundToWallet = async (userId, amount, meta = {}) => {
  return creditWallet(userId, amount, "REFUND", {
    ...meta,
    description: meta.description || "Refund credited to RovAuto coins wallet",
  });
};

module.exports = {
  getOrCreateWallet,
  getWallet,
  getWalletTransactions,
  creditWallet,
  debitWallet,
  rechargeWallet,
  refundToWallet,
};
