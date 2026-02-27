import express from 'express';
import authRoutes from './auth.route.js';
import userRoutes from './user.route.js';
import groupRoutes from './group.route.js';
import folderRoutes from './folder.route.js';
import documentRoutes from './document.route.js';
import notificationRoutes from './notification.route.js';
import distRoutes from './documentDistribution.route.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import * as groupController from '../controllers/group.controller.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/groups', groupRoutes);
router.use('/folders', folderRoutes);
router.use('/documents', documentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/distributions', distRoutes);

// Move document route handling is also handled in folder.route,
// but for standard separation we keep those /documents mounted later if needed,
// for now we'll route it directly here or on document routes. We mounted it in folder Routes.

// Special admin grouped routes
router.get('/groups-stats/:id', requireAuth, requireRole('admin'), groupController.getGroupStats);

export default router;
