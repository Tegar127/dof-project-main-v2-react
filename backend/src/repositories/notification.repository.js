import db from '../config/database.js';

export const getUserNotifications = async (userId, unreadOnly = false) => {
    let query = db('notifications')
        .where('notifiable_id', userId)
        .where('notifiable_type', 'App\\Models\\User'); // Assuming mimicking Laravel polymorphism mostly for compatibility

    if (unreadOnly) {
        query.whereNull('read_at');
    }

    return await query.orderBy('created_at', 'desc');
};

export const getNotificationById = async (id, userId) => {
    return await db('notifications')
        .where({ id, notifiable_id: userId })
        .first();
};

export const markAsRead = async (id, userId) => {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db('notifications')
        .where({ id, notifiable_id: userId })
        .update({ read_at: now, updated_at: now });
};

export const markAllAsRead = async (userId) => {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db('notifications')
        .where('notifiable_id', userId)
        .whereNull('read_at')
        .update({ read_at: now, updated_at: now });
};

export const createNotification = async (notificationData) => {
    // Assuming type, notifiable_type, notifiable_id, data
    const insertData = {
        id: crypto.randomUUID(), // Laravel notifications typically use UUIDs
        type: notificationData.type,
        notifiable_type: 'App\\Models\\User',
        notifiable_id: notificationData.notifiable_id,
        data: JSON.stringify(notificationData.data),
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    await db('notifications').insert(insertData);
    return insertData;
};
