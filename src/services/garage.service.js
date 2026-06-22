const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");
const calculateDistanceKm = require("../utils/distance");

const getGarages = async (query) => {
  const {
    search,
    city,
    area,
    verified,
    serviceId,
    minRating,
    openNow,
  } = query;

  const where = {
    isActive: true,
    ...(city && { city: { contains: city, mode: "insensitive" } }),
    ...(area && { area: { contains: area, mode: "insensitive" } }),
    ...(verified === "true" && { isVerified: true }),
    ...(minRating && { ratingAvg: { gte: Number(minRating) } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { area: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(serviceId && {
      services: {
        some: {
          serviceId,
          isActive: true,
        },
      },
    }),
  };

  let garages = await prisma.garage.findMany({
    where,
    include: {
      services: {
        where: { isActive: true },
        include: {
          service: {
            include: {
              category: true,
            },
          },
        },
      },
    },
    orderBy: [{ isVerified: "desc" }, { ratingAvg: "desc" }],
  });

  if (openNow === "true") {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    garages = garages.filter((garage) => {
      if (!garage.openingTime || !garage.closingTime) return true;
      return garage.openingTime <= currentTime && garage.closingTime >= currentTime;
    });
  }

  return garages;
};

const getNearbyGarages = async (userId, query) => {
  const { maxDistance = 10, serviceId, verified, minRating, openNow } = query;

  const defaultLocation = await prisma.customerLocation.findFirst({
    where: {
      userId,
      isDefault: true,
    },
  });

  if (!defaultLocation) {
    throw new ApiError(404, "Default location not found");
  }

  let garages = await getGarages({
    serviceId,
    verified,
    minRating,
    openNow,
  });

  garages = garages
    .map((garage) => ({
      ...garage,
      distanceKm: calculateDistanceKm(
        defaultLocation.latitude,
        defaultLocation.longitude,
        garage.latitude,
        garage.longitude
      ),
    }))
    .filter((garage) => garage.distanceKm <= Number(maxDistance))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return garages;
};

const getGarageById = async (garageId) => {
  const garage = await prisma.garage.findFirst({
    where: {
      id: garageId,
      isActive: true,
    },
    include: {
      services: {
        where: { isActive: true },
        include: {
          service: {
            include: {
              category: true,
            },
          },
        },
      },
      slots: {
        where: {
          isActive: true,
          date: {
            gte: new Date(),
          },
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      },
      reviews: {
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!garage) {
    throw new ApiError(404, "Garage not found");
  }

  return garage;
};

const getGarageServices = async (garageId) => {
  const garage = await prisma.garage.findFirst({
    where: {
      id: garageId,
      isActive: true,
    },
  });

  if (!garage) {
    throw new ApiError(404, "Garage not found");
  }

  return prisma.garageService.findMany({
    where: {
      garageId,
      isActive: true,
    },
    include: {
      service: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      price: "asc",
    },
  });
};

const getGarageSlots = async (garageId) => {
  const garage = await prisma.garage.findFirst({
    where: {
      id: garageId,
      isActive: true,
    },
  });

  if (!garage) {
    throw new ApiError(404, "Garage not found");
  }

  return prisma.garageSlot.findMany({
    where: {
      garageId,
      isActive: true,
      date: {
        gte: new Date(),
      },
      bookedCount: {
        lt: prisma.garageSlot.fields.capacity,
      },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
};

module.exports = {
  getGarages,
  getNearbyGarages,
  getGarageById,
  getGarageServices,
  getGarageSlots,
};