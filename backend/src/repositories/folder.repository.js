import prisma from '../config/database.js';

export const findAll = async () => {
    return await prisma.folder.findMany({ orderBy: { name: 'asc' } });
};

export const findById = async (id) => {
    return await prisma.folder.findUnique({ where: { id: Number(id) } });
};

export const firstOrCreateCategory = async (name) => {
    let folder = await prisma.folder.findFirst({ where: { name, type: 'category' } });
    if (!folder) {
        folder = await prisma.folder.create({ data: { name, type: 'category' } });
    }
    return folder;
};

export const create = async (data) => {
    const metadata = data.metadata ? JSON.stringify(data.metadata) : null;
    const folder = await prisma.folder.create({ data: { ...data, metadata } });
    return folder.id;
};

export const update = async (id, data) => {
    const updateData = { ...data };
    if (data.metadata !== undefined) {
        updateData.metadata = data.metadata ? JSON.stringify(data.metadata) : null;
    }
    await prisma.folder.update({ where: { id: Number(id) }, data: updateData });
    return true;
};

export const destroy = async (id) => {
    await prisma.folder.delete({ where: { id: Number(id) } });
    return true;
};

export const getFolderDocumentsCount = async (id) => {
    return await prisma.document.count({ where: { folder_id: Number(id) } });
};

export const getFolderChildrenCount = async (id) => {
    return await prisma.folder.count({ where: { parent_id: Number(id) } });
};

export const getFolderDocuments = async (id) => {
    return await prisma.document.findMany({
        where: { folder_id: Number(id) },
        include: { author: { select: { name: true } } }
    });
};

export const getFolderChildren = async (id) => {
    return await prisma.folder.findMany({ where: { parent_id: Number(id) } });
};

export const moveDocument = async (documentId, folderId) => {
    await prisma.document.update({
        where: { id: Number(documentId) },
        data: { folder_id: folderId ? Number(folderId) : null }
    });
};

export const getUniqueDocumentTypes = async (userId) => {
    const results = await prisma.document.findMany({
        where: { author_id: Number(userId) },
        select: { type: true },
        distinct: ['type']
    });
    return results.map((r) => r.type);
};
