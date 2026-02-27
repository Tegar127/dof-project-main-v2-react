import express from 'express';
import * as folderController from '../controllers/folder.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createFolderSchema, updateFolderSchema, moveDocumentSchema } from '../utils/validators.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', folderController.getAllFolders);
router.post('/', validate(createFolderSchema), folderController.createFolder);
router.get('/:id', folderController.getFolder);
router.put('/:id', validate(updateFolderSchema), folderController.updateFolder);
router.delete('/:id', folderController.deleteFolder);

// Move document to folder endpoint mapped from routes as well
router.post('/documents/:id/move', validate(moveDocumentSchema), folderController.moveDocument);

export default router;
