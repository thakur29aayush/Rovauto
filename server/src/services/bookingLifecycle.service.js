const crypto = require("crypto");

const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");
const BOOKING_STATUS = require("../constants/bookingStatus");
const BROADCAST_STATUS = require("../constants/broadcastStatus");
const notificationService = require("../customer/services/notification.service");

const DEFAULT_SEARCH_TIMEOUT_SECONDS = 120;
const DEFAULT_HANDOVER_OTP_TTL_MINUTES = 30;

const getGarageSearchTimeoutMs = () => {
  const seconds = Number(process.env.GARAGE_SEARCH_TIMEOUT_SECONDS || DEFAULT_SEARCH_TIMEOUT_SECONDS);
  return (Number.isFinite(seconds) && seconds > 0 ? seconds : DEFAULT_SEARCH_TIMEOUT_SECONDS) * 1000;
};

const getSearchExpiresAt = () => new Date(Date.now() + getGarageSearchTimeoutMs());

const getOtpHash = (otp) => crypto.createHash("sha256").update(String(otp)).digest("hex");

const createHandoverOtp = () => {
  const otp = String(crypto.randomInt(100000, 1000000));
  const ttlMinutes = Number(process.env.HANDOVER_OTP_TTL_MINUTES || DEFAULT_HANDOVER_OTP_TTL_MINUTES);
  const expiresAt = new Date(Date.now() + (Number.isFinite(ttlMinutes) && ttlMinutes > 0 ? ttlMinutes : DEFAULT_HANDOVER_OTP_TTL_MINUTES) * 60 * 1000);
  return { otp, otpHash: getOtpHash(otp), expiresAt };
};

const notifySearchExpired = async (booking) => {
  await notificationService.createNotification({
    userId: booking.userId,
    type: "BOOKING",
    title: "Please try again",
    message: "No garage accepted your service request in time. Please try again - nearby garages may be busy right now.",
    link: `/dashboard/bookings/${booking.id}`,
    metadata: { bookingId: booking.id, reason: "GARAGE_SEARCH_TIMEOUT" },
  });
};

const expireBookingSearch = async (bookingId) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.status !== BOOKING_STATUS.SEARCHING_GARAGE || booking.garageId) return booking;
  if (!booking.searchExpiresAt || booking.searchExpiresAt > new Date()) return booking;

  const updated = await prisma.$transaction(async (tx) => {
    await tx.garageBroadcastRequest.updateMany({
      where: { bookingId, status: BROADCAST_STATUS.SENT },
      data: { status: BROADCAST_STATUS.EXPIRED, expiredAt: new Date() },
    });

    return tx.booking.update({
      where: { id: bookingId },
      data: { status: BOOKING_STATUS.EXPIRED, expiredAt: new Date() },
    });
  });

  await notifySearchExpired(updated);
  return updated;
};

const expireStaleGarageSearchesForUser = async (userId) => {
  const now = new Date();
  const bookings = await prisma.booking.findMany({
    where: {
      userId,
      status: BOOKING_STATUS.SEARCHING_GARAGE,
      garageId: null,
      searchExpiresAt: { lte: now },
    },
  });

  for (const booking of bookings) {
    await expireBookingSearch(booking.id);
  }
};

const notifyGarageAccepted = async ({ booking, garage, otp }) => {
  return notificationService.createNotification({
    userId: booking.userId,
    type: "BOOKING",
    title: "Garage accepted your request",
    message: `${garage.name} has accepted your service request. Your handover OTP is ${otp}. Share it with the garage only when handing over the vehicle.`,
    link: `/dashboard/bookings/${booking.id}`,
    metadata: {
      bookingId: booking.id,
      garageId: garage.id,
      otp,
      purpose: "VEHICLE_HANDOVER",
    },
  });
};

const notifyVehicleDelivered = async ({ booking, garage }) => {
  return notificationService.createNotification({
    userId: booking.userId,
    type: "BOOKING",
    title: "Vehicle marked delivered",
    message: `${garage.name} has marked your vehicle as delivered. Please review and accept delivery to move it to service history.`,
    link: `/dashboard/bookings/${booking.id}`,
    metadata: { bookingId: booking.id, garageId: garage.id, action: "ACCEPT_DELIVERY" },
  });
};

const verifyBookingHandoverOtp = async ({ garageId, requestId, otp }) => {
  const request = await prisma.garageBroadcastRequest.findFirst({
    where: { id: requestId, garageId, status: BROADCAST_STATUS.ACCEPTED },
    include: { booking: true, garage: true },
  });

  if (!request) throw new ApiError(404, "Accepted garage request not found");
  const booking = request.booking;

  if (booking.status !== BOOKING_STATUS.CONFIRMED) {
    throw new ApiError(400, "Booking is not ready for handover OTP verification");
  }

  if (!booking.handoverOtpHash || !booking.handoverOtpExpiresAt) {
    throw new ApiError(400, "Handover OTP is not available for this booking");
  }

  if (booking.handoverOtpExpiresAt < new Date()) {
    throw new ApiError(400, "Handover OTP has expired");
  }

  if (getOtpHash(otp) !== booking.handoverOtpHash) {
    throw new ApiError(400, "Invalid handover OTP");
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: BOOKING_STATUS.IN_PROGRESS,
      handoverOtpVerifiedAt: new Date(),
    },
    include: {
      user: true,
      vehicle: true,
      garage: true,
      services: { include: { service: true } },
      payment: true,
    },
  });

  return { request, booking: updatedBooking };
};

const markBookingDeliveredByGarage = async ({ garageId, requestId }) => {
  const request = await prisma.garageBroadcastRequest.findFirst({
    where: { id: requestId, garageId, status: BROADCAST_STATUS.ACCEPTED },
    include: { booking: { include: { user: true } }, garage: true },
  });

  if (!request) throw new ApiError(404, "Accepted garage request not found");
  const booking = request.booking;

  if (!booking.handoverOtpVerifiedAt) {
    throw new ApiError(400, "Verify customer handover OTP before marking delivery");
  }

  if (![BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.CONFIRMED].includes(booking.status)) {
    throw new ApiError(400, "Booking cannot be marked delivered now");
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: booking.id },
    data: { deliveredAt: new Date() },
    include: {
      garage: true,
      vehicle: true,
      services: { include: { service: true } },
      payment: true,
    },
  });

  await notifyVehicleDelivered({ booking: updatedBooking, garage: request.garage });
  return { request, booking: updatedBooking };
};

const acceptDeliveredBookingByCustomer = async ({ userId, bookingId }) => {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: { garage: true, payment: true },
  });

  if (!booking) throw new ApiError(404, "Booking not found");
  if (!booking.deliveredAt) throw new ApiError(400, "Garage has not marked this booking delivered yet");
  if (booking.payment && booking.payment.status !== "PAID") throw new ApiError(400, "Payment is not completed");

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BOOKING_STATUS.COMPLETED,
      customerAcceptedAt: new Date(),
    },
    include: {
      garage: true,
      vehicle: true,
      services: { include: { service: true } },
      payment: true,
      review: true,
    },
  });
};

module.exports = {
  createHandoverOtp,
  expireBookingSearch,
  expireStaleGarageSearchesForUser,
  getGarageSearchTimeoutMs,
  getSearchExpiresAt,
  notifyGarageAccepted,
  verifyBookingHandoverOtp,
  markBookingDeliveredByGarage,
  acceptDeliveredBookingByCustomer,
};
