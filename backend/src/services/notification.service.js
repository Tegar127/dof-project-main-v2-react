import * as notificationRepository from '../repositories/notification.repository.js';
import { NotFoundError } from '../utils/errors.js';

export const getUnreadNotifications = async (user) => {
    const notifications = await notificationRepository.getUserNotifications(user.id, true);
    return notifications.map(notif => ({
        ...notif,
        data: typeof notif.data === 'string' ? JSON.parse(notif.data) : notif.data
    }));
};

export const getAllNotifications = async (user) => {
    const notifications = await notificationRepository.getUserNotifications(user.id, false);
    return notifications.map(notif => ({
        ...notif,
        data: typeof notif.data === 'string' ? JSON.parse(notif.data) : notif.data
    }));
};

export const markAsRead = async (id, user) => {
    const notification = await notificationRepository.getNotificationById(id, user.id);
    if (!notification) throw new NotFoundError('Notification not found');

    await notificationRepository.markAsRead(id, user.id);
    return true;
};

export const markAllAsRead = async (user) => {
    await notificationRepository.markAllAsRead(user.id);
    return true;
};

export const createNotification = async (userId, type, data) => {
    return await notificationRepository.createNotification({
        type,
        notifiable_id: userId,
        data
    });
};
