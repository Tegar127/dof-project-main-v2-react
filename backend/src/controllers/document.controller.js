import * as documentService from '../services/document.service.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/responses.js';
import * as documentRepository from '../repositories/document.repository.js';

export const getAllDocuments = catchAsync(async (req, res) => {
    const documents = await documentService.getAllDocuments(req.user, req.query);
    return sendSuccess(res, 200, 'Documents fetched successfully', documents);
});

export const createDocument = catchAsync(async (req, res) => {
    const document = await documentService.createDocument(req.user, req.body);
    return sendSuccess(res, 201, 'Document created successfully', document);
});

export const getDocument = catchAsync(async (req, res) => {
    const document = await documentService.getDocumentById(req.params.id, req.user);
    return sendSuccess(res, 200, 'Document fetched successfully', document);
});

export const updateDocument = catchAsync(async (req, res) => {
    const document = await documentService.updateDocument(req.params.id, req.user, req.body);
    return sendSuccess(res, 200, 'Document updated successfully', { document });
});

export const deleteDocument = catchAsync(async (req, res) => {
    const { reason } = req.body;
    await documentService.deleteDocument(req.params.id, req.user, reason);
    return sendSuccess(res, 200, 'Document deleted successfully');
});

export const getLogs = catchAsync(async (req, res) => {
    const logs = await documentRepository.getLogs(req.params.id);
    return res.status(200).json(logs);
});

export const getVersions = catchAsync(async (req, res) => {
    const versions = await documentRepository.getVersions(req.params.id);
    return res.status(200).json(versions);
});

export const restoreVersion = catchAsync(async (req, res) => {
    // We handle simple restore here using repo directly or via service
    // For simplicity, map to basic operations:
    const version = await documentRepository.getVersionById(req.params.versionId);
    if (!version) return res.status(404).json({ success: false, message: 'Version not found' });

    // Call update document service forcing content data update and version increment
    const data = {
        content_data: typeof version.content_data === 'string' ? JSON.parse(version.content_data) : version.content_data,
        increment_version: true
    };
    const document = await documentService.updateDocument(req.params.id, req.user, data);
    // Optional: override the change summary to "Pulihkan dari vX.X"

    return sendSuccess(res, 200, 'Version restored successfully', { document });
});
