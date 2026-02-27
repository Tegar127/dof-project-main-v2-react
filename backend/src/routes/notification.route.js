import express from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', notificationController.getAllNotifications); // Equivalent to Laravel's index
router.post('/mark-all-read', notificationController.markAllAsRead);
router.post('/:id/mark-read', notificationController.markAsRead);

export default router;
