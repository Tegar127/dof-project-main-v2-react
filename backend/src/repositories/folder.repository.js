import db from '../config/database.js';

export const findAll = async () => {
    return await db('folders').orderBy('name');
};

export const findById = async (id) => {
    return await db('folders').where({ id }).first();
};

export const firstOrCreateCategory = async (name) => {
    let folder = await db('folders').where({ name, type: 'category' }).first();
    if (!folder) {
        const [id] = await db('folders').insert({ name, type: 'category' });
        folder = { id, name, type: 'category' };
    }
    return folder;
};

export const create = async (data) => {
    const metadata = data.metadata ? JSON.stringify(data.metadata) : null;
    const insertData = { ...data, metadata };
    const [id] = await db('folders').insert(insertData);
    return id;
};

export const update = async (id, data) => {
    const metadata = data.metadata ? JSON.stringify(data.metadata) : null;
    const updateData = { ...data };
    if (data.metadata !== undefined) updateData.metadata = metadata;
    await db('folders').where({ id }).update(updateData);
    return true;
};

export const destroy = async (id) => {
    await db('folders').where({ id }).del();
    return true;
};

export const getFolderDocumentsCount = async (id) => {
    const result = await db('documents').where({ folder_id: id }).count('id as count').first();
    return result.count;
};

export const getFolderChildrenCount = async (id) => {
    const result = await db('folders').where({ parent_id: id }).count('id as count').first();
    return result.count;
};

export const getFolderDocuments = async (id) => {
    return await db('documents')
        .leftJoin('users as author', 'documents.author_id', 'author.id')
        .select('documents.*', 'author.name as author_name')
        .where('documents.folder_id', id);
};

export const getFolderChildren = async (id) => {
    return await db('folders').where({ parent_id: id });
};

// Documents related
export const moveDocument = async (documentId, folderId) => {
    await db('documents').where({ id: documentId }).update({ folder_id: folderId });
};

export const getUniqueDocumentTypes = async (userId) => {
    return await db('documents')
        .where({ author_id: userId }) // the trait `forUser` originally limits by author or role. Simplified for sync.
        .distinct('type')
        .pluck('type');
};
