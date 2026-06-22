const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");

const serviceInclude = {
  category: true,
  media: {
    orderBy: [{ isThumbnail: "desc" }, { order: "asc" }],
  },
};

const getServiceCategories = async () => {
  return prisma.serviceCategory.findMany({
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
};

const getServices = async (query = {}) => {
  const { categoryId, search, minPrice, maxPrice } = query;

  return prisma.service.findMany({
    where: {
      isActive: true,

      ...(categoryId && { categoryId }),

      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
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
    include: serviceInclude,
    orderBy: { name: "asc" },
  });
};

const getServiceById = async (serviceId) => {
  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      isActive: true,
    },
    include: {
      ...serviceInclude,
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

  return {
    ...service,
    thumbnail: service.media.find((item) => item.isThumbnail) || null,
  };
};

module.exports = {
  getServiceCategories,
  getServices,
  getServiceById,
};