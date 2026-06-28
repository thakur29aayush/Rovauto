const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const notificationService = require("../services/notification.service");

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getMyNotifications(req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Notifications fetched successfully", notifications));
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markNotificationRead(
    req.user.id,
    req.params.id
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Notification marked as read", notification));
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllNotificationsRead(req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "All notifications marked as read", result));
});

module.exports = {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
