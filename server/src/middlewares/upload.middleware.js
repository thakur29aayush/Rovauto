const multer = require("multer");
const ApiError = require("../utils/apiError");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const allowedVideoTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska"];

  if (
    allowedImageTypes.includes(file.mimetype) ||
    allowedVideoTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Invalid file type"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 13,
    fields: 20,
  },
});

module.exports = upload;
