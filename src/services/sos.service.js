const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");
const generateBookingCode = require("../utils/bookingCode");
const garageRequestService = require("./garageRequest.service");

const SOS_CHARGE = 50;
const SOS_ESTIMATED_AMOUNT = 500;

const createSosRequest = async (userId, data) => {
  const { vehicleId, latitude, longitude, address, note } = data;

  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: vehicleId,
      userId,
    },
  });

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet || wallet.balance < SOS_CHARGE) {
    throw new ApiError(400, "Insufficient RovAuto coins for SOS");
  }

  const sosCategory = await prisma.serviceCategory.upsert({
    where: {
      name: "SOS",
    },
    update: {},
    create: {
      name: "SOS",
      description: "Emergency roadside assistance",
      isActive: true,
    },
  });

  const sosService = await prisma.service.upsert({
    where: {
      id: "sos-service-fixed-id",
    },
    update: {
      categoryId: sosCategory.id,
      name: "SOS Emergency Assistance",
      description: "Emergency garage assistance request",
      basePrice: SOS_ESTIMATED_AMOUNT,
      minPrice: 500,
      maxPrice: 2000,
      durationMin: 30,
      isActive: true,
    },
    create: {
      id: "sos-service-fixed-id",
      categoryId: sosCategory.id,
      name: "SOS Emergency Assistance",
      description: "Emergency garage assistance request",
      basePrice: SOS_ESTIMATED_AMOUNT,
      minPrice: 500,
      maxPrice: 2000,
      durationMin: 30,
      isActive: true,
    },
  });

  const bookingCode = await generateBookingCode();

  const booking = await prisma.booking.create({
    data: {
      userId,
      vehicleId,
      garageId: null,

      bookingCode,

      requestType: "SOS",
      status: "SEARCHING_GARAGE",

      customerLatitude: latitude,
      customerLongitude: longitude,
      customerAddress: address || null,

      customerNote: note || "SOS emergency request",

      handlingFee: SOS_CHARGE,
      totalServiceAmount: SOS_ESTIMATED_AMOUNT,
      walletAmountUsed: 0,
      payableAmount: 0,

      services: {
        create: {
          serviceId: sosService.id,
          quantity: 1,
          estimatedPrice: SOS_ESTIMATED_AMOUNT,
        },
      },

      payment: {
        create: {
          amount: 0,
          currency: "INR",
          status: "PAID",
          walletAmountUsed: 0,
          upiAmountPaid: 0,
        },
      },
    },
    include: {
      vehicle: true,
      services: {
        include: {
          service: true,
        },
      },
      payment: true,
    },
  });

  const requests = await garageRequestService.broadcastBookingToNearbyGarages(
    booking.id,
    {
      maxDistance: 15,
    }
  );

  return {
    booking,
    requests,
    message: "SOS signal sent to nearby garages",
  };
};

const getSosRequestById = async (userId, bookingId) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId,
      requestType: "SOS",
    },
    include: {
      vehicle: true,
      garage: true,
      services: {
        include: {
          service: {
            include: {
              category: true,
              media: true,
            },
          },
        },
      },
      broadcasts: {
        include: {
          garage: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      payment: true,
    },
  });

  if (!booking) {
    throw new ApiError(404, "SOS request not found");
  }

  return booking;
};

module.exports = {
  createSosRequest,
  getSosRequestById,
};