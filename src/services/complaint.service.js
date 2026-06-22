const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");

const createComplaint = async (userId, data) => {
  if (data.bookingId) {
    const booking = await prisma.booking.findFirst({
      where: {
        id: data.bookingId,
        userId,
      },
    });

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }
  }

  return prisma.complaint.create({
    data: {
      userId,
      bookingId: data.bookingId || null,
      title: data.title,
      description: data.description,
      status: "OPEN",
    },
    include: {
      booking: {
        include: {
          garage: true,
          vehicle: true,
          service: true,
        },
      },
    },
  });
};

const getMyComplaints = async (userId) => {
  return prisma.complaint.findMany({
    where: { userId },
    include: {
      booking: {
        include: {
          garage: true,
          vehicle: true,
          service: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getComplaintById = async (userId, complaintId) => {
  const complaint = await prisma.complaint.findFirst({
    where: {
      id: complaintId,
      userId,
    },
    include: {
      booking: {
        include: {
          garage: true,
          vehicle: true,
          service: true,
          payment: true,
        },
      },
    },
  });

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  return complaint;
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById,
};