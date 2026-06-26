const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");
const calculateDistanceKm = require("../utils/distance");

const garageIncludeForList = {
  images: {
    orderBy: [{ isThumbnail: "desc" }, { order: "asc" }],
  },
  videos: {
    orderBy: { order: "asc" },
  },
  services: {
    where: { isActive: true },
    include: {
      service: {
        include: {
          category: true,
          media: {
            orderBy: [{ isThumbnail: "desc" }, { order: "asc" }],
          },
        },
      },
    },
  },
};

const garageIncludeForDetails = {
  images: {
    orderBy: [{ isThumbnail: "desc" }, { order: "asc" }],
  },
  videos: {
    orderBy: { order: "asc" },
  },
  services: {
    where: { isActive: true },
    include: {
      service: {
        include: {
          category: true,
          media: {
            orderBy: [{ isThumbnail: "desc" }, { order: "asc" }],
          },
        },
      },
    },
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
  wallet: true,
};

const isGarageOpenNow = (garage) => {
  if (!garage.openingTime || !garage.closingTime) return true;

  const currentTime = new Date().toTimeString().slice(0, 5);

  return garage.openingTime <= currentTime && garage.closingTime >= currentTime;
};

const buildGarageServiceFilter = (serviceIds = []) => {
  if (!Array.isArray(serviceIds) || serviceIds.length === 0) return {};

  const uniqueServiceIds = [...new Set(serviceIds)];

  return {
    AND: uniqueServiceIds.map((serviceId) => ({
      services: {
        some: {
          serviceId,
          isActive: true,
        },
      },
    })),
  };
};

const getGarages = async (query = {}) => {
  const {
    search,
    city,
    area,
    verified,
    serviceId,
    serviceIds,
    minRating,
    openNow,
  } = query;

  const finalServiceIds = serviceIds || (serviceId ? [serviceId] : []);

  const where = {
    isActive: true,

    ...buildGarageServiceFilter(finalServiceIds),

    ...(city && {
      city: {
        contains: city,
        mode: "insensitive",
      },
    }),

    ...(area && {
      area: {
        contains: area,
        mode: "insensitive",
      },
    }),

    ...(verified === "true" && {
      isVerified: true,
    }),

    ...(minRating && {
      ratingAvg: {
        gte: Number(minRating),
      },
    }),

    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          area: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          city: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          address: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    }),
  };

  let garages = await prisma.garage.findMany({
    where,
    include: garageIncludeForList,
    orderBy: [{ isVerified: "desc" }, { ratingAvg: "desc" }],
  });

  if (openNow === "true") {
    garages = garages.filter(isGarageOpenNow);
  }

  return garages.map((garage) => ({
    ...garage,
    thumbnail: garage.images.find((image) => image.isThumbnail === true) || null,
  }));
};

const getNearbyGarages = async (userId, query = {}) => {
  const {
    maxDistance = 10,
    serviceId,
    serviceIds,
    verified,
    minRating,
    openNow,
  } = query;

  const defaultLocation = await prisma.customerLocation.findFirst({
    where: {
      userId,
      isDefault: true,
    },
  });

  if (!defaultLocation) {
    throw new ApiError(404, "Default location not found");
  }

  const finalServiceIds = serviceIds || (serviceId ? [serviceId] : []);

  let garages = await getGarages({
    serviceIds: finalServiceIds,
    verified,
    minRating,
    openNow,
  });

  return garages
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
};

const findNearbyEligibleGarages = async ({
  latitude,
  longitude,
  serviceIds = [],
  maxDistance = 10,
  onlyVerified = true,
  requireOpenNow = true,
  requireWalletBalance = false,
  minGarageWalletBalance = 0,
}) => {
  if (!latitude || !longitude) {
    throw new ApiError(400, "Customer location is required");
  }

  if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
    throw new ApiError(400, "At least one service is required");
  }

  let garages = await prisma.garage.findMany({
    where: {
      isActive: true,

      ...(onlyVerified && {
        isVerified: true,
      }),

      ...buildGarageServiceFilter(serviceIds),

      ...(requireWalletBalance && {
        wallet: {
          balance: {
            gte: minGarageWalletBalance,
          },
        },
      }),
    },
    include: {
      ...garageIncludeForList,
      wallet: true,
    },
    orderBy: [{ isVerified: "desc" }, { ratingAvg: "desc" }],
  });

  if (requireOpenNow) {
    garages = garages.filter(isGarageOpenNow);
  }

  return garages
    .map((garage) => ({
      ...garage,
      thumbnail:
        garage.images.find((image) => image.isThumbnail === true) || null,
      distanceKm: calculateDistanceKm(
        latitude,
        longitude,
        garage.latitude,
        garage.longitude
      ),
    }))
    .filter((garage) => garage.distanceKm <= Number(maxDistance))
    .sort((a, b) => a.distanceKm - b.distanceKm);
};

const getGarageById = async (garageId) => {
  const garage = await prisma.garage.findFirst({
    where: {
      id: garageId,
      isActive: true,
    },
    include: garageIncludeForDetails,
  });

  if (!garage) {
    throw new ApiError(404, "Garage not found");
  }

  return {
    ...garage,
    thumbnail: garage.images.find((image) => image.isThumbnail === true) || null,
  };
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
          media: {
            orderBy: [{ isThumbnail: "desc" }, { order: "asc" }],
          },
        },
      },
    },
    orderBy: {
      price: "asc",
    },
  });
};

module.exports = {
  getGarages,
  getNearbyGarages,
  findNearbyEligibleGarages,
  getGarageById,
  getGarageServices,
};