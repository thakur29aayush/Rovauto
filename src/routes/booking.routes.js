const express = require("express");

const bookingController = require("../controllers/booking.controller");
const { protect } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");

const {
  bookingIdValidation,
  createBookingValidation,
} = require("../validations/booking.validation");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(createBookingValidation, validate, bookingController.createBooking)
  .get(bookingController.getMyBookings);

router.get(
  "/:id/success",
  bookingIdValidation,
  validate,
  bookingController.getBookingSuccess
);

router.get(
  "/:id",
  bookingIdValidation,
  validate,
  bookingController.getBookingById
);

module.exports = router;