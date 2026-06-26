const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");

const addServiceMedia = async (serviceId, data) => {
  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      isActive: true,
    },
  });

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  const media = await prisma.$transaction(async (tx) => {
    if (data.isThumbnail) {
      await tx.serviceMedia.updateMany({
        where: {
          serviceId,
          mediaType: data.mediaType || "IMAGE",
          isThumbnail: true,
        },
        data: {
          isThumbnail: false,
        },
      });
    }

    return tx.serviceMedia.create({
      data: {
        serviceId,
        mediaType: data.mediaType,
        url: data.url,
        publicId: data.publicId,
        order: data.order || 0,
        isThumbnail: data.isThumbnail || false,
        durationSeconds: data.durationSeconds || null,
        sizeBytes: data.sizeBytes || null,
      },
    });
  });

  return media;
};

const getServiceMedia = async (serviceId) => {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  return prisma.serviceMedia.findMany({
    where: { serviceId },
    orderBy: [{ isThumbnail: "desc" }, { order: "asc" }],
  });
};

const updateServiceMedia = async (mediaId, data) => {
  const existingMedia = await prisma.serviceMedia.findUnique({
    where: { id: mediaId },
  });

  if (!existingMedia) {
    throw new ApiError(404, "Service media not found");
  }

  const updatedMedia = await prisma.$transaction(async (tx) => {
    if (data.isThumbnail === true) {
      await tx.serviceMedia.updateMany({
        where: {
          serviceId: existingMedia.serviceId,
          mediaType: existingMedia.mediaType,
          isThumbnail: true,
          id: {
            not: mediaId,
          },
        },
        data: {
          isThumbnail: false,
        },
      });
    }

    return tx.serviceMedia.update({
      where: { id: mediaId },
      data: {
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isThumbnail !== undefined && {
          isThumbnail: data.isThumbnail,
        }),
      },
    });
  });

  return updatedMedia;
};

const deleteServiceMedia = async (mediaId) => {
  const existingMedia = await prisma.serviceMedia.findUnique({
    where: { id: mediaId },
  });

  if (!existingMedia) {
    throw new ApiError(404, "Service media not found");
  }

  await prisma.serviceMedia.delete({
    where: { id: mediaId },
  });

  return {
    message: "Service media deleted successfully",
    media: existingMedia,
  };
};

module.exports = {
  addServiceMedia,
  getServiceMedia,
  updateServiceMedia,
  deleteServiceMedia,
};