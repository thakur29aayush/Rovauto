const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");
const garageService = require("./garage.service");

const BOOKING_STATUS = require("../constants/bookingStatus");
const BROADCAST_STATUS = require("../constants/broadcastStatus");
const REQUEST_TYPE = require("../constants/requestType");
const WALLET_TRANSACTION_TYPE = require("../constants/walletTransactionType");
const WALLET_TRANSACTION_STATUS = require("../constants/walletTransactionStatus");

const GARAGE_ACCEPT_FEE = 30;
const SOS_CHARGE = 50;

const requestInclude = {
  booking: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      vehicle: true,
      services: {
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
      payment: true,
    },
  },
  garage: true,
};

const broadcastBookingToNearbyGarages = async (bookingId, options = {}) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      services: true,
    },
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (!booking.customerLatitude || !booking.customerLongitude) {
    throw new ApiError(400, "Booking location is missing");
  }

  const serviceIds = booking.services.map((item) => item.serviceId);

  const nearbyGarages = await garageService.findNearbyEligibleGarages({
    latitude: booking.customerLatitude,
    longitude: booking.customerLongitude,
    serviceIds,
    maxDistance: options.maxDistance || 10,
    onlyVerified: true,
    requireOpenNow: false,
    requireWalletBalance: false,
  });

  if (nearbyGarages.length === 0) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BOOKING_STATUS.EXPIRED,
        expiredAt: new Date(),
      },
    });

    throw new ApiError(404, "No nearby eligible garages found");
  }

  await prisma.garageBroadcastRequest.createMany({
    data: nearbyGarages.map((garage) => ({
      bookingId,
      garageId: garage.id,
      status: BROADCAST_STATUS.SENT,
    })),
    skipDuplicates: true,
  });

  return prisma.garageBroadcastRequest.findMany({
    where: { bookingId },
    include: requestInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getGarageRequests = async (garageId, query = {}) => {
  const { status = BROADCAST_STATUS.SENT } = query;

  return prisma.garageBroadcastRequest.findMany({
    where: {
      garageId,
      ...(status && { status }),
    },
    include: requestInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
};

const acceptGarageRequest = async (garageId, requestId, note) => {
  const request = await prisma.garageBroadcastRequest.findFirst({
    where: {
      id: requestId,
      garageId,
    },
    include: {
      booking: true,
      garage: {
        include: {
          wallet: true,
        },
      },
    },
  });

  if (!request) {
    throw new ApiError(404, "Garage request not found");
  }

  if (request.status !== BROADCAST_STATUS.SENT) {
    throw new ApiError(400, "This request is no longer available");
  }

  if (
    ![
      BOOKING_STATUS.SEARCHING_GARAGE,
      BOOKING_STATUS.GARAGE_ASSIGNED,
    ].includes(request.booking.status)
  ) {
    throw new ApiError(400, "Booking is no longer accepting garages");
  }

  const updatedRequest = await prisma.$transaction(async (tx) => {
    const freshBooking = await tx.booking.findUnique({
      where: { id: request.bookingId },
    });

    if (!freshBooking) {
      throw new ApiError(404, "Booking not found");
    }

    if (freshBooking.garageId && freshBooking.garageId !== garageId) {
      throw new ApiError(400, "Another garage already accepted this booking");
    }

    if (
      ![
        BOOKING_STATUS.SEARCHING_GARAGE,
        BOOKING_STATUS.GARAGE_ASSIGNED,
      ].includes(freshBooking.status)
    ) {
      throw new ApiError(400, "Booking is no longer available");
    }

    await tx.booking.update({
      where: { id: request.bookingId },
      data: {
        garageId,
        status: BOOKING_STATUS.CONFIRMED,
        garageNote: note || null,
        acceptedAt: new Date(),
      },
    });

    await tx.garageBroadcastRequest.updateMany({
      where: {
        bookingId: request.bookingId,
        id: {
          not: requestId,
        },
        status: BROADCAST_STATUS.SENT,
      },
      data: {
        status: BROADCAST_STATUS.EXPIRED,
        expiredAt: new Date(),
      },
    });

    await tx.garageBroadcastRequest.update({
      where: { id: requestId },
      data: {
        status: BROADCAST_STATUS.ACCEPTED,
        acceptedAt: new Date(),
        garageResponseNote: note || null,
      },
    });

    if (request.booking.requestType === REQUEST_TYPE.SOS) {
      const wallet = await tx.wallet.findUnique({
        where: {
          userId: request.booking.userId,
        },
      });

      if (!wallet || wallet.balance < SOS_CHARGE) {
        throw new ApiError(
          400,
          "Customer has insufficient wallet balance for SOS"
        );
      }

      const balanceAfter = wallet.balance - SOS_CHARGE;

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: balanceAfter,
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId: request.booking.userId,
          type: WALLET_TRANSACTION_TYPE.SOS_DEDUCTION,
          status: WALLET_TRANSACTION_STATUS.SUCCESS,
          amount: SOS_CHARGE,
          balanceAfter,
          description: "SOS service charge deducted after garage acceptance",
        },
      });
    }

    if (
      request.garage.wallet &&
      request.garage.wallet.balance >= GARAGE_ACCEPT_FEE
    ) {
      const balanceAfter = request.garage.wallet.balance - GARAGE_ACCEPT_FEE;

      await tx.garageWallet.update({
        where: { id: request.garage.wallet.id },
        data: {
          balance: balanceAfter,
        },
      });

      await tx.garageWalletTransaction.create({
        data: {
          garageWalletId: request.garage.wallet.id,
          garageId,
          type: WALLET_TRANSACTION_TYPE.GARAGE_ACCEPT_FEE,
          status: WALLET_TRANSACTION_STATUS.SUCCESS,
          amount: GARAGE_ACCEPT_FEE,
          balanceAfter,
          description: "Garage request acceptance platform fee",
        },
      });
    }

    return tx.garageBroadcastRequest.findUnique({
      where: { id: requestId },
      include: requestInclude,
    });
  });

  return updatedRequest;
};

const rejectGarageRequest = async (garageId, requestId, note) => {
  const request = await prisma.garageBroadcastRequest.findFirst({
    where: {
      id: requestId,
      garageId,
    },
  });

  if (!request) {
    throw new ApiError(404, "Garage request not found");
  }

  if (request.status !== BROADCAST_STATUS.SENT) {
    throw new ApiError(400, "This request cannot be rejected now");
  }

  return prisma.garageBroadcastRequest.update({
    where: { id: requestId },
    data: {
      status: BROADCAST_STATUS.REJECTED,
      rejectedAt: new Date(),
      garageResponseNote: note || null,
    },
    include: requestInclude,
  });
};

module.exports = {
  broadcastBookingToNearbyGarages,
  getGarageRequests,
  acceptGarageRequest,
  rejectGarageRequest,
};