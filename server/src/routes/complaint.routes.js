const express = require("express");

const complaintController = require("../controllers/complaint.controller");
const { protect } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const upload = require("../middlewares/upload.middleware");

const {
  complaintIdValidation,
  createComplaintValidation,
} = require("../validations/complaint.validation");

const router = express.Router();

router.use(protect);

router.post(
  "/",
  upload.array("images", 10),
  createComplaintValidation,
  validate,
  complaintController.createComplaint
);

router.get("/my", complaintController.getMyComplaints);

router.get(
  "/:id",
  complaintIdValidation,
  validate,
  complaintController.getComplaintById
);

module.exports = router;