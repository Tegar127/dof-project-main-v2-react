import express from 'express';
import * as documentController from '../controllers/document.controller.js';
import * as documentApprovalController from '../controllers/documentApproval.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
    createDocumentSchema,
    updateDocumentSchema,
    approveDocumentSchema,
    rejectDocumentSchema,
    updateApprovalSequenceSchema
} from '../utils/validators.js';

const router = express.Router();

router.use(requireAuth);

// Core Document Routes
router.get('/', documentController.getAllDocuments);
router.post('/', validate(createDocumentSchema), documentController.createDocument);
router.get('/:id', documentController.getDocument);
router.put('/:id', validate(updateDocumentSchema), documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);

// Document Sub-resources (Logs, Versions)
router.get('/:id/logs', documentController.getLogs);
router.get('/:id/versions', documentController.getVersions);
router.post('/:id/versions/:versionId/restore', documentController.restoreVersion);

// Document Approvals
router.get('/:id/approvals', documentApprovalController.getApprovals);
router.post('/:documentId/approvals/:approvalId/approve', validate(approveDocumentSchema), documentApprovalController.approveDocument);
router.post('/:documentId/approvals/:approvalId/reject', validate(rejectDocumentSchema), documentApprovalController.rejectDocument);
router.put('/:id/approvals/sequence', validate(updateApprovalSequenceSchema), documentApprovalController.updateSequence);

export default router;
