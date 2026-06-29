const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");

const getOrCreateGarageWallet = async (garageId) => {
  const garage = await prisma.garage.findUnique({
    where: { id: garageId },
  });

  if (!garage) {
    throw new ApiError(404, "Garage not found");
  }

  let wallet = await prisma.garageWallet.findUnique({
    where: { garageId },
  });

  if (!wallet) {
    wallet = await prisma.garageWallet.create({
      data: {
        garageId,
        balance: 0,
      },
    });
  }

  return wallet;
};

const getGarageWallet = async (garageId) => {
  return getOrCreateGarageWallet(garageId);
};

const getGarageWalletTransactions = async (garageId, query = {}) => {
  const { page = 1, limit = 20, type } = query;

  const wallet = await getOrCreateGarageWallet(garageId);

  const skip = (Number(page) - 1) * Number(limit);

  const where = {
    garageWalletId: wallet.id,
    ...(type && { type }),
  };

  const [transactions, total] = await Promise.all([
    prisma.garageWalletTransaction.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.garageWalletTransaction.count({ where }),
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

const rechargeGarageWallet = async (garageId, amount, meta = {}) => {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new ApiError(400, "Invalid recharge amount");
  }

  const wallet = await getOrCreateGarageWallet(garageId);

  const result = await prisma.$transaction(async (tx) => {
    const currentWallet = await tx.garageWallet.findUnique({
      where: { id: wallet.id },
    });

    const balanceAfter = currentWallet.balance + amount;

    const updatedWallet = await tx.garageWallet.update({
      where: { id: wallet.id },
      data: {
        balance: balanceAfter,
      },
    });

    const transaction = await tx.garageWalletTransaction.create({
      data: {
        garageWalletId: wallet.id,
        garageId,
        type: "RECHARGE",
        status: "SUCCESS",
        amount,
        balanceAfter,
        cashfreeOrderId: meta.cashfreeOrderId || null,
        cashfreePaymentId: meta.cashfreePaymentId || null,
        description: meta.description || "Garage wallet recharge",
      },
    });

    return {
      wallet: updatedWallet,
      transaction,
    };
  });

  return result;
};

const debitGarageWallet = async (garageId, amount, type, description) => {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new ApiError(400, "Invalid debit amount");
  }

  const wallet = await getOrCreateGarageWallet(garageId);

  return prisma.$transaction(async (tx) => {
    const currentWallet = await tx.garageWallet.findUnique({
      where: { id: wallet.id },
    });

    if (!currentWallet || currentWallet.balance < amount) {
      throw new ApiError(400, "Insufficient garage wallet balance");
    }

    const balanceAfter = currentWallet.balance - amount;

    const updatedWallet = await tx.garageWallet.update({
      where: { id: wallet.id },
      data: {
        balance: balanceAfter,
      },
    });

    const transaction = await tx.garageWalletTransaction.create({
      data: {
        garageWalletId: wallet.id,
        garageId,
        type,
        status: "SUCCESS",
        amount,
        balanceAfter,
        description,
      },
    });

    return {
      wallet: updatedWallet,
      transaction,
    };
  });
};

module.exports = {
  getOrCreateGarageWallet,
  getGarageWallet,
  getGarageWalletTransactions,
  rechargeGarageWallet,
  debitGarageWallet,
};
