const express = require("express");

const reviewController = require("../controllers/review.controller");
const { protect } = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");

const {
  reviewIdValidation,
  createReviewValidation,
  updateReviewValidation,
} = require("../validations/review.validation");

const router = express.Router();

router.use(protect);

router.post("/", createReviewValidation, validate, reviewController.createReview);
router.get("/my", reviewController.getMyReviews);

router
  .route("/:id")
  .patch(updateReviewValidation, validate, reviewController.updateReview)
  .delete(reviewIdValidation, validate, reviewController.deleteReview);

module.exports = router;
