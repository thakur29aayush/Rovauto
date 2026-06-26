const prisma = require("../config/prisma");

const getVehicleBrands = async () => {
  return prisma.vehicleBrand.findMany({
    where: {
      isActive: true,
    },
    include: {
      models: {
        where: {
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
};

const getVehicleModelsByBrand = async (brandId) => {
  return prisma.vehicleModel.findMany({
    where: {
      brandId,
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

module.exports = {
  getVehicleBrands,
  getVehicleModelsByBrand,
};