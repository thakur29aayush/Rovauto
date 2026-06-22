const prisma = require("../config/prisma");

const getServiceCategories = async () => {
  return prisma.serviceCategory.findMany({
    where: { isActive: true },
    include: {
      services: {
        where: { isActive: true },
      },
    },
    orderBy: { name: "asc" },
  });
};

const getServices = async () => {
  return prisma.service.findMany({
    where: { isActive: true },
    include: {
      category: true,
    },
    orderBy: { name: "asc" },
  });
};

module.exports = {
  getServiceCategories,
  getServices,
};