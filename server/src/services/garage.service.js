const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");
const calculateDistanceKm = require("../utils/distance");
const { getCache, setCache } = require("../utils/cache");

const GARAGE_LIST_TTL = 5 * 60;
const GARAGE_DETAIL_TTL = 5 * 60;

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

const normalizeServiceIds = (serviceIds) => {
  if (!serviceIds) return [];

  if (Array.isArray(serviceIds)) {
    return [...new Set(serviceIds.filter(Boolean))];
  }

  return String(serviceIds)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const buildGarageServiceFilter = (serviceIds = []) => {
  const uniqueServiceIds = normalizeServiceIds(serviceIds);

  if (uniqueServiceIds.length === 0) return {};

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

const serializeGarageQuery = (query = {}) => {
  return JSON.stringify(
    Object.keys(query)
      .sort()
      .reduce((acc, key) => {
        const value = query[key];

        if (Array.isArray(value)) {
          acc[key] = [...value].sort();
        } else {
          acc[key] = value ?? "";
        }

        return acc;
      }, {})
  );
};

const addThumbnail = (garage) => ({
  ...garage,
  thumbnail: garage.images.find((image) => image.isThumbnail === true) || null,
});

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

  const finalServiceIds = normalizeServiceIds(
    serviceIds || (serviceId ? [serviceId] : [])
  );

  const cacheKey = `garages:list:${serializeGarageQuery({
    search,
    city,
    area,
    verified,
    serviceIds: finalServiceIds,
    minRating,
    openNow,
  })}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

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

  const result = garages.map(addThumbnail);

  await setCache(cacheKey, result, GARAGE_LIST_TTL);

  return result;
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

  const finalServiceIds = normalizeServiceIds(
    serviceIds || (serviceId ? [serviceId] : [])
  );

  const garages = await getGarages({
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

  const finalServiceIds = normalizeServiceIds(serviceIds);

  if (finalServiceIds.length === 0) {
    throw new ApiError(400, "At least one service is required");
  }

  let garages = await prisma.garage.findMany({
    where: {
      isActive: true,

      ...(onlyVerified && {
        isVerified: true,
      }),

      ...buildGarageServiceFilter(finalServiceIds),

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
      ...addThumbnail(garage),
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
  const cacheKey = `garages:detail:${garageId}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

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

  const result = addThumbnail(garage);

  await setCache(cacheKey, result, GARAGE_DETAIL_TTL);

  return result;
};

const getGarageServices = async (garageId) => {
  const cacheKey = `garages:${garageId}:services`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const garage = await prisma.garage.findFirst({
    where: {
      id: garageId,
      isActive: true,
    },
  });

  if (!garage) {
    throw new ApiError(404, "Garage not found");
  }

  const services = await prisma.garageService.findMany({
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

  await setCache(cacheKey, services, GARAGE_DETAIL_TTL);

  return services;
};

module.exports = {
  getGarages,
  getNearbyGarages,
  findNearbyEligibleGarages,
  getGarageById,
  getGarageServices,
};