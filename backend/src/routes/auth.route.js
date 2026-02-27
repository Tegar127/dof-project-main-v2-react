import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { loginSchema } from '../utils/validators.js';

const router = express.Router();

router.post('/login', validate(loginSchema), authController.login);

// Protected routes
router.use(requireAuth);
router.post('/logout', authController.logout);
router.get('/user', authController.user);

export default router;
