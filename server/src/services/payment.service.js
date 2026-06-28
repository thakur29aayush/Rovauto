const prisma = require("../config/prisma");
const razorpay = require("../config/razorpay");
const ApiError = require("../utils/apiError");
const verifyRazorpaySignature = require("../utils/razorpaySignature");
const garageRequestService = require("./garageRequest.service");
const invalidateCustomerCache = require("../utils/invalidateCustomerCache");

const bookingInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
  vehicle: true,
  garage: true,
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
  broadcasts: true,
};

const createPaymentOrder = async (userId, { bookingId }) => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new ApiError(500, "Razorpay payment gateway is not configured");
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId,
    },
    include: {
      payment: true,
    },
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.status !== "PENDING_PAYMENT") {
    throw new ApiError(400, "Booking is not pending payment");
  }

  if (booking.payment?.status === "PAID") {
    throw new ApiError(400, "Payment already completed");
  }

  const amount = booking.payableAmount || booking.handlingFee || 99;

  if (amount <= 0) {
    throw new ApiError(400, "No online payment required for this booking");
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: booking.bookingCode,
    notes: {
      bookingId: booking.id,
      userId,
    },
  });

  const payment = await prisma.payment.upsert({
    where: {
      bookingId: booking.id,
    },
    update: {
      amount,
      currency: "INR",
      status: "CREATED",
      razorpayOrderId: razorpayOrder.id,
      upiAmountPaid: amount,
    },
    create: {
      bookingId: booking.id,
      amount,
      currency: "INR",
      status: "CREATED",
      razorpayOrderId: razorpayOrder.id,
      walletAmountUsed: booking.walletAmountUsed || 0,
      upiAmountPaid: amount,
    },
  });

  return {
    payment,
    razorpayOrder: {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
    },
    keyId: process.env.RAZORPAY_KEY_ID,
  };
};

const verifyPayment = async (
  userId,
  { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId,
    },
    include: {
      payment: true,
      services: true,
    },
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (!booking.payment) {
    throw new ApiError(404, "Payment order not found");
  }

  if (booking.payment.status === "PAID") {
    throw new ApiError(400, "Payment already verified");
  }

  if (booking.payment.razorpayOrderId !== razorpayOrderId) {
    throw new ApiError(400, "Invalid Razorpay order ID");
  }

  const isValidSignature = verifyRazorpaySignature({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  if (!isValidSignature) {
    await prisma.payment.update({
      where: { bookingId },
      data: {
        status: "FAILED",
      },
    });

    await invalidateCustomerCache(userId);

    throw new ApiError(400, "Invalid payment signature");
  }

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.update({
      where: {
        bookingId,
      },
      data: {
        status: "PAID",
        razorpayPaymentId,
        razorpaySignature,
      },
    });

    const updatedBooking = await tx.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: "SEARCHING_GARAGE",
      },
      include: bookingInclude,
    });

    return {
      payment,
      booking: updatedBooking,
    };
  });

  let broadcastRequests = [];

  try {
    broadcastRequests =
      await garageRequestService.broadcastBookingToNearbyGarages(bookingId);
  } catch (error) {
    await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: "EXPIRED",
        expiredAt: new Date(),
      },
    });

    await invalidateCustomerCache(userId);

    throw error;
  }

  await invalidateCustomerCache(userId);

  return {
    ...result,
    broadcastRequests,
    message: "Payment verified. Request sent to nearby garages.",
  };
};

const getMyPayments = async (userId) => {
  return prisma.payment.findMany({
    where: {
      booking: {
        userId,
      },
    },
    include: {
      booking: {
        include: {
          services: {
            include: {
              service: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getMyPayments,
};
