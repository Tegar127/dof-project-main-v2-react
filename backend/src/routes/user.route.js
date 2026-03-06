import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createUserSchema, updateUserSchema } from '../utils/validators.js';

const router = express.Router();

router.use(requireAuth);

// Non-admin can access list (for mention/assign functionality)
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);

// Authenticated users can update their own profile (password)
router.put('/profile/update', validate(updateUserSchema), userController.updateProfile);

// Only admins can create, update, delete
router.use(requireRole('admin'));

router.post('/', validate(createUserSchema), userController.createUser);
router.put('/:id', validate(updateUserSchema), userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
