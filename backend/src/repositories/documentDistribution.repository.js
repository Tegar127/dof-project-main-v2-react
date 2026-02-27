import db from '../config/database.js';

export const getDistributedDocuments = async (user) => {
    let query = db('documents')
        .whereIn('status', ['sent', 'received', 'approved'])
        .leftJoin('users as author', 'documents.author_id', 'author.id')
        .select('documents.*', 'author.name as author_name')
        .orderBy('documents.updated_at', 'desc');

    if (user.role !== 'admin') {
        query.where('author_id', user.id);
    }

    return await query;
};

export const getDocumentDistributions = async (documentId) => {
    return await db('document_distributions')
        .where('document_id', documentId);
};

export const createDistribution = async (distributionData) => {
    await db('document_distributions').insert(distributionData);
};
