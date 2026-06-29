const prisma = require("../../config/prisma");
const { getCache, setCache } = require("../../utils/cache");

const getVehicleBrands = async () => {
  const cacheKey = "vehicle-meta:brands";

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const brands = await prisma.vehicleBrand.findMany({
    where: { isActive: true },
    include: {
      models: {
        where: { isActive: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  await setCache(cacheKey, brands, 24 * 60 * 60);

  return brands;
};

const getVehicleModelsByBrand = async (brandId) => {
  const cacheKey = `vehicle-meta:brand:${brandId}:models`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const models = await prisma.vehicleModel.findMany({
    where: {
      brandId,
      isActive: true,
    },
    orderBy: { name: "asc" },
  });

  await setCache(cacheKey, models, 24 * 60 * 60);

  return models;
};

module.exports = {
  getVehicleBrands,
  getVehicleModelsByBrand,
};
