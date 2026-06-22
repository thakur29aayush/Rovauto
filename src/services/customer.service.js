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
const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      isOnboarded: true,
      isActive: true,
      customerProfile: true,
      vehicles: {
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      },
      locations: {
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

const updateProfile = async (userId, data) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      customerProfile: true,
    },
  });

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  if (data.phone && data.phone !== existingUser.phone) {
    const phoneExists = await prisma.user.findUnique({
      where: { phone: data.phone },
    });

    if (phoneExists) {
      throw new ApiError(409, "Phone number already in use");
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isOnboarded: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const updatedProfile = await tx.customerProfile.upsert({
      where: { userId },
      update: {
        ...(data.address !== undefined && { address: data.address || null }),
        ...(data.avatarUrl !== undefined && {
          avatarUrl: data.avatarUrl || null,
        }),
      },
      create: {
        userId,
        address: data.address || null,
        avatarUrl: data.avatarUrl || null,
      },
    });

    return {
      ...updatedUser,
      customerProfile: updatedProfile,
    };
  });

  return result;
};
module.exports = {
  completeOnboarding,
  getProfile,
  updateProfile,
};