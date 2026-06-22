const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");

const generateBookingCode = () => {
  return `PX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

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
  service: {
    include: {
      category: true,
    },
  },
  slot: true,
  payment: true,
};

const createBooking = async (userId, data) => {
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: data.vehicleId,
      userId,
    },
  });

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  const garage = await prisma.garage.findFirst({
    where: {
      id: data.garageId,
      isActive: true,
    },
  });

  if (!garage) {
    throw new ApiError(404, "Garage not found");
  }

  const garageService = await prisma.garageService.findFirst({
    where: {
      garageId: data.garageId,
      serviceId: data.serviceId,
      isActive: true,
    },
    include: {
      service: true,
    },
  });

  if (!garageService) {
    throw new ApiError(404, "Service not available at this garage");
  }

  let slot = null;

  if (data.slotId) {
    slot = await prisma.garageSlot.findFirst({
      where: {
        id: data.slotId,
        garageId: data.garageId,
        isActive: true,
      },
    });

    if (!slot) {
      throw new ApiError(404, "Slot not found");
    }

    if (slot.bookedCount >= slot.capacity) {
      throw new ApiError(400, "Slot is already full");
    }
  }

  const booking = await prisma.$transaction(async (tx) => {
    if (slot) {
      await tx.garageSlot.update({
        where: { id: slot.id },
        data: {
          bookedCount: {
            increment: 1,
          },
        },
      });
    }

    return tx.booking.create({
      data: {
        userId,
        vehicleId: data.vehicleId,
        garageId: data.garageId,
        serviceId: data.serviceId,
        slotId: data.slotId || null,
        bookingCode: generateBookingCode(),
        scheduledDate: new Date(data.scheduledDate),
        startTime: data.startTime,
        endTime: data.endTime || null,
        customerNote: data.customerNote || null,
        status: "PENDING_PAYMENT",
        handlingFee: 99,
      },
      include: bookingInclude,
    });
  });

  return booking;
};

const getMyBookings = async (userId) => {
  return prisma.booking.findMany({
    where: { userId },
    include: bookingInclude,
    orderBy: { createdAt: "desc" },
  });
};

const getBookingById = async (userId, bookingId) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId,
    },
    include: bookingInclude,
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  return booking;
};

const getBookingSuccess = async (userId, bookingId) => {
  const booking = await getBookingById(userId, bookingId);

  if (booking.status !== "CONFIRMED") {
    throw new ApiError(400, "Booking is not confirmed yet");
  }

  return {
    booking,
    whatsappLink: booking.garage.whatsappNo
      ? `https://wa.me/${booking.garage.whatsappNo}`
      : null,
    directionsLink: `https://www.google.com/maps?q=${booking.garage.latitude},${booking.garage.longitude}`,
  };
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  getBookingSuccess,
};