import * as folderService from '../services/folder.service.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/responses.js';

export const getAllFolders = catchAsync(async (req, res) => {
    const folders = await folderService.getAllFolders(req.user);
    return res.status(200).json(folders);
});

export const createFolder = catchAsync(async (req, res) => {
    const folder = await folderService.createFolder(req.body);
    return sendSuccess(res, 201, 'Folder created successfully', { folder });
});

export const getFolder = catchAsync(async (req, res) => {
    const folder = await folderService.getFolderById(req.params.id);
    return res.status(200).json(folder);
});

export const updateFolder = catchAsync(async (req, res) => {
    const folder = await folderService.updateFolder(req.params.id, req.body);
    return sendSuccess(res, 200, 'Folder updated successfully', { folder });
});

export const deleteFolder = catchAsync(async (req, res) => {
    await folderService.deleteFolder(req.params.id);
    return sendSuccess(res, 200, 'Folder deleted successfully');
});

export const moveDocument = catchAsync(async (req, res) => {
    const document = await folderService.moveDocument(req.params.id, req.body.folder_id, req.user);
    return sendSuccess(res, 200, 'Document moved successfully', { document });
});
