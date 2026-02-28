import * as folderRepository from '../repositories/folder.repository.js';
import * as documentRepository from '../repositories/document.repository.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';
import prisma from '../config/database.js';

const syncDynamicFolders = async (user) => {
    const types = await folderRepository.getUniqueDocumentTypes(user.id);
    for (const type of types) {
        let folderName = type;
        switch (type) {
            case 'nota': folderName = 'Nota Dinas'; break;
            case 'sppd': folderName = 'Surat Perintah (SPPD)'; break;
            case 'perj': folderName = 'Perjanjian Kerja Sama'; break;
            default: folderName = type.charAt(0).toUpperCase() + type.slice(1);
        }
        await folderRepository.firstOrCreateCategory(folderName);
    }
};

export const getAllFolders = async (user) => {
    await syncDynamicFolders(user);
    const folders = await folderRepository.findAll();
    const foldersWithCount = await Promise.all(folders.map(async (folder) => {
        const documents_count = await folderRepository.getFolderDocumentsCount(folder.id);
        if (folder.metadata && typeof folder.metadata === 'string') {
            folder.metadata = JSON.parse(folder.metadata);
        }
        return { ...folder, documents_count };
    }));
    return foldersWithCount;
};

export const createFolder = async (data) => {
    const folderId = await folderRepository.create(data);
    return await folderRepository.findById(folderId);
};

export const getFolderById = async (id) => {
    const folder = await folderRepository.findById(id);
    if (!folder) throw new NotFoundError('Folder not found');
    if (folder.metadata && typeof folder.metadata === 'string') {
        folder.metadata = JSON.parse(folder.metadata);
    }
    const children = await folderRepository.getFolderChildren(id);
    const documents = await folderRepository.getFolderDocuments(id);
    let parent = null;
    if (folder.parent_id) parent = await folderRepository.findById(folder.parent_id);
    return { ...folder, children, documents, parent };
};

export const updateFolder = async (id, data) => {
    const folder = await folderRepository.findById(id);
    if (!folder) throw new NotFoundError('Folder not found');
    await folderRepository.update(id, data);
    return await folderRepository.findById(id);
};

export const deleteFolder = async (id) => {
    const folder = await folderRepository.findById(id);
    if (!folder) throw new NotFoundError('Folder not found');
    const docCount = await folderRepository.getFolderDocumentsCount(id);
    if (docCount > 0) throw new BadRequestError('Folder masih berisi dokumen. Pindahkan atau hapus dokumen terlebih dahulu.');
    const childCount = await folderRepository.getFolderChildrenCount(id);
    if (childCount > 0) throw new BadRequestError('Folder masih memiliki subfolder. Hapus subfolder terlebih dahulu.');
    await folderRepository.destroy(id);
    return true;
};

export const moveDocument = async (documentId, folderId, user) => {
    const document = await prisma.document.findUnique({ where: { id: Number(documentId) } });
    if (!document) throw new NotFoundError('Document not found');
    if (document.author_id !== user.id && user.role !== 'admin') {
        throw new ForbiddenError('Anda tidak memiliki izin untuk memindahkan dokumen ini.');
    }

    await folderRepository.moveDocument(documentId, folderId);

    let folderName = 'Root';
    if (folderId) {
        const folder = await folderRepository.findById(folderId);
        if (folder) folderName = folder.name;
    }

    await documentRepository.createLog({
        document_id: documentId,
        user_id: user.id,
        action: 'updated',
        details: `Dokumen dipindahkan ke folder: ${folderName}`
    });

    return await prisma.document.findUnique({ where: { id: Number(documentId) } });
};
