const prisma = require("../../config/prisma");
const ApiError = require("../../utils/apiError");
const { getCache, setCache, deletePattern } = require("../../utils/cache");

const NOTIFICATIONS_CACHE_TTL = 60;

const getNotificationsCacheKey = (userId) => {
  return `customer:${userId}:notifications`;
};

const invalidateNotificationCache = async (userId) => {
  if (!userId) return;
  await deletePattern(`customer:${userId}:notifications*`);
};

const getMyNotifications = async (userId) => {
  const cacheKey = getNotificationsCacheKey(userId);

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const notifications = await prisma.notification.findMany({
    where: {
      OR: [
        { userId },
        { userId: null },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  await setCache(cacheKey, notifications, NOTIFICATIONS_CACHE_TTL);

  return notifications;
};

const createNotification = async ({
  userId = null,
  title,
  message,
  type = "SYSTEM",
  link = null,
  metadata = null,
}) => {
  if (!title || !message) {
    throw new ApiError(400, "Title and message are required");
  }

  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      link,
      metadata,
    },
  });

  if (userId) {
    await invalidateNotificationCache(userId);
  }

  return notification;
};

const markNotificationRead = async (userId, notificationId) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      OR: [
        { userId },
        { userId: null },
      ],
    },
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (!notification.userId) {
    const copied = await prisma.notification.create({
      data: {
        userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        link: notification.link,
        metadata: notification.metadata,
        isRead: true,
      },
    });

    await invalidateNotificationCache(userId);
    return copied;
  }

  const updated = await prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      isRead: true,
    },
  });

  await invalidateNotificationCache(userId);

  return updated;
};

const markAllNotificationsRead = async (userId) => {
  await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  await invalidateNotificationCache(userId);

  return {
    marked: true,
  };
};

module.exports = {
  getMyNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  invalidateNotificationCache,
};
