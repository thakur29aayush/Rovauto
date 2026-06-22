const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");

const createVehicle = async (userId, data) => {
  const vehicleCount = await prisma.vehicle.count({
    where: { userId },
  });

  const shouldBeDefault = data.isDefault === true || vehicleCount === 0;

  const result = await prisma.$transaction(async (tx) => {
    if (shouldBeDefault) {
      await tx.vehicle.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const vehicle = await tx.vehicle.create({
      data: {
        userId,
        brand: data.brand,
        model: data.model,
        year: Number(data.year),
        fuelType: data.fuelType,
        registrationNumber: data.registrationNumber || null,
        isDefault: shouldBeDefault,
      },
    });

    return vehicle;
  });

  return result;
};

const getMyVehicles = async (userId) => {
  const vehicles = await prisma.vehicle.findMany({
    where: { userId },
    orderBy: [
      { isDefault: "desc" },
      { createdAt: "desc" },
    ],
  });

  return vehicles;
};

const getVehicleById = async (userId, vehicleId) => {
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: vehicleId,
      userId,
    },
  });

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  return vehicle;
};

const updateVehicle = async (userId, vehicleId, data) => {
  const existingVehicle = await prisma.vehicle.findFirst({
    where: {
      id: vehicleId,
      userId,
    },
  });

  if (!existingVehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  const shouldBeDefault = data.isDefault === true;

  const result = await prisma.$transaction(async (tx) => {
    if (shouldBeDefault) {
      await tx.vehicle.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const updatedVehicle = await tx.vehicle.update({
      where: { id: vehicleId },
      data: {
        ...(data.brand !== undefined && { brand: data.brand }),
        ...(data.model !== undefined && { model: data.model }),
        ...(data.year !== undefined && { year: Number(data.year) }),
        ...(data.fuelType !== undefined && { fuelType: data.fuelType }),
        ...(data.registrationNumber !== undefined && {
          registrationNumber: data.registrationNumber || null,
        }),
        ...(data.isDefault !== undefined && {
          isDefault: shouldBeDefault ? true : data.isDefault,
        }),
      },
    });

    return updatedVehicle;
  });

  return result;
};

const deleteVehicle = async (userId, vehicleId) => {
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: vehicleId,
      userId,
    },
  });

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  const bookingCount = await prisma.booking.count({
    where: {
      vehicleId,
    },
  });

  if (bookingCount > 0) {
    throw new ApiError(
      400,
      "Vehicle cannot be deleted because it is linked to bookings"
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.vehicle.delete({
      where: { id: vehicleId },
    });

    if (vehicle.isDefault) {
      const nextVehicle = await tx.vehicle.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      if (nextVehicle) {
        await tx.vehicle.update({
          where: { id: nextVehicle.id },
          data: { isDefault: true },
        });
      }
    }
  });

  return {
    deleted: true,
  };
};

const setDefaultVehicle = async (userId, vehicleId) => {
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: vehicleId,
      userId,
    },
  });

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.vehicle.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    const updatedVehicle = await tx.vehicle.update({
      where: { id: vehicleId },
      data: { isDefault: true },
    });

    return updatedVehicle;
  });

  return result;
};

module.exports = {
  createVehicle,
  getMyVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  setDefaultVehicle,
};