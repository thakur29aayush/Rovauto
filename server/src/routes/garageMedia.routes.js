const express = require("express");

const upload = require("../middlewares/upload.middleware");
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const garageMediaController = require("../controllers/garageMedia.controller");

const router = express.Router();

router.post(
  "/:garageId/media",
  protect,
  authorizeRoles("GARAGE_OWNER", "ADMIN"),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 2 },
  ]),
  garageMediaController.uploadGarageMedia
);

module.exports = router;
