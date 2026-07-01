const prisma = require("../../config/prisma");
const ApiError = require("../../utils/apiError");
const {
  GARAGE_MINIMUM_ACTIVATION_IMAGES,
  GARAGE_MINIMUM_ACTIVATION_RECHARGE,
} = require("../constants");

const getGarageForOwner = async (userId, options = {}) => {
  const garage = await prisma.garage.findFirst({
    where: {
      ownerId: userId,
      ...(options.requireActive ? { isActive: true } : {}),
    },
    include: options.include,
  });

  if (!garage) {
    throw new ApiError(404, "Garage not found for this owner");
  }

  return garage;
};

const getGarageOwnerProfile = async (userId) => {
  const garage = await getGarageForOwner(userId, {
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
        },
      },
      wallet: true,
      images: {
        orderBy: [{ isThumbnail: "desc" }, { order: "asc" }],
      },
    },
  });

  return {
    ...garage,
    activation: {
      minimumBalance: GARAGE_MINIMUM_ACTIVATION_RECHARGE,
      minimumPhotos: GARAGE_MINIMUM_ACTIVATION_IMAGES,
      walletBalance: garage.wallet?.balance || 0,
      photoCount: garage.images?.length || 0,
      hasMinimumBalance:
        (garage.wallet?.balance || 0) >= GARAGE_MINIMUM_ACTIVATION_RECHARGE,
      hasMinimumPhotos:
        (garage.images?.length || 0) >= GARAGE_MINIMUM_ACTIVATION_IMAGES,
      isActive: garage.isActive,
    },
  };
};

const activateGarageIfEligible = async (tx, garageId) => {
  const garage = await tx.garage.findUnique({
    where: { id: garageId },
    include: { wallet: true, images: true },
  });

  if (!garage) {
    throw new ApiError(404, "Garage not found");
  }

  if (
    !garage.isVerified ||
    !garage.wallet ||
    garage.wallet.balance < GARAGE_MINIMUM_ACTIVATION_RECHARGE ||
    (garage.images?.length || 0) < GARAGE_MINIMUM_ACTIVATION_IMAGES
  ) {
    return garage;
  }

  if (garage.isActive) return garage;

  return tx.garage.update({
    where: { id: garageId },
    data: { isActive: true },
    include: { wallet: true, images: true },
  });
};

module.exports = {
  activateGarageIfEligible,
  getGarageForOwner,
  getGarageOwnerProfile,
};
