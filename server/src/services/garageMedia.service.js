const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");
const { uploadToCloudinary } = require("../utils/cloudinaryUpload");

const uploadGarageMedia = async (garageId, files, user) => {
  const images = files.images || [];
  const videos = files.videos || [];
  const thumbnail = files.thumbnail || [];

  if (images.length < 5 || images.length > 10) {
    throw new ApiError(400, "Garage must have 5 to 10 images");
  }

  if (thumbnail.length !== 1) {
    throw new ApiError(400, "Exactly 1 thumbnail image is required");
  }

  if (videos.length < 1 || videos.length > 2) {
    throw new ApiError(400, "Garage must have 1 to 2 videos");
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

  for (const file of [...images, ...thumbnail]) {
    if (!file.mimetype.startsWith("image/")) {
      throw new ApiError(400, "Only image files allowed in images/thumbnail");
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new ApiError(400, "Each image must be under 10 MB");
    }
  }

  for (const file of videos) {
    if (!file.mimetype.startsWith("video/")) {
      throw new ApiError(400, "Only video files allowed");
    }

    if (file.size > 100 * 1024 * 1024) {
      throw new ApiError(400, "Each video must be under 100 MB");
    }
  }

  const uploadedThumbnail = await uploadToCloudinary(
    thumbnail[0].buffer,
    "project-x/garages/images",
    "image"
  );

  const uploadedImages = [];

  for (const file of images) {
    const uploaded = await uploadToCloudinary(
      file.buffer,
      "project-x/garages/images",
      "image"
    );

    uploadedImages.push(uploaded);
  }

  const uploadedVideos = [];

  for (const file of videos) {
    const uploaded = await uploadToCloudinary(
      file.buffer,
      "project-x/garages/videos",
      "video"
    );

    uploadedVideos.push({
      ...uploaded,
      sizeBytes: file.size,
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.garageImage.create({
      data: {
        garageId,
        imageUrl: uploadedThumbnail.secure_url,
        publicId: uploadedThumbnail.public_id,
        isThumbnail: true,
        order: 0,
      },
    });

    await tx.garageImage.createMany({
      data: uploadedImages.map((image, index) => ({
        garageId,
        imageUrl: image.secure_url,
        publicId: image.public_id,
        isThumbnail: false,
        order: index + 1,
      })),
    });

    await tx.garageVideo.createMany({
      data: uploadedVideos.map((video, index) => ({
        garageId,
        videoUrl: video.secure_url,
        publicId: video.public_id,
        durationSeconds: video.duration
          ? Math.round(video.duration)
          : null,
        sizeBytes: video.sizeBytes,
        order: index,
      })),
    });

    return tx.garage.findUnique({
      where: { id: garageId },
      include: {
        images: true,
        videos: true,
      },
    });
  });

  return result;
};

module.exports = {
  uploadGarageMedia,
};
