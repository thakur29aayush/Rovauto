const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (fileBuffer, folder, resourceType = "image") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};