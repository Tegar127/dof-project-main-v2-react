import express from 'express';
import * as distController from '../controllers/documentDistribution.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { distributeDocumentSchema } from '../utils/validators.js';

const router = express.Router();

router.use(requireAuth);

router.get('/monitoring', distController.getMonitoringData);
router.get('/:id', distController.getDistributionDetails);

// Only admins can distribute
router.post('/:id', requireRole('admin'), validate(distributeDocumentSchema), distController.distributeDocument);

export default router;
