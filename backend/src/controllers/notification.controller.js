import * as notificationService from '../services/notification.service.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/responses.js';

export const getUnreadNotifications = catchAsync(async (req, res) => {
    const notifications = await notificationService.getUnreadNotifications(req.user);
    return res.status(200).json(notifications);
});

export const getAllNotifications = catchAsync(async (req, res) => {
    // Currently Laravel returned unread on index, but having both is useful
    const notifications = await notificationService.getUnreadNotifications(req.user);
    return res.status(200).json(notifications);
});

export const markAsRead = catchAsync(async (req, res) => {
    await notificationService.markAsRead(req.params.id, req.user);
    return sendSuccess(res, 200, 'Notification marked as read');
});

export const markAllAsRead = catchAsync(async (req, res) => {
    await notificationService.markAllAsRead(req.user);
    return sendSuccess(res, 200, 'All notifications marked as read');
});
