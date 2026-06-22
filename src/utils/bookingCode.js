import { prisma } from "../config/prisma.js";

export const generateBookingCode = async () => {
  let bookingCode;
  let exists = true;

  while (exists) {
    const time = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);

    bookingCode = `ROV-${time}-${random}`;

    const booking = await prisma.booking.findUnique({
      where: { bookingCode },
      select: { id: true },
    });

    exists = Boolean(booking);
  }

  return bookingCode;
};