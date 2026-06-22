const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");

const completeOnboarding = async (userId, { vehicle, location }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, "Please verify email before onboarding");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.vehicle.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    await tx.customerLocation.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    const createdVehicle = await tx.vehicle.create({
      data: {
        userId,
        brand: vehicle.brand,
        model: vehicle.model,
        year: Number(vehicle.year),
        fuelType: vehicle.fuelType,
        registrationNumber: vehicle.registrationNumber || null,
        isDefault: true,
      },
    });

    const createdLocation = await tx.customerLocation.create({
      data: {
        userId,
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        address: location.address || null,
        source: "GPS",
        isDefault: true,
      },
    });

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        isOnboarded: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        isOnboarded: true,
      },
    });

    return {
      user: updatedUser,
      vehicle: createdVehicle,
      location: createdLocation,
    };
  });

  return result;
};

module.exports = {
  completeOnboarding,
};