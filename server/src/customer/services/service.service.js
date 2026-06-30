const prisma = require("../../config/prisma");
const ApiError = require("../../utils/apiError");
const { getCache, setCache } = require("../../utils/cache");
const { addServicePriceRange } = require("../../utils/pricing");

const getServiceCategories = async () => {
  const cacheKey = "services:categories";

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    include: {
      services: {
        where: { isActive: true },
        include: {
          media: {
            orderBy: [{ isThumbnail: "desc" }, { order: "asc" }],
          },
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const result = categories.map((category) => ({
    ...category,
    services: category.services.map(addServicePriceRange),
  }));

  await setCache(cacheKey, result, 30 * 60);

  return result;
};

const getServices = async (query = {}) => {
  const { categoryId, search, minPrice, maxPrice } = query;

  const safeCategoryId =
    categoryId && categoryId !== "null" && categoryId !== "undefined"
      ? categoryId
      : null;

  const cacheKey = `services:list:${JSON.stringify({
    categoryId: safeCategoryId,
    search: search || "",
    minPrice: minPrice || "",
    maxPrice: maxPrice || "",
  })}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const services = await prisma.service.findMany({
    where: {
      isActive: true,

      ...(safeCategoryId && {
        categoryId: safeCategoryId,
      }),

      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),

      ...(minPrice && {
        OR: [
          { basePrice: { gte: Number(minPrice) } },
          { minPrice: { gte: Number(minPrice) } },
        ],
      }),

      ...(maxPrice && {
        OR: [
          { basePrice: { lte: Number(maxPrice) } },
          { maxPrice: { lte: Number(maxPrice) } },
        ],
      }),
    },
    include: {
      category: true,
      media: {
        orderBy: [{ isThumbnail: "desc" }, { order: "asc" }],
      },
    },
    orderBy: { name: "asc" },
  });

  const result = services.map(addServicePriceRange);

  await setCache(cacheKey, result, 30 * 60);

  return result;
};

const getServiceById = async (serviceId) => {
  const cacheKey = `services:detail:${serviceId}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      isActive: true,
    },
    include: {
      category: true,
      media: {
        orderBy: [{ isThumbnail: "desc" }, { order: "asc" }],
      },
      garageServices: {
        where: {
          isActive: true,
          garage: {
            isActive: true,
          },
        },
        include: {
          garage: {
            select: {
              id: true,
              name: true,
              area: true,
              city: true,
              isVerified: true,
              ratingAvg: true,
              ratingCount: true,
            },
          },
        },
      },
    },
  });

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  const result = {
    ...addServicePriceRange(service),
    thumbnail: service.media.find((item) => item.isThumbnail) || null,
  };

  await setCache(cacheKey, result, 30 * 60);

  return result;
};

module.exports = {
  getServiceCategories,
  getServices,
  getServiceById,
};
