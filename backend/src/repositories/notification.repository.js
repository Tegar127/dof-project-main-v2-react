import prisma from '../config/database.js';

export const getUserNotifications = async (userId, unreadOnly = false) => {
    const where = {
        notifiable_id: String(userId),
        notifiable_type: 'App\\Models\\User'
    };

    if (unreadOnly) {
        where.read_at = null;
    }

    return await prisma.notification.findMany({
        where,
        orderBy: { created_at: 'desc' }
    });
};

export const getNotificationById = async (id, userId) => {
    return await prisma.notification.findFirst({
        where: { id, notifiable_id: String(userId) }
    });
};

export const markAsRead = async (id, userId) => {
    const now = new Date().toISOString();
    await prisma.notification.updateMany({
        where: { id, notifiable_id: String(userId) },
        data: { read_at: now }
    });
};

export const markAllAsRead = async (userId) => {
    const now = new Date().toISOString();
    await prisma.notification.updateMany({
        where: {
            notifiable_id: String(userId),
            read_at: null
        },
        data: { read_at: now }
    });
};

export const createNotification = async (notificationData) => {
    const insertData = {
        id: crypto.randomUUID(),
        type: notificationData.type,
        notifiable_type: 'App\\Models\\User',
        notifiable_id: String(notificationData.notifiable_id),
        data: JSON.stringify(notificationData.data)
    };

    return await prisma.notification.create({ data: insertData });
};
