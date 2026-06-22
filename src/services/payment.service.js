const prisma = require("../config/prisma");
const razorpay = require("../config/razorpay");
const ApiError = require("../utils/apiError");
const verifyRazorpaySignature = require("../utils/razorpaySignature");

const createPaymentOrder = async (userId, { bookingId }) => {
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

  const amount = booking.handlingFee || 99;

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
    },
    create: {
      bookingId: booking.id,
      amount,
      currency: "INR",
      status: "CREATED",
      razorpayOrderId: razorpayOrder.id,
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
    },
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (!booking.payment) {
    throw new ApiError(404, "Payment order not found");
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
      data: { status: "FAILED" },
    });

    throw new ApiError(400, "Invalid payment signature");
  }

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.update({
      where: { bookingId },
      data: {
        status: "PAID",
        razorpayPaymentId,
        razorpaySignature,
      },
    });

    const confirmedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
      },
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
        garage: true,
        service: {
          include: {
            category: true,
          },
        },
        slot: true,
        payment: true,
      },
    });

    return {
      payment,
      booking: confirmedBooking,
    };
  });

  return result;
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
};