import express from 'express';
import * as groupController from '../controllers/group.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createGroupSchema, updateGroupSchema } from '../utils/validators.js';

const router = express.Router();

router.use(requireAuth);

// Accessible by all users (with service layer filtering inside `getAllGroups`)
router.get('/', groupController.getAllGroups);
router.get('/:id', groupController.getGroup);

// Admin only actions
router.use(requireRole('admin'));
router.post('/', validate(createGroupSchema), groupController.createGroup);
router.put('/:id', validate(updateGroupSchema), groupController.updateGroup);
router.delete('/:id', groupController.deleteGroup);

export default router;
