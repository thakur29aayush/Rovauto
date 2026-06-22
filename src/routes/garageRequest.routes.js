const express = require("express");

const garageRequestController = require("../controllers/garageRequest.controller");
const { protect } = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");

const {
  acceptGarageRequestSchema,
  rejectGarageRequestSchema,
} = require("../validations/garageRequest.validation");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("GARAGE_OWNER", "ADMIN"));

/**
 * GET /api/garage/requests
 * Get requests sent to the logged-in garage owner.
 */
router.get("/", garageRequestController.getGarageRequests);

/**
 * POST /api/garage/requests/:requestId/accept
 * Accept customer booking request.
 */
router.post(
  "/:requestId/accept",
  acceptGarageRequestSchema,
  validate,
  garageRequestController.acceptGarageRequest
);

/**
 * POST /api/garage/requests/:requestId/reject
 * Reject customer booking request.
 */
router.post(
  "/:requestId/reject",
  rejectGarageRequestSchema,
  validate,
  garageRequestController.rejectGarageRequest
);

module.exports = router;