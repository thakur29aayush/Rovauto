const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");

const createLocation = async (userId, data) => {
  const locationCount = await prisma.customerLocation.count({
    where: { userId },
  });

  const shouldBeDefault = data.isDefault === true || locationCount === 0;

  const result = await prisma.$transaction(async (tx) => {
    if (shouldBeDefault) {
      await tx.customerLocation.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const location = await tx.customerLocation.create({
      data: {
        userId,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        address: data.address || null,
        source: data.source || "GPS",
        isDefault: shouldBeDefault,
      },
    });

    return location;
  });

  return result;
};

const getMyLocations = async (userId) => {
  const locations = await prisma.customerLocation.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return locations;
};

const getLocationById = async (userId, locationId) => {
  const location = await prisma.customerLocation.findFirst({
    where: {
      id: locationId,
      userId,
    },
  });

  if (!location) {
    throw new ApiError(404, "Location not found");
  }

  return location;
};

const updateLocation = async (userId, locationId, data) => {
  const existingLocation = await prisma.customerLocation.findFirst({
    where: {
      id: locationId,
      userId,
    },
  });

  if (!existingLocation) {
    throw new ApiError(404, "Location not found");
  }

  const shouldBeDefault = data.isDefault === true;

  const result = await prisma.$transaction(async (tx) => {
    if (shouldBeDefault) {
      await tx.customerLocation.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const updatedLocation = await tx.customerLocation.update({
      where: { id: locationId },
      data: {
        ...(data.latitude !== undefined && {
          latitude: Number(data.latitude),
        }),
        ...(data.longitude !== undefined && {
          longitude: Number(data.longitude),
        }),
        ...(data.address !== undefined && {
          address: data.address || null,
        }),
        ...(data.source !== undefined && {
          source: data.source,
        }),
        ...(data.isDefault !== undefined && {
          isDefault: shouldBeDefault ? true : data.isDefault,
        }),
      },
    });

    return updatedLocation;
  });

  return result;
};

const deleteLocation = async (userId, locationId) => {
  const location = await prisma.customerLocation.findFirst({
    where: {
      id: locationId,
      userId,
    },
  });

  if (!location) {
    throw new ApiError(404, "Location not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.customerLocation.delete({
      where: { id: locationId },
    });

    if (location.isDefault) {
      const nextLocation = await tx.customerLocation.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      if (nextLocation) {
        await tx.customerLocation.update({
          where: { id: nextLocation.id },
          data: { isDefault: true },
        });
      }
    }
  });

  return {
    deleted: true,
  };
};

const setDefaultLocation = async (userId, locationId) => {
  const location = await prisma.customerLocation.findFirst({
    where: {
      id: locationId,
      userId,
    },
  });

  if (!location) {
    throw new ApiError(404, "Location not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.customerLocation.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    const updatedLocation = await tx.customerLocation.update({
      where: { id: locationId },
      data: { isDefault: true },
    });

    return updatedLocation;
  });

  return result;
};

module.exports = {
  createLocation,
  getMyLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  setDefaultLocation,
};