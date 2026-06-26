const prisma = require("../config/prisma");
const { getCache, setCache } = require("../utils/cache");

const DASHBOARD_TTL = Number(process.env.DASHBOARD_CACHE_TTL || 60);

const dashboardInclude = {
  vehicles: {
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  },
  customerProfile: true,
  wallet: true,
};

const bookingListInclude = {
  vehicle: true,
  garage: {
    select: {
      id: true,
      name: true,
      phone: true,
      whatsappNo: true,
      latitude: true,
      longitude: true,
    },
  },
  services: {
    include: {
      service: {
        select: {
          id: true,
          name: true,
          basePrice: true,
          minPrice: true,
        },
      },
    },
  },
  payment: true,
  review: true,
};

const ACTIVE_STATUSES = [
  "PENDING_PAYMENT",
  "SEARCHING_GARAGE",
  "GARAGE_ASSIGNED",
  "CONFIRMED",
  "IN_PROGRESS",
];

const getCustomerDashboard = async (userId) => {
  const cacheKey = `customer:${userId}:dashboard`;

  const cached = await getCache(cacheKey);
  if (cached) {
    return {
      ...cached,
      fromCache: true,
    };
  }

  const [user, activeBookings, completedBookingsCount, recentBookings] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isEmailVerified: true,
          isOnboarded: true,
          customerProfile: true,
          vehicles: {
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
          },
          wallet: true,
        },
      }),

      prisma.booking.findMany({
        where: {
          userId,
          status: {
            in: ACTIVE_STATUSES,
          },
        },
        include: bookingListInclude,
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),

      prisma.booking.count({
        where: {
          userId,
          status: "COMPLETED",
        },
      }),

      prisma.booking.findMany({
        where: {
          userId,
        },
        include: bookingListInclude,
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),
    ]);

  const data = {
    user,
    vehicles: user?.vehicles || [],
    vehicle: user?.vehicles?.find((v) => v.isDefault) || user?.vehicles?.[0] || null,
    wallet: user?.wallet || null,
    activeBookings,
    completedBookingsCount,
    recentBookings,
  };

  await setCache(cacheKey, data, DASHBOARD_TTL);

  return {
    ...data,
    fromCache: false,
  };
};

module.exports = {
  getCustomerDashboard,
};