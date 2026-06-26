const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const bookingService = require("../services/booking.service");

const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.user.id, req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, "Checkout booking created successfully", booking));
});

const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getMyBookings(req.user.id, req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, "Bookings fetched successfully", bookings));
});

const getBookingById = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(req.user.id, req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Booking fetched successfully", booking));
});

const getBookingSuccess = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingSuccess(
    req.user.id,
    req.params.id
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Booking success fetched successfully", booking));
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.user.id, req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Booking cancelled successfully", booking));
});

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  getBookingSuccess,
  cancelBooking,
};