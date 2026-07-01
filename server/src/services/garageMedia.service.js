const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");
const { uploadToCloudinary } = require("../utils/cloudinaryUpload");
const {
  GARAGE_MAXIMUM_IMAGES,
  GARAGE_MINIMUM_ACTIVATION_IMAGES,
} = require("../garage/constants");
const { activateGarageIfEligible } = require("../garage/services/garageOwner.service");

const getTotalPhotoCount = (images, thumbnail) => images.length + thumbnail.length;

const validateImageFile = (file) => {
  if (!file.mimetype.startsWith("image/")) {
    throw new ApiError(400, "Only image files are allowed for garage photos");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new ApiError(400, "Each garage photo must be under 10 MB");
  }
};

const uploadGarageMedia = async (garageId, files, user) => {
  const images = files.images || [];
  const thumbnail = files.thumbnail || [];
  const videos = files.videos || [];

  if (videos.length > 0) {
    throw new ApiError(400, "Garage videos are not required. Upload photos only.");
  }

  const totalPhotoCount = getTotalPhotoCount(images, thumbnail);

  if (totalPhotoCount < GARAGE_MINIMUM_ACTIVATION_IMAGES || totalPhotoCount > GARAGE_MAXIMUM_IMAGES) {
    throw new ApiError(
      400,
      `Garage must upload ${GARAGE_MINIMUM_ACTIVATION_IMAGES} to ${GARAGE_MAXIMUM_IMAGES} photos`
    );
  }

  if (thumbnail.length > 1) {
    throw new ApiError(400, "Only 1 thumbnail image is allowed");
  }

  if (thumbnail.length === 0 && images.length === 0) {
    throw new ApiError(400, "At least 5 garage photos are required");
  }

  const garage = await prisma.garage.findUnique({
    where: { id: garageId },
  });

  if (!garage) {
    throw new ApiError(404, "Garage not found");
  }

  if (user.role !== "ADMIN" && garage.ownerId !== user.id) {
    throw new ApiError(403, "You are not allowed to upload media for this garage");
  }

  for (const file of [...thumbnail, ...images]) {
    validateImageFile(file);
  }

  const orderedFiles = [...thumbnail, ...images];
  const uploadedImages = [];

  for (const file of orderedFiles) {
    const uploaded = await uploadToCloudinary(
      file.buffer,
      "project-x/garages/images",
      "image"
    );

    uploadedImages.push(uploaded);
  }

  return prisma.$transaction(async (tx) => {
    await tx.garageImage.deleteMany({ where: { garageId } });

    await tx.garageImage.createMany({
      data: uploadedImages.map((image, index) => ({
        garageId,
        imageUrl: image.secure_url,
        publicId: image.public_id,
        isThumbnail: index === 0,
        order: index,
      })),
    });

    const updatedGarage = await activateGarageIfEligible(tx, garageId);

    return tx.garage.findUnique({
      where: { id: garageId },
      include: {
        images: {
          orderBy: [{ isThumbnail: "desc" }, { order: "asc" }],
        },
        wallet: true,
      },
    }).then((freshGarage) => ({
      ...freshGarage,
      activation: {
        isActive: updatedGarage.isActive,
        hasMinimumPhotos: freshGarage.images.length >= GARAGE_MINIMUM_ACTIVATION_IMAGES,
        photoCount: freshGarage.images.length,
        minimumPhotos: GARAGE_MINIMUM_ACTIVATION_IMAGES,
      },
    }));
  });
};

module.exports = {
  uploadGarageMedia,
};
